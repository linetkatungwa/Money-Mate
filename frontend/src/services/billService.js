import api from './api';

/**
 * Get all bills
 */
export const getBills = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.isPaid !== undefined) params.append('isPaid', filters.isPaid);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.dueSoon) params.append('dueSoon', filters.dueSoon);
    if (filters.overdue) params.append('overdue', filters.overdue);
    
    const response = await api.get(`/bills?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single bill by ID
 */
export const getBill = async (id) => {
  try {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new bill
 */
export const createBill = async (billData) => {
  try {
    const response = await api.post('/bills', billData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update bill
 */
export const updateBill = async (id, billData) => {
  try {
    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete bill
 */
export const deleteBill = async (id) => {
  try {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get bills summary/statistics
 */
export const getBillsSummary = async () => {
  try {
    const response = await api.get('/bills/stats/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

