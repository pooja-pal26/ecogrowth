import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expense-dashboard';

export const getExpenseOverview = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.year) query.append('year', params.year);
  if (params.zone) query.append('zone', params.zone);
  
  const response = await axios.get(`${API_URL}/overview?${query.toString()}`);
  return response.data;
};

export const getExpenseBreakdown = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.year) query.append('year', params.year);
  if (params.month) query.append('month', params.month);
  if (params.limit) query.append('limit', params.limit);
  
  const response = await axios.get(`${API_URL}/breakdown?${query.toString()}`);
  return response.data;
};
