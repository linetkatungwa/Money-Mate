import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getSavingsPrediction } from '../services/analyticsService';
import { formatCurrency } from '../utils/helpers';
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
import { Line, Bar } from 'react-chartjs-2';
import './SavingsPredictor.css';

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

const SavingsPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expenseReduction, setExpenseReduction] = useState(0);
  const [incomeIncrease, setIncomeIncrease] = useState(0);
  const [months, setMonths] = useState(12);
  const [predictionData, setPredictionData] = useState(null);

  useEffect(() => {
    // Auto-load prediction on mount with default values
    handlePredict();
  }, []);

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSavingsPrediction(expenseReduction, incomeIncrease, months);
      if (response.success) {
        setPredictionData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const getLineChartData = () => {
    if (!predictionData?.predictions) return null;

    return {
      labels: predictionData.predictions.map(p => p.monthLabel),
      datasets: [
        {
          label: 'Projected Income',
          data: predictionData.predictions.map(p => p.projectedIncome),
          borderColor: 'rgb(80, 200, 120)',
          backgroundColor: 'rgba(80, 200, 120, 0.1)',
          tension: 0.4
        },
        {
          label: 'Projected Expenses',
          data: predictionData.predictions.map(p => p.projectedExpense),
          borderColor: 'rgb(255, 107, 107)',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getSavingsChartData = () => {
    if (!predictionData?.predictions) return null;

    return {
      labels: predictionData.predictions.map(p => p.monthLabel),
      datasets: [
        {
          label: 'Monthly Savings',
          data: predictionData.predictions.map(p => p.monthlySavings),
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgb(102, 126, 234)',
          borderWidth: 1
        },
        {
          label: 'Cumulative Savings',
          data: predictionData.predictions.map(p => p.cumulativeSavings),
          backgroundColor: 'rgba(255, 165, 0, 0.6)',
          borderColor: 'rgb(255, 165, 0)',
          borderWidth: 1,
          type: 'line',
          tension: 0.4,
          fill: false
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
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

  return (
    <DashboardLayout>
      <div className="savings-predictor">
        <div className="page-header">
          <div>
            <h1 className="page-title">Savings Predictor</h1>
            <p className="page-subtitle">
              Calculate your potential savings based on your income and spending patterns
            </p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={handlePredict} className="btn-link">Retry</button>
          </div>
        )}

        {/* Scenario Inputs */}
        <div className="scenario-card">
          <h2 className="section-title">Adjust Your Scenario</h2>
          <div className="scenario-inputs">
            <div className="input-group">
              <label htmlFor="expenseReduction">
                Reduce Expenses by (%)
              </label>
              <input
                type="number"
                id="expenseReduction"
                min="0"
                max="100"
                value={expenseReduction}
                onChange={(e) => setExpenseReduction(parseFloat(e.target.value) || 0)}
                className="input-field"
              />
              <span className="input-hint">
                Current: {predictionData?.historical?.avgMonthlyExpense 
                  ? formatCurrency(predictionData.historical.avgMonthlyExpense)
                  : 'N/A'}
              </span>
            </div>

            <div className="input-group">
              <label htmlFor="incomeIncrease">
                Increase Income by (%)
              </label>
              <input
                type="number"
                id="incomeIncrease"
                min="0"
                max="100"
                value={incomeIncrease}
                onChange={(e) => setIncomeIncrease(parseFloat(e.target.value) || 0)}
                className="input-field"
              />
              <span className="input-hint">
                Current: {predictionData?.historical?.avgMonthlyIncome 
                  ? formatCurrency(predictionData.historical.avgMonthlyIncome)
                  : 'N/A'}
              </span>
            </div>

            <div className="input-group">
              <label htmlFor="months">
                Prediction Period (Months)
              </label>
              <select
                id="months"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="input-field"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-primary btn-predict"
            >
              {loading ? 'Calculating...' : 'Calculate Prediction'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-state">Analyzing your financial patterns...</div>
        )}

        {predictionData && (
          <>
            {!predictionData.hasData ? (
              <div className="empty-state">
                <p>{predictionData.message}</p>
                <p className="empty-hint">
                  Add more transactions to enable accurate savings predictions.
                </p>
              </div>
            ) : (
              <>
                {/* Historical Summary */}
                <div className="summary-grid">
                  <div className="summary-card">
                    <h3 className="summary-title">Historical Analysis</h3>
                    <div className="summary-content">
                      <div className="summary-item">
                        <span className="summary-label">Months Analyzed:</span>
                        <span className="summary-value">{predictionData.historical.monthsAnalyzed}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Avg Monthly Income:</span>
                        <span className="summary-value income">
                          {formatCurrency(predictionData.historical.avgMonthlyIncome)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Avg Monthly Expense:</span>
                        <span className="summary-value expense">
                          {formatCurrency(predictionData.historical.avgMonthlyExpense)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Avg Monthly Savings:</span>
                        <span className="summary-value savings">
                          {formatCurrency(predictionData.historical.avgMonthlySavings)}
                        </span>
                      </div>
                      {predictionData.historical.incomeTrend !== 0 && (
                        <div className="summary-item">
                          <span className="summary-label">Income Trend:</span>
                          <span className={`summary-value ${predictionData.historical.incomeTrend > 0 ? 'positive' : 'negative'}`}>
                            {predictionData.historical.incomeTrend > 0 ? '+' : ''}
                            {formatCurrency(predictionData.historical.incomeTrend)}/month
                          </span>
                        </div>
                      )}
                      {predictionData.historical.expenseTrend !== 0 && (
                        <div className="summary-item">
                          <span className="summary-label">Expense Trend:</span>
                          <span className={`summary-value ${predictionData.historical.expenseTrend < 0 ? 'positive' : 'negative'}`}>
                            {predictionData.historical.expenseTrend > 0 ? '+' : ''}
                            {formatCurrency(predictionData.historical.expenseTrend)}/month
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="summary-card">
                    <h3 className="summary-title">Projected Summary</h3>
                    <div className="summary-content">
                      <div className="summary-item highlight">
                        <span className="summary-label">Total Projected Savings:</span>
                        <span className="summary-value savings large">
                          {formatCurrency(predictionData.summary.totalProjectedSavings)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Avg Monthly Savings:</span>
                        <span className="summary-value savings">
                          {formatCurrency(predictionData.summary.avgMonthlySavings)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Best Month:</span>
                        <span className="summary-value positive">
                          {predictionData.summary.bestMonth.month} - {formatCurrency(predictionData.summary.bestMonth.savings)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Worst Month:</span>
                        <span className="summary-value negative">
                          {predictionData.summary.worstMonth.month} - {formatCurrency(predictionData.summary.worstMonth.savings)}
                        </span>
                      </div>
                      {(expenseReduction > 0 || incomeIncrease > 0) && (
                        <div className="summary-item highlight">
                          <span className="summary-label">Scenario Applied:</span>
                          <span className="summary-value">
                            {expenseReduction > 0 && `-${expenseReduction}% expenses`}
                            {expenseReduction > 0 && incomeIncrease > 0 && ', '}
                            {incomeIncrease > 0 && `+${incomeIncrease}% income`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3 className="chart-title">Income vs Expenses Projection</h3>
                    <div className="chart-container">
                      {getLineChartData() && (
                        <Line data={getLineChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">Savings Projection</h3>
                    <div className="chart-container">
                      {getSavingsChartData() && (
                        <Bar data={getSavingsChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Predictions Table */}
                <div className="predictions-table-card">
                  <h3 className="section-title">Monthly Predictions</h3>
                  <div className="table-container">
                    <table className="predictions-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Projected Income</th>
                          <th>Projected Expenses</th>
                          <th>Monthly Savings</th>
                          <th>Cumulative Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionData.predictions.map((prediction) => (
                          <tr key={prediction.month}>
                            <td>{prediction.monthLabel}</td>
                            <td className="income">{formatCurrency(prediction.projectedIncome)}</td>
                            <td className="expense">{formatCurrency(prediction.projectedExpense)}</td>
                            <td className={prediction.monthlySavings >= 0 ? 'savings positive' : 'savings negative'}>
                              {formatCurrency(prediction.monthlySavings)}
                            </td>
                            <td className="savings cumulative">
                              {formatCurrency(prediction.cumulativeSavings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavingsPredictor;


