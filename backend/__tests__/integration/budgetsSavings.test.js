import request from 'supertest';
import app from '../../app.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../setupTestDB.js';

let authToken;

const registerUser = async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Planning Tester',
      email: 'planning@test.com',
      password: 'BudgetPass123'
    });

  return response.body.token;
};

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  authToken = await registerUser();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Budget Management API', () => {
  const baseBudget = {
    category: 'Housing',
    amount: 5000,
    period: 'monthly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  it('creates a budget and calculates spending progress', async () => {
    const budgetResponse = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send(baseBudget)
      .expect(201);

    expect(budgetResponse.body.success).toBe(true);
    expect(budgetResponse.body.data.category).toBe('Housing');

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 1500,
        type: 'expense',
        category: 'Housing',
        description: 'Rent payment',
        date: new Date().toISOString()
      })
      .expect(201);

    const budgetsResponse = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(budgetsResponse.body.count).toBe(1);
    const [budget] = budgetsResponse.body.data;
    expect(budget.spent).toBe(1500);
    expect(budget.remaining).toBe(3500);
    expect(budget.status).toBe('good');
  });
});

describe('Savings Goals API', () => {
  const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  it('creates a savings goal and returns progress metadata', async () => {
    const createResponse = await request(app)
      .post('/api/savings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        goalName: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2500,
        targetDate: futureDate,
        description: 'Build a safety net'
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.goalName).toBe('Emergency Fund');

    const listResponse = await request(app)
      .get('/api/savings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listResponse.body.count).toBe(1);
    const goal = listResponse.body.data[0];
    expect(goal.progress).toBeGreaterThan(0);
    expect(goal.status).toBe('active');
    expect(goal.daysRemaining).toBeGreaterThan(0);
  });

  it('filters savings goals by status', async () => {
    await request(app)
      .post('/api/savings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        goalName: 'Travel Fund',
        targetAmount: 3000,
        currentAmount: 3000,
        targetDate: futureDate
      })
      .expect(201);

    const achievedResponse = await request(app)
      .get('/api/savings?status=achieved')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(achievedResponse.body.count).toBe(1);
    expect(achievedResponse.body.data[0].status).toBe('achieved');
  });
});

