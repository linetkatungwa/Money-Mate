import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const createBudget = async (req, res) => {
  try {
    const { category, amount, period, startDate, endDate } = req.body;

    // Validate required fields
    if (!category || !amount || !period || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      userId: req.user.id,
      category,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category in the specified period'
      });
    }

    // Create budget
    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      period: period.toLowerCase(),
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating budget',
      error: error.message
    });
  }
};

/**
 * @desc    Get all user budgets with spending data
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, active } = req.query;
    
    // Build query
    const query = { userId };
    if (period) {
      query.period = period.toLowerCase();
    }

    // Get budgets
    const budgets = await Budget.find(query).sort({ createdAt: -1 });

    // Filter active budgets if requested
    let filteredBudgets = budgets;
    if (active === 'true') {
      filteredBudgets = budgets.filter(budget => budget.isActive());
    }

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      filteredBudgets.map(async (budget) => {
        // Get transactions for this category within budget period
        const transactions = await Transaction.find({
          userId,
          category: budget.category,
          type: 'expense',
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
          }
        });

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentage: Math.round(percentage * 10) / 10,
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
        };
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      data: budgetsWithSpending
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets',
      error: error.message
    });
  }
};

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Calculate spending
    const transactions = await Transaction.find({
      userId: req.user.id,
      category: budget.category,
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate
      }
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
      }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget',
      error: error.message
    });
  }
};

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res) => {
  try {
    const { category, amount, period, startDate, endDate } = req.body;

    // Find budget
    let budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Update fields
    if (category !== undefined) budget.category = category;
    if (amount !== undefined) budget.amount = amount;
    if (period !== undefined) budget.period = period.toLowerCase();
    if (startDate !== undefined) budget.startDate = startDate;
    if (endDate !== undefined) budget.endDate = endDate;

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget',
      error: error.message
    });
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget',
      error: error.message
    });
  }
};

/**
 * @desc    Get budget summary/statistics
 * @route   GET /api/budgets/stats/summary
 * @access  Private
 */
export const getBudgetSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active budgets
    const budgets = await Budget.find({ userId });
    const activeBudgets = budgets.filter(b => b.isActive());

    // Calculate overall statistics
    let totalBudgeted = 0;
    let totalSpent = 0;
    let budgetsExceeded = 0;
    let budgetsOnTrack = 0;

    for (const budget of activeBudgets) {
      totalBudgeted += budget.amount;

      const transactions = await Transaction.find({
        userId,
        category: budget.category,
        type: 'expense',
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate
        }
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      totalSpent += spent;

      if (spent >= budget.amount) {
        budgetsExceeded++;
      } else {
        budgetsOnTrack++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalBudgets: activeBudgets.length,
        totalBudgeted,
        totalSpent,
        totalRemaining: totalBudgeted - totalSpent,
        budgetsExceeded,
        budgetsOnTrack,
        overallPercentage: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget summary',
      error: error.message
    });
  }
};

