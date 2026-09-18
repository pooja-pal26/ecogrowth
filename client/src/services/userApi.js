import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/users';

// Fallback mock master data
const MOCK_MASTER_DATA = {
  departments: [
    { id: '1', department: 'Accounts' },
    { id: '2', department: 'HR' },
    { id: '18', department: 'Electrical' },
    { id: '19', department: 'Mechanical' },
    { id: '20', department: 'IT' },
    { id: '21', department: 'Operations' }
  ],
  roleTypes: [
    { id: '1', role_type: 'Senior Level Professionals' },
    { id: '2', role_type: 'Mid Level Professionals' },
    { id: '3', role_type: 'Entry Level Professionals' },
    { id: '4', role_type: 'System Administrator' }
  ],
  roles: [
    { id: '1', role_type: '1', role: 'Admin' },
    { id: '2', role_type: '1', role: 'Chief Executive Officer (CEO)' },
    { id: '3', role_type: '1', role: 'Chief Operation Officer (COO)' },
    { id: '4', role_type: '1', role: 'Chief Finance Officer (CFO)' },
    { id: '15', role_type: '3', role: 'Supervisor' },
    { id: '20', role_type: '2', role: 'Project Manager' },
    { id: '25', role_type: '3', role: 'Field Engineer' }
  ]
};

// Fallback mock users
const MOCK_USERS = [
  {
    id: '1',
    name: 'VIPUL RAI',
    first_name: 'VIPUL',
    last_name: 'RAI',
    contact_no: '9935540006',
    alternate_mobile: '9935540006',
    email_id: 'vipul@logimetrix.co.in',
    department: '20',
    department_name: 'IT',
    role_type: '1',
    role_type_name: 'Senior Level Professionals',
    role: '1',
    role_name: 'Admin',
    date_of_joining: '2017-01-01',
    formattedDOJ: '01/01/2017',
    updated: '2023-04-28',
    formattedUpdated: '28/04/2023',
    current_address: 'VIKAS KHAND, GOMTINAGAR',
    permanent_address: 'VIKAS KHAND, GOMTINAGAR',
    status: '1',
    is_deleted: '0'
  },
  {
    id: '15',
    name: 'AJEET KUMAR SINGH',
    first_name: 'AJEET',
    last_name: 'KUMAR SINGH',
    contact_no: '9876543210',
    alternate_mobile: '9876543211',
    email_id: 'ajeet@ecogrowth.in',
    department: '21',
    department_name: 'Operations',
    role_type: '3',
    role_type_name: 'Entry Level Professionals',
    role: '25',
    role_name: 'Field Engineer',
    date_of_joining: '2024-03-15',
    formattedDOJ: '15/03/2024',
    updated: '2024-03-15',
    formattedUpdated: '15/03/2024',
    current_address: 'INDIRA NAGAR, LUCKNOW',
    permanent_address: 'INDIRA NAGAR, LUCKNOW',
    status: '1',
    is_deleted: '0'
  },
  {
    id: '16',
    name: 'VIVEK SINGH',
    first_name: 'VIVEK',
    last_name: 'SINGH',
    contact_no: '9876543222',
    alternate_mobile: '',
    email_id: 'vivek@ecogrowth.in',
    department: '21',
    department_name: 'Operations',
    role_type: '2',
    role_type_name: 'Mid Level Professionals',
    role: '20',
    role_name: 'Project Manager',
    date_of_joining: '2023-11-01',
    formattedDOJ: '01/11/2023',
    updated: '2024-05-10',
    formattedUpdated: '10/05/2024',
    current_address: 'ALIGANJ, LUCKNOW',
    permanent_address: 'ALIGANJ, LUCKNOW',
    status: '1',
    is_deleted: '0'
  },
  {
    id: '99',
    name: 'MANISH SHARMA',
    first_name: 'MANISH',
    last_name: 'SHARMA',
    contact_no: '9123456789',
    alternate_mobile: '',
    email_id: 'manish@ecogrowth.in',
    department: '18',
    department_name: 'Electrical',
    role_type: '3',
    role_type_name: 'Entry Level Professionals',
    role: '25',
    role_name: 'Field Engineer',
    date_of_joining: '2022-06-10',
    formattedDOJ: '10/06/2022',
    updated: '2024-02-15',
    formattedUpdated: '15/02/2024',
    current_address: 'CHHATTISGARH HUB',
    permanent_address: 'LUCKNOW',
    status: '0',
    is_deleted: '0'
  }
];

/**
 * Fetch Departments, Role Types, and Roles
 */
export const fetchUserMasterData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/master-data`, { withCredentials: true });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('API fetchUserMasterData failed, using fallback mock:', err.message);
  }
  return MOCK_MASTER_DATA;
};

/**
 * Fetch Users (Active or Deactive)
 */
export const fetchUsers = async (status = 'active', search = '', department = '') => {
  try {
    const res = await axios.get(API_BASE_URL, {
      params: { status, search, department },
      withCredentials: true
    });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(`API fetchUsers (${status}) failed, using fallback mock:`, err.message);
  }
  const isDeactive = status === 'deactive' || status === 'inactive';
  return MOCK_USERS.filter(u => isDeactive ? u.status === '0' : u.status === '1');
};

/**
 * Fetch User by ID
 */
export const fetchUserById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(`API fetchUserById (${id}) failed:`, err.message);
  }
  return MOCK_USERS.find(u => String(u.id) === String(id)) || null;
};

/**
 * Create New User
 */
export const createUser = async (userData) => {
  try {
    const res = await axios.post(API_BASE_URL, userData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create user';
    throw new Error(msg);
  }
};

/**
 * Update Existing User
 */
export const updateUser = async (id, userData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/${id}`, userData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to update user details';
    throw new Error(msg);
  }
};

/**
 * Deactivate User Profile
 */
export const deactivateUser = async (id, name) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/${id}/deactivate`, { name }, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to deactivate user';
    throw new Error(msg);
  }
};

/**
 * Activate User Profile
 */
export const activateUser = async (id, name) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/${id}/activate`, { name }, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to activate user';
    throw new Error(msg);
  }
};

/**
 * Clear User Device ID
 */
export const clearUserDeviceId = async (id, name) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/${id}/clear-device`, { name }, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to clear device ID';
    throw new Error(msg);
  }
};

/**
 * Permanently Delete User Profile
 */
export const deleteUserPermanent = async (id, name) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to permanently delete user';
    throw new Error(msg);
  }
};
