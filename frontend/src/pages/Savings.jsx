import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SavingsModal from '../components/SavingsModal';
import { 
  getSavingsGoals, 
  createSavingsGoal, 
  updateSavingsGoal, 
  deleteSavingsGoal,
  addContribution,
  getSavingsSummary
} from '../services/savingsService';
import { formatCurrency, formatDate } from '../utils/helpers';
import './Savings.css';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, achieved, overdue

  useEffect(() => {
    fetchGoals();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSavingsGoals(filter === 'all' ? 'all' : filter);
      setGoals(response.data || []);
    } catch (err) {
      setError('Failed to load savings goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getSavingsSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleAddGoal = async (goalData) => {
    try {
      await createSavingsGoal(goalData);
      setSuccessMessage('Savings goal created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchGoals();
      await fetchSummary();
    } catch (err) {
      throw new Error(err.message || 'Failed to create savings goal');
    }
  };

  const handleEditGoal = async (goalData) => {
    try {
      await updateSavingsGoal(editingGoal._id, goalData);
      setSuccessMessage('Savings goal updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchGoals();
      await fetchSummary();
      setEditingGoal(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update savings goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }
    
    try {
      await deleteSavingsGoal(id);
      setSuccessMessage('Savings goal deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchGoals();
      await fetchSummary();
    } catch (err) {
      setError('Failed to delete savings goal');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddContribution = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      setError('Please enter a valid contribution amount');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await addContribution(contributingGoal._id, parseFloat(contributionAmount));
      setSuccessMessage('Contribution added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setContributionAmount('');
      setIsContributeModalOpen(false);
      setContributingGoal(null);
      await fetchGoals();
      await fetchSummary();
    } catch (err) {
      setError(err.message || 'Failed to add contribution');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setModalMode('create');
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setModalMode('edit');
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const openContributeModal = (goal) => {
    setContributingGoal(goal);
    setContributionAmount('');
    setIsContributeModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const closeContributeModal = () => {
    setIsContributeModalOpen(false);
    setContributingGoal(null);
    setContributionAmount('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'achieved':
        return '#50c878'; // Green
      case 'overdue':
        return '#dc3545'; // Red
      case 'active':
        return '#007bff'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'achieved':
        return '✅ Achieved';
      case 'overdue':
        return '⚠️ Overdue';
      case 'active':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="savings-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Savings Goals</h1>
            <p className="page-subtitle">Track your savings progress</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            🎯 New Goal
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
          <div className="savings-summary">
            <div className="summary-card">
              <div className="summary-label">Total Goals</div>
              <div className="summary-amount">{summary.totalGoals}</div>
              <div className="summary-count">{summary.goalsActive} active</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Target Amount</div>
              <div className="summary-amount">{formatCurrency(summary.totalTarget)}</div>
              <div className="summary-count">All goals</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Saved</div>
              <div className="summary-amount">{formatCurrency(summary.totalSaved)}</div>
              <div className="summary-count">{Math.round(summary.overallProgress)}% complete</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Remaining</div>
              <div className="summary-amount">{formatCurrency(summary.remainingAmount)}</div>
              <div className="summary-count">{summary.goalsAchieved} achieved</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Goals
          </button>
          <button 
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`tab ${filter === 'achieved' ? 'active' : ''}`}
            onClick={() => setFilter('achieved')}
          >
            Achieved
          </button>
          <button 
            className={`tab ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </button>
        </div>

        {/* Goals List */}
        <div className="savings-container">
          {loading ? (
            <div className="loading-state">Loading savings goals...</div>
          ) : goals.length === 0 ? (
            <div className="empty-state">
              <p>💰 No savings goals found</p>
              <button onClick={openAddModal} className="btn-primary">
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const progress = Math.min(goal.progress || 0, 100);
                const statusColor = getStatusColor(goal.status);
                const daysRemaining = goal.daysRemaining || 0;
                
                return (
                  <div key={goal._id} className="goal-card">
                    <div className="goal-header">
                      <div>
                        <h3 className="goal-name">{goal.goalName}</h3>
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}
                      </div>
                      <span 
                        className="goal-status"
                        style={{ color: statusColor }}
                      >
                        {getStatusLabel(goal.status)}
                      </span>
                    </div>

                    <div className="goal-amounts">
                      <div className="amount-row">
                        <span className="amount-label">Target:</span>
                        <span className="amount-value">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Saved:</span>
                        <span className="amount-value saved">{formatCurrency(goal.currentAmount || 0)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Remaining:</span>
                        <span className={`amount-value ${(goal.targetAmount - (goal.currentAmount || 0)) < 0 ? 'negative' : 'positive'}`}>
                          {formatCurrency(goal.targetAmount - (goal.currentAmount || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="goal-progress">
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: statusColor
                          }}
                        />
                      </div>
                      <div className="progress-text">
                        {Math.round(progress)}% complete
                      </div>
                    </div>

                    <div className="goal-info">
                      <div className="info-item">
                        <span className="info-label">Target Date:</span>
                        <span className="info-value">{formatDate(goal.targetDate)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Days Remaining:</span>
                        <span className={`info-value ${daysRemaining < 0 ? 'negative' : daysRemaining <= 30 ? 'warning' : ''}`}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                        </span>
                      </div>
                    </div>

                    <div className="goal-actions">
                      {!goal.isAchieved && (
                        <button 
                          className="btn-contribute"
                          onClick={() => openContributeModal(goal)}
                          title="Add Contribution"
                        >
                          💰 Add Money
                        </button>
                      )}
                      <button 
                        className="btn-icon edit"
                        onClick={() => openEditModal(goal)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeleteGoal(goal._id)}
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

        {/* Savings Goal Modal */}
        <SavingsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={modalMode === 'edit' ? handleEditGoal : handleAddGoal}
          goal={editingGoal}
          mode={modalMode}
        />

        {/* Contribution Modal */}
        {isContributeModalOpen && contributingGoal && (
          <div className="modal-overlay" onClick={closeContributeModal}>
            <div className="modal-content contribute-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Contribution</h2>
                <button className="modal-close" onClick={closeContributeModal}>&times;</button>
              </div>

              <div className="contribute-form">
                <div className="goal-preview">
                  <h3>{contributingGoal.goalName}</h3>
                  <p>Current: {formatCurrency(contributingGoal.currentAmount || 0)} / {formatCurrency(contributingGoal.targetAmount)}</p>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{
                        width: `${Math.min(contributingGoal.progress || 0, 100)}%`,
                        backgroundColor: getStatusColor(contributingGoal.status)
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contributionAmount">Amount (KES)</label>
                  <input
                    type="number"
                    id="contributionAmount"
                    step="0.01"
                    min="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeContributeModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn-primary" onClick={handleAddContribution}>
                    Add Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Savings;
