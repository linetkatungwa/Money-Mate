import express from 'express';
import {
  getExpensesByCategory,
  getIncomeVsExpense,
  getSpendingTrends,
  getAnalyticsReport,
  getSavingsPrediction
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/income-vs-expense', getIncomeVsExpense);
router.get('/spending-trends', getSpendingTrends);
router.get('/report', getAnalyticsReport);
router.post('/savings-prediction', getSavingsPrediction);

export default router;

