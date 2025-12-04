import express from 'express';
import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Budget CRUD routes
router.route('/')
  .get(getBudgets)
  .post(
    logActivity('create_budget', 'budget', {
      getDescription: (req, data) => `Created budget for ${data.data?.category || 'category'}`,
      getEntityId: (req, data) => data.data?._id
    }),
    createBudget
  );

router.route('/stats/summary')
  .get(getBudgetSummary);

router.route('/:id')
  .get(getBudget)
  .put(
    logActivity('update_budget', 'budget', {
      getDescription: (req, data) => `Updated budget: ${data.data?.category || req.params.id}`,
      getEntityId: (req, data) => req.params.id
    }),
    updateBudget
  )
  .delete(
    logActivity('delete_budget', 'budget', {
      getDescription: (req, data) => `Deleted budget: ${req.params.id}`,
      getEntityId: (req, data) => req.params.id
    }),
    deleteBudget
  );

export default router;

