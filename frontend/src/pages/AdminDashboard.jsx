import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getSystemStatistics } from '../services/adminService';
import { formatCurrency, formatDate } from '../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching system statistics...');
      const response = await getSystemStatistics();
      console.log('✅ Statistics response:', response);
      setStats(response.data);
    } catch (err) {
      console.error('❌ Error fetching statistics:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <div className="admin-dashboard">
          <div className="loading-state">Loading system statistics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">System overview and statistics</p>
          </div>
          <button className="btn-refresh" onClick={fetchStatistics}>
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {stats && (
          <>
            {/* Admin-Only System Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.users.total}</div>
                  <div className="stat-subtext">
                    {stats.users.active} active, {stats.users.admins} admins
                  </div>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-label">New Users</div>
                  <div className="stat-value">{stats.users.new}</div>
                  <div className="stat-subtext">Last 30 days</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔔</div>
                <div className="stat-content">
                  <div className="stat-label">System Notifications</div>
                  <div className="stat-value">{stats.notifications.total}</div>
                  <div className="stat-subtext">Platform-wide alerts</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">System Activity</div>
                  <div className="stat-value">{stats.transactions.recent}</div>
                  <div className="stat-subtext">Actions in last 30 days</div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            {stats.users.recent && stats.users.recent.length > 0 && (
              <div className="section-card">
                <h2>Recent Users</h2>
                <div className="users-list">
                  {stats.users.recent.map((user) => (
                    <div key={user._id} className="user-item">
                      <div className="user-avatar-small">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div className="user-meta">
                        <span className="user-role">{user.role}</span>
                        <span className="user-date">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

