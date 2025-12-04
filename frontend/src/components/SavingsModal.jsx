import { useState, useEffect } from 'react';
import './SavingsModal.css';

const SavingsModal = ({ isOpen, onClose, onSubmit, goal = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (goal && mode === 'edit') {
      setFormData({
        goalName: goal.goalName || '',
        targetAmount: goal.targetAmount || '',
        currentAmount: goal.currentAmount || '',
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        description: goal.description || ''
      });
    } else {
      // Set default target date to 3 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: defaultDate.toISOString().split('T')[0],
        description: ''
      });
    }
  }, [goal, mode, isOpen]);

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
    if (!formData.goalName || !formData.targetAmount || !formData.targetDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      setError('Target amount must be greater than 0');
      setLoading(false);
      return;
    }

    if (new Date(formData.targetDate) <= new Date()) {
      setError('Target date must be in the future');
      setLoading(false);
      return;
    }

    const currentAmount = parseFloat(formData.currentAmount) || 0;
    if (currentAmount < 0) {
      setError('Current amount cannot be negative');
      setLoading(false);
      return;
    }

    if (currentAmount > parseFloat(formData.targetAmount)) {
      setError('Current amount cannot exceed target amount');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        goalName: formData.goalName.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: currentAmount,
        targetDate: formData.targetDate,
        description: formData.description.trim()
      });
      
      // Reset form
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: defaultDate.toISOString().split('T')[0],
        description: ''
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
      <div className="modal-content savings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Savings Goal' : 'New Savings Goal'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="savings-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="goalName">Goal Name *</label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              placeholder="e.g., Vacation Fund, Emergency Fund"
              required
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Target Amount (KES) *</label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                step="0.01"
                min="0.01"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentAmount">Current Amount (KES)</label>
              <input
                type="number"
                id="currentAmount"
                name="currentAmount"
                step="0.01"
                min="0"
                value={formData.currentAmount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date *</label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              required
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional: Add notes about this savings goal"
              rows="3"
              disabled={loading}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsModal;

