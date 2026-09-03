import axios from 'axios';

const API_URL = 'http://localhost:5000/api/master-data';

// Generic CRUD methods
export const fetchList = async (endpoint) => {
  const response = await axios.get(`${API_URL}/${endpoint}`);
  return response.data;
};

export const createItem = async (endpoint, data) => {
  const response = await axios.post(`${API_URL}/${endpoint}`, data);
  return response.data;
};

export const updateItem = async (endpoint, id, data) => {
  const response = await axios.put(`${API_URL}/${endpoint}/${id}`, data);
  return response.data;
};

export const deleteItem = async (endpoint, id) => {
  const response = await axios.delete(`${API_URL}/${endpoint}/${id}`);
  return response.data;
};
