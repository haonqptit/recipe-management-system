const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getAdminTestToken, getMemberTestToken } = require('./helpers/test-auth');

describe('Category Router API Tests', () => {
  let adminToken;
  let memberToken;
  let seededData;

  beforeEach(async () => {
    seededData = await resetTestDb();
    adminToken = await getAdminTestToken();
    memberToken = await getMemberTestToken();
  });

  test('CAT-T01: Admin can create a category (201)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Italian Cuisine',
        description: 'Authentic Italian pizza and pasta',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Italian Cuisine');
    expect(res.body.data.id).toBeDefined();
  });

  test('CAT-T02: Cannot create category with duplicate name (409)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Korean Food', // already exists
        description: 'Duplicate',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('CAT-T03: Can retrieve categories list with pagination (200)', async () => {
    const res = await request(app)
      .get('/api/categories?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.data[0].recipeCount).toBeDefined();
  });

  test('CAT-T04: Cannot delete category that has associated recipes (409)', async () => {
    const res = await request(app)
      .delete(`/api/categories/${seededData.category.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CATEGORY_IN_USE');
  });

  test('CAT-T05: Member cannot create category (403)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Snacks',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('CAT-T06: Can get category detail by ID (200) and 404 for non-existent', async () => {
    const res = await request(app)
      .get(`/api/categories/${seededData.category.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Korean Food');

    const notFoundRes = await request(app)
      .get('/api/categories/99999');
    expect(notFoundRes.status).toBe(404);
  });

  test('CAT-T07: Admin can update category (200)', async () => {
    const res = await request(app)
      .put(`/api/categories/${seededData.category.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Updated Korean food description',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('CAT-T08: Can get recipes belonging to a category (200)', async () => {
    const res = await request(app)
      .get(`/api/categories/${seededData.category.id}/recipes`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('CAT-T09: Admin can delete unused category (200)', async () => {
    // Create an unused category
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Empty Category',
      });
    const newCatId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/categories/${newCatId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
