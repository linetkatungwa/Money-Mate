import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TransactionModal from '../components/TransactionModal';
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/helpers';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTransactions({ limit: 100 });
      setTransactions(response.data || []);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await createTransaction(transactionData);
      setSuccessMessage('Transaction added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchTransactions();
    } catch (err) {
      throw new Error(err.message || 'Failed to add transaction');
    }
  };

  const handleEditTransaction = async (transactionData) => {
    try {
      await updateTransaction(editingTransaction._id, transactionData);
      setSuccessMessage('Transaction updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await deleteTransaction(id);
      setSuccessMessage('Transaction deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return t.description.toLowerCase().includes(searchLower) ||
             t.category.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Get all unique categories from transactions
  const allCategories = [...new Set(transactions.map(t => t.category))];

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="transactions-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Manage your income and expenses</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            ➕ Add Transaction
          </button>
        </div>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Summary Cards */}
        <div className="transaction-summary">
          <div className="summary-card income">
            <div className="summary-label">Total Income</div>
            <div className="summary-amount">{formatCurrency(totalIncome)}</div>
            <div className="summary-count">{filteredTransactions.filter(t => t.type === 'income').length} transactions</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-amount">{formatCurrency(totalExpenses)}</div>
            <div className="summary-count">{filteredTransactions.filter(t => t.type === 'expense').length} transactions</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Net Balance</div>
            <div className="summary-amount">{formatCurrency(totalIncome - totalExpenses)}</div>
            <div className="summary-count">{filteredTransactions.length} total</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Type</label>
            <select 
              value={filters.type} 
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          {(filters.type || filters.category || filters.search) && (
            <button 
              className="btn-clear-filters"
              onClick={() => setFilters({ type: '', category: '', search: '' })}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="transactions-container">
          {loading ? (
            <div className="loading-state">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <p>📭 No transactions found</p>
              <button onClick={openAddModal} className="btn-primary">
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="transactions-table">
              {filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-row">
                  <div className="transaction-main">
                    <span className={`transaction-type-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '📥' : '📤'}
                    </span>
                    <div className="transaction-info">
                      <div className="transaction-desc">{transaction.description}</div>
                      <div className="transaction-meta">
                        <span className="transaction-category">{transaction.category}</span>
                        <span className="transaction-date">{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <span className={`transaction-amt ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon edit"
                        onClick={() => openEditModal(transaction)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={modalMode === 'edit' ? handleEditTransaction : handleAddTransaction}
          transaction={editingTransaction}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
};

export default Transactions;

