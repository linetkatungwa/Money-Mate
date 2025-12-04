import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a bill name'],
    trim: true,
    maxlength: [100, 'Bill name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a bill amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  frequency: {
    type: String,
    enum: ['once', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date
  },
  reminderDays: {
    type: Number,
    default: 3,
    min: [0, 'Reminder days cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for faster queries
billSchema.index({ userId: 1, dueDate: 1 });
billSchema.index({ userId: 1, isPaid: 1, isActive: 1 });
billSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
billSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if bill is overdue
billSchema.methods.isOverdue = function() {
  if (this.isPaid) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// Method to check if bill is due soon
billSchema.methods.isDueSoon = function() {
  if (this.isPaid || !this.isActive) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return daysUntilDue >= 0 && daysUntilDue <= this.reminderDays;
};

const Bill = mongoose.model('Bill', billSchema);

export default Bill;

