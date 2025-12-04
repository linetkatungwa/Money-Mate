import api from './api';

/**
 * Get expense breakdown by category
 */
export const getExpensesByCategory = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/analytics/expenses-by-category?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get income vs expense comparison by month
 */
export const getIncomeVsExpense = async (months = 6) => {
  try {
    const response = await api.get(`/analytics/income-vs-expense?months=${months}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get spending trends over time
 */
export const getSpendingTrends = async (period = 'month', months = 12) => {
  try {
    const response = await api.get(`/analytics/spending-trends?period=${period}&months=${months}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get comprehensive analytics report
 */
export const getAnalyticsReport = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/analytics/report?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get savings prediction based on income and expense patterns
 */
export const getSavingsPrediction = async (expenseReduction = 0, incomeIncrease = 0, months = 12) => {
  try {
    const response = await api.post('/analytics/savings-prediction', {
      expenseReduction,
      incomeIncrease,
      months
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

