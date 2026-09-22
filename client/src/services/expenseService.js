import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expenses';

/**
 * Get form metadata (Expense Types, Companies, Banks, Debit, Payment Modes, POs, Documents, Transfer-To list)
 */
export const getExpenseFormData = async () => {
  const response = await axios.get(`${API_URL}/form-data`);
  return response.data;
};

/**
 * Get allocated sites for a selected PO number
 */
export const getSitesByPoNumber = async (poNo) => {
  if (!poNo) return { success: true, sites: [] };
  const response = await axios.get(`${API_URL}/sites-by-po/${encodeURIComponent(poNo)}`);
  return response.data;
};

/**
 * Get Expense In options for a selected Expense Type ID
 */
export const getExpenseInList = async (expenseTypeId) => {
  if (!expenseTypeId) return { success: true, expenseInList: [] };
  const response = await axios.get(`${API_URL}/expense-in/${expenseTypeId}`);
  return response.data;
};

/**
 * Get Expense For options for a selected Expense In ID
 */
export const getExpenseForList = async (expenseInId) => {
  if (!expenseInId) return { success: true, expenseForList: [] };
  const response = await axios.get(`${API_URL}/expense-for/${expenseInId}`);
  return response.data;
};

/**
 * Submit Create Expense Form (supports FormData with file attachments)
 */
export const createExpense = async (formData) => {
  const response = await axios.post(`${API_URL}/create`, formData, {
    headers: {
      'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
    }
  });
  return response.data;
};

/**
 * Get Site Expense Report data
 */
export const getSiteExpenseReport = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.from_date) query.append('from_date', params.from_date);
  if (params.to_date) query.append('to_date', params.to_date);
  if (params.quarter) query.append('quarter', params.quarter);
  if (params.session) query.append('session', params.session);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const response = await axios.get(`${API_URL}/site-report?${query.toString()}`);
  return response.data;
};

/**
 * Get Office Expense Report data
 */
export const getOfficeExpenseReport = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.from_date) query.append('from_date', params.from_date);
  if (params.to_date) query.append('to_date', params.to_date);
  if (params.company_id) query.append('company_id', params.company_id);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const response = await axios.get(`${API_URL}/office-report?${query.toString()}`);
  return response.data;
};

/**
 * Get B2B Fund Transfer Report data
 */
export const getB2BFundTransferReport = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.from_date) query.append('from_date', params.from_date);
  if (params.to_date) query.append('to_date', params.to_date);
  if (params.company_id) query.append('company_id', params.company_id);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const response = await axios.get(`${API_URL}/fund-transfer-report?${query.toString()}`);
  return response.data;
};

