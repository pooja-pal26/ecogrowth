import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/vendors';

// Fallback mock master data
const MOCK_MASTER_DATA = {
  states: [
    { id: '1', state_name: 'Andhra Pradesh' },
    { id: '2', state_name: 'Assam' },
    { id: '3', state_name: 'Bihar' },
    { id: '4', state_name: 'Chhattisgarh' },
    { id: '5', state_name: 'Delhi' },
    { id: '6', state_name: 'Gujarat' },
    { id: '7', state_name: 'Haryana' },
    { id: '8', state_name: 'Madhya Pradesh' },
    { id: '9', state_name: 'Maharashtra' },
    { id: '10', state_name: 'Rajasthan' },
    { id: '11', state_name: 'Uttar Pradesh' },
    { id: '12', state_name: 'West Bengal' }
  ],
  bankList: [
    { id: '1', bank_name: 'Allahabad Bank' },
    { id: '2', bank_name: 'Bank of Baroda' },
    { id: '3', bank_name: 'Bank of India' },
    { id: '4', bank_name: 'HDFC Bank' },
    { id: '5', bank_name: 'ICICI Bank' },
    { id: '6', bank_name: 'Punjab National Bank' },
    { id: '7', bank_name: 'State Bank Of India' }
  ],
  relativeExperienceList: [
    { id: '1', experience: 'Less than 2 years' },
    { id: '2', experience: '3 years - 5 years' },
    { id: '3', experience: 'More than 5 years' }
  ],
  organizationTypeList: [
    { id: '1', organization_type: 'Sole Proprietorship Firm' },
    { id: '2', organization_type: 'Partnership Firm' },
    { id: '3', organization_type: 'Private Limited Company' }
  ],
  associationYearsList: [
    { id: '1', association_years: 'No Existing Relation' },
    { id: '2', association_years: '1 year - 2 years' },
    { id: '3', association_years: 'Over 2 years' }
  ],
  geographicalPresenceList: [
    { id: '1', geographical_presence: 'Localized/Regional' },
    { id: '2', geographical_presence: 'All Metros' },
    { id: '3', geographical_presence: 'Pan India' }
  ],
  vendorMajorClientsList: [
    { id: '1', major_clients: 'Small Company' },
    { id: '2', major_clients: 'Medium Level Company' },
    { id: '3', major_clients: 'Some Large Corporations' }
  ],
  teamStrengthList: [
    { id: '1', team_strength: 'Upto 10' },
    { id: '2', team_strength: '10 - 20' },
    { id: '3', team_strength: 'Above 20' }
  ],
  annualTurnoverList: [
    { id: '1', annual_turnover: 'Upto 1 Cr.' },
    { id: '2', annual_turnover: '1 Cr. to 5 Cr.' },
    { id: '3', annual_turnover: 'Above 5 Cr.' }
  ],
  workHandlingAmountList: [
    { id: '1', work_handling_amount: 'Upto 5 Cr.' },
    { id: '2', work_handling_amount: '5 Cr. to 10 Cr.' },
    { id: '3', work_handling_amount: '10 Cr. to 15 Cr.' }
  ]
};

