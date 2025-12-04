import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { BUDGET_PERIODS } from '../utils/constants';
import './BudgetModal.css';

const BudgetModal = ({ isOpen, onClose, onSubmit, budget = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate end date based on period
  const calculateEndDate = (startDate, period) => {
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        end.setMonth(start.getMonth() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Populate form if editing
  useEffect(() => {
    if (budget && mode === 'edit') {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate).toISOString().split('T')[0],
        endDate: new Date(budget.endDate).toISOString().split('T')[0]
      });
    } else {
      // Set default end date for new budget
      const endDate = calculateEndDate(formData.startDate, formData.period);
      setFormData(prev => ({ ...prev, endDate }));
    }
  }, [budget, mode]);

  // Update end date when start date or period changes
  useEffect(() => {
    if (formData.startDate && formData.period && mode === 'create') {
      const endDate = calculateEndDate(formData.startDate, formData.period);
      setFormData(prev => ({ ...prev, endDate }));
    }
  }, [formData.startDate, formData.period, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.category || !formData.amount || !formData.period || !formData.startDate || !formData.endDate) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Budget amount must be greater than 0');
      setLoading(false);
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Reset form
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: calculateEndDate(new Date().toISOString().split('T')[0], 'monthly')
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Budget' : 'Set Budget'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="budget-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Budget Amount (KES)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="period">Period</label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {Object.entries(BUDGET_PERIODS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;

