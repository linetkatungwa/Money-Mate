import api from './api';

/**
 * Get dashboard summary (financial overview)
 */
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (limit = 5) => {
  try {
    const response = await api.get(`/dashboard/transactions/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get expense trends
 */
export const getExpenseTrends = async (months = 6) => {
  try {
    const response = await api.get(`/dashboard/expense-trends?months=${months}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get expense categories breakdown
 */
export const getExpenseCategories = async () => {
  try {
    const response = await api.get('/dashboard/expense-categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

