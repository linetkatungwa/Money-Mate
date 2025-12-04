import request from 'supertest';
import app from '../../app.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../setupTestDB.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication API', () => {
  const baseUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'SecurePass123'
  };

  it('registers a new user and returns a token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(baseUser)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(baseUser.email);
  });

  it('prevents duplicate registrations for the same email', async () => {
    await request(app).post('/api/auth/register').send(baseUser).expect(201);

    const duplicateResponse = await request(app)
      .post('/api/auth/register')
      .send(baseUser)
      .expect(400);

    expect(duplicateResponse.body.success).toBe(false);
    expect(duplicateResponse.body.message).toMatch(/already exists/i);
  });

  it('authenticates an existing user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(baseUser).expect(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: baseUser.email,
        password: baseUser.password
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.role).toBe('user');
  });

  it('rejects login attempts with invalid credentials', async () => {
    await request(app).post('/api/auth/register').send(baseUser).expect(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: baseUser.email,
        password: 'WrongPassword'
      })
      .expect(401);

    expect(loginResponse.body.success).toBe(false);
    expect(loginResponse.body.message).toMatch(/invalid email or password/i);
  });
});

