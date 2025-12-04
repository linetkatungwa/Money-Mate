import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import BudgetModal from '../components/BudgetModal';
import { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  getBudgetSummary
} from '../services/budgetService';
import { formatCurrency, formatDate } from '../utils/helpers';
import './Budgets.css';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired

  useEffect(() => {
    fetchBudgets();
    fetchSummary();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getBudgets({ active: filter === 'active' ? 'true' : undefined });
      setBudgets(response.data || []);
    } catch (err) {
      setError('Failed to load budgets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getBudgetSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [filter]);

  const handleAddBudget = async (budgetData) => {
    try {
      await createBudget(budgetData);
      setSuccessMessage('Budget created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchBudgets();
      await fetchSummary();
    } catch (err) {
      throw new Error(err.message || 'Failed to create budget');
    }
  };

  const handleEditBudget = async (budgetData) => {
    try {
      await updateBudget(editingBudget._id, budgetData);
      setSuccessMessage('Budget updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchBudgets();
      await fetchSummary();
      setEditingBudget(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await deleteBudget(id);
      setSuccessMessage('Budget deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchBudgets();
      await fetchSummary();
    } catch (err) {
      setError('Failed to delete budget');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setModalMode('create');
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setModalMode('edit');
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    if (filter === 'active') {
      const now = new Date();
      return new Date(budget.startDate) <= now && new Date(budget.endDate) >= now;
    }
    if (filter === 'expired') {
      return new Date(budget.endDate) < new Date();
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded':
        return '#dc3545'; // Red
      case 'warning':
        return '#ffc107'; // Yellow
      case 'good':
        return '#50c878'; // Green
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'exceeded':
        return 'Exceeded';
      case 'warning':
        return 'Warning';
      case 'good':
        return 'On Track';
      default:
        return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="budgets-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Budgets</h1>
            <p className="page-subtitle">Track your spending against budgets</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            🎯 Set Budget
          </button>
        </div>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="budget-summary">
            <div className="summary-card">
              <div className="summary-label">Total Budgeted</div>
              <div className="summary-amount">{formatCurrency(summary.totalBudgeted)}</div>
              <div className="summary-count">{summary.totalBudgets} budgets</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Spent</div>
              <div className="summary-amount">{formatCurrency(summary.totalSpent)}</div>
              <div className="summary-count">{Math.round(summary.overallPercentage)}% used</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Remaining</div>
              <div className="summary-amount">{formatCurrency(summary.totalRemaining)}</div>
              <div className="summary-count">{summary.budgetsOnTrack} on track</div>
            </div>
            <div className="summary-card warning">
              <div className="summary-label">Exceeded</div>
              <div className="summary-amount">{summary.budgetsExceeded}</div>
              <div className="summary-count">budgets over limit</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Budgets
          </button>
          <button 
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`tab ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
        </div>

        {/* Budgets List */}
        <div className="budgets-container">
          {loading ? (
            <div className="loading-state">Loading budgets...</div>
          ) : filteredBudgets.length === 0 ? (
            <div className="empty-state">
              <p>📊 No budgets found</p>
              <button onClick={openAddModal} className="btn-primary">
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="budgets-grid">
              {filteredBudgets.map((budget) => {
                const percentage = Math.min(budget.percentage || 0, 100);
                const statusColor = getStatusColor(budget.status);
                
                return (
                  <div key={budget._id} className="budget-card">
                    <div className="budget-header">
                      <div>
                        <h3 className="budget-category">{budget.category}</h3>
                        <p className="budget-period">
                          {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                        </p>
                      </div>
                      <span 
                        className="budget-status"
                        style={{ color: statusColor }}
                      >
                        {getStatusLabel(budget.status)}
                      </span>
                    </div>

                    <div className="budget-amounts">
                      <div className="amount-row">
                        <span className="amount-label">Budget:</span>
                        <span className="amount-value">{formatCurrency(budget.amount)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Spent:</span>
                        <span className="amount-value spent">{formatCurrency(budget.spent || 0)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Remaining:</span>
                        <span className={`amount-value ${budget.remaining < 0 ? 'negative' : 'positive'}`}>
                          {formatCurrency(budget.remaining || budget.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="budget-progress">
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: statusColor
                          }}
                        />
                      </div>
                      <div className="progress-text">
                        {Math.round(percentage)}% used
                      </div>
                    </div>

                    <div className="budget-dates">
                      <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                    </div>

                    <div className="budget-actions">
                      <button 
                        className="btn-icon edit"
                        onClick={() => openEditModal(budget)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeleteBudget(budget._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Modal */}
        <BudgetModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={modalMode === 'edit' ? handleEditBudget : handleAddBudget}
          budget={editingBudget}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
};

export default Budgets;


