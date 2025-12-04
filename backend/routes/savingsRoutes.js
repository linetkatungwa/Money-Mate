import express from 'express';
import {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoal,
  updateSavingsGoal,
  addContribution,
  deleteSavingsGoal,
  getSavingsSummary
} from '../controllers/savingsController.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.post('/', 
  logActivity('create_savings', 'savings', {
    getDescription: (req, data) => `Created savings goal: ${data.data?.name || 'New goal'}`,
    getEntityId: (req, data) => data.data?._id
  }),
  createSavingsGoal
);
router.get('/', getSavingsGoals);
router.get('/stats/summary', getSavingsSummary);
router.get('/:id', getSavingsGoal);
router.put('/:id', 
  logActivity('update_savings', 'savings', {
    getDescription: (req, data) => `Updated savings goal: ${data.data?.name || req.params.id}`,
    getEntityId: (req, data) => req.params.id
  }),
  updateSavingsGoal
);
router.post('/:id/contribute', 
  logActivity('add_contribution', 'savings', {
    getDescription: (req, data) => `Added contribution to savings goal: ${req.params.id}`,
    getEntityId: (req, data) => req.params.id
  }),
  addContribution
);
router.delete('/:id', 
  logActivity('delete_savings', 'savings', {
    getDescription: (req, data) => `Deleted savings goal: ${req.params.id}`,
    getEntityId: (req, data) => req.params.id
  }),
  deleteSavingsGoal
);

export default router;

