import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp to 50 users
    { duration: '1m', target: 100 },   // Ramp to 100 users
    { duration: '1m', target: 100 },   // Hold 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // 95% under 1s, 99% under 2s
    errors: ['rate<0.1'], // Error rate under 10%
  },
};

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'Test@123456'
};

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(TEST_USER), {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginSuccess = check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  if (!loginSuccess) {
    errorRate.add(1);
    return;
  }

  let token;
  try {
    const loginData = JSON.parse(loginRes.body);
    token = loginData.token;
  } catch (e) {
    errorRate.add(1);
    return;
  }

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Test Dashboard Summary (the critical endpoint)
  const dashboardRes = http.get(`${BASE_URL}/dashboard/summary`, authHeaders);
  const dashboardCheck = check(dashboardRes, {
    'dashboard status 200': (r) => r.status === 200,
    'dashboard no timeout': (r) => r.status !== 0,
    'dashboard response time OK': (r) => r.timings.duration < 2000,
  });

  if (!dashboardCheck) {
    errorRate.add(1);
  }

  // Test transactions
  const transactionsRes = http.get(`${BASE_URL}/transactions`, authHeaders);
  check(transactionsRes, {
    'transactions status 200': (r) => r.status === 200,
  });

  // Test budgets
  const budgetsRes = http.get(`${BASE_URL}/budgets`, authHeaders);
  check(budgetsRes, {
    'budgets status 200': (r) => r.status === 200,
  });

  sleep(1);
}
