import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * @desc    Get expense breakdown by category
 * @route   GET /api/analytics/expenses-by-category
 * @access  Private
 */
export const getExpensesByCategory = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    console.log('🔍 Expenses by category - userId:', userId);
    console.log('🔍 Date filters:', { startDate, endDate });

    // Build date query
    const dateQuery = { userId, type: 'expense' };
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) {
        dateQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.date.$lte = new Date(endDate);
      }
    }

    console.log('🔍 Query:', dateQuery);

    // First, check total transactions for this user
    const totalTransactions = await Transaction.countDocuments({ userId });
    const totalExpenses = await Transaction.countDocuments({ userId, type: 'expense' });
    console.log('📊 Total transactions for user:', totalTransactions);
    console.log('📊 Total expenses for user:', totalExpenses);

    // Aggregate expenses by category
    const categoryBreakdown = await Transaction.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    console.log('✅ Category breakdown results:', categoryBreakdown.length, 'categories');

    // Format response
    const formatted = categoryBreakdown.map(item => ({
      category: item._id,
      amount: item.totalAmount,
      count: item.count
    }));

    // Calculate total
    const total = formatted.reduce((sum, item) => sum + item.amount, 0);

    // Calculate percentages
    const withPercentages = formatted.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100 * 10) / 10 : 0
    }));

    res.status(200).json({
      success: true,
      data: withPercentages,
      total
    });
  } catch (error) {
    console.error('Expenses by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense breakdown',
      error: error.message
    });
  }
};

/**
 * @desc    Get income vs expense comparison by month
 * @route   GET /api/analytics/income-vs-expense
 * @access  Private
 */
export const getIncomeVsExpense = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const months = parseInt(req.query.months) || 6;

    // Calculate date range - go back much further to catch all transactions
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // Go back 5 years instead of just months
    startDate.setDate(1); // Start from first day of month

    console.log('Income vs Expense Query:', { userId, startDate, endDate, months });

    // Aggregate by month
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log('Aggregated monthly data:', monthlyData);

    // Create month map
    const monthMap = new Map();

    monthlyData.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      const monthLabel = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          monthLabel,
          income: 0,
          expense: 0,
          net: 0
        });
      }

      const monthData = monthMap.get(monthKey);
      if (item._id.type === 'income') {
        monthData.income = item.totalAmount;
      } else {
        monthData.expense = item.totalAmount;
      }
      monthData.net = monthData.income - monthData.expense;
    });

    // Convert to array and sort
    const result = Array.from(monthMap.values()).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Income vs expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching income vs expense data',
      error: error.message
    });
  }
};

/**
 * @desc    Get spending trends over time
 * @route   GET /api/analytics/spending-trends
 * @access  Private
 */