// Fallback mock vendors
const MOCK_VENDORS = [
  {
    id: '1',
    vendor_name: 'Logimetrix Techsolutions Pvt Ltd',
    email: 'shantanu@logimetrix.co.in',
    contact_number: '7275600003',
    prop_director_name: 'Shantanu Kumar',
    contact_person: 'Rishabh Gupta',
    address: '3/204 Vikas Khand Gomti Nagar Lucknow',
    registered_office_address: '3/204 Vikas Khand Gomti Nagar Lucknow',
    registration_number: 'AA12345678ASD098',
    bank_name: 'Allahabad Bank',
    bank_account_no: '123456789',
    bank_ifsc_code: 'AJAY1234567',
    pan_number: 'AACCL3704H',
    gst_number: '09AACCL3704H1ZO',
    gst_state_name: 'Uttar Pradesh',
    organization_type: 'Private Limited Company',
    annual_turnover: 'Above 5 Cr.',
    is_active: '1',
    status: '1'
  },
  {
    id: '3',
    vendor_name: 'Pooja Traders',
    email: 'avanish.baghel@gmail.com',
    contact_number: '9565215002',
    prop_director_name: 'Avanish Kumar Baghel',
    contact_person: 'Avanish Kumar Baghel',
    address: 'Mitauli, Post_ Mitauli, Dist_ Lakhimpur U.p. 262727',
    registered_office_address: 'Mitauli, Post_ Mitauli, Dist_ Lakhimpur U.p. 262727',
    registration_number: '09CATEB2126D1ZY',
    bank_name: 'State Bank Of India',
    bank_account_no: '30473930386',
    bank_ifsc_code: 'SBIN0011226',
    pan_number: 'CATPB2126D',
    gst_number: '09CATEB2126D1ZY',
    gst_state_name: 'Uttar Pradesh',
    organization_type: 'Sole Proprietorship Firm',
    annual_turnover: '1 Cr. to 5 Cr.',
    is_active: '1',
    status: '1'
  },
  {
    id: '11',
    vendor_name: 'Apex Infrastructure & Services',
    email: 'contact@apexinfra.com',
    contact_number: '9876543210',
    prop_director_name: 'Rajesh Malhotra',
    contact_person: 'Santosh Tiwari',
    address: 'Sector 62, Noida, Uttar Pradesh',
    registered_office_address: 'Sector 62, Noida',
    registration_number: '09APEX1234F1Z5',
    bank_name: 'HDFC Bank',
    bank_account_no: '50200012345678',
    bank_ifsc_code: 'HDFC0001234',
    pan_number: 'AAACA1234B',
    gst_number: '09AAACA1234B1Z5',
    gst_state_name: 'Uttar Pradesh',
    organization_type: 'Partnership Firm',
    annual_turnover: 'Above 5 Cr.',
    is_active: '0',
    status: '1'
  }
];

/**
 * Fetch master dropdown datasets
 */
export const fetchVendorMasterData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/master-data`, { withCredentials: true });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('API fetchVendorMasterData failed, using fallback mock:', err.message);
  }
  return MOCK_MASTER_DATA;
};

/**
 * Fetch vendors list (active or deactive)
 */
export const fetchVendors = async (status = 'active', search = '') => {
  try {
    const res = await axios.get(API_BASE_URL, {
      params: { status, search },
      withCredentials: true
    });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(`API fetchVendors (${status}) failed, using fallback mock:`, err.message);
  }
  const isDeactive = status === 'deactive' || status === 'deactivated' || status === '0';
  return MOCK_VENDORS.filter(v => isDeactive ? v.is_active === '0' : v.is_active === '1');
};

/**
 * Fetch single vendor by ID
 */
export const fetchVendorById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(`API fetchVendorById (${id}) failed:`, err.message);
  }
  return MOCK_VENDORS.find(v => String(v.id) === String(id)) || null;
};

/**
 * Create new vendor
 */
export const createVendor = async (vendorData) => {
  try {
    const res = await axios.post(API_BASE_URL, vendorData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create vendor';
    throw new Error(msg);
  }
};

/**
 * Update existing vendor
 */
export const updateVendor = async (id, vendorData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/${id}`, vendorData, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to update vendor details';
    throw new Error(msg);
  }
};

/**
 * Deactivate vendor profile
 */
export const deactivateVendor = async (id) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/${id}/deactivate`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to deactivate vendor';
    throw new Error(msg);
  }
};

/**
 * Activate vendor profile
 */
export const activateVendor = async (id) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/${id}/activate`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to activate vendor';
    throw new Error(msg);
  }
};

/**
 * Permanently soft-delete vendor profile (status = '2')
 */
export const deleteVendor = async (id) => {
  try {
    const res = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to delete vendor';
    throw new Error(msg);
  }
};
