# Money Mate - Personal Finance Management System

A web-based personal finance management application designed to help users track their income, expenses, budgets, and savings goals with ease. Built specifically for Kenyan users with localization in mind.

## Project Overview

Money Mate is a comprehensive financial management tool that replaces traditional manual budgeting methods with an interactive and automated web-based platform. The system helps individuals monitor spending habits, plan savings, and make informed financial decisions.

## Features

- **User Authentication**: Secure login and registration system
- **Transaction Tracking**: Record income and expenses with categorization
- **Budget Management**: Set budgets and receive overspending alerts
- **Savings Goals**: Track progress toward financial goals
- **Analytics Dashboard**: Visual reports and financial insights
- **Real-time Notifications**: Alerts for budgets, bills, and milestones
- **Export Reports**: Generate PDF and Excel reports

## Tech Stack

### Frontend
- React.js (with Vite)
- React Router for navigation
- Axios for API calls
- Chart.js for data visualization
- Ant Design for UI components

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Database
- MongoDB Atlas (Cloud)

## Project Structure

```
MONEY MATE/
├── frontend/          # React.js frontend application
├── backend/           # Node.js/Express.js backend API
├── docs/              # Project documentation
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd "MONEY MATE"
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables

Create `.env` file in the `backend` folder:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

Create `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:5000/api
```

5. Run the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Development Phases

- **Phase 1**: Project Setup & Foundation ✅ **COMPLETED**
- **Phase 2**: Core Authentication System ✅ **COMPLETED**
- **Phase 3**: Dashboard & Main Interface ✅ **COMPLETED**
- **Phase 4**: Transaction Management ✅ **COMPLETED**
- **Phase 5**: Budget Management ✅ **COMPLETED**
- **Phase 6**: Savings Goals ✅ **COMPLETED**
- **Phase 7**: Analytics & Reports ✅ **COMPLETED**
- **Phase 8**: Notifications & Reminders ✅ **COMPLETED**
- **Phase 9**: Settings & Profile ✅ **COMPLETED**
- **Phase 10**: Admin Panel ✅ **COMPLETED**
- **Phase 11**: Testing & Quality Assurance ⏭️ **SKIPPED**
- **Phase 12**: Optimization & Deployment ⏭️ **SKIPPED**

## 🎉 Project Status: **COMPLETED**

### All Phases Achievements Summary:
✅ Complete MERN stack application  
✅ Secure JWT authentication system  
✅ Transaction tracking with categories  
✅ Budget management with alerts  
✅ Savings goals tracking  
✅ Analytics dashboard with charts  
✅ PDF/Excel export capabilities  
✅ Real-time notifications system  
✅ User profile and settings  
✅ Admin panel with user management  
✅ Responsive web design  
✅ Role-based access control  

**See `PROJECT_COMPLETE.md` for detailed completion summary.**  

## Contributing

This is a project for academic purposes. For contributions, please follow the project proposal guidelines.

## License

This project is created for educational purposes.

