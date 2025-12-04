# Money Mate - AI Agent Instructions

## Architecture Overview

**Money Mate** is a MERN stack personal finance management system with a **strict client-server separation**. The backend (`/backend`) is an Express REST API with MongoDB, and the frontend (`/frontend`) is a React+Vite SPA with **full responsive design** supporting mobile, tablet, and desktop devices.

### Key Architectural Decisions
- **ES Modules only**: Both frontend and backend use `"type": "module"` - always use `import/export`, never `require()`
- **JWT Authentication**: Token stored in `localStorage`, attached via axios interceptor in `frontend/src/services/api.js`
- **Role-based Access**: Two middleware layers: `protect` (auth) and `admin` (role check) in `backend/middleware/auth.js`
- **Centralized API Client**: All HTTP requests go through `frontend/src/services/api.js` which handles auth headers and 401 redirects
- **Responsive Design**: Mobile-first approach with collapsible sidebar (hamburger menu <768px), supports 320px to 1920px+ viewports

## Project Structure & Patterns

### Backend (`/backend`)
- **Controllers**: Handle business logic, always return `{ success: true/false, data/message }` format
- **Models**: Mongoose schemas with indexes on `userId` for performance - see `Transaction.js` and `Budget.js` for examples
- **Routes**: Thin route files that apply middleware and delegate to controllers
- **Middleware Pattern**: Routes use `protect` middleware for auth, `admin` for admin-only endpoints
  ```javascript
  router.get('/admin/users', protect, admin, getUsers); // Example from adminRoutes.js
  ```

### Frontend (`/frontend`)
- **Context**: `AuthContext` manages authentication state - use `useAuth()` hook, not direct context import
- **Page Components**: Full page views in `/pages` (Dashboard, Transactions, Analytics, etc.)
- **Reusable Components**: Modals and layouts in `/components` (TransactionModal, BudgetModal, DashboardLayout)
- **Layout Pattern**: Most pages wrap content in `<DashboardLayout>` which provides Sidebar (collapsible on mobile) + NotificationBell
- **Services**: API calls organized by domain in `/services` directory
- **Responsive Breakpoints**: 
  - Desktop: >1024px (sidebar always visible)
  - Tablet: 768px-1024px (collapsible sidebar with hamburger menu)
  - Mobile: <768px (overlay sidebar, touch-optimized UI)
  - Minimum: 320px (iPhone SE support)

### Data Models Relationships
- All user-scoped documents have `userId` field (indexed)
- Dashboard aggregates from: Transactions (income/expense), Budgets (category spending), SavingsGoals (progress)
- Analytics controller uses MongoDB aggregation pipelines for complex queries (see `getExpensesByCategory`, `getIncomeVsExpense`)

## Development Workflows

### Running the Application
```powershell
# Backend (terminal 1)
cd backend; npm run dev  # Runs on :5000 with nodemon

# Frontend (terminal 2)
cd frontend; npm run dev  # Runs on :5173 with Vite HMR
```

### Environment Setup
- **Backend** requires `.env` with: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV`, `FRONTEND_URL`
- **Frontend** requires `.env` with: `VITE_API_URL=http://localhost:5000/api`
- Never commit `.env` files - use `.env.example` for templates

### Testing
```powershell
# Backend integration tests (Jest + MongoDB Memory Server)
cd backend; npm test

# Tests use setupTestDB.js for in-memory MongoDB
# See __tests__/integration/auth.test.js for pattern
```

## Critical Conventions

### API Response Format
**Always** return this structure from controllers:
```javascript
// Success
res.status(200).json({ success: true, data: {...} });

// Error
res.status(400).json({ success: false, message: "Error description" });
```

### Authentication Flow
1. Login/Register returns `{ token, user }` → stored in `localStorage`
2. Axios interceptor reads token from `localStorage`, adds `Authorization: Bearer ${token}` header
3. Backend `protect` middleware verifies JWT, attaches `req.user` with user document
4. Controllers access authenticated user via `req.user.id`

### Date Handling
- Transaction/Budget dates stored as ISO Date objects in MongoDB
- Dashboard calculations use month boundaries: `new Date(year, month, 1)` for start, `new Date(year, month+1, 0, 23, 59, 59)` for end
- See `dashboardController.js` `getDashboardSummary` for canonical date range pattern

### Category System
- Categories are **strings** stored directly in Transaction/Budget documents (not normalized)
- No predefined category list - users can create arbitrary categories
- Analytics groups by category using MongoDB `$group` aggregation

### Mongoose Patterns
- Use schema indexes for query performance: `schema.index({ userId: 1, date: -1 })`
- Pre-save hooks update `updatedAt`: `schema.pre('save', function(next) { this.updatedAt = Date.now(); next(); })`
- Instance methods for derived state: `budgetSchema.methods.isActive = function() {...}`

## Common Pitfalls

1. **Don't bypass the API client**: Always import `api` from `frontend/src/services/api.js`, never use raw axios
2. **Role checks need both middlewares**: Admin routes must use `protect, admin` - `admin` alone won't authenticate
3. **ES Module imports**: No `.default` needed - controllers export named functions directly
4. **Ant Design imports**: Import components from `'antd'`, not subpaths (tree-shaking handled by Vite)
5. **MongoDB queries**: Always filter by `userId` to prevent data leaks: `Transaction.find({ userId: req.user.id })`

## Key Integration Points

### Dashboard Summary Calculation
The dashboard (`/api/dashboard/summary`) aggregates:
- Current month transactions for income/expenses
- Previous month transactions for % change calculations
- All-time transactions for total balance
- SavingsGoals collection for total savings
See `backend/controllers/dashboardController.js` for complete implementation.

### Notification System
- Created by backend services (e.g., budget overspending triggers notification creation)
- Polled by frontend `NotificationBell` component
- Mark as read via `/api/notifications/:id/read` endpoint

### Admin Features
- Admin users have `role: 'admin'` in User model
- Admin panel pages: AdminDashboard, AdminUsers, AdminActivityLogs
- Protected by `AdminRoute` component which checks `user.role === 'admin'`

## File References

**Key Backend Files:**
- `backend/app.js` - Express app config, middleware, route registration
- `backend/middleware/auth.js` - `protect` and `admin` middleware definitions
- `backend/controllers/dashboardController.js` - Complex aggregation example

**Key Frontend Files:**
- `frontend/src/services/api.js` - Axios instance with interceptors
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/components/DashboardLayout.jsx` - Standard page wrapper pattern

**Documentation:**
- `docs/API_DOCUMENTATION.md` - Complete API endpoint reference
- `docs/SETUP.md` - Environment setup and troubleshooting
- `PROJECT_COMPLETE.md` - Feature completion status and architecture notes
