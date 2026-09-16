import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/invoices';

export const getInvoicesReport = async () => {
  const res = await axios.get(`${API_BASE}`);
  return res.data;
};

export const changeViewStatusAndUpdateInvoice = async (payload) => {
  const res = await axios.post(`${API_BASE}/change-view-status-and-update`, payload);
  return res.data;
};

export const attachPaymentAdviceToInvoice = async (payload) => {
  const res = await axios.post(`${API_BASE}/attach-payment-advice`, payload);
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};

export const getPunchInitData = async () => {
  const res = await axios.get(`${API_BASE}/punch-init`);
  return res.data;
};

export const punchInvoice = async (payload) => {
  const res = await axios.post(`${API_BASE}/punch`, payload);
  return res.data;
};

// Services & Products
export const getServicesProducts = async () => {
  const res = await axios.get(`${API_BASE}/services-products`);
  return res.data;
};

export const addServiceProduct = async (payload) => {
  const res = await axios.post(`${API_BASE}/services-products`, payload);
  return res.data;
};

export const updateServiceProduct = async (id, payload) => {
  const res = await axios.put(`${API_BASE}/services-products/${id}`, payload);
  return res.data;
};

export const toggleServiceStatus = async (id, action) => {
  const res = await axios.post(`${API_BASE}/services-products/${id}/toggle-status`, { action });
  return res.data;
};

export const deleteServiceProduct = async (id) => {
  const res = await axios.delete(`${API_BASE}/services-products/${id}`);
  return res.data;
};

// Generate Invoice
export const getGenerateInvoiceInitData = async () => {
  const res = await axios.get(`${API_BASE}/generate-init`);
  return res.data;
};

export const saveGeneratedInvoice = async (payload) => {
  const res = await axios.post(`${API_BASE}/save-generated`, payload);
  return res.data;
};

// Monthly Invoice Report
export const getMonthlyInvoices = async (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const res = await axios.get(`${API_BASE}/monthly`, { params });
  return res.data;
};

export const addMonthlyInvoice = async (payload) => {
  const res = await axios.post(`${API_BASE}/monthly`, payload);
  return res.data;
};

export const deleteMonthlyInvoiceRecord = async (id) => {
  const res = await axios.delete(`${API_BASE}/monthly/${id}`);
  return res.data;
};

