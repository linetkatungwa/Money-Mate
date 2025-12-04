import { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="dashboard-header">
          <button 
            className="menu-toggle" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <NotificationBell />
        </header>
        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

