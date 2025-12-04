import Notification from '../models/Notification.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Transaction from '../models/Transaction.js';
import Bill from '../models/Bill.js';

/**
 * Create a notification
 */
export const createNotification = async (userId, notificationData) => {
  return await Notification.create({
    userId,
    ...notificationData
  });
};

/**
 * Check and create budget overspending notifications
 */
export const checkBudgetOverspending = async (userId) => {
  try {
    const budgets = await Budget.find({ userId, isActive: true });
    const notifications = [];

    for (const budget of budgets) {
      // Calculate spending for this budget period
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      
      const expenses = await Transaction.aggregate([
        {
          $match: {
            userId: budget.userId,
            type: 'expense',
            category: budget.category,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      const spent = expenses.length > 0 ? expenses[0].totalSpent : 0;
      const percentage = (spent / budget.amount) * 100;

      // Check if budget is exceeded
      if (spent > budget.amount) {
        // Check if notification already exists for this budget
        const existingNotification = await Notification.findOne({
          userId,
          type: 'budget',
          relatedId: budget._id,
          isRead: false,
          createdAt: { $gte: startDate }
        });

        if (!existingNotification) {
          const notification = await createNotification(userId, {
            type: 'budget',
            title: 'Budget Exceeded',
            message: `Your ${budget.category} budget has been exceeded. You've spent ${spent.toFixed(2)} KES out of ${budget.amount} KES.`,
            priority: 'high',
            relatedId: budget._id,
            relatedModel: 'Budget',
            actionUrl: '/budgets'
          });
          notifications.push(notification);
        }
      } 
      // Check if budget is at warning threshold (80-99%)
      else if (percentage >= 80 && percentage < 100) {
        const existingNotification = await Notification.findOne({
          userId,
          type: 'budget',
          relatedId: budget._id,
          isRead: false,
          createdAt: { $gte: startDate }
        });

        if (!existingNotification) {
          const notification = await createNotification(userId, {
            type: 'budget',
            title: 'Budget Warning',
            message: `Your ${budget.category} budget is ${percentage.toFixed(1)}% used. ${(budget.amount - spent).toFixed(2)} KES remaining.`,
            priority: 'medium',
            relatedId: budget._id,
            relatedModel: 'Budget',
            actionUrl: '/budgets'
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Budget overspending check error:', error);
    return [];
  }
};

/**
 * Check and create savings goal milestone notifications
 */
export const checkSavingsMilestones = async (userId) => {
  try {
    const goals = await SavingsGoal.find({ userId });
    const notifications = [];

    for (const goal of goals) {
      if (goal.isAchieved()) {
        // Check if achievement notification already exists
        const existingNotification = await Notification.findOne({
          userId,
          type: 'achievement',
          relatedId: goal._id,
          message: { $regex: 'achieved', $options: 'i' }
        });

        if (!existingNotification) {
          const notification = await createNotification(userId, {
            type: 'achievement',
            title: 'Goal Achieved! 🎉',
            message: `Congratulations! You've achieved your savings goal: "${goal.goalName}"`,
            priority: 'high',
            relatedId: goal._id,
            relatedModel: 'SavingsGoal',
            actionUrl: '/savings'
          });
          notifications.push(notification);
        }
      } else {
        // Check for milestone percentages (25%, 50%, 75%)
        const progress = goal.getProgress();
        const milestones = [25, 50, 75];
        
        for (const milestone of milestones) {
          if (progress >= milestone && progress < milestone + 5) {
            const existingNotification = await Notification.findOne({
              userId,
              type: 'savings',
              relatedId: goal._id,
              message: { $regex: `${milestone}%`, $options: 'i' },
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within last 7 days
            });

            if (!existingNotification) {
              const notification = await createNotification(userId, {
                type: 'savings',
                title: 'Milestone Reached!',
                message: `You've reached ${milestone}% of your "${goal.goalName}" savings goal! Keep it up!`,
                priority: 'medium',
                relatedId: goal._id,
                relatedModel: 'SavingsGoal',
                actionUrl: '/savings'
              });
              notifications.push(notification);
              break; // Only create one milestone notification at a time
            }
          }
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Savings milestone check error:', error);
    return [];
  }
};

/**
 * Check and create bill reminder notifications
 */
export const checkBillReminders = async (userId) => {
  try {
    const bills = await Bill.find({ userId, isPaid: false, isActive: true });
    const notifications = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const bill of bills) {
      if (bill.isDueSoon() || bill.isOverdue()) {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        // Check if notification already exists for this bill in the last 24 hours
        const existingNotification = await Notification.findOne({
          userId,
          type: 'bill',
          relatedId: bill._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingNotification) {
          let title, message, priority;

          if (bill.isOverdue()) {
            title = 'Bill Overdue!';
            message = `Your bill "${bill.name}" (${bill.amount} KES) is overdue!`;
            priority = 'high';
          } else if (daysUntilDue === 0) {
            title = 'Bill Due Today!';
            message = `Your bill "${bill.name}" (${bill.amount} KES) is due today!`;
            priority = 'high';
          } else {
            title = 'Bill Reminder';
            message = `Your bill "${bill.name}" (${bill.amount} KES) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`;
            priority = daysUntilDue <= 1 ? 'high' : 'medium';
          }

          const notification = await createNotification(userId, {
            type: 'bill',
            title,
            message,
            priority,
            relatedId: bill._id,
            relatedModel: 'Bill',
            actionUrl: '/bills'
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Bill reminder check error:', error);
    return [];
  }
};

/**
 * Check for unusual spending patterns
 */
export const checkUnusualSpending = async (userId) => {
  try {
    // Get transactions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: thirtyDaysAgo }
    });

    // Group by category and calculate averages
    const categorySpending = {};
    recentTransactions.forEach(transaction => {
      if (!categorySpending[transaction.category]) {
        categorySpending[transaction.category] = [];
      }
      categorySpending[transaction.category].push(transaction.amount);
    });

    // Check for unusually large transactions (more than 3x average for category)
    for (const [category, amounts] of Object.entries(categorySpending)) {
      if (amounts.length < 3) continue; // Need at least 3 transactions for pattern

      const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const threshold = average * 3;

      // Find large transactions
      const largeTransactions = recentTransactions.filter(
        t => t.category === category && t.amount > threshold
      );

      for (const transaction of largeTransactions) {
        // Check if notification already exists for this transaction
        const existingNotification = await Notification.findOne({
          userId,
          type: 'spending',
          relatedId: transaction._id
        });

        if (!existingNotification) {
          const notification = await createNotification(userId, {
            type: 'spending',
            title: 'Unusual Spending Detected',
            message: `Large transaction detected: ${transaction.amount} KES for ${category}. This is ${(transaction.amount / average).toFixed(1)}x your average spending in this category.`,
            priority: 'medium',
            relatedId: transaction._id,
            relatedModel: 'Transaction',
            actionUrl: '/transactions'
          });
          await notification.save();
        }
      }
    }

    return [];
  } catch (error) {
    console.error('Unusual spending check error:', error);
    return [];
  }
};

/**
 * Run all notification checks for a user
 */
export const runNotificationChecks = async (userId) => {
  try {
    const [
      budgetNotifications,
      savingsNotifications,
      billNotifications,
      spendingNotifications
    ] = await Promise.all([
      checkBudgetOverspending(userId),
      checkSavingsMilestones(userId),
      checkBillReminders(userId),
      checkUnusualSpending(userId)
    ]);

    return {
      budget: budgetNotifications,
      savings: savingsNotifications,
      bills: billNotifications,
      spending: spendingNotifications
    };
  } catch (error) {
    console.error('Notification checks error:', error);
    return { budget: [], savings: [], bills: [], spending: [] };
  }
};

