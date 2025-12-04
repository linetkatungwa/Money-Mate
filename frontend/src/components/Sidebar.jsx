import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when nav item is clicked
    if (onClose) onClose();
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Overview' },
    { path: '/transactions', icon: '💰', label: 'Transactions' },
    { path: '/budgets', icon: '🎯', label: 'Budgets' },
    { path: '/savings', icon: '💎', label: 'Savings Goals' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/predictor', icon: '🔮', label: 'Savings Predictor' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  const adminMenuItems = [
    { path: '/admin', icon: '🛡️', label: 'Admin Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'User Management' },
    { path: '/admin/activity', icon: '📋', label: 'Activity Logs' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            <span className="logo-icon">💰</span>
            Money Mate
          </h2>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name || 'User'}</p>
          <p className="user-email">{user?.email || ''}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Show client features only for regular users */}
        {user?.role !== 'admin' && menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
        
        {/* Show admin features only for admin users */}
        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label">System Administration</div>
            {adminMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
            <div className="nav-divider"></div>
            <Link
              to="/settings"
              className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;

