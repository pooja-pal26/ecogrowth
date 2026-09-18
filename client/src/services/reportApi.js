import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

/**
 * Fetch filter options (suppliers, categories, brands, POs, sites)
 */
export const fetchReportFilters = async () => {
  try {
    const res = await axios.get(`${API_URL}/filters`);
    return res.data?.data || { productTypes: [], suppliers: [], brands: [], poNumbers: [], sites: [] };
  } catch (error) {
    console.error('Error fetching report filters:', error);
    return { productTypes: [], suppliers: [], brands: [], poNumbers: [], sites: [] };
  }
};

/**
 * Fetch Stock In Report
 */
export const fetchStockInReport = async (params = {}) => {
  try {
    const res = await axios.get(`${API_URL}/stock-in`, { params });
    return res.data || { success: false, data: [], summary: {} };
  } catch (error) {
    console.error('Error fetching stock in report:', error);
    return { success: false, data: [], summary: {} };
  }
};

/**
 * Fetch single Stock In details for View Modal
 */
export const fetchStockInDetails = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/stock-in/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error(`Error fetching stock in details for ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetch Stock Out Report
 */
export const fetchStockOutReport = async (params = {}) => {
  try {
    const res = await axios.get(`${API_URL}/stock-out`, { params });
    return res.data || { success: false, data: [], summary: {} };
  } catch (error) {
    console.error('Error fetching stock out report:', error);
    return { success: false, data: [], summary: {} };
  }
};

/**
 * Fetch single Stock Out details for View Modal
 */
export const fetchStockOutDetails = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/stock-out/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error(`Error fetching stock out details for ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetch Overall Stock Summary (Opening, In, Out, Closing)
 */
export const fetchStockSummary = async (params = {}) => {
  try {
    const res = await axios.get(`${API_URL}/stock-summary`, { params });
    return res.data || { success: false, data: [], summary: {}, categoryStats: [] };
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    return { success: false, data: [], summary: {}, categoryStats: [] };
  }
};

/**
 * Fetch Site Financial Summary matching PHP summaryReportAction
 */
export const fetchSiteFinancialSummary = async (params = {}) => {
  try {
    const res = await axios.get(`${API_URL}/site-financial-summary`, { params });
    return res.data || { success: false, data: [], summary: {} };
  } catch (error) {
    console.error('Error fetching site financial summary:', error);
    return { success: false, data: [], summary: {} };
  }
};
