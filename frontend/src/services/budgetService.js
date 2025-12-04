import api from './api';

/**
 * Get all budgets with spending data
 */
export const getBudgets = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.active) params.append('active', filters.active);
    
    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single budget by ID
 */
export const getBudget = async (id) => {
  try {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new budget
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update budget
 */
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete budget
 */
export const deleteBudget = async (id) => {
  try {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get budget summary/statistics
 */
export const getBudgetSummary = async () => {
  try {
    const response = await api.get('/budgets/stats/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

