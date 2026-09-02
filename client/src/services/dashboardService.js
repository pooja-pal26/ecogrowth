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
