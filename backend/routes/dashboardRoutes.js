import express from 'express';
import {
  getDashboardSummary,
  getRecentTransactions,
  getExpenseTrends,
  getExpenseCategories
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/summary', protect, getDashboardSummary);
router.get('/transactions/recent', protect, getRecentTransactions);
router.get('/expense-trends', protect, getExpenseTrends);
router.get('/expense-categories', protect, getExpenseCategories);

export default router;