export const getSpendingTrends = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { period = 'month', months = 12 } = req.query;

    // Calculate date range - go back much further to catch all transactions
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // Go back 5 years instead of just months

    let groupBy = {};
    let dateFormat = '';

    if (period === 'day') {
      groupBy = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      };
      dateFormat = 'YYYY-MM-DD';
    } else if (period === 'week') {
      groupBy = {
        year: { $year: '$date' },
        week: { $week: '$date' }
      };
      dateFormat = 'YYYY-WW';
    } else {
      // Default to month
      groupBy = {
        year: { $year: '$date' },
        month: { $month: '$date' }
      };
      dateFormat = 'YYYY-MM';
    }

    // Aggregate spending trends
    const trends = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    // Format response
    const formatted = trends.map(item => {
      let dateLabel = '';
      let dateKey = '';

      if (period === 'day') {
        const date = new Date(item._id.year, item._id.month - 1, item._id.day);
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        dateKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      } else if (period === 'week') {
        dateLabel = `Week ${item._id.week}, ${item._id.year}`;
        dateKey = `${item._id.year}-W${String(item._id.week).padStart(2, '0')}`;
      } else {
        const date = new Date(item._id.year, item._id.month - 1);
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        dateKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      }

      return {
        period: dateKey,
        periodLabel: dateLabel,
        amount: item.totalAmount,
        count: item.count
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
      period
    });
  } catch (error) {
    console.error('Spending trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching spending trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get comprehensive analytics report
 * @route   GET /api/analytics/report
 * @access  Private
 */
export const getAnalyticsReport = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    // Build date query
    const dateQuery = { userId };
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) {
        dateQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.date.$lte = new Date(endDate);
      }
    }

    // Get all transactions
    const transactions = await Transaction.find(dateQuery).sort({ date: -1 });

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalIncome - totalExpense;

    // Expense breakdown by category
    const expenseBreakdown = await Transaction.aggregate([
      {
        $match: {
          ...dateQuery,
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Income breakdown by category
    const incomeBreakdown = await Transaction.aggregate([
      {
        $match: {
          ...dateQuery,
          type: 'income'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Top expenses
    const topExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(t => ({
        description: t.description,
        category: t.category,
        amount: t.amount,
        date: t.date
      }));

    // Transaction count by type
    const transactionCounts = {
      income: transactions.filter(t => t.type === 'income').length,
      expense: transactions.filter(t => t.type === 'expense').length,
      total: transactions.length
    };

    // Average transaction amounts
    const avgIncome = transactionCounts.income > 0 
      ? totalIncome / transactionCounts.income 
      : 0;
    const avgExpense = transactionCounts.expense > 0 
      ? totalExpense / transactionCounts.expense 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netAmount,
          transactionCounts,
          avgIncome: Math.round(avgIncome * 100) / 100,
          avgExpense: Math.round(avgExpense * 100) / 100
        },
        expenseBreakdown: expenseBreakdown.map(item => ({
          category: item._id,
          amount: item.totalAmount,
          count: item.count
        })),
        incomeBreakdown: incomeBreakdown.map(item => ({
          category: item._id,
          amount: item.totalAmount,
          count: item.count
        })),
        topExpenses,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    console.error('Analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating analytics report',
      error: error.message
    });
  }
};

/**
 * @desc    Predict future savings based on income and expense patterns
 * @route   POST /api/analytics/savings-prediction
 * @access  Private
 */
export const getSavingsPrediction = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { 
      expenseReduction = 0,  // Percentage to reduce expenses (0-100)
      incomeIncrease = 0,      // Percentage to increase income (0-100)
      months = 12              // Number of months to predict
    } = req.body;

    // Get historical data (last 12 months minimum for better predictions)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Fetch all transactions
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Insufficient data for prediction. Please add more transactions.',
          hasData: false
        }
      });
    }

    // Group transactions by month
    const monthlyData = {};
    transactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          income: 0,
          expense: 0,
          savings: 0,
          date: new Date(transaction.date.getFullYear(), transaction.date.getMonth(), 1)
        };
      }
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
      monthlyData[monthKey].savings = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    // Convert to array and sort
    const historicalMonths = Object.values(monthlyData).sort((a, b) => a.date - b.date);

    if (historicalMonths.length < 3) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Need at least 3 months of data for accurate predictions.',
          hasData: false
        }
      });
    }

    // Calculate averages
    const avgIncome = historicalMonths.reduce((sum, m) => sum + m.income, 0) / historicalMonths.length;
    const avgExpense = historicalMonths.reduce((sum, m) => sum + m.expense, 0) / historicalMonths.length;
    const avgSavings = historicalMonths.reduce((sum, m) => sum + m.savings, 0) / historicalMonths.length;

    // Calculate trends using linear regression (simple slope calculation)
    let incomeTrend = 0;
    let expenseTrend = 0;
    
    if (historicalMonths.length >= 2) {
      // Calculate income trend
      const incomeValues = historicalMonths.map(m => m.income);
      const incomeSlope = calculateTrend(incomeValues);
      incomeTrend = incomeSlope;

      // Calculate expense trend
      const expenseValues = historicalMonths.map(m => m.expense);
      const expenseSlope = calculateTrend(expenseValues);
      expenseTrend = expenseSlope;
    }

    // Apply scenario adjustments
    const adjustedAvgIncome = avgIncome * (1 + incomeIncrease / 100);
    const adjustedAvgExpense = avgExpense * (1 - expenseReduction / 100);

    // Generate predictions for future months
    const predictions = [];
    let cumulativeSavings = 0;
    const currentDate = new Date();
    currentDate.setDate(1); // Start from first day of next month

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() + i + 1);

      // Project income with trend
      const projectedIncome = adjustedAvgIncome + (incomeTrend * (i + 1));
      
      // Project expense with trend
      const projectedExpense = adjustedAvgExpense + (expenseTrend * (i + 1));
      
      // Ensure expenses don't go negative
      const safeExpense = Math.max(0, projectedExpense);
      
      // Monthly savings
      const monthlySavings = projectedIncome - safeExpense;
      cumulativeSavings += monthlySavings;

      predictions.push({
        month: i + 1,
        monthLabel: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        projectedIncome: Math.round(projectedIncome * 100) / 100,
        projectedExpense: Math.round(safeExpense * 100) / 100,
        monthlySavings: Math.round(monthlySavings * 100) / 100,
        cumulativeSavings: Math.round(cumulativeSavings * 100) / 100
      });
    }

    // Calculate summary statistics
    const totalProjectedSavings = cumulativeSavings;
    const avgMonthlySavings = totalProjectedSavings / months;
    const bestMonth = predictions.reduce((best, current) => 
      current.monthlySavings > best.monthlySavings ? current : best
    );
    const worstMonth = predictions.reduce((worst, current) => 
      current.monthlySavings < worst.monthlySavings ? current : worst
    );

    res.status(200).json({
      success: true,
      data: {
        hasData: true,
        historical: {
          monthsAnalyzed: historicalMonths.length,
          avgMonthlyIncome: Math.round(avgIncome * 100) / 100,
          avgMonthlyExpense: Math.round(avgExpense * 100) / 100,
          avgMonthlySavings: Math.round(avgSavings * 100) / 100,
          incomeTrend: Math.round(incomeTrend * 100) / 100,
          expenseTrend: Math.round(expenseTrend * 100) / 100,
          historicalMonths: historicalMonths.map(m => ({
            month: m.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            income: Math.round(m.income * 100) / 100,
            expense: Math.round(m.expense * 100) / 100,
            savings: Math.round(m.savings * 100) / 100
          }))
        },
        scenario: {
          expenseReduction,
          incomeIncrease,
          adjustedAvgIncome: Math.round(adjustedAvgIncome * 100) / 100,
          adjustedAvgExpense: Math.round(adjustedAvgExpense * 100) / 100
        },
        predictions,
        summary: {
          totalProjectedSavings: Math.round(totalProjectedSavings * 100) / 100,
          avgMonthlySavings: Math.round(avgMonthlySavings * 100) / 100,
          bestMonth: {
            month: bestMonth.monthLabel,
            savings: bestMonth.monthlySavings
          },
          worstMonth: {
            month: worstMonth.monthLabel,
            savings: worstMonth.monthlySavings
          },
          monthsPredicted: months
        }
      }
    });
  } catch (error) {
    console.error('Savings prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating savings prediction',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate trend (slope) using simple linear regression
 */
function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  values.forEach((value, index) => {
    const x = index + 1;
    sumX += x;
    sumY += value;
    sumXY += x * value;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope || 0;
}

