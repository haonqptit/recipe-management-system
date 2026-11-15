const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getAdminTestToken, getMemberTestToken, createTestUser } = require('./helpers/test-auth');

describe('Review Router API Tests', () => {
  let adminToken;
  let memberToken;
  let seededData;

  beforeEach(async () => {
    seededData = await resetTestDb();
    adminToken = await getAdminTestToken();
    memberToken = await getMemberTestToken();
  });

  test('REV-T01: Member can create a review with valid rating (201)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'Delicious and quick to make!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.recipeId).toBe(seededData.recipe.id);
  });

  test('REV-T02: Fails with 400 when rating is 6 (out of range 1-5)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 6,
        comment: 'Over the top rating',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('REV-T03: Cannot create duplicate review for same recipe by same user (409)', async () => {
    // Post first review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 4,
        comment: 'First review',
      });

    // Attempt second review
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'Second attempt',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ALREADY_REVIEWED');
  });

  test('REV-T04: Member cannot update another user\'s review (404)', async () => {
    // Create review by Member 1
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'Original review by foodlover',
      });
    const reviewId = createRes.body.data.id;

    // Create Member 2
    const { token: otherUserToken } = await createTestUser({
      username: 'rivalchef',
      email: 'rivalchef@example.com',
    });

    // Member 2 tries to update Member 1's review
    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        rating: 1,
        comment: 'Malicious edit attempt',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('REV-T05: Can get reviews by recipeId with summary (200)', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 4,
        comment: 'Nice taste',
      });

    const res = await request(app)
      .get(`/api/reviews/recipe/${seededData.recipe.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.averageRating).toBe(4);
    expect(res.body.summary.reviewCount).toBe(1);
  });

  test('REV-T06: Can get single review detail by ID (200)', async () => {
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'Great recipe detail test',
      });
    const reviewId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/reviews/${reviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(reviewId);
    expect(res.body.data.rating).toBe(5);
  });

  test('REV-T07: Owner can update their own review (200)', async () => {
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 3,
        comment: 'It was okay',
      });
    const reviewId = createRes.body.data.id;

    const updateRes = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rating: 5,
        comment: 'Actually tried it again with cheese, fantastic!',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.rating).toBe(5);
  });

  test('REV-T08: Review deletion authorization: owner (200), non-owner (403), admin moderation (200)', async () => {
    // 1. Create a review by Member 1
    const createRes1 = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 4,
        comment: 'Review for deletion test',
      });
    const reviewId1 = createRes1.body.data.id;

    // Member 2 tries to delete Member 1's review -> 403
    const { token: otherToken } = await createTestUser({
      username: 'unauthuser',
      email: 'unauthuser@example.com',
    });
    const forbiddenRes = await request(app)
      .delete(`/api/reviews/${reviewId1}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(forbiddenRes.status).toBe(403);

    // Admin can delete any review (moderation) -> 200
    const adminDelRes = await request(app)
      .delete(`/api/reviews/${reviewId1}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDelRes.status).toBe(200);
    expect(adminDelRes.body.success).toBe(true);

    // 2. Member 1 creates another review and deletes it themselves -> 200
    const createRes2 = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'Self delete test',
      });
    const reviewId2 = createRes2.body.data.id;

    const selfDelRes = await request(app)
      .delete(`/api/reviews/${reviewId2}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(selfDelRes.status).toBe(200);
    expect(selfDelRes.body.success).toBe(true);
  });

  test('REV-T09: Can get my reviews list (200)', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
        rating: 5,
        comment: 'My review test',
      });

    const res = await request(app)
      .get('/api/reviews/my-reviews')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].recipe.title).toBe('Kimchi Fried Rice');
  });
});
