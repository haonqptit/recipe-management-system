const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getAdminTestToken, getMemberTestToken } = require('./helpers/test-auth');

describe('Ingredient Router API Tests', () => {
  let adminToken;
  let memberToken;
  let seededData;

  beforeEach(async () => {
    seededData = await resetTestDb();
    adminToken = await getAdminTestToken();
    memberToken = await getMemberTestToken();
  });

  test('ING-T01: Admin can create an ingredient (201)', async () => {
    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Olive Oil',
        description: 'Extra virgin olive oil',
        defaultUnit: 'ml',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Olive Oil');
    expect(res.body.data.defaultUnit).toBe('ml');
  });

  test('ING-T02: Cannot create ingredient with duplicate name (409)', async () => {
    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Rice', // already exists in seed
        defaultUnit: 'gram',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('ING-T03: Can search ingredients by keyword (200)', async () => {
    const res = await request(app)
      .get('/api/ingredients/search?keyword=Ric');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((ing) => ing.name === 'Rice')).toBe(true);
  });

  test('ING-T04: Cannot delete ingredient that is used in recipes (409)', async () => {
    const res = await request(app)
      .delete(`/api/ingredients/${seededData.ingredient1.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INGREDIENT_IN_USE');
  });

  test('ING-T05: Member cannot create ingredient (403)', async () => {
    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Sugar',
        defaultUnit: 'gram',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('ING-T06: Can get ingredient list (200) and detail (200/404)', async () => {
    const listRes = await request(app).get('/api/ingredients');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const detailRes = await request(app).get(`/api/ingredients/${seededData.ingredient1.id}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.name).toBe('Rice');

    const notFoundRes = await request(app).get('/api/ingredients/99999');
    expect(notFoundRes.status).toBe(404);
  });

  test('ING-T07: Admin can update and delete unused ingredient (200)', async () => {
    const createRes = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Black Pepper',
        defaultUnit: 'gram',
      });
    const ingId = createRes.body.data.id;

    // Update
    const updateRes = await request(app)
      .put(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Coarse ground black pepper',
      });
    expect(updateRes.status).toBe(200);

    // Delete
    const delRes = await request(app)
      .delete(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
