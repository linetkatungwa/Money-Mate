import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

const Landing = () => {
  const { darkMode, setDarkMode } = useTheme();

  const features = [
    {
      icon: '💰',
      title: 'Transaction Tracking',
      description: 'Easily record and categorize your income and expenses. Keep track of every transaction with detailed descriptions and dates.'
    },
    {
      icon: '🎯',
      title: 'Budget Management',
      description: 'Set budgets for different categories and track your spending. Get alerts when you\'re approaching or exceeding your limits.'
    },
    {
      icon: '💎',
      title: 'Savings Goals',
      description: 'Create and track your savings goals. Visualize your progress and stay motivated to reach your financial targets.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Get detailed insights into your spending patterns with interactive charts. Export reports in PDF or Excel format.'
    },
    {
      icon: '🔮',
      title: 'Savings Predictor',
      description: 'Calculate your potential savings based on your income and spending patterns. Plan your financial future with confidence.'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Receive timely alerts for budget overspending, bill reminders, savings milestones, and unusual spending patterns.'
    },
    {
      icon: '📈',
      title: 'Visual Dashboards',
      description: 'View your financial overview at a glance with beautiful charts showing income, expenses, and savings trends.'
    },
    {
      icon: '⚙️',
      title: 'Customizable Settings',
      description: 'Personalize your experience with custom categories, currency preferences, and notification settings.'
    }
  ];

  return (
    <div className={`landing-page${darkMode ? ' dark-mode' : ''}`}>
      {/* Header Navigation */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-text">MoneyMate</span>
          </Link>
          <nav className="header-nav">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Take Control of Your <span className="brand-highlight">Finances</span><br />
              with MoneyMate
            </h1>
            <p className="hero-subtitle">
              The smartest way to track spending, manage budgets, and achieve your financial goals.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary btn-hero">
                Get Started
              </Link>
              <a href="#features" className="btn-secondary btn-hero">
                Learn More
              </a>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">4.9★</div>
              <div className="stat-label">App Rating</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">$2M+</div>
              <div className="stat-label">Total Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage your finances effectively
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to take control of your finances?</h2>
            <p className="cta-subtitle">
              Join Money Mate today and start your journey towards better financial health
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary btn-cta">
                Create Free Account
              </Link>
              <Link to="/login" className="btn-secondary btn-cta">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p className="footer-text">
            © 2024 Money Mate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

