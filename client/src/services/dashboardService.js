import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

// Uncomment and configure if using auth tokens
// const getAuthHeaders = () => {
//   return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
// };

export const getTotalSites = async () => {
  const response = await axios.get(`${API_URL}/total-sites`);
  return response.data.total;
};

export const getPendingSites = async () => {
  const response = await axios.get(`${API_URL}/pending-sites`);
  return response.data.pending;
};

export const getAllocatedSites = async () => {
  const response = await axios.get(`${API_URL}/allocated-sites`);
  return response.data.allocated;
};

export const getCompletedSites = async () => {
  const response = await axios.get(`${API_URL}/completed-sites`);
  return response.data.completed;
};

export const getSiteExpensesChart = async () => {
  const response = await axios.get(`${API_URL}/expenses/site`);
  return response.data;
};

export const getOfficeExpensesChart = async () => {
  const response = await axios.get(`${API_URL}/expenses/office`);
  return response.data;
};

export const getScurveData = async () => {
  const response = await axios.get(`${API_URL}/charts/scurve`);
  return response.data;
};


export const getTotalAssets = async () => {
  const response = await axios.get(`${API_URL}/assets`);
  return response.data.total;
};

export const getTotalInvoices = async () => {
  const response = await axios.get(`${API_URL}/invoices`);
  return response.data.total;
};

export const getTotalMaterials = async () => {
  const response = await axios.get(`${API_URL}/materials`);
  return response.data.total;
};

export const getTotalUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data.total;
};

export const getTotalVendors = async () => {
  const response = await axios.get(`${API_URL}/vendors`);
  return response.data.total;
};

export const getMaterialStockChart = async () => {
  const response = await axios.get(`${API_URL}/charts/material-stock`);
  return response.data;
};

export const getInvoiceDataChart = async () => {
  const response = await axios.get(`${API_URL}/charts/invoices`);
  return response.data;
};

export const getPoAmountsChart = async () => {
  const response = await axios.get(`${API_URL}/charts/po-amounts`);
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await axios.get(`${API_URL}/recent-activity`);
  return response.data;
};
