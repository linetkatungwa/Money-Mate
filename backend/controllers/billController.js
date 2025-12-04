import Bill from '../models/Bill.js';
import { checkBillReminders } from '../services/notificationService.js';

/**
 * @desc    Create new bill
 * @route   POST /api/bills
 * @access  Private
 */
export const createBill = async (req, res) => {
  try {
    const { name, amount, category, dueDate, frequency, description, reminderDays } = req.body;

    // Validate required fields
    if (!name || !amount || !category || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, amount, category, and due date'
      });
    }

    // Create bill
    const bill = await Bill.create({
      userId: req.user.id,
      name,
      amount,
      category,
      dueDate,
      frequency: frequency || 'monthly',
      description: description || '',
      reminderDays: reminderDays || 3
    });

    // Check if bill needs immediate reminder
    if (bill.isDueSoon() || bill.isOverdue()) {
      await checkBillReminders(req.user.id);
    }

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill',
      error: error.message
    });
  }
};

/**
 * @desc    Get all user bills
 * @route   GET /api/bills
 * @access  Private
 */
export const getBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPaid, isActive, dueSoon, overdue } = req.query;

    // Build query
    const query = { userId };

    if (isPaid !== undefined) {
      query.isPaid = isPaid === 'true';
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Get all bills
    const bills = await Bill.find(query).sort({ dueDate: 1 });

    // Add calculated fields and filter if needed
    let filteredBills = bills.map(bill => {
      const billObj = bill.toObject();
      billObj.isOverdue = bill.isOverdue();
      billObj.isDueSoon = bill.isDueSoon();
      return billObj;
    });

    // Additional filters
    if (dueSoon === 'true') {
      filteredBills = filteredBills.filter(bill => bill.isDueSoon && !bill.isPaid);
    }

    if (overdue === 'true') {
      filteredBills = filteredBills.filter(bill => bill.isOverdue && !bill.isPaid);
    }

    res.status(200).json({
      success: true,
      count: filteredBills.length,
      data: filteredBills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message
    });
  }
};

/**
 * @desc    Get single bill
 * @route   GET /api/bills/:id
 * @access  Private
 */
export const getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const billObj = bill.toObject();
    billObj.isOverdue = bill.isOverdue();
    billObj.isDueSoon = bill.isDueSoon();

    res.status(200).json({
      success: true,
      data: billObj
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
};

/**
 * @desc    Update bill
 * @route   PUT /api/bills/:id
 * @access  Private
 */
export const updateBill = async (req, res) => {
  try {
    const { name, amount, category, dueDate, frequency, description, reminderDays, isPaid, isActive } = req.body;

    // Find bill
    let bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Update fields
    if (name !== undefined) bill.name = name;
    if (amount !== undefined) bill.amount = amount;
    if (category !== undefined) bill.category = category;
    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (frequency !== undefined) bill.frequency = frequency;
    if (description !== undefined) bill.description = description;
    if (reminderDays !== undefined) bill.reminderDays = reminderDays;
    if (isActive !== undefined) bill.isActive = isActive;

    // Handle payment
    if (isPaid === true && !bill.isPaid) {
      bill.isPaid = true;
      bill.paidDate = new Date();
    } else if (isPaid === false && bill.isPaid) {
      bill.isPaid = false;
      bill.paidDate = undefined;
    }

    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bill',
      error: error.message
    });
  }
};

/**
 * @desc    Delete bill
 * @route   DELETE /api/bills/:id
 * @access  Private
 */
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bill',
      error: error.message
    });
  }
};

/**
 * @desc    Get bills summary/statistics
 * @route   GET /api/bills/stats/summary
 * @access  Private
 */
export const getBillsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all bills
    const bills = await Bill.find({ userId, isActive: true });

    // Calculate statistics
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    bills.forEach(bill => {
      totalAmount += bill.amount;
      if (bill.isPaid) {
        paidAmount += bill.amount;
      } else {
        unpaidAmount += bill.amount;
        if (bill.isOverdue()) {
          overdueCount++;
        } else if (bill.isDueSoon()) {
          dueSoonCount++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalBills: bills.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueCount,
        dueSoonCount,
        paidCount: bills.filter(b => b.isPaid).length,
        unpaidCount: bills.filter(b => !b.isPaid).length
      }
    });
  } catch (error) {
    console.error('Get bills summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills summary',
      error: error.message
    });
  }
};

