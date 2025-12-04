import api from './api';

/**
 * Get all savings goals
 */
export const getSavingsGoals = async (status = 'all') => {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get(`/savings?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single savings goal by ID
 */
export const getSavingsGoal = async (id) => {
  try {
    const response = await api.get(`/savings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new savings goal
 */
export const createSavingsGoal = async (goalData) => {
  try {
    const response = await api.post('/savings', goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update savings goal
 */
export const updateSavingsGoal = async (id, goalData) => {
  try {
    const response = await api.put(`/savings/${id}`, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add contribution to savings goal
 */
export const addContribution = async (id, amount) => {
  try {
    const response = await api.post(`/savings/${id}/contribute`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete savings goal
 */
export const deleteSavingsGoal = async (id) => {
  try {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get savings summary/statistics
 */
export const getSavingsSummary = async () => {
  try {
    const response = await api.get('/savings/stats/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

