import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logActivity('logout', 'system', { description: 'User logged out' }), logout);
router.put('/password', protect, logActivity('update_password', 'user', { description: 'User updated password' }), updatePassword);

export default router;

