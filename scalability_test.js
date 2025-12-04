import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
  stages: [
    // Warm up
    { duration: '1m', target: 10 },
    // Ramp up to 50 users
    { duration: '2m', target: 50 },
    // Ramp up to 100 users
    { duration: '2m', target: 100 },
    // Hold at 100 users
    { duration: '3m', target: 100 },
    // Spike test - sudden increase to 200 users
    { duration: '30s', target: 200 },
    // Hold spike
    { duration: '1m', target: 200 },
    // Recovery - ramp down to 50
    { duration: '1m', target: 50 },
    // Cool down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.1'], // Less than 10% failures
    errors: ['rate<0.1'], // Less than 10% errors
  },
};

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'Test@123456'
};

export default function () {
  // 1. Login
  let loginPayload = JSON.stringify(testUser);
  let loginParams = { headers: { 'Content-Type': 'application/json' } };
  let loginRes = http.post('http://localhost:5000/api/auth/login', loginPayload, loginParams);
  
  const loginSuccess = check(loginRes, {
    'login successful': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });
  errorRate.add(!loginSuccess);

  if (!loginSuccess) {
    sleep(1);
    return;
  }

  // Extract token
  let token = '';
  try {
    let loginData = JSON.parse(loginRes.body);
    token = loginData.token;
  } catch (e) {
    errorRate.add(true);
    sleep(1);
    return;
  }

  const authParams = { 
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } 
  };

  // 2. Get Dashboard Summary
  let dashboardRes = http.get('http://localhost:5000/api/dashboard/summary', authParams);
  const dashboardSuccess = check(dashboardRes, {
    'dashboard loaded': (r) => r.status === 200,
  });
  errorRate.add(!dashboardSuccess);

  sleep(0.5);

  // 3. Get Transactions
  let transactionsRes = http.get('http://localhost:5000/api/transactions', authParams);
  const transactionsSuccess = check(transactionsRes, {
    'transactions loaded': (r) => r.status === 200,
  });
  errorRate.add(!transactionsSuccess);

  sleep(0.5);

  // 4. Get Budgets
  let budgetsRes = http.get('http://localhost:5000/api/budgets', authParams);
  const budgetsSuccess = check(budgetsRes, {
    'budgets loaded': (r) => r.status === 200,
  });
  errorRate.add(!budgetsSuccess);

  sleep(0.5);

  // 5. Get Analytics - Expenses by Category
  let analyticsRes = http.get('http://localhost:5000/api/analytics/expenses-by-category', authParams);
  const analyticsSuccess = check(analyticsRes, {
    'analytics loaded': (r) => r.status === 200,
  });
  errorRate.add(!analyticsSuccess);

  sleep(0.5);

  // 6. Create a Transaction (Write operation - more taxing)
  let newTransaction = JSON.stringify({
    amount: Math.floor(Math.random() * 1000) + 10,
    type: Math.random() > 0.5 ? 'income' : 'expense',
    category: ['Food', 'Transport', 'Entertainment', 'Salary'][Math.floor(Math.random() * 4)],
    description: `Test transaction ${Date.now()}`,
    date: new Date().toISOString()
  });

  let createRes = http.post('http://localhost:5000/api/transactions', newTransaction, authParams);
  const createSuccess = check(createRes, {
    'transaction created': (r) => r.status === 201,
  });
  errorRate.add(!createSuccess);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += indent + '█ SCALABILITY TEST RESULTS\n\n';
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  summary += indent + `Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;
  
  summary += indent + '█ RESPONSE TIMES\n';
  summary += indent + `Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
  summary += indent + `95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += indent + `Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  summary += indent + '█ LOAD PROFILE\n';
  summary += indent + `Peak VUs: ${data.metrics.vus_max.values.max}\n`;
  summary += indent + `Total Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(2)} minutes\n`;
  summary += indent + `Data Transferred: ${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB\n\n`;
  
  return summary;
}
