# Money Mate - Development Guide

## Project Overview

Money Mate is a personal finance management web application built with React.js frontend and Node.js/Express backend, using MongoDB as the database.

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Coding Standards

#### JavaScript/React
- Use ES6+ features
- Follow functional component patterns with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

#### CSS
- Use CSS custom properties (variables) defined in `colors.css`
- Follow BEM naming convention for custom classes
- Mobile-first responsive design
- Use utility classes from `global.css` where appropriate

#### Backend
- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all inputs
- Keep route handlers thin, business logic in controllers
- Document all API endpoints

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.js`)
- **Pages**: PascalCase (e.g., `Dashboard.jsx`)
- **Styles**: kebab-case (e.g., `login-page.css`)

## Development Phases

### Phase 1: Project Setup ✓ (Completed)
- Project structure created
- Frontend initialized with React + Vite
- Backend initialized with Node.js + Express
- Database configuration ready
- Base styling and utilities in place

### Phase 2: Authentication System (Current)
Tasks:
1. Create User model
2. Build registration endpoint
3. Build login endpoint
4. Create auth middleware
5. Build login/signup pages
6. Implement protected routes

### Phase 3: Dashboard & Interface
### Phase 4: Transaction Management
### Phase 5: Budget Management
### Phase 6: Savings Goals
### Phase 7: Analytics & Reports
### Phase 8: Notifications
### Phase 9: Settings & Profile
### Phase 10: Admin Panel
### Phase 11: Testing
### Phase 12: Deployment

## Technology Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.1
- **Charts**: Chart.js 4.5.1 + React-ChartJS-2 5.3.1
- **UI Library**: Ant Design 5.28.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Environment**: dotenv 16.3.1
- **CORS**: cors 2.8.5

### DevTools
- **Backend Dev Server**: Nodemon 3.0.1
- **Linting**: ESLint 9.36.0
- **Version Control**: Git

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moneymate
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Common Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
cd backend
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

## Database Schema Design

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  type: String (income/expense),
  category: String,
  description: String,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Budget
```javascript
{
  userId: ObjectId (ref: User),
  category: String,
  amount: Number,
  period: String (weekly/monthly/yearly),
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SavingsGoal
```javascript
{
  userId: ObjectId (ref: User),
  goalName: String,
  targetAmount: Number,
  currentAmount: Number,
  targetDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```javascript
{
  userId: ObjectId (ref: User),
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: Date
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Testing Strategy

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Aim for 80%+ code coverage

### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flow

### E2E Tests
- Test complete user workflows
- Test on multiple browsers
- Test responsive design

## Debugging Tips

### Frontend
1. Use React DevTools browser extension
2. Check browser console for errors
3. Use `console.log()` strategically
4. Check network tab for API calls

### Backend
1. Check terminal for server logs
2. Use `console.log()` to trace execution
3. Test API endpoints with Postman
4. Check MongoDB for data issues

### Common Issues

**CORS Errors**
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`

**Database Connection Failed**
- Verify MongoDB URI
- Check network connection
- Ensure IP is whitelisted in MongoDB Atlas

**Module Not Found**
- Run `npm install` in affected directory
- Check import paths

**Port Already in Use**
- Change port in `.env` file
- Kill process using the port

## Performance Considerations

- Implement pagination for large lists
- Use lazy loading for routes
- Optimize images and assets
- Implement caching where appropriate
- Use React.memo for expensive components
- Debounce search inputs

## Security Best Practices

- Never commit `.env` files
- Validate all user inputs
- Sanitize data before database operations
- Use HTTPS in production
- Implement rate limiting
- Set secure HTTP headers
- Hash passwords with bcrypt
- Use JWT with short expiration times

## Git Workflow

1. Pull latest changes from develop
```bash
git checkout develop
git pull origin develop
```

2. Create feature branch
```bash
git checkout -b feature/your-feature-name
```

3. Make changes and commit
```bash
git add .
git commit -m "feat: descriptive commit message"
```

4. Push to remote
```bash
git push origin feature/your-feature-name
```

5. Create Pull Request
- Submit PR to `develop` branch
- Add description and screenshots
- Request code review

## Commit Message Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Ant Design Components](https://ant.design/components)
- [Chart.js Documentation](https://www.chartjs.org)

## Contact & Support

For questions or issues:
1. Check existing documentation
2. Search for similar issues
3. Ask team members
4. Create detailed issue report

