import os

filepath = 'client/src/services/dashboardService.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_methods = """
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
"""

content += new_methods

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Frontend service updated.")
