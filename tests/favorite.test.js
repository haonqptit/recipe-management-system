const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getMemberTestToken, createTestUser } = require('./helpers/test-auth');

describe('Favorite Router API Tests', () => {
  let memberToken;
  let seededData;

  beforeEach(async () => {
    seededData = await resetTestDb();
    memberToken = await getMemberTestToken();
  });

  test('FAV-T01: Member can add a recipe to favorites (201)', async () => {
    // Member adds seeded recipe to favorites
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        recipeId: seededData.recipe.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recipeId).toBe(seededData.recipe.id);
  });

  test('FAV-T02: Cannot add duplicate favorite for same user and recipe (409)', async () => {
    // Add once
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });

    // Add second time
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ALREADY_FAVORITED');
  });

  test('FAV-T03: Can retrieve my favorites list (200)', async () => {
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });

    const res = await request(app)
      .get('/api/favorites?page=1&limit=10')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].recipe.title).toBe('Kimchi Fried Rice');
  });

  test('FAV-T04: Cannot access another user\'s favorite by ID (404)', async () => {
    // Create favorite for member 1
    const favRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });
    const favoriteId = favRes.body.data.id;

    // Create member 2
    const { token: otherUserToken } = await createTestUser({
      username: 'othermember',
      email: 'othermember@example.com',
    });

    // Member 2 attempts to get Member 1's favorite
    const res = await request(app)
      .get(`/api/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('FAV-T05: Can check favorite status by recipeId (200)', async () => {
    // Initially false
    const resBefore = await request(app)
      .get(`/api/favorites/recipe/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(resBefore.status).toBe(200);
    expect(resBefore.body.data.isFavorite).toBe(false);

    // Add to favorites
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });

    // Now true
    const resAfter = await request(app)
      .get(`/api/favorites/recipe/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(resAfter.status).toBe(200);
    expect(resAfter.body.data.isFavorite).toBe(true);
    expect(resAfter.body.data.favoriteId).toBeDefined();
  });

  test('FAV-T06: Can remove favorite by recipeId (200)', async () => {
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });

    const delRes = await request(app)
      .delete(`/api/favorites/recipe/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Removing again returns 404
    const delAgain = await request(app)
      .delete(`/api/favorites/recipe/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(delAgain.status).toBe(404);
  });

  test('FAV-T07: Can remove favorite by favorite ID (200)', async () => {
    const addRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ recipeId: seededData.recipe.id });
    const favId = addRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/favorites/${favId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  test('FAV-T08: Guest cannot access favorite endpoints without token (401)', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(401);
  });
});
