import axios from 'axios';

const API_URL = 'http://localhost:5000/api/materials';

/**
 * Fetch master dropdown data (product types, suppliers, brands, receivers, POs)
 */
export const fetchMaterialMasterData = async () => {
  try {
    const res = await axios.get(`${API_URL}/master-data`);
    return res.data?.data || { productTypes: [], suppliers: [], brands: [], users: [], poNumbers: [] };
  } catch (error) {
    console.error('Error fetching material master data:', error);
    return { productTypes: [], suppliers: [], brands: [], users: [], poNumbers: [] };
  }
};

/**
 * Fetch products filtered by product category (product_type_id)
 */
export const fetchProductsByType = async (typeId) => {
  if (!typeId) return [];
  try {
    const res = await axios.get(`${API_URL}/products-by-type/${typeId}`);
    return res.data?.data || [];
  } catch (error) {
    console.error(`Error fetching products for type ${typeId}:`, error);
    return [];
  }
};

/**
 * Fetch product unit and current available stock quantity in inventory
 */
export const fetchProductStock = async (typeId, productId) => {
  if (!typeId || !productId) return { unit: '', total_quantity: 0 };
  try {
    const res = await axios.get(`${API_URL}/product-stock/${typeId}/${productId}`);
    return {
      unit: res.data?.unit || '',
      total_quantity: Number(res.data?.total_quantity || 0)
    };
  } catch (error) {
    console.error(`Error fetching stock for product ${productId}:`, error);
    return { unit: '', total_quantity: 0 };
  }
};

/**
 * Fetch sites allocated to a specific PO number
 */
export const fetchSitesByPo = async (poNo) => {
  if (!poNo) return [];
  try {
    const res = await axios.get(`${API_URL}/sites-by-po/${encodeURIComponent(poNo)}`);
    return res.data?.sites || [];
  } catch (error) {
    console.error(`Error fetching sites for PO ${poNo}:`, error);
    return [];
  }
};

/**
 * Fetch Material Stock Report (joined inventory list)
 */
export const fetchMaterialStockReport = async () => {
  try {
    const res = await axios.get(`${API_URL}/stock-report`);
    return res.data?.data || [];
  } catch (error) {
    console.error('Error fetching material stock report:', error);
    return [];
  }
};

/**
 * Submit Material Stock In
 */
export const submitStockIn = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/stock-in`, payload);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to save stock in details.';
    throw new Error(message);
  }
};

/**
 * Submit Material Stock Out
 */
export const submitStockOut = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/stock-out`, payload);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to submit stock out.';
    throw new Error(message);
  }
};

/**
 * Fetch Stock In transaction history
 */
export const fetchStockInHistory = async () => {
  try {
    const res = await axios.get(`${API_URL}/stock-in-history`);
    return res.data?.data || [];
  } catch (error) {
    console.error('Error fetching stock in history:', error);
    return [];
  }
};

/**
 * Fetch Stock Out transaction history
 */
export const fetchStockOutHistory = async () => {
  try {
    const res = await axios.get(`${API_URL}/stock-out-history`);
    return res.data?.data || [];
  } catch (error) {
    console.error('Error fetching stock out history:', error);
    return [];
  }
};
