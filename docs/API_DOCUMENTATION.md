# Money Mate API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
- **POST** `/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Transactions

#### Get All Transactions
- **GET** `/transactions`
- **Query Params:** `?type=income&category=Salary&startDate=2024-01-01&endDate=2024-12-31`
- **Headers:** Authorization required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction_id",
      "amount": 5000,
      "type": "income",
      "category": "Salary",
      "description": "Monthly salary",
      "date": "2024-01-15",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Transaction
- **POST** `/transactions`
- **Headers:** Authorization required
- **Body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2024-01-15"
}
```

#### Update Transaction
- **PUT** `/transactions/:id`
- **Headers:** Authorization required
- **Body:**
```json
{
  "amount": 5500,
  "description": "Updated monthly salary"
}
```

#### Delete Transaction
- **DELETE** `/transactions/:id`
- **Headers:** Authorization required

### Budgets

#### Get All Budgets
- **GET** `/budgets`
- **Headers:** Authorization required

#### Create Budget
- **POST** `/budgets`
- **Headers:** Authorization required
- **Body:**
```json
{
  "category": "Food & Dining",
  "amount": 10000,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

#### Update Budget
- **PUT** `/budgets/:id`
- **Headers:** Authorization required

#### Delete Budget
- **DELETE** `/budgets/:id`
- **Headers:** Authorization required

### Savings Goals

#### Get All Savings Goals
- **GET** `/savings`
- **Headers:** Authorization required

#### Create Savings Goal
- **POST** `/savings`
- **Headers:** Authorization required
- **Body:**
```json
{
  "goalName": "Emergency Fund",
  "targetAmount": 100000,
  "currentAmount": 0,
  "targetDate": "2024-12-31"
}
```

#### Update Savings Goal
- **PUT** `/savings/:id`
- **Headers:** Authorization required

#### Add to Savings
- **POST** `/savings/:id/contribute`
- **Headers:** Authorization required
- **Body:**
```json
{
  "amount": 5000
}
```

#### Delete Savings Goal
- **DELETE** `/savings/:id`
- **Headers:** Authorization required

### Dashboard

#### Get Financial Summary
- **GET** `/dashboard/summary`
- **Headers:** Authorization required
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalBalance": 50000,
    "totalIncome": 75000,
    "totalExpenses": 25000,
    "totalSavings": 30000,
    "percentageChanges": {
      "income": 12,
      "expenses": -5,
      "savings": 15
    }
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## Notes

- All dates should be in ISO 8601 format
- All amounts are in the smallest currency unit (cents for KES)
- Timestamps are in UTC

