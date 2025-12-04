# Money Mate - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Create `backend/.env` file:
```env
MONGODB_URI=your_connection_string_here
JWT_SECRET=your_secret_key_12345
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Option B: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/moneymate
```

### Step 3: Create Frontend Environment

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```
MONEY MATE/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Helper functions
│   │   ├── context/     # React context
│   │   └── styles/      # Global styles
│   └── package.json
│
└── docs/               # Documentation
```

## 🛠️ Available Commands

### Frontend
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

### Backend
```bash
npm run dev      # Start dev server with nodemon
npm start        # Start production server
```

## 📝 What's Included

### Frontend (React + Vite)
- ✅ React 19.1.1
- ✅ React Router DOM 7.9.5
- ✅ Axios for API calls
- ✅ Chart.js for data visualization
- ✅ Ant Design UI components
- ✅ Custom CSS theming system

### Backend (Node.js + Express)
- ✅ Express.js server
- ✅ MongoDB with Mongoose
- ✅ JWT authentication setup
- ✅ CORS configuration
- ✅ Environment variable management

### Development Tools
- ✅ Nodemon for auto-restart
- ✅ ESLint for code quality
- ✅ Git with .gitignore

## 🎨 Design System

Color variables are defined in `frontend/src/styles/colors.css`:
- Primary color: `var(--primary-color)`
- Secondary color: `var(--secondary-color)`
- Text colors: `var(--text-primary)`, `var(--text-secondary)`
- Status colors: `var(--success)`, `var(--error)`, `var(--warning)`

## 🔐 Environment Variables

### Backend Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend Required
- `VITE_API_URL` - Backend API URL

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [API Documentation](./API_DOCUMENTATION.md) - API endpoints

## ⚡ Next Steps

After setup:
1. ✅ Phase 1: Project Setup - **COMPLETED**
2. 🔄 Phase 2: Build authentication system
3. 📊 Phase 3: Create dashboard
4. 💰 Phase 4: Implement transactions
5. 🎯 Phase 5: Add budgets
6. 💎 Phase 6: Add savings goals

## 🐛 Common Issues

**Error: Cannot find module**
```bash
npm install
```

**Port already in use**
- Change `PORT` in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

**MongoDB connection failed**
- Check your internet connection
- Verify MongoDB URI is correct
- Whitelist your IP in MongoDB Atlas

**CORS errors**
- Ensure `FRONTEND_URL` matches frontend address
- Check CORS configuration in `backend/server.js`

## 💡 Tips

- Use two terminal windows (one for backend, one for frontend)
- Keep `.env` files private (never commit them)
- Install MongoDB Compass for database visualization
- Use Postman to test API endpoints
- Install React DevTools browser extension

## 🆘 Need Help?

1. Check documentation in `docs/` folder
2. Review error messages carefully
3. Check browser console and terminal output
4. Verify environment variables are set correctly

## 🎯 Ready to Code?

You're all set! Start with Phase 2: Authentication System.

Check the development plan in `build-money-mate-app.plan.md` for detailed tasks.

Happy coding! 💻

