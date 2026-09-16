import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

export const getTotalSites = async (params = {}) => {
  const response = await axios.get(`${API_URL}/total-sites`, { params });
  return response.data.total;
};

export const getPendingSites = async (params = {}) => {
  const response = await axios.get(`${API_URL}/pending-sites`, { params });
  return response.data.pending;
};

export const getAllocatedSites = async (params = {}) => {
  const response = await axios.get(`${API_URL}/allocated-sites`, { params });
  return response.data.allocated;
};

export const getCompletedSites = async (params = {}) => {
  const response = await axios.get(`${API_URL}/completed-sites`, { params });
  return response.data.completed;
};

export const getSiteExpensesChart = async (params = {}) => {
  const response = await axios.get(`${API_URL}/expenses/site`, { params });
  return response.data;
};

export const getOfficeExpensesChart = async (params = {}) => {
  const response = await axios.get(`${API_URL}/expenses/office`, { params });
  return response.data;
};

export const getScurveData = async (params = {}) => {
  const response = await axios.get(`${API_URL}/charts/scurve`, { params });
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

export const getMaterialStockChart = async (params = {}) => {
  const response = await axios.get(`${API_URL}/charts/material-stock`, { params });
  return response.data;
};

export const getInvoiceDataChart = async (params = {}) => {
  const response = await axios.get(`${API_URL}/charts/invoices`, { params });
  return response.data;
};

export const getPoAmountsChart = async (params = {}) => {
  const response = await axios.get(`${API_URL}/charts/po-amounts`, { params });
  return response.data;
};

export const getPoSiteProfitLoss = async (params = {}) => {
  const response = await axios.get(`${API_URL}/charts/po-site-profit-loss`, { params });
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await axios.get(`${API_URL}/recent-activity`);
  return response.data;  
};

export const getSitesDetailList = async (type = 'all') => {
  const response = await axios.get(`${API_URL}/sites-detail-list`, { params: { type } });
  return response.data;
};
