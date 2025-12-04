import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getPreferences,
  updatePreferences
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/profile', getProfile);
router.put('/profile', 
  logActivity('update_profile', 'user', {
    getDescription: (req, data) => `Updated profile information`,
    getEntityId: (req, data) => req.user.id
  }),
  updateProfile
);
router.put('/password', 
  logActivity('change_password', 'user', {
    description: 'Changed account password',
    getEntityId: (req, data) => req.user.id
  }),
  changePassword
);
router.delete('/account', 
  logActivity('delete_account', 'user', {
    description: 'Deleted user account',
    getEntityId: (req, data) => req.user.id
  }),
  deleteAccount
);
router.get('/preferences', getPreferences);
router.put('/preferences', 
  logActivity('update_preferences', 'user', {
    description: 'Updated user preferences',
    getEntityId: (req, data) => req.user.id
  }),
  updatePreferences
);

export default router;

