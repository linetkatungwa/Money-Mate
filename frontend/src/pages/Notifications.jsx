import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} from '../services/notificationService';
import { formatDate } from '../utils/helpers';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, budget, savings, bill, spending, system, achievement

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        limit: 100,
        page: 1
      };

      if (filter === 'unread') {
        filters.isRead = false;
      } else if (filter === 'read') {
        filters.isRead = true;
      }

      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }

      const response = await getNotifications(filters);
      setNotifications(response.data || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getNotificationStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      await fetchStats();
    } catch (err) {
      setError('Failed to mark notification as read');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setSuccessMessage('All notifications marked as read');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchNotifications();
      await fetchStats();
    } catch (err) {
      setError('Failed to mark all notifications as read');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteNotification(id);
      setSuccessMessage('Notification deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchNotifications();
      await fetchStats();
    } catch (err) {
      setError('Failed to delete notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      budget: '🎯',
      savings: '💎',
      bill: '📅',
      spending: '⚠️',
      system: '🔔',
      achievement: '🎉'
    };
    return icons[type] || '🔔';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#dc3545',
      medium: '#ffc107',
      low: '#6c757d'
    };
    return colors[priority] || '#6c757d';
  };

  const getTypeLabel = (type) => {
    const labels = {
      budget: 'Budget',
      savings: 'Savings',
      bill: 'Bill',
      spending: 'Spending',
      system: 'System',
      achievement: 'Achievement'
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout>
      <div className="notifications-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated on your finances</p>
          </div>
          {stats && stats.unread > 0 && (
            <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
              Mark All Read
            </button>
          )}
        </div>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="notification-stats">
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card unread">
              <div className="stat-label">Unread</div>
              <div className="stat-value">{stats.unread}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Read</div>
              <div className="stat-value">{stats.read}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="notification-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="budget">Budget</option>
              <option value="savings">Savings</option>
              <option value="bill">Bill</option>
              <option value="spending">Spending</option>
              <option value="system">System</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-container">
          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <p>📭 No notifications found</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-card-header">
                    <div className="notification-card-left">
                      <span className="notification-type-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div>
                        <h3 className="notification-card-title">
                          {notification.title || 'Notification'}
                        </h3>
                        <span className="notification-type-badge">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-card-right">
                      {!notification.isRead && (
                        <span
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(notification.priority) }}
                          title={notification.priority}
                        />
                      )}
                    </div>
                  </div>

                  <p className="notification-card-message">{notification.message}</p>

                  <div className="notification-card-footer">
                    <span className="notification-card-time">
                      {formatDate(notification.createdAt)}
                    </span>
                    <div className="notification-card-actions">
                      {!notification.isRead && (
                        <button
                          className="btn-action"
                          onClick={() => handleMarkAsRead(notification._id)}
                          title="Mark as read"
                        >
                          ✓ Read
                        </button>
                      )}
                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(notification._id)}
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
      </div>
    </DashboardLayout>
  );
};

export default Notifications;

