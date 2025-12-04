import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import DashboardLayout from '../components/DashboardLayout';
import {
  getExpensesByCategory,
  getIncomeVsExpense,
  getSpendingTrends,
  getAnalyticsReport
} from '../services/analyticsService';
import { formatCurrency } from '../utils/helpers';
import { CHART_COLORS } from '../utils/constants';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [expenseData, setExpenseData] = useState(null);
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState(null);
  const [spendingTrendsData, setSpendingTrendsData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
  const [successMessage, setSuccessMessage] = useState('');
  
  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [months, setMonths] = useState(0.033); // Start with 1 day (1/30 of a month)
  const [trendPeriod, setTrendPeriod] = useState('day');

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, months, trendPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📊 Fetching analytics with params:', { startDate, endDate, months, trendPeriod });

      const [expenses, incomeExpense, trends, report] = await Promise.all([
        getExpensesByCategory(startDate || null, endDate || null),
        getIncomeVsExpense(months),
        getSpendingTrends(trendPeriod, months),
        getAnalyticsReport(startDate || null, endDate || null)
      ]);

      console.log('✅ Expenses data:', expenses.data);
      console.log('✅ Income vs Expense data:', incomeExpense.data);
      console.log('✅ Spending trends data:', trends.data);
      console.log('✅ Report data:', report.data);

      setExpenseData(expenses.data);
      setIncomeVsExpenseData(incomeExpense.data);
      setSpendingTrendsData(trends.data);
      setReportData(report.data);
    } catch (err) {
      console.error('❌ Analytics error:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare expense pie chart data
  const expensePieData = expenseData ? {
    labels: expenseData.map(item => item.category),
    datasets: [{
      label: 'Expenses by Category',
      data: expenseData.map(item => item.amount),
      backgroundColor: CHART_COLORS.slice(0, expenseData.length),
      borderColor: '#fff',
      borderWidth: 2
    }]
  } : null;

  // Prepare income vs expense line chart data
  const incomeVsExpenseLineData = incomeVsExpenseData ? {
    labels: incomeVsExpenseData.map(item => item.monthLabel),
    datasets: [
      {
        label: 'Income',
        data: incomeVsExpenseData.map(item => item.income),
        backgroundColor: '#50c878',
        borderColor: '#50c878',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: incomeVsExpenseData.map(item => item.expense),
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      },
      {
        label: 'Net',
        data: incomeVsExpenseData.map(item => item.net),
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        borderWidth: 1
      }
    ]
  } : null;

  // Prepare spending trends bar chart data
  const spendingTrendsBarData = spendingTrendsData ? {
    labels: spendingTrendsData.map(item => item.periodLabel),
    datasets: [{
      label: 'Spending',
      data: spendingTrendsData.map(item => item.amount),
      backgroundColor: '#667eea',
      borderColor: '#764ba2',
      borderWidth: 1
    }]
  } : null;

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const percentage = expenseData ? expenseData[context.dataIndex].percentage : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Spending: ${formatCurrency(context.parsed.y)}`;
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
  };

  const handleExportPDF = async () => {
    try {
      if (!reportData) {
        setError('Please wait for data to load before exporting.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setExporting(prev => ({ ...prev, pdf: true }));
      setError('');
      setSuccessMessage('');

      const chartData = {
        expensesByCategory: expenseData,
        incomeVsExpense: incomeVsExpenseData,
        spendingTrends: spendingTrendsData
      };

      await exportToPDF(reportData, chartData, startDate, endDate);
      
      setSuccessMessage('PDF exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.message || 'Failed to export PDF. Please ensure jspdf is installed.';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
      console.error('PDF export error:', error);
    } finally {
      setExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExportExcel = async () => {
    try {
      if (!reportData) {
        setError('Please wait for data to load before exporting.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setExporting(prev => ({ ...prev, excel: true }));
      setError('');
      setSuccessMessage('');

      const chartData = {
        expensesByCategory: expenseData,
        incomeVsExpense: incomeVsExpenseData,
        spendingTrends: spendingTrendsData
      };

      await exportToExcel(reportData, chartData, startDate, endDate);
      
      setSuccessMessage('Excel file exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.message || 'Failed to export Excel. Please ensure xlsx is installed.';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
      console.error('Excel export error:', error);
    } finally {
      setExporting(prev => ({ ...prev, excel: false }));
    }
  };

  const handleDateRangeChange = () => {
    fetchAnalytics();
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <DashboardLayout>
      <div className="analytics-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Analytics & Reports</h1>
            <p className="page-subtitle">Financial insights and visualizations</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-export" 
              onClick={handleExportPDF}
              disabled={exporting.pdf || loading || !reportData}
            >
              {exporting.pdf ? '⏳ Exporting...' : '📄 Export PDF'}
            </button>
            <button 
              className="btn-export" 
              onClick={handleExportExcel}
              disabled={exporting.excel || loading || !reportData}
            >
              {exporting.excel ? '⏳ Exporting...' : '📊 Export Excel'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {/* Date Range Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateRangeChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateRangeChange}
            />
          </div>
          <div className="filter-group">
            <label>Time Range:</label>
            <select
              value={months}
              onChange={(e) => setMonths(parseFloat(e.target.value))}
            >
              <option value={0.033}>Last 1 Day</option>
              <option value={0.25}>Last 1 Week</option>
              <option value={1}>Last 1 Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
              <option value={24}>Last 24 Months</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Trend Period:</label>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          {(startDate || endDate) && (
            <button className="btn-clear" onClick={clearDateRange}>
              Clear Dates
            </button>
          )}
        </div>

        {/* Summary Cards */}
        {reportData && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Income</div>
              <div className="summary-amount income">{formatCurrency(reportData.summary.totalIncome)}</div>
              <div className="summary-count">{reportData.summary.transactionCounts.income} transactions</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Expenses</div>
              <div className="summary-amount expense">{formatCurrency(reportData.summary.totalExpense)}</div>
              <div className="summary-count">{reportData.summary.transactionCounts.expense} transactions</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Net Amount</div>
              <div className={`summary-amount ${reportData.summary.netAmount >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(reportData.summary.netAmount)}
              </div>
              <div className="summary-count">
                Avg: {formatCurrency(reportData.summary.avgExpense)} per expense
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Transactions</div>
              <div className="summary-amount">{reportData.summary.transactionCounts.total}</div>
              <div className="summary-count">
                Avg: {formatCurrency(reportData.summary.avgIncome)} per income
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Expense Breakdown Pie Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Expenses by Category</h3>
              {expenseData && (
                <span className="chart-total">
                  Total: {formatCurrency(expenseData.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              )}
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading-state">Loading chart...</div>
              ) : expensePieData ? (
                <Pie data={expensePieData} options={pieOptions} />
              ) : (
                <div className="empty-state">No expense data available</div>
              )}
            </div>
          </div>

          {/* Income vs Expense Bar Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Income vs Expenses</h3>
              <span className="chart-period">
                {months === 0.033 ? 'Today' : 
                 months === 0.25 ? 'Last 7 days' :
                 months === 1 ? 'Last month' :
                 `Last ${months} months`}
              </span>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading-state">Loading chart...</div>
              ) : incomeVsExpenseLineData ? (
                <Bar data={incomeVsExpenseLineData} options={lineOptions} />
              ) : (
                <div className="empty-state">No data available</div>
              )}
            </div>
          </div>

          {/* Spending Trends Bar Chart */}
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Spending Trends</h3>
              <span className="chart-period">
                {trendPeriod.charAt(0).toUpperCase() + trendPeriod.slice(1)} view
              </span>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading-state">Loading chart...</div>
              ) : spendingTrendsBarData ? (
                <Bar data={spendingTrendsBarData} options={barOptions} />
              ) : (
                <div className="empty-state">No spending data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        {reportData && (
          <div className="tables-section">
            <div className="table-card">
              <h3>Top Expense Categories</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.expenseBreakdown.slice(0, 10).map((item, index) => {
                    const percentage = reportData.summary.totalExpense > 0
                      ? Math.round((item.amount / reportData.summary.totalExpense) * 100 * 10) / 10
                      : 0;
                    return (
                      <tr key={index}>
                        <td>{item.category}</td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>{item.count}</td>
                        <td>
                          <div className="percentage-bar">
                            <div 
                              className="percentage-fill"
                              style={{ width: `${percentage}%` }}
                            />
                            <span>{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="table-card">
              <h3>Top Expenses</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.description}</td>
                      <td>{expense.category}</td>
                      <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
