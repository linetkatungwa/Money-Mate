import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getSystemStatistics,
  getActivityLogs,
  getUserStatistics
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', 
  logActivity('admin_update_user', 'user', {
    getDescription: (req, data) => `Admin updated user: ${req.params.id}`,
    getEntityId: (req, data) => req.params.id
  }),
  updateUser
);
router.delete('/users/:id', 
  logActivity('admin_delete_user', 'user', {
    getDescription: (req, data) => `Admin deleted user: ${req.params.id}`,
    getEntityId: (req, data) => req.params.id
  }),
  deleteUser
);
router.get('/users/:id/stats', getUserStatistics);
router.get('/statistics', getSystemStatistics);
router.get('/activity-logs', getActivityLogs);

export default router;

