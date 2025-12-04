# Money Mate - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "MONEY MATE"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/moneymate?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your database credentials
7. Update the `MONGODB_URI` in your `.env` file

## Project Structure

```
MONEY MATE/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── utils/      # Helper functions
│   │   ├── context/    # React context providers
│   │   └── styles/     # Global styles
│   └── package.json
├── backend/            # Node.js backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   └── package.json
└── docs/               # Documentation
```

## Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

Backend: Change `PORT` in `backend/.env`
Frontend: Vite will automatically suggest another port

### MongoDB Connection Issues

- Verify your IP address is whitelisted in MongoDB Atlas
- Check your username and password are correct
- Ensure your connection string is properly formatted

### Module Not Found Errors

Run `npm install` in both frontend and backend directories

## Next Steps

After setup is complete:
1. Test the backend API at `http://localhost:5000`
2. Test the frontend at `http://localhost:5173`
3. Proceed to Phase 2: Authentication System

