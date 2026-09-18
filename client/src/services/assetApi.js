import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/assets';

// Fallback mock data in case backend is offline
const MOCK_TYPES = [
  { id: '1', name: 'IT Assets', description: 'Laptops, workstations, monitors, and peripherals', status: 'Active', assetCount: 3 },
  { id: '2', name: 'Infra Asset', description: 'DG sets, electrical panels, power tools, and heavy machinery', status: 'Active', assetCount: 2 },
  { id: '21', name: 'Ecogrowth Assets', description: 'Solar inverters, monitoring devices, and field instruments', status: 'Active', assetCount: 1 },
  { id: '22', name: 'Vehicles & Transport', description: 'Utility trucks, site inspection vehicles, and two-wheelers', status: 'Active', assetCount: 1 },
  { id: '23', name: 'Office Equipment', description: 'Printers, conference projectors, networking switches', status: 'Active', assetCount: 1 }
];

const MOCK_ASSETS = [
  {
    id: '1',
    code: 'AST-IT-001',
    name: 'Dell Latitude 5420 Laptop',
    asset_type_id: '1',
    typeName: 'IT Assets',
    serial_number: 'SN-DL5420-8921',
    purchase_date: '2025-04-10',
    warranty_date: '2028-04-09',
    value: '65000',
    purchase_cost: '65000',
    condition: 'Good',
    status: 'Assigned',
    location: 'Head Office Lucknow',
    assigned_to: '15',
    assignedToName: 'AJEET KUMAR SINGH',
    notes: 'Assigned for field engineering and SCADA management.'
  },
  {
    id: '2',
    code: 'AST-IT-002',
    name: 'HP ProBook 450 G8',
    asset_type_id: '1',
    typeName: 'IT Assets',
    serial_number: 'SN-HP450-4491',
    purchase_date: '2025-06-15',
    warranty_date: '2027-06-14',
    value: '58000',
    purchase_cost: '58000',
    condition: 'Good',
    status: 'Assigned',
    location: 'Head Office Lucknow',
    assigned_to: '16',
    assignedToName: 'VIVEK SINGH',
    notes: 'Assigned to Site Operations Manager.'
  },
  {
    id: '3',
    code: 'AST-IT-003',
    name: 'Lenovo ThinkPad E14',
    asset_type_id: '1',
    typeName: 'IT Assets',
    serial_number: 'SN-LN-E14-7712',
    purchase_date: '2025-08-01',
    warranty_date: '2028-07-31',
    value: '62000',
    purchase_cost: '62000',
    condition: 'New',
    status: 'Available',
    location: 'IT Department Stockroom',
    assigned_to: null,
    assignedToName: 'Unassigned',
    notes: 'Configured and ready for next engineer allocation.'
  },
  {
    id: '4',
    code: 'AST-INF-001',
    name: 'Kirloskar 15 kVA Diesel Generator',
    asset_type_id: '2',
    typeName: 'Infra Asset',
    serial_number: 'SN-KIRL-15K-990',
    purchase_date: '2024-11-20',
    warranty_date: '2026-11-19',
    value: '285000',
    purchase_cost: '285000',
    condition: 'Good',
    status: 'Assigned',
    location: 'Site IN-3627764 (Chhattisgarh)',
    assigned_to: '28',
    assignedToName: 'PRAVEEN SINGH',
    notes: 'Backup power for installation operations.'
  },
  {
    id: '5',
    code: 'AST-INF-002',
    name: 'Bosch Heavy Hammer Drill Kit',
    asset_type_id: '2',
    typeName: 'Infra Asset',
    serial_number: 'SN-BSH-HD-3312',
    purchase_date: '2025-02-14',
    warranty_date: '2026-02-13',
    value: '18500',
    purchase_cost: '18500',
    condition: 'Fair',
    status: 'In Maintenance',
    location: 'Central Workshop',
    assigned_to: null,
    assignedToName: 'Unassigned',
    notes: 'Sent for chuck servicing and motor brush replacement.'
  },
  {
    id: '6',
    code: 'AST-ECO-001',
    name: 'Solar Array IV Curve Tracer',
    asset_type_id: '21',
    typeName: 'Ecogrowth Assets',
    serial_number: 'SN-IVTRAC-0081',
    purchase_date: '2025-05-18',
    warranty_date: '2027-05-17',
    value: '120000',
    purchase_cost: '120000',
    condition: 'New',
    status: 'Available',
    location: 'Central QA Lab',
    assigned_to: null,
    assignedToName: 'Unassigned',
    notes: 'Calibrated precision instrument for photovoltaic efficiency testing.'
  },
  {
    id: '7',
    code: 'AST-VEH-001',
    name: 'Mahindra Bolero Camper 4x4',
    asset_type_id: '22',
    typeName: 'Vehicles & Transport',
    serial_number: 'UP-32-EG-4512',
    purchase_date: '2024-03-01',
    warranty_date: '2027-02-28',
    value: '890000',
    purchase_cost: '890000',
    condition: 'Good',
    status: 'Assigned',
    location: 'Regional Hub Lucknow',
    assigned_to: '30',
    assignedToName: 'RISHABH GUPTA',
    notes: 'Field vehicle assigned for site audit visits.'
  },
  {
    id: '8',
    code: 'AST-OFF-001',
    name: 'Canon imageRUNNER 2625i Multi-Function Printer',
    asset_type_id: '23',
    typeName: 'Office Equipment',
    serial_number: 'SN-CN-IR2625-103',
    purchase_date: '2024-09-10',
    warranty_date: '2026-09-09',
    value: '145000',
    purchase_cost: '145000',
    condition: 'Good',
    status: 'Available',
    location: 'Head Office Floor 2',
    assigned_to: null,
    assignedToName: 'Unassigned',
    notes: 'Shared office network printer and scanner.'
  }
];

