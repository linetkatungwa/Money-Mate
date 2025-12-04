import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getActivityLogs } from '../services/adminService';
import { formatDate } from '../utils/helpers';
import './AdminActivityLogs.css';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getActivityLogs({
        ...filters,
        userId: filters.userId || undefined,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        page: pagination.page,
        limit: 50
      });
      setLogs(response.data || []);
      setPagination({
        page: response.page,
        total: response.total,
        pages: response.pages
      });
    } catch (err) {
      setError('Failed to load activity logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'update_user': '✏️',
      'delete_user': '🗑️',
      'create_transaction': '💰',
      'update_transaction': '✏️',
      'delete_transaction': '🗑️',
      'create_budget': '🎯',
      'update_budget': '✏️',
      'delete_budget': '🗑️',
      'create_savings': '💎',
      'update_savings': '✏️',
      'delete_savings': '🗑️',
      'login': '🔐',
      'logout': '🚪',
      'register': '👤'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return '#dc3545';
    if (action.includes('create')) return '#50c878';
    if (action.includes('update')) return '#ffc107';
    return '#6c757d';
  };

  return (
    <DashboardLayout>
      <div className="admin-activity-logs">
        <div className="page-header">
          <div>
            <h1 className="page-title">Activity Logs</h1>
            <p className="page-subtitle">System activity and user actions</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Action:</label>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <option value="">All Actions</option>
              <option value="update_user">Update User</option>
              <option value="delete_user">Delete User</option>
              <option value="create_transaction">Create Transaction</option>
              <option value="update_transaction">Update Transaction</option>
              <option value="delete_transaction">Delete Transaction</option>
              <option value="create_budget">Create Budget</option>
              <option value="update_budget">Update Budget</option>
              <option value="delete_budget">Delete Budget</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="register">Register</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Entity Type:</label>
            <select
              value={filters.entityType}
              onChange={(e) => {
                setFilters({ ...filters, entityType: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="transaction">Transaction</option>
              <option value="budget">Budget</option>
              <option value="savings">Savings</option>
              <option value="bill">Bill</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="logs-table-container">
          {loading ? (
            <div className="loading-state">Loading activity logs...</div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
                This could mean: No activity logs exist yet, or there was an error fetching them.
              </p>
              <button className="btn-refresh" onClick={fetchLogs} style={{ marginTop: '16px' }}>
                🔄 Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <p>📋 No activity logs found</p>
              <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
                Activity logs will appear here when users perform actions (create/update/delete transactions, budgets, etc.)
              </p>
            </div>
          ) : (
            <>
              <table className="activity-logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDate(log.createdAt)}</td>
                      <td>
                        {log.userId ? (
                          <div className="log-user">
                            <span>{log.userId.name || log.userId.email || 'Unknown'}</span>
                            <span className="user-email-small">{log.userId.email}</span>
                          </div>
                        ) : (
                          <span className="system-user">System</span>
                        )}
                      </td>
                      <td>
                        <span 
                          className="action-badge"
                          style={{ 
                            backgroundColor: getActionColor(log.action),
                            color: 'white'
                          }}
                        >
                          {getActionIcon(log.action)} {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {log.entityType && (
                          <span className="entity-type-badge">{log.entityType}</span>
                        )}
                      </td>
                      <td>
                        <div className="log-description">
                          {log.description || 'No description'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminActivityLogs;

