import SavingsGoal from '../models/SavingsGoal.js';

/**
 * @desc    Create new savings goal
 * @route   POST /api/savings
 * @access  Private
 */
export const createSavingsGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, currentAmount, targetDate, description } = req.body;

    // Validate required fields
    if (!goalName || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal name, target amount, and target date'
      });
    }

    // Validate target date is in the future
    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be in the future'
      });
    }

    // Create savings goal
    const savingsGoal = await SavingsGoal.create({
      userId: req.user.id,
      goalName,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: savingsGoal
    });
  } catch (error) {
    console.error('Create savings goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating savings goal',
      error: error.message
    });
  }
};

/**
 * @desc    Get all user savings goals
 * @route   GET /api/savings
 * @access  Private
 */
export const getSavingsGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // 'active', 'achieved', 'overdue', 'all'

    // Get all savings goals
    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 });

    // Add calculated fields and filter if needed
    const goalsWithStats = goals.map(goal => {
      const progress = goal.getProgress();
      const daysRemaining = goal.getDaysRemaining();
      const isAchieved = goal.isAchieved();
      const isOverdue = goal.isOverdue();

      return {
        ...goal.toObject(),
        progress: Math.round(progress * 10) / 10,
        daysRemaining,
        isAchieved,
        isOverdue,
        status: isAchieved ? 'achieved' : isOverdue ? 'overdue' : 'active'
      };
    });

    // Filter by status if requested
    let filteredGoals = goalsWithStats;
    if (status && status !== 'all') {
      filteredGoals = goalsWithStats.filter(goal => goal.status === status);
    }

    res.status(200).json({
      success: true,
      count: filteredGoals.length,
      data: filteredGoals
    });
  } catch (error) {
    console.error('Get savings goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings goals',
      error: error.message
    });
  }
};

/**
 * @desc    Get single savings goal
 * @route   GET /api/savings/:id
 * @access  Private
 */
export const getSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    const progress = goal.getProgress();
    const daysRemaining = goal.getDaysRemaining();
    const isAchieved = goal.isAchieved();
    const isOverdue = goal.isOverdue();

    res.status(200).json({
      success: true,
      data: {
        ...goal.toObject(),
        progress: Math.round(progress * 10) / 10,
        daysRemaining,
        isAchieved,
        isOverdue,
        status: isAchieved ? 'achieved' : isOverdue ? 'overdue' : 'active'
      }
    });
  } catch (error) {
    console.error('Get savings goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings goal',
      error: error.message
    });
  }
};

/**
 * @desc    Update savings goal
 * @route   PUT /api/savings/:id
 * @access  Private
 */
export const updateSavingsGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, currentAmount, targetDate, description } = req.body;

    // Find goal
    let goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    // Update fields
    if (goalName !== undefined) goal.goalName = goalName;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Update savings goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating savings goal',
      error: error.message
    });
  }
};

/**
 * @desc    Add contribution to savings goal
 * @route   POST /api/savings/:id/contribute
 * @access  Private
 */
export const addContribution = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contribution amount'
      });
    }

    // Find goal
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    // Add contribution
    goal.currentAmount = (goal.currentAmount || 0) + amount;
    await goal.save();

    const progress = goal.getProgress();
    const isAchieved = goal.isAchieved();

    res.status(200).json({
      success: true,
      message: 'Contribution added successfully',
      data: {
        ...goal.toObject(),
        progress: Math.round(progress * 10) / 10,
        isAchieved
      }
    });
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding contribution',
      error: error.message
    });
  }
};

/**
 * @desc    Delete savings goal
 * @route   DELETE /api/savings/:id
 * @access  Private
 */
export const deleteSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete savings goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting savings goal',
      error: error.message
    });
  }
};

/**
 * @desc    Get savings goals summary/statistics
 * @route   GET /api/savings/stats/summary
 * @access  Private
 */
export const getSavingsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all savings goals
    const goals = await SavingsGoal.find({ userId });

    // Calculate statistics
    let totalTarget = 0;
    let totalSaved = 0;
    let goalsAchieved = 0;
    let goalsActive = 0;
    let goalsOverdue = 0;

    goals.forEach(goal => {
      totalTarget += goal.targetAmount;
      totalSaved += goal.currentAmount || 0;

      if (goal.isAchieved()) {
        goalsAchieved++;
      } else if (goal.isOverdue()) {
        goalsOverdue++;
      } else {
        goalsActive++;
      }
    });

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const remainingAmount = totalTarget - totalSaved;

    res.status(200).json({
      success: true,
      data: {
        totalGoals: goals.length,
        totalTarget,
        totalSaved,
        remainingAmount,
        overallProgress: Math.round(overallProgress * 10) / 10,
        goalsAchieved,
        goalsActive,
        goalsOverdue
      }
    });
  } catch (error) {
    console.error('Get savings summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings summary',
      error: error.message
    });
  }
};

