import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  getUsers,
  updateUser,
  deleteUser,
  getUserStatistics
} from '../services/adminService';
import { formatDate, formatCurrency } from '../utils/helpers';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userStats, setUserStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers({
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page: pagination.page,
        limit: 20
      });
      setUsers(response.data || []);
      setPagination({
        page: response.page,
        total: response.total,
        pages: response.pages
      });
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setSuccessMessage('User role updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user role');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await updateUser(userId, { isActive });
      setSuccessMessage(`User ${isActive ? 'activated' : 'suspended'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleViewStats = async (user) => {
    try {
      const response = await getUserStatistics(user._id);
      setUserStats(response.data);
      setSelectedUser(user);
      setShowStatsModal(true);
    } catch (err) {
      setError('Failed to load user statistics');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-users">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage users and their accounts</p>
          </div>
        </div>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              placeholder="Search by name or email..."
            />
          </div>
          <div className="filter-group">
            <label>Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {loading ? (
            <div className="loading-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>👥 No users found</p>
            </div>
          ) : (
            <>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`status-btn ${user.isActive !== false ? 'active' : 'inactive'}`}
                          onClick={() => handleStatusChange(user._id, !user.isActive)}
                        >
                          {user.isActive !== false ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon view"
                            onClick={() => handleViewStats(user)}
                            title="View Statistics"
                          >
                            📊
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDelete(user._id, user.name)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
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

        {/* User Statistics Modal */}
        {showStatsModal && userStats && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
            <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Statistics: {selectedUser.name}</h2>
                <button className="modal-close" onClick={() => setShowStatsModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="stats-grid-small">
                  <div className="stat-item">
                    <div className="stat-label">Transactions</div>
                    <div className="stat-value">{userStats.transactions.total}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Income</div>
                    <div className="stat-value">{formatCurrency(userStats.transactions.totalIncome)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Expenses</div>
                    <div className="stat-value">{formatCurrency(userStats.transactions.totalExpenses)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Budgets</div>
                    <div className="stat-value">{userStats.budgets.total}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Savings Goals</div>
                    <div className="stat-value">{userStats.savings.total}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Notifications</div>
                    <div className="stat-value">{userStats.notifications.total}</div>
                  </div>
                </div>
                <div className="user-details">
                  <p><strong>Email:</strong> {userStats.user.email}</p>
                  <p><strong>Role:</strong> {userStats.user.role}</p>
                  <p><strong>Member Since:</strong> {formatDate(userStats.user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;

