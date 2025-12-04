import './StatCard.css';

const StatCard = ({ title, amount, change, icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{amount}</div>
      <div className="stat-meta">
        {change !== undefined && (
          <span className={`stat-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;