const MOCK_ASSIGNMENTS = [
  {
    id: '1',
    asset_id: '1',
    assetCode: 'AST-IT-001',
    assetName: 'Dell Latitude 5420 Laptop',
    assetType: 'IT Assets',
    assigned_to: '15',
    assignedToName: 'AJEET KUMAR SINGH',
    assigned_by: '1',
    assignedByName: 'Admin',
    assign_date: '2026-05-10 10:00:00',
    formattedAssignDate: '10-05-2026',
    assignTime: '10:00:00',
    return_date: null,
    formattedReturnDate: '-',
    returnTime: '-',
    condition_on_assign: 'Good',
    condition_on_return: '-',
    notes: 'Issued with charger, laptop bag, and wireless mouse.',
    status: 'Assigned'
  },
  {
    id: '2',
    asset_id: '2',
    assetCode: 'AST-IT-002',
    assetName: 'HP ProBook 450 G8',
    assetType: 'IT Assets',
    assigned_to: '16',
    assignedToName: 'VIVEK SINGH',
    assigned_by: '1',
    assignedByName: 'Admin',
    assign_date: '2026-06-01 11:30:00',
    formattedAssignDate: '01-06-2026',
    assignTime: '11:30:00',
    return_date: null,
    formattedReturnDate: '-',
    returnTime: '-',
    condition_on_assign: 'Good',
    condition_on_return: '-',
    notes: 'Issued for daily site progress reporting.',
    status: 'Assigned'
  },
  {
    id: '3',
    asset_id: '4',
    assetCode: 'AST-INF-001',
    assetName: 'Kirloskar 15 kVA Diesel Generator',
    assetType: 'Infra Asset',
    assigned_to: '28',
    assignedToName: 'PRAVEEN SINGH',
    assigned_by: '1',
    assignedByName: 'Admin',
    assign_date: '2026-07-15 09:15:00',
    formattedAssignDate: '15-07-2026',
    assignTime: '09:15:00',
    return_date: null,
    formattedReturnDate: '-',
    returnTime: '-',
    condition_on_assign: 'Good',
    condition_on_return: '-',
    notes: 'Deployed at Site IN-3627764 for civil works.',
    status: 'Assigned'
  },
  {
    id: '4',
    asset_id: '7',
    assetCode: 'AST-VEH-001',
    assetName: 'Mahindra Bolero Camper 4x4',
    assetType: 'Vehicles & Transport',
    assigned_to: '30',
    assignedToName: 'RISHABH GUPTA',
    assigned_by: '1',
    assignedByName: 'Admin',
    assign_date: '2026-08-01 14:00:00',
    formattedAssignDate: '01-08-2026',
    assignTime: '14:00:00',
    return_date: null,
    formattedReturnDate: '-',
    returnTime: '-',
    condition_on_assign: 'Good',
    condition_on_return: '-',
    notes: 'Vehicle handover with keys, RC, and pollution certificate.',
    status: 'Assigned'
  },
  {
    id: '5',
    asset_id: '5',
    assetCode: 'AST-INF-002',
    assetName: 'Bosch Heavy Hammer Drill Kit',
    assetType: 'Infra Asset',
    assigned_to: '31',
    assignedToName: 'ATUL SINGH',
    assigned_by: '1',
    assignedByName: 'Admin',
    assign_date: '2026-07-01 10:00:00',
    formattedAssignDate: '01-07-2026',
    assignTime: '10:00:00',
    return_date: '2026-08-28 17:00:00',
    formattedReturnDate: '28-08-2026',
    returnTime: '17:00:00',
    condition_on_assign: 'Good',
    condition_on_return: 'Needs Repair',
    notes: 'Returned with motor brush wear; sent to workshop for maintenance.',
    status: 'Returned'
  }
];

