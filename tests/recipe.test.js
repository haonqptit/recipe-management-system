const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getAdminTestToken, getMemberTestToken } = require('./helpers/test-auth');

describe('Recipe Router API Tests', () => {
  let adminToken;
  let memberToken;
  let seededData;

  beforeEach(async () => {
    seededData = await resetTestDb();
    adminToken = await getAdminTestToken();
    memberToken = await getMemberTestToken();
  });

  test('RCP-T01: Admin can create a recipe with ingredients and steps (201)', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Bibimbap Special',
        description: 'Authentic Korean mixed rice bowl',
        categoryId: seededData.category.id,
        prepTime: 20,
        cookTime: 15,
        servings: 2,
        difficulty: 'MEDIUM',
        ingredients: [
          {
            ingredientId: seededData.ingredient1.id,
            quantity: 200,
            unit: 'gram',
            note: 'Steamed rice',
          },
          {
            ingredientId: seededData.ingredient2.id,
            quantity: 80,
            unit: 'gram',
            note: 'Kimchi topping',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Steam the white rice until fluffy',
          },
          {
            stepNumber: 2,
            instruction: 'Mix vegetables and kimchi in the bowl',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Bibimbap Special');
  });

  test('RCP-T02: Member cannot create a recipe (403)', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Unauthorized Recipe',
        categoryId: seededData.category.id,
        prepTime: 10,
        cookTime: 10,
        servings: 1,
        difficulty: 'EASY',
        ingredients: [{ ingredientId: seededData.ingredient1.id, quantity: 100, unit: 'gram' }],
        steps: [{ stepNumber: 1, instruction: 'Cook it' }],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('RCP-T03: Can get recipe detail by existing ID (200)', async () => {
    const res = await request(app)
      .get(`/api/recipes/${seededData.recipe.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(seededData.recipe.id);
    expect(res.body.data.title).toBe('Kimchi Fried Rice');
    expect(Array.isArray(res.body.data.ingredients)).toBe(true);
    expect(Array.isArray(res.body.data.steps)).toBe(true);
    expect(res.body.data.category.id).toBe(seededData.category.id);
  });

  test('RCP-T04: Returns 404 for non-existent recipe ID', async () => {
    const res = await request(app)
      .get('/api/recipes/999999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('RCP-T05: Fails with 400 when missing required title or invalid data', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        // title missing
        categoryId: seededData.category.id,
        prepTime: 10,
        cookTime: 10,
        servings: 1,
        difficulty: 'EASY',
        ingredients: [],
        steps: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('RCP-T06: Admin can update recipe fields, ingredients, and steps (200)', async () => {
    const res = await request(app)
      .put(`/api/recipes/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Kimchi Cheese Fried Rice',
        difficulty: 'MEDIUM',
        prepTime: 12,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Kimchi Cheese Fried Rice');
  });

  test('RCP-T07: Can retrieve recipes list with filters and search (200)', async () => {
    const listRes = await request(app)
      .get('/api/recipes?difficulty=EASY&page=1&limit=10');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const searchRes = await request(app)
      .get('/api/recipes/search?keyword=Kimchi');
    expect(searchRes.status).toBe(200);
    expect(Array.isArray(searchRes.body.data)).toBe(true);
    expect(searchRes.body.data.some((r) => r.title.includes('Kimchi'))).toBe(true);
  });

  test('RCP-T08: Admin can delete recipe (200)', async () => {
    const res = await request(app)
      .delete(`/api/recipes/${seededData.recipe.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const verifyRes = await request(app).get(`/api/recipes/${seededData.recipe.id}`);
    expect(verifyRes.status).toBe(404);
  });
});
