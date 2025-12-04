# Money Mate Backend API

Backend server for Money Mate personal finance management system.

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
backend/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models/schemas
├── routes/          # API routes
├── utils/           # Helper functions
├── server.js        # Entry point
└── package.json     # Dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required variables (see `.env.example`)

3. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Savings Goals
- `GET /api/savings` - Get all savings goals
- `POST /api/savings` - Create new savings goal
- `PUT /api/savings/:id` - Update savings goal
- `DELETE /api/savings/:id` - Delete savings goal

More endpoints will be added as development progresses.

