import Transaction from '../models/Transaction.js';
import SavingsGoal from '../models/SavingsGoal.js';
import mongoose from 'mongoose';
import { cache, cacheKeys } from '../utils/cache.js';

/**
 * @desc    Get financial summary for dashboard
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheKeys.dashboardSummary(userId);

    // Check cache first
    if (cache.has(cacheKey)) {
      return res.status(200).json({
        success: true,
        data: cache.get(cacheKey),
        cached: true
      });
    }

    // Convert userId to ObjectId for MongoDB
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get current date range (current month)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get previous month date range
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Use aggregation pipeline to get all transaction data in one query
    const transactionStats = await Transaction.aggregate([
      {
        $match: { userId: userObjectId }
      },
      {
        $facet: {
          currentMonth: [
            {
              $match: {
                date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
              }
            },
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' }
              }
            }
          ],
          previousMonth: [
            {
              $match: {
                date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth }
              }
            },
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' }
              }
            }
          ],
          allTime: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' }
              }
            }
          ],
          recent: [
            {
              $sort: { date: -1, createdAt: -1 }
            },
            {
              $limit: 5
            },
            {
              $project: {
                _id: 1,
                amount: 1,
                type: 1,
                category: 1,
                description: 1,
                date: 1
              }
            }
          ]
        }
      }
    ]);

    // Get savings goals in parallel
    const savingsGoalsPromise = SavingsGoal.find({ userId: userObjectId })
      .select('currentAmount')
      .lean();

    const [stats, savingsGoals] = await Promise.all([
      Promise.resolve(transactionStats[0]),
      savingsGoalsPromise
    ]);

    // Extract current month data
    const currentIncome = stats.currentMonth.find(t => t._id === 'income')?.total || 0;
    const currentExpenses = stats.currentMonth.find(t => t._id === 'expense')?.total || 0;

    // Extract previous month data
    const previousIncome = stats.previousMonth.find(t => t._id === 'income')?.total || 0;
    const previousExpenses = stats.previousMonth.find(t => t._id === 'expense')?.total || 0;

    // Extract all-time data
    const allTimeIncome = stats.allTime.find(t => t._id === 'income')?.total || 0;
    const allTimeExpenses = stats.allTime.find(t => t._id === 'expense')?.total || 0;

    // Calculate total savings
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const previousSavings = totalSavings - (currentIncome - currentExpenses);

    // Calculate percentage changes
    const incomeChange = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : 0;
    
    const expensesChange = previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : 0;

    const savingsChange = previousSavings > 0 
      ? ((totalSavings - previousSavings) / previousSavings) * 100 
      : 0;

    const totalBalance = allTimeIncome - allTimeExpenses;

    // Calculate balance change
    const currentBalance = currentIncome - currentExpenses;
    const previousBalance = previousIncome - previousExpenses;
    const balanceChange = previousBalance !== 0 
      ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 
      : 0;

    const summary = {
      totalBalance: totalBalance || 0,
      income: currentIncome || 0,
      expenses: currentExpenses || 0,
      savings: totalSavings || 0,
      percentageChanges: {
        balance: Math.round(balanceChange * 10) / 10,
        income: Math.round(incomeChange * 10) / 10,
        expenses: Math.round(expensesChange * 10) / 10,
        savings: Math.round(savingsChange * 10) / 10
      },
      recentTransactions: stats.recent.map(t => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category: t.category
      }))
    };

    // Cache for 2 minutes (120 seconds)
    cache.set(cacheKey, summary, 120);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent transactions
 * @route   GET /api/dashboard/transactions/recent
 * @access  Private
 */
export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const transactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .select('amount type category description date');

    res.status(200).json({
      success: true,
      data: transactions.map(t => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category: t.category
      }))
    });
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get expense trends for dashboard
 * @route   GET /api/dashboard/expense-trends
 * @access  Private
 */
export const getExpenseTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    console.log('Expense Trends Query:', { userId, startDate, months });

    // Aggregate expenses by month
    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'expense',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the data with month labels
    const formattedTrends = trends.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        monthLabel: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: item.total,
        count: item.count,
        average: item.count > 0 ? item.total / item.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTrends
    });
  } catch (error) {
    console.error('Expense trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get expense breakdown by category
 * @route   GET /api/dashboard/expense-categories
 * @access  Private
 */
export const getExpenseCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current month expenses by category
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    console.log('Expense Categories Query:', { userId, startOfMonth, endOfMonth });

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 8
      }
    ]);

    const formattedData = categoryData.map(item => ({
      category: item._id,
      total: item.total,
      count: item.count,
      percentage: 0 // Will be calculated on frontend
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Expense categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense categories',
      error: error.message
    });
  }
};

