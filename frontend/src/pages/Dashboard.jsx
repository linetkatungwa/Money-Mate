import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getDashboardSummary, getExpenseTrends, getExpenseCategories } from '../services/dashboardService';
import { getIncomeVsExpense } from '../services/analyticsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    percentageChanges: {
      balance: 0,
      income: 0,
      expenses: 0,
      savings: 0
    }
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [expenseTrends, setExpenseTrends] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
    fetchExpenseData();
    
    // Debug: Check if we have any transactions at all
    console.log('=== DASHBOARD MOUNTED ===');
    console.log('Recent Transactions:', recentTransactions);
  }, []);

  const fetchExpenseData = async () => {
    try {
      const [trendsResponse, categoriesResponse] = await Promise.all([
        getExpenseTrends(6),
        getExpenseCategories()
      ]);
      
      console.log('Expense Trends Response:', trendsResponse);
      console.log('Expense Trends Data:', trendsResponse?.data);
      console.log('Expense Categories Response:', categoriesResponse);
      console.log('Expense Categories Data:', categoriesResponse?.data);
      
      if (trendsResponse.success && trendsResponse.data) {
        setExpenseTrends(trendsResponse.data);
        console.log('Expense trends set!', trendsResponse.data.length, 'items');
      }
      if (categoriesResponse.success && categoriesResponse.data) {
        setExpenseCategories(categoriesResponse.data);
        console.log('Expense categories set!', categoriesResponse.data.length, 'items');
      }
    } catch (err) {
      console.error('Expense data fetch error:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await getIncomeVsExpense(6); // Last 6 months
      console.log('Income vs Expense Response:', response);
      console.log('Income vs Expense Data Array:', response?.data);
      console.log('Is Array?', Array.isArray(response?.data));
      console.log('Array Length:', response?.data?.length);
      if (response.success && response.data) {
        setChartData(response.data);
        console.log('Chart data set successfully!');
      } else {
        console.log('No chart data or failed response');
      }
    } catch (err) {
      console.error('Chart data fetch error:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDashboardSummary();
      console.log('=== DASHBOARD SUMMARY ===');
      console.log('Full Response:', response);
      if (response.success) {
        setFinancialData(response.data);
        setRecentTransactions(response.data.recentTransactions || []);
        console.log('Recent Transactions Found:', response.data.recentTransactions?.length || 0);
        console.log('Recent Transactions:', response.data.recentTransactions);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add-transaction':
        navigate('/transactions?action=add');
        break;
      case 'set-budget':
        navigate('/budgets?action=add');
        break;
      case 'create-goal':
        navigate('/savings?action=add');
        break;
      case 'view-reports':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-overview">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard Overview</h1>
              <p className="page-subtitle">Welcome back, {user?.name}! 👋</p>
            </div>
          </div>
          <div className="loading-state">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-overview">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Welcome back, {user?.name}! 👋</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchDashboardData} className="btn-link">Retry</button>
          </div>
        )}

        {/* Financial Summary Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Income"
            amount={formatCurrency(financialData.income)}
            change={financialData.percentageChanges.income}
            color="#0000FF"
          />
          <StatCard
            title="Total Expenses"
            amount={formatCurrency(financialData.expenses)}
            change={financialData.percentageChanges.expenses}
            color="#EF4444"
          />
          <StatCard
            title="Net Balance"
            amount={formatCurrency(financialData.totalBalance)}
            change={financialData.percentageChanges.balance}
            color="#10B981"
          />
          <StatCard
            title="Savings"
            amount={formatCurrency(financialData.savings)}
            change={financialData.percentageChanges.savings}
            color="#F59E0B"
          />
        </div>

        {/* Analytical Charts */}
        <div className="charts-section">
          <h2 className="section-title">Financial Insights</h2>
          {(!chartData || chartData.length === 0) && (
            <div className="section-card">
              <div className="empty-state">
                <p>📊 No chart data available yet. Add some transactions to see your financial insights!</p>
              </div>
            </div>
          )}
          {chartData && chartData.length > 0 && (
            <>
            <div className="charts-grid">
              {/* Income vs Expenses vs Savings Chart */}
              <div className="chart-card">
                <h3 className="chart-title">💰 Income, Expenses & Savings Overview</h3>
                <div className="chart-container">
                  <Bar
                    data={{
                      labels: chartData.map(item => item.monthLabel),
                      datasets: [
                        {
                          label: 'Income',
                          data: chartData.map(item => item.income),
                          backgroundColor: 'rgba(25, 118, 210, 0.8)',
                          borderColor: 'rgb(25, 118, 210)',
                          borderWidth: 2
                        },
                        {
                          label: 'Expenses',
                          data: chartData.map(item => item.expense),
                          backgroundColor: 'rgba(244, 67, 54, 0.8)',
                          borderColor: 'rgb(244, 67, 54)',
                          borderWidth: 2
                        },
                        {
                          label: 'Net Savings',
                          data: chartData.map(item => item.net),
                          backgroundColor: 'rgba(76, 175, 80, 0.8)',
                          borderColor: 'rgb(76, 175, 80)',
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            padding: 15,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Expense Trends Line Chart */}
              {expenseTrends && expenseTrends.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title">📉 Expense Trends (Last 6 Months)</h3>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: expenseTrends.map(item => item.monthLabel),
                        datasets: [
                          {
                            label: 'Total Expenses',
                            data: expenseTrends.map(item => item.total),
                            borderColor: 'rgb(255, 152, 0)',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: 'rgb(255, 152, 0)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                          },
                          {
                            label: 'Average Per Transaction',
                            data: expenseTrends.map(item => item.average),
                            borderColor: 'rgb(156, 39, 176)',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(156, 39, 176)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              padding: 15,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                              },
                              afterLabel: function(context) {
                                if (context.datasetIndex === 0) {
                                  const dataPoint = expenseTrends[context.dataIndex];
                                  return `Transactions: ${dataPoint.count}`;
                                }
                                return '';
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expense Categories Pie Chart */}
            {expenseCategories && expenseCategories.length > 0 && (
              <div className="chart-card expense-breakdown">
                <h3 className="chart-title">🎯 Expense Breakdown by Category (This Month)</h3>
                <div className="chart-container-pie">
                  <Pie
                    data={{
                      labels: expenseCategories.map(item => item.category),
                      datasets: [
                        {
                          data: expenseCategories.map(item => item.total),
                          backgroundColor: [
                            'rgba(25, 118, 210, 0.8)',
                            'rgba(244, 67, 54, 0.8)',
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(156, 39, 176, 0.8)',
                            'rgba(3, 169, 244, 0.8)',
                            'rgba(233, 30, 99, 0.8)',
                            'rgba(205, 220, 57, 0.8)'
                          ],
                          borderColor: [
                            'rgb(25, 118, 210)',
                            'rgb(244, 67, 54)',
                            'rgb(76, 175, 80)',
                            'rgb(255, 152, 0)',
                            'rgb(156, 39, 176)',
                            'rgb(3, 169, 244)',
                            'rgb(233, 30, 99)',
                            'rgb(205, 220, 57)'
                          ],
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            padding: 12,
                            font: {
                              size: 11
                            },
                            generateLabels: function(chart) {
                              const data = chart.data;
                              if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                  const value = data.datasets[0].data[i];
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                  };
                                });
                              }
                              return [];
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = formatCurrency(context.parsed);
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
            </>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Transactions</h2>
            <button 
              className="btn-link" 
              onClick={() => navigate('/transactions')}
            >
              View All
            </button>
          </div>
          
          <div className="transactions-list">
            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet. Start by adding your first transaction!</p>
                <button 
                  className="btn-primary" 
                  onClick={() => handleQuickAction('add-transaction')}
                >
                  Add Transaction
                </button>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-left">
                    <span className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '📥' : '📤'}
                    </span>
                    <div className="transaction-details">
                      <p className="transaction-description">{transaction.description}</p>
                      <p className="transaction-meta">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('add-transaction')}
            >
              <span className="action-icon">➕</span>
              <span>Add Transaction</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('set-budget')}
            >
              <span className="action-icon">🎯</span>
              <span>Set Budget</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('create-goal')}
            >
              <span className="action-icon">💎</span>
              <span>Create Goal</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('view-reports')}
            >
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

