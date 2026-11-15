const request = require('supertest');
const app = require('../src/app');
const { resetTestDb } = require('./setup');
const { getMemberTestToken } = require('./helpers/test-auth');

describe('Member Router API Tests', () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  test('MEM-T01: Register successful with valid data (201)', async () => {
    const res = await request(app)
      .post('/api/members/register')
      .send({
        username: 'newchef',
        email: 'newchef@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('newchef');
    expect(res.body.data.email).toBe('newchef@example.com');
    expect(res.body.data.role).toBe('MEMBER');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test('MEM-T02: Register with duplicate email returns 409', async () => {
    const res = await request(app)
      .post('/api/members/register')
      .send({
        username: 'anotherfoodie',
        email: 'foodlover@example.com', // already seeded in resetTestDb
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  test('MEM-T03: Register with missing/short password returns 400', async () => {
    const res = await request(app)
      .post('/api/members/register')
      .send({
        username: 'baduser',
        email: 'baduser@example.com',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('MEM-T04: Login with valid credentials returns 200 and accessToken', async () => {
    const res = await request(app)
      .post('/api/members/login')
      .send({
        email: 'foodlover@example.com',
        password: 'StrongPassword123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('foodlover@example.com');
  });

  test('MEM-T05: Login with incorrect password returns 401', async () => {
    const res = await request(app)
      .post('/api/members/login')
      .send({
        email: 'foodlover@example.com',
        password: 'WrongPassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('MEM-T06: GET /members/me with token returns profile (200)', async () => {
    const token = await getMemberTestToken();
    const res = await request(app)
      .get('/api/members/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('foodlover@example.com');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test('MEM-T07: GET /members/me without token returns 401', async () => {
    const res = await request(app)
      .get('/api/members/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('MEM-T08: PUT /members/me updates username successfully (200)', async () => {
    const token = await getMemberTestToken();
    const res = await request(app)
      .put('/api/members/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'foodlover_updated',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('foodlover_updated');
  });

  test('MEM-T09: Change password successfully (200) and fail with wrong current password (401)', async () => {
    const token = await getMemberTestToken();

    // Wrong current password
    const failRes = await request(app)
      .put('/api/members/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'WrongPassword',
        newPassword: 'BrandNewPassword123',
      });
    expect(failRes.status).toBe(401);

    // Correct current password
    const successRes = await request(app)
      .put('/api/members/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'StrongPassword123',
        newPassword: 'BrandNewPassword123',
      });
    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
  });

  test('MEM-T10: POST /members/logout returns 200', async () => {
    const token = await getMemberTestToken();
    const res = await request(app)
      .post('/api/members/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
