import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const { search, role, limit = 50, page = 1, sortBy = 'createdAt', sortOrder = -1 } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * @desc    Update user (suspend, activate, change role)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from modifying their own role
    if (userId === req.user.id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (role !== undefined) {
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_user',
      entityType: 'user',
      entityId: userId,
      description: `Updated user: ${user.email}`,
      metadata: { role, isActive }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data (optional - you may want to keep for audit)
    // For now, we'll just delete the user
    await user.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_user',
      entityType: 'user',
      entityId: userId,
      description: `Deleted user: ${user.email}`
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/statistics
 * @access  Private/Admin
 */
export const getSystemStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalTransactions,
      totalBudgets,
      totalSavingsGoals,
      totalNotifications,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ $or: [{ isActive: { $exists: false } }, { isActive: true }] }),
      User.countDocuments({ role: 'admin' }),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      SavingsGoal.countDocuments(),
      Notification.countDocuments(),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate total income and expenses
    const incomeExpense = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = incomeExpense.find(item => item._id === 'income')?.total || 0;
    const totalExpenses = incomeExpense.find(item => item._id === 'expense')?.total || 0;

    // Get users by registration date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get transactions by date (last 30 days)
    const recentTransactions = await Transaction.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          new: newUsers,
          recent: recentUsers
        },
        transactions: {
          total: totalTransactions,
          recent: recentTransactions,
          totalIncome,
          totalExpenses
        },
        budgets: {
          total: totalBudgets
        },
        savings: {
          total: totalSavingsGoals
        },
        notifications: {
          total: totalNotifications
        }
      }
    });
  } catch (error) {
    console.error('Get system statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get activity logs
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { userId, action, entityType, limit = 100, page = 1 } = req.query;

    // Build query
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get activity logs
    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/users/:id/stats
 * @access  Private/Admin
 */
export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.params.id;

    const [
      user,
      transactions,
      budgets,
      savingsGoals,
      notifications
    ] = await Promise.all([
      User.findById(userId).select('-password'),
      Transaction.countDocuments({ userId }),
      Budget.countDocuments({ userId }),
      SavingsGoal.countDocuments({ userId }),
      Notification.countDocuments({ userId })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate user's total income and expenses
    const incomeExpense = await Transaction.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = incomeExpense.find(item => item._id === 'income')?.total || 0;
    const totalExpenses = incomeExpense.find(item => item._id === 'expense')?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        transactions: {
          total: transactions,
          totalIncome,
          totalExpenses
        },
        budgets: {
          total: budgets
        },
        savings: {
          total: savingsGoals
        },
        notifications: {
          total: notifications
        }
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