const MOCK_EMPLOYEES = [
  { id: '15', name: 'AJEET KUMAR SINGH', email: 'ajeet@ecogrowth.in' },
  { id: '16', name: 'VIVEK SINGH', email: 'vivek@ecogrowth.in' },
  { id: '28', name: 'PRAVEEN SINGH', email: 'praveen@ecogrowth.in' },
  { id: '30', name: 'RISHABH GUPTA', email: 'rishabh@ecogrowth.in' },
  { id: '31', name: 'ATUL SINGH', email: 'atul@ecogrowth.in' },
  { id: '38', name: 'SAURABH PRAJAPATI', email: 'saurabh@ecogrowth.in' }
];

/**
 * Fetch Init Master Data
 */
export const fetchAssetInitData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/init`, { withCredentials: true });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('API fetchAssetInitData failed, using fallback mock:', err.message);
  }
  return {
    types: MOCK_TYPES,
    employees: MOCK_EMPLOYEES,
    availableAssets: MOCK_ASSETS.filter(a => a.status === 'Available'),
    conditions: ['New', 'Good', 'Fair', 'Needs Repair'],
    statuses: ['Available', 'Assigned', 'In Maintenance', 'Archived'],
    locations: [
      'Head Office Lucknow',
      'Head Office Floor 2',
      'IT Department Stockroom',
      'Central Warehouse',
      'Central Workshop',
      'Central QA Lab',
      'Regional Hub Lucknow',
      'Site IN-3627764 (Chhattisgarh)'
    ]
  };
};

/**
 * =======================
 * ASSET TYPES API
 * =======================
 */

export const fetchAssetTypes = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/types`, { withCredentials: true });
    if (res.data && res.data.success) return res.data.data;
  } catch (err) {
    console.warn('API fetchAssetTypes failed, using mock data:', err.message);
  }
  return MOCK_TYPES;
};

export const createAssetType = async (typeData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/types`, typeData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create asset type';
    throw new Error(msg);
  }
};

export const updateAssetType = async (id, typeData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/types/${id}`, typeData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to update asset type';
    throw new Error(msg);
  }
};

export const deleteAssetType = async (id) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}/types/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to delete asset type';
    throw new Error(msg);
  }
};

/**
 * =======================
 * ASSETS INVENTORY API
 * =======================
 */

export const fetchAssets = async () => {
  try {
    const res = await axios.get(API_BASE_URL, { withCredentials: true });
    if (res.data && res.data.success) return res.data.data;
  } catch (err) {
    console.warn('API fetchAssets failed, using mock data:', err.message);
  }
  return MOCK_ASSETS;
};

export const fetchAssetById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    if (res.data && res.data.success) return res.data.data;
  } catch (err) {
    console.warn('API fetchAssetById failed, using mock data:', err.message);
  }
  return MOCK_ASSETS.find(a => String(a.id) === String(id));
};

export const createAsset = async (assetData) => {
  try {
    const res = await axios.post(API_BASE_URL, assetData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create asset';
    throw new Error(msg);
  }
};

export const updateAsset = async (id, assetData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/${id}`, assetData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to update asset';
    throw new Error(msg);
  }
};

export const deleteAsset = async (id) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to delete asset';
    throw new Error(msg);
  }
};

/**
 * =======================
 * ASSET ASSIGNMENTS API
 * =======================
 */

export const fetchAssignments = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/assignments`, { withCredentials: true });
    if (res.data && res.data.success) return res.data.data;
  } catch (err) {
    console.warn('API fetchAssignments failed, using mock data:', err.message);
  }
  return MOCK_ASSIGNMENTS;
};

export const assignAsset = async (assignData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/assign`, assignData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to assign asset';
    throw new Error(msg);
  }
};

export const returnAsset = async (returnData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/return`, returnData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to return asset';
    throw new Error(msg);
  }
};

export const transferAsset = async (transferData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/transfer`, transferData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to transfer asset';
    throw new Error(msg);
  }
};
