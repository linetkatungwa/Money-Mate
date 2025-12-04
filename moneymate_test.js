import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  let loginPayload = JSON.stringify({
    email: 'testuser@example.com',
    password: 'Test@123456'
  });

  let loginParams = { headers: { 'Content-Type': 'application/json' } };
  let loginRes = http.post('http://localhost:5000/api/auth/login', loginPayload, loginParams);
  check(loginRes, { 'login status 200': (r) => r.status === 200 });

  // Extract token from login response
  let token = '';
  if (loginRes.status === 200) {
    try {
      let loginData = JSON.parse(loginRes.body);
      token = loginData.token;
    } catch (e) {
      console.log('Failed to parse login response');
    }
  }

  // Use token for authenticated requests
  let authParams = { 
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } 
  };

  let budgetsRes = http.get('http://localhost:5000/api/budgets', authParams);
  check(budgetsRes, { 'budgets status 200': (r) => r.status === 200 });

  let transactionsRes = http.get('http://localhost:5000/api/transactions', authParams);
  check(transactionsRes, { 'transactions status 200': (r) => r.status === 200 });

  sleep(1);
}
