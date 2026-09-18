import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Plus, Search, Eye, Edit2, Ban, 
  AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight, 
  MapPin, Phone, Mail, FileCheck, ShieldCheck, DollarSign, Building
} from 'lucide-react';
import { 
  fetchVendors, 
  fetchVendorMasterData, 
  updateVendor, 
  deactivateVendor 
} from '../../services/vendorApi';

const ActiveVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [masterData, setMasterData] = useState({
    states: [],
    bankList: [],
    relativeExperienceList: [],
    organizationTypeList: [],
    associationYearsList: [],
    geographicalPresenceList: [],
    vendorMajorClientsList: [],
    teamStrengthList: [],
    annualTurnoverList: [],
    workHandlingAmountList: []
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // View Modal State (matching PHP view-vendor-profile.phtml)
  const [viewVendor, setViewVendor] = useState(null);
  const [viewTab, setViewTab] = useState('basic');
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit Modal State (matching PHP edit-vendor-info.phtml with 5 tabs)
  const [editVendor, setEditVendor] = useState(null);
  const [editTab, setEditTab] = useState('basicDetails');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Deactivate Confirmation Modal (matching PHP deactivateVendor)
  const [deactivateConfirm, setDeactivateConfirm] = useState({
    isOpen: false,
    vendor: null,
    loading: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [vendorList, master] = await Promise.all([
        fetchVendors('active'),
        fetchVendorMasterData()
      ]);
      setVendors(Array.isArray(vendorList) ? vendorList : []);
      if (master) setMasterData(master);
    } catch (err) {
      console.error('Error loading active vendors:', err);
      showNotification('error', 'Failed to load vendor records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalActive = vendors.length;
    const withGst = vendors.filter(v => Boolean(v.gst_number)).length;
    const highTurnover = vendors.filter(v => v.annual_turnover && v.annual_turnover.includes('Above')).length;
    return { totalActive, withGst, highTurnover };
  }, [vendors]);

  // Filtered List
  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(v =>
        (v.vendor_name && v.vendor_name.toLowerCase().includes(q)) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(q)) ||
        (v.contact_number && v.contact_number.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.pan_number && v.pan_number.toLowerCase().includes(q)) ||
        (v.gst_number && v.gst_number.toLowerCase().includes(q))
      );
    }

    return result;
  }, [vendors, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage]);

  // Open View Profile
  const handleOpenView = (vendor) => {
    setViewVendor(vendor);
    setViewTab('basic');
    setIsViewOpen(true);
  };

  // Open Edit Profile
  const handleOpenEdit = (vendor) => {
    setEditVendor(vendor);
    setEditTab('basicDetails');
    setEditForm({
      nameOfCompany: vendor.vendor_name || '',
      propDirName: vendor.prop_director_name || '',
      contactPerson: vendor.contact_person || '',
      contactNumber: vendor.contact_number || '',
      emailId: vendor.email || '',
      address: vendor.address || '',
      regHeadOfficeAddress: vendor.registered_office_address || '',
      bankName: vendor.bank_name || '',
      bankBranchName: vendor.bank_branch_name || '',
      bankAddress: vendor.bank_address || '',
      bankContactNumber: vendor.bank_contact_number || '',
      bankAccountNumber: vendor.bank_account_no || '',
      bankMicrCode: vendor.bank_micr_code || '',
      bankRtgsCode: vendor.bank_ifsc_code || '',
      bankNeftCode: vendor.bank_ifsc_code || '',
      registrationNumber: vendor.registration_number || '',
      panNumber: vendor.pan_number || '',
      esiNumber: vendor.esi_number || '',
      pfNumber: vendor.pf_number || '',
      gstNumber: vendor.gst_number || '',
      gstState: vendor.gst_state_name || '',
      annualTurnover: vendor.annual_turnover || '',
      auditedBalanceSheet: vendor.audited_balance_sheet || '',
      annualWorkHandleCapacity: vendor.work_handle_amount || '',
      organizationType: vendor.organization_type || '',
      totalTeam: vendor.total_team_available || '',
      plantAndMechnery: vendor.plant_and_machinery || '',
      organizationChart: vendor.organization_chart || '',
      interestOtherWorkType: vendor.other_work_intrest || '',
      associationWithRil: vendor.association_with_ril || '',
      geographicalPresence: vendor.geographical_presence || '',
      majorClients: vendor.major_clients || '',
      sopQapSignOff: vendor.sop_sign_off || '',
      sopForQuality: vendor.sop_for_quality || '',
      experience: vendor.relative_experience || '',
      experienceCertificate: vendor.experience_certificate_path || '',
      panCard: vendor.pan_card_path || '',
      gstDocument: vendor.gst_certificate_path || '',
      registrationCertificate: vendor.registration_certificate_path || ''
    });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.nameOfCompany.trim()) {
      setEditError('Company or Vendor Name is Missing! Please try again.');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.propDirName.trim()) {
      setEditError('Proprietor or Director Name is Missing! Please try again.');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.contactPerson.trim()) {
      setEditError('Contact Person Name is Missing! Please try again.');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.contactNumber.trim()) {
      setEditError('Contact Number is Missing! Please try again.');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.address.trim()) {
      setEditError('Address is Missing! Please try again.');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.bankName.trim()) {
      setEditError('Bank Name is Missing! Please try again.');
      setEditTab('bankGstDetails');
      return;
    }
    if (!editForm.bankAccountNumber.trim()) {
      setEditError('Bank Account Number Missing! Please try again.');
      setEditTab('bankGstDetails');
      return;
    }
    if (!editForm.bankNeftCode.trim()) {
      setEditError('Bank NEFT/RTGS Code Missing! Please try again.');
      setEditTab('bankGstDetails');
      return;
    }
    if (!editForm.panNumber.trim()) {
      setEditError('PAN Number Missing! Please try again.');
      setEditTab('financialDetails');
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError('');
      await updateVendor(editVendor.id || editVendor._id, editForm);
      showNotification('success', 'Vendor details has been updated successfully.');
      setIsEditOpen(false);
      setEditVendor(null);
      loadData();
    } catch (err) {
      setEditError(err.message || 'Failed to update vendor details');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Deactivate Handler
  const handleConfirmDeactivate = async () => {
    if (!deactivateConfirm.vendor) return;
    try {
      setDeactivateConfirm(prev => ({ ...prev, loading: true }));
      const res = await deactivateVendor(deactivateConfirm.vendor.id || deactivateConfirm.vendor._id);
      showNotification('success', res.message || 'Vendor Profile has been deactivated successfully.');
      setDeactivateConfirm({ isOpen: false, vendor: null, loading: false });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to deactivate vendor');
      setDeactivateConfirm({ isOpen: false, vendor: null, loading: false });
    }
  };

  const editTabList = [
    { id: 'basicDetails', label: 'Vendor Details' },
    { id: 'bankGstDetails', label: 'Bank Details' },
    { id: 'financialDetails', label: 'Financial & GST Details' },
    { id: 'otherDetails', label: 'Other Details' },
    { id: 'documentAttachment', label: 'Attach Documents' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP index.phtml (Vendor List) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-green-600" size={26} />
            <span>Vendor List</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Manage Vendors</span>
            <span>/</span>
            <span className="text-gray-700">Active Vendors</span>
          </nav>
        </div>
        <Link
          to="/manage-vendors/add-new-vendor"
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Add New Vendor</span>
        </Link>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 border ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Vendors</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-0.5">{metrics.totalActive}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">GST Registered</p>
            <h3 className="text-2xl font-bold text-green-700 mt-0.5">{metrics.withGst}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Above 5 Cr. Turnover</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-0.5">{metrics.highTurnover}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search vendor name, contact person, phone, email, PAN, GST..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Main Table matching PHP index.phtml */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading vendor list...</p>
          </div>
        ) : paginatedVendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No Vendors Found !</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'No vendors matched your search criteria.' : 'Create your first vendor to populate this list.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Vendor Name</th>
                    <th className="py-3.5 px-4">Contact Person</th>
                    <th className="py-3.5 px-4">Contact Number</th>
                    <th className="py-3.5 px-4">Email ID</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedVendors.map((vendor, idx) => (
                    <tr key={vendor.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-gray-400">
                        {(currentPage - 1) * pageSize + idx + 1}.
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {vendor.vendor_name}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {vendor.contact_person}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 text-xs">
                        {vendor.contact_number}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {vendor.email || '-'}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        {/* View Details matching PHP showVendorDetails */}
                        <button
                          onClick={() => handleOpenView(vendor)}
                          title="View Details"
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit Details matching PHP editVendorInfo */}
                        <button
                          onClick={() => handleOpenEdit(vendor)}
                          title="Edit Details"
                          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Deactivate Vendor matching PHP deactivateVendor */}
                        <button
                          onClick={() => setDeactivateConfirm({ isOpen: true, vendor, loading: false })}
                          title="Deactivate Vendor"
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Ban size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3.5 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-600 gap-3">
              <div>
                Showing <strong className="text-gray-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-gray-800">
                  {Math.min(currentPage * pageSize, filteredVendors.length)}
                </strong>{' '}
                of <strong className="text-gray-800">{filteredVendors.length}</strong> records
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Profile Modal matching PHP view-vendor-profile.phtml */}
      {isViewOpen && viewVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="relative bg-gradient-to-r from-green-700 to-teal-800 h-28 px-6 pt-4 flex justify-between items-start text-white">
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Vendor Profile</span>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-white/80 hover:text-white bg-black/20 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 pt-0 relative overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-6 gap-4">
                <div className="flex items-end space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-md shrink-0 flex items-center justify-center border border-gray-100">
                    <Building2 className="text-green-600" size={36} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{viewVendor.vendor_name}</h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {viewVendor.organization_type || 'Vendor'} • {viewVendor.gst_state_name || 'India'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsViewOpen(false);
                    handleOpenEdit(viewVendor);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* View Tabs matching PHP view-vendor-profile.phtml */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-4 text-xs sm:text-sm font-semibold">
                  <button
                    onClick={() => setViewTab('basic')}
                    className={`pb-2.5 border-b-2 transition-colors ${
                      viewTab === 'basic' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Basic Details
                  </button>
                  <button
                    onClick={() => setViewTab('bankFinancial')}
                    className={`pb-2.5 border-b-2 transition-colors ${
                      viewTab === 'bankFinancial' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bank & Financial Details
                  </button>
                  <button
                    onClick={() => setViewTab('other')}
                    className={`pb-2.5 border-b-2 transition-colors ${
                      viewTab === 'other' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Other Details
                  </button>
                  <button
                    onClick={() => setViewTab('documents')}
                    className={`pb-2.5 border-b-2 transition-colors ${
                      viewTab === 'documents' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Documents
                  </button>
                </div>
              </div>

              {/* Tab 1: Basic Details */}
              {viewTab === 'basic' && (
                <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Registration Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4">{viewVendor.registration_number || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Proprietor/Director Name :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4">{viewVendor.prop_director_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Contact Person :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.contact_person || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Contact Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 font-mono">{viewVendor.contact_number || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Email ID :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.email || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Organization Type :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.organization_type || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Address :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.address || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Registered Address :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.registered_office_address || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Organization Chart :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.organization_chart || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Total Team Available :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.total_team_available || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Annual Turnover :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.annual_turnover || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Audited Balance Sheet :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.audited_balance_sheet || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Tab 2: Bank & Financial Details */}
              {viewTab === 'bankFinancial' && (
                <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Bank Name :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4">{viewVendor.bank_name || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Bank Account Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4 font-mono">{viewVendor.bank_account_no || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Bank Branch Name :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.bank_branch_name || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Bank Address :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.bank_address || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Bank Contact Number :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.bank_contact_number || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Bank MICR Code :</th>
                      <td className="py-2.5 px-4 text-gray-900 font-mono uppercase">{viewVendor.bank_micr_code || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Bank IFS Code :</th>
                      <td className="py-2.5 px-4 text-gray-900 font-mono uppercase">{viewVendor.bank_ifsc_code || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">PAN Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 font-mono uppercase">{viewVendor.pan_number || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">GST Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 font-mono uppercase">{viewVendor.gst_number || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">GST State Name :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.gst_state_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">PF Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 uppercase">{viewVendor.pf_number || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">ESI Number :</th>
                      <td className="py-2.5 px-4 text-gray-900 uppercase">{viewVendor.esi_number || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Tab 3: Other Details */}
              {viewTab === 'other' && (
                <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Relative Experience :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4">{viewVendor.relative_experience || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600 w-1/4">Geographical Presence :</th>
                      <td className="py-2.5 px-4 text-gray-900 w-1/4">{viewVendor.geographical_presence || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Plant and Machinery :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.plant_and_machinery || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Interest in other work :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.other_work_intrest || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Association with Logimetrix :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.association_with_ril || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Major Clients :</th>
                      <td className="py-2.5 px-4 text-gray-900">{viewVendor.major_clients || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">SOP-QAP Sign Off :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.sop_sign_off || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">SOP for Quality :</th>
                      <td className="py-2.5 px-4 text-gray-900 capitalize">{viewVendor.sop_for_quality || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 text-left text-gray-600">Capacity Handled / Year :</th>
                      <td colSpan={3} className="py-2.5 px-4 text-gray-900">{viewVendor.work_handle_amount || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Tab 4: Documents */}
              {viewTab === 'documents' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">PAN Card :</p>
                    {viewVendor.pan_card_path ? (
                      <img src={viewVendor.pan_card_path} alt="PAN Card" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 italic">No PAN Card uploaded</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">GST Registration :</p>
                    {viewVendor.gst_certificate_path ? (
                      <img src={viewVendor.gst_certificate_path} alt="GST Registration" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 italic">No GST Certificate uploaded</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Experience Certificate :</p>
                    {viewVendor.experience_certificate_path ? (
                      <img src={viewVendor.experience_certificate_path} alt="Experience Certificate" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 italic">No Experience Certificate uploaded</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Registration Certificate :</p>
                    {viewVendor.registration_certificate_path ? (
                      <img src={viewVendor.registration_certificate_path} alt="Registration Certificate" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 italic">No Registration Certificate uploaded</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal matching PHP edit-vendor-info.phtml with 5 tabs */}
      {isEditOpen && editVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-3 bg-[#337ab7] text-white">
              <h3 className="text-base font-bold">Edit Vendor Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {/* 5 Tabs matching PHP edit-vendor-info.phtml */}
              <div className="border-b-2 border-[#5B92E5] mb-4 overflow-x-auto">
                <ul className="flex flex-nowrap space-x-1 min-w-max">
                  {editTabList.map((tab) => {
                    const isActive = editTab === tab.id;
                    return (
                      <li key={tab.id}>
                        <button
                          type="button"
                          onClick={() => setEditTab(tab.id)}
                          className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-t-md transition-all ${
                            isActive
                              ? 'bg-white text-gray-800 border-2 border-b-0 border-[#5B92E5] shadow-xs'
                              : 'bg-[#5B92E5] text-white hover:bg-[#4a80d4]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Tab 1: Basic Details */}
              {editTab === 'basicDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Company/Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.nameOfCompany}
                        onChange={(e) => setEditForm({ ...editForm, nameOfCompany: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Proprietor/Director Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.propDirName}
                        onChange={(e) => setEditForm({ ...editForm, propDirName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.contactPerson}
                        onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={editForm.contactNumber}
                        onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email ID
                      </label>
                      <input
                        type="email"
                        value={editForm.emailId}
                        onChange={(e) => setEditForm({ ...editForm, emailId: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="2"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Registered/Head Office Address
                    </label>
                    <textarea
                      rows="2"
                      value={editForm.regHeadOfficeAddress}
                      onChange={(e) => setEditForm({ ...editForm, regHeadOfficeAddress: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Bank Details */}
              {editTab === 'bankGstDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editForm.bankName}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        required
                      >
                        <option value="">Please Select</option>
                        {masterData.bankList.map(b => (
                          <option key={b.id} value={b.bank_name}>{b.bank_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Branch Name
                      </label>
                      <input
                        type="text"
                        value={editForm.bankBranchName}
                        onChange={(e) => setEditForm({ ...editForm, bankBranchName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Address
                      </label>
                      <input
                        type="text"
                        value={editForm.bankAddress}
                        onChange={(e) => setEditForm({ ...editForm, bankAddress: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Contact Number
                      </label>
                      <input
                        type="text"
                        value={editForm.bankContactNumber}
                        onChange={(e) => setEditForm({ ...editForm, bankContactNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.bankAccountNumber}
                        onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank MICR Code
                      </label>
                      <input
                        type="text"
                        value={editForm.bankMicrCode}
                        onChange={(e) => setEditForm({ ...editForm, bankMicrCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank NEFT/RTGS Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.bankNeftCode}
                        onChange={(e) => setEditForm({ ...editForm, bankNeftCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Financial & GST */}
              {editTab === 'financialDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={editForm.registrationNumber}
                        onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PAN Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={editForm.panNumber}
                        onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ESI Number
                      </label>
                      <input
                        type="text"
                        value={editForm.esiNumber}
                        onChange={(e) => setEditForm({ ...editForm, esiNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PF Number
                      </label>
                      <input
                        type="text"
                        value={editForm.pfNumber}
                        onChange={(e) => setEditForm({ ...editForm, pfNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={editForm.gstNumber}
                        onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        GST State
                      </label>
                      <select
                        value={editForm.gstState}
                        onChange={(e) => setEditForm({ ...editForm, gstState: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.states.map(s => (
                          <option key={s.id} value={s.state_name}>{s.state_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Annual Company Turnover
                      </label>
                      <select
                        value={editForm.annualTurnover}
                        onChange={(e) => setEditForm({ ...editForm, annualTurnover: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.annualTurnoverList.map(a => (
                          <option key={a.id} value={a.annual_turnover}>{a.annual_turnover}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Audited Balance Sheet
                      </label>
                      <select
                        value={editForm.auditedBalanceSheet}
                        onChange={(e) => setEditForm({ ...editForm, auditedBalanceSheet: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Capacity Handled / Year
                      </label>
                      <select
                        value={editForm.annualWorkHandleCapacity}
                        onChange={(e) => setEditForm({ ...editForm, annualWorkHandleCapacity: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.workHandlingAmountList.map(w => (
                          <option key={w.id} value={w.work_handling_amount}>{w.work_handling_amount}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Other Details */}
              {editTab === 'otherDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Type of Organization
                      </label>
                      <select
                        value={editForm.organizationType}
                        onChange={(e) => setEditForm({ ...editForm, organizationType: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.organizationTypeList.map(o => (
                          <option key={o.id} value={o.organization_type}>{o.organization_type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Total Team Available
                      </label>
                      <select
                        value={editForm.totalTeam}
                        onChange={(e) => setEditForm({ ...editForm, totalTeam: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.teamStrengthList.map(t => (
                          <option key={t.id} value={t.team_strength}>{t.team_strength}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Plant and Machinery
                      </label>
                      <select
                        value={editForm.plantAndMechnery}
                        onChange={(e) => setEditForm({ ...editForm, plantAndMechnery: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        <option value="owned">Owned</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Association with Logimetrix
                      </label>
                      <select
                        value={editForm.associationWithRil}
                        onChange={(e) => setEditForm({ ...editForm, associationWithRil: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="">Please Select</option>
                        {masterData.associationYearsList.map(a => (
                          <option key={a.id} value={a.association_years}>{a.association_years}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Attach Documents */}
              {editTab === 'documentAttachment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-2">PAN Card :</p>
                      {editForm.panCard ? (
                        <img src={editForm.panCard} alt="PAN Card" className="max-h-32 object-contain" />
                      ) : (
                        <p className="text-xs text-gray-400 italic">No document</p>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-2">GST Registration :</p>
                      {editForm.gstDocument ? (
                        <img src={editForm.gstDocument} alt="GST" className="max-h-32 object-contain" />
                      ) : (
                        <p className="text-xs text-gray-400 italic">No document</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-5 py-2 rounded text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal matching PHP deactivateVendor sweetalert */}
      {deactivateConfirm.isOpen && deactivateConfirm.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Ban size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Are you sure!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Do you want to deactivate clicked vendor profile?
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-1">({deactivateConfirm.vendor.vendor_name})</p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateConfirm({ isOpen: false, vendor: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deactivateConfirm.loading}
                onClick={handleConfirmDeactivate}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {deactivateConfirm.loading ? 'Deactivating...' : 'Yes, deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVendors;
