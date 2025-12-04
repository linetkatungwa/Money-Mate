import express from 'express';
import {
  createBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
  getBillsSummary
} from '../controllers/billController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.post('/', createBill);
router.get('/', getBills);
router.get('/stats/summary', getBillsSummary);
router.get('/:id', getBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;

