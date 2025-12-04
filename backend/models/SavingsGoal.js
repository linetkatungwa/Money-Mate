import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goalName: {
    type: String,
    required: [true, 'Please provide a goal name'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0.01, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide a target date']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
savingsGoalSchema.index({ userId: 1, targetDate: 1 });
savingsGoalSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
savingsGoalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate progress percentage
savingsGoalSchema.methods.getProgress = function() {
  if (this.targetAmount <= 0) return 0;
  const percentage = (this.currentAmount / this.targetAmount) * 100;
  return Math.min(percentage, 100); // Cap at 100%
};

// Method to calculate days remaining
savingsGoalSchema.methods.getDaysRemaining = function() {
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Method to check if goal is achieved
savingsGoalSchema.methods.isAchieved = function() {
  return this.currentAmount >= this.targetAmount;
};

// Method to check if goal is overdue
savingsGoalSchema.methods.isOverdue = function() {
  const today = new Date();
  const target = new Date(this.targetDate);
  return today > target && !this.isAchieved();
};

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;

