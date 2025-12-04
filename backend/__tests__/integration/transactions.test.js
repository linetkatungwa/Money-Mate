import request from 'supertest';
import app from '../../app.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../setupTestDB.js';

let authToken;

const registerAndLogin = async () => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Finance Tester',
      email: 'finance@test.com',
      password: 'TestPass123'
    });

  authToken = registerResponse.body.token;
  return authToken;
};

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  await registerAndLogin();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Transaction API', () => {
  const createTransaction = (overrides = {}) => ({
    amount: 2500,
    type: 'expense',
    category: 'Groceries',
    description: 'Weekly shopping',
    date: new Date().toISOString(),
    ...overrides
  });

  it('creates a transaction and retrieves it in the list', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTransaction())
      .expect(201);

    const listResponse = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listResponse.body.count).toBe(1);
    expect(listResponse.body.data[0].category).toBe('Groceries');
  });

  it('returns accurate stats for income and expenses', async () => {
    const transactions = [
      createTransaction({ type: 'income', category: 'Salary', amount: 8000 }),
      createTransaction({ type: 'expense', category: 'Rent', amount: 3000 }),
      createTransaction({ type: 'expense', category: 'Utilities', amount: 1500 })
    ];

    for (const txn of transactions) {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(txn)
        .expect(201);
    }

    const statsResponse = await request(app)
      .get('/api/transactions/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statsResponse.body.data.totalIncome).toBe(8000);
    expect(statsResponse.body.data.totalExpenses).toBe(4500);
    expect(statsResponse.body.data.netBalance).toBe(3500);
    expect(statsResponse.body.data.categoryBreakdown.length).toBeGreaterThanOrEqual(2);
  });
});

