import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Transaction CRUD routes
router.route('/')
  .get(getTransactions)
  .post(
    logActivity('create_transaction', 'transaction', {
      getDescription: (req, data) => `Created transaction: ${data.data?.description || 'New transaction'}`,
      getEntityId: (req, data) => data.data?._id
    }),
    createTransaction
  );

router.route('/stats')
  .get(getTransactionStats);

router.route('/:id')
  .get(getTransaction)
  .put(
    logActivity('update_transaction', 'transaction', {
      getDescription: (req, data) => `Updated transaction: ${data.data?.description || req.params.id}`,
      getEntityId: (req, data) => req.params.id
    }),
    updateTransaction
  )
  .delete(
    logActivity('delete_transaction', 'transaction', {
      getDescription: (req, data) => `Deleted transaction: ${req.params.id}`,
      getEntityId: (req, data) => req.params.id
    }),
    deleteTransaction
  );

export default router;

