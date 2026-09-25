import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Plus, Search, Eye, Pencil, Ban, 
  X, ChevronLeft, ChevronRight, FileText, Download,
  Phone, Mail, MapPin, Building, CreditCard, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
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

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // View Modal State matching PHP view-vendor-profile.phtml
  const [viewVendor, setViewVendor] = useState(null);
  const [viewTab, setViewTab] = useState('basicDetails');
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit Modal State matching PHP edit-vendor-info.phtml
  const [editVendor, setEditVendor] = useState(null);
  const [editTab, setEditTab] = useState('basicDetails');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

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
      Swal.fire('Error !', 'Failed to load vendor records. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered List
  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(v =>
        (v.vendor_name && v.vendor_name.toLowerCase().includes(q)) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(q)) ||
        (v.contact_number && v.contact_number.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q))
      );
    }

    return result;
  }, [vendors, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Open View Profile Modal
  const handleOpenView = (vendor) => {
    setViewVendor(vendor);
    setViewTab('basicDetails');
    setIsViewOpen(true);
  };

  // Open Edit Profile Modal
  const handleOpenEdit = (vendor) => {
    setEditVendor(vendor);
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
      experience: vendor.relative_experience || ''
    });
    setEditTab('basicDetails');
    setIsEditOpen(true);
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.nameOfCompany || !editForm.nameOfCompany.trim()) {
      Swal.fire('Company Name Missing !', 'Please Enter Company Name.', 'error');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.propDirName || !editForm.propDirName.trim()) {
      Swal.fire('Prop/Dir Name Missing !', 'Please Enter Proprietor/Director Name.', 'error');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.contactPerson || !editForm.contactPerson.trim()) {
      Swal.fire('Contact Person Missing !', 'Please Enter Contact Person Name.', 'error');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.contactNumber || !editForm.contactNumber.trim()) {
      Swal.fire('Contact Number Missing !', 'Please Enter Contact Number.', 'error');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.address || !editForm.address.trim()) {
      Swal.fire('Address Missing !', 'Please Enter Address.', 'error');
      setEditTab('basicDetails');
      return;
    }
    if (!editForm.bankName) {
      Swal.fire('Bank Name Missing !', 'Please Select Bank Name.', 'error');
      setEditTab('bankGstDetails');
      return;
    }
    if (!editForm.bankAccountNumber || !editForm.bankAccountNumber.trim()) {
      Swal.fire('Bank Account Missing !', 'Please Enter Bank Account Number.', 'error');
      setEditTab('bankGstDetails');
      return;
    }
    if (!editForm.bankNeftCode || !editForm.bankNeftCode.trim()) {
      Swal.fire('Bank IFSC Missing !', 'Please Enter Bank IFS Code.', 'error');
      setEditTab('bankGstDetails');
      return;
    }

    try {
      setEditSubmitting(true);
      await updateVendor(editVendor.id || editVendor._id, editForm);
      Swal.fire('Updated Successfully', 'Vendor details have been updated successfully.', 'success');
      setIsEditOpen(false);
      setEditVendor(null);
      loadData();
    } catch (err) {
      Swal.fire('Error !', err.message || 'Failed to update vendor details', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Deactivate Vendor matching PHP deactivateVendor
  const handleDeactivate = async (vendor) => {
    const result = await Swal.fire({
      title: 'Are you sure!',
      text: 'Do you want to deactivate clicked vendor profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await deactivateVendor(vendor.id || vendor._id);
        Swal.fire({
          title: 'Deactivated',
          text: res.message || 'Vendor profile has been deactivated successfully.',
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong!', err.message || 'Failed to deactivate vendor', 'error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (Vendor List) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Vendor List</span>
        </h1>
        <Link
          to="/manage-vendors/add-new-vendor"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Plus size={14} />
          <span>Add New Vendor</span>
        </Link>
      </div>

      {/* Main Table Card with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Top Controls: Show entries & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-600 font-medium">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-600 font-medium">entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Data Table matching PHP vendorDtailsTable */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-r-transparent mb-2" />
            <p className="text-xs font-medium">Loading Vendor List...</p>
          </div>
        ) : paginatedVendors.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Building2 className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-gray-700">No Vendor Found !</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Vendor Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact Person</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact Number</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Email ID</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedVendors.map((vendor, idx) => (
                  <tr key={vendor.id || idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center font-medium text-gray-500 whitespace-nowrap">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {vendor.vendor_name}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {vendor.contact_person || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {vendor.contact_number || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                      {vendor.email || '-'}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2.5">
                        {/* View Details matching PHP <i class="fa fa-eye" style="color: #1DAA29;"> */}
                        <button
                          onClick={() => handleOpenView(vendor)}
                          title="View Details"
                          className="text-[#1DAA29] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit Details matching PHP <i class="fa fa-pencil" style="color: #1DAA29;"> */}
                        <button
                          onClick={() => handleOpenEdit(vendor)}
                          title="Edit Details"
                          className="text-[#1DAA29] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Deactivate Vendor matching PHP <i class="fa fa-ban" style="color: red;"> */}
                        <button
                          onClick={() => handleDeactivate(vendor)}
                          title="deactivate Vendor"
                          className="text-red-600 hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Ban size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2 text-xs text-gray-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredVendors.length)} of {filteredVendors.length} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700 bg-gray-100 rounded border border-gray-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Vendor Modal matching PHP view-vendor-profile.phtml */}
      {isViewOpen && viewVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-6 border border-gray-200 overflow-hidden">
            {/* Header banner and title */}
            <div className="relative bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Building2 size={20} />
                  <span>{viewVendor.vendor_name}</span>
                </h2>
                <p className="text-xs text-teal-100 mt-0.5">{viewVendor.organization_type || 'Vendor Profile'}</p>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Tabs matching PHP view-vendor-profile.phtml */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 pt-2 flex space-x-1 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'basicDetails', label: 'Basic Details' },
                { id: 'bankDetails', label: 'Bank & Financial Details' },
                { id: 'otherDetails', label: 'Other Details' },
                { id: 'documents', label: 'Documents' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setViewTab(t.id)}
                  className={`px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    viewTab === t.id
                      ? 'border-teal-600 text-teal-700 bg-white rounded-t'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Panes */}
            <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto text-xs">
              {viewTab === 'basicDetails' && (
                <table className="w-full text-left border border-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Registration Number :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4 border-r border-gray-200">{viewVendor.registration_number || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Proprietor/Director Name :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4">{viewVendor.prop_director_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Contact Person :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.contact_person || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Contact Number :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.contact_number || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Email ID :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.email || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Organization Type :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.organization_type || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Address :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.address || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Registered Address :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.registered_office_address || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Organization Chart :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.organization_chart || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Total Team Available :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.total_team_available || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Annual Turnover :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.annual_turnover || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Audited Balance Sheet(Last 3 Years) :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.audited_balance_sheet || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {viewTab === 'bankDetails' && (
                <table className="w-full text-left border border-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Bank Account Number :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4 border-r border-gray-200">{viewVendor.bank_account_no || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Bank Name :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4">{viewVendor.bank_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Bank Branch Name :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.bank_branch_name || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Bank Address :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.bank_address || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Bank Contact Number :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.bank_contact_number || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Bank MICR Code :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.bank_micr_code || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Bank IFS Code:</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.bank_ifsc_code || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">PAN Number :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.pan_number || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">GST Number :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.gst_number || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">GST State Name :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.gst_state_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">PF Number :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.pf_number || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">ESI Number :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.esi_number || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {viewTab === 'otherDetails' && (
                <table className="w-full text-left border border-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Relative Experience :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4 border-r border-gray-200">{viewVendor.relative_experience || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">Geographical Presence :</th>
                      <td className="py-2.5 px-3 text-gray-800 w-1/4">{viewVendor.geographical_presence || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Plant and Machinery :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.plant_and_machinery || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Interest of other work :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.other_work_intrest || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Association with Company :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.association_with_ril || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Work Amount can be handled :</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.work_handle_amount || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">SOP-QAP Sign Off :</th>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{viewVendor.sop_sign_off || '-'}</td>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">SOP for Quality(Manual):</th>
                      <td className="py-2.5 px-3 text-gray-800">{viewVendor.sop_for_quality || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Major Clients :</th>
                      <td colSpan={3} className="py-2.5 px-3 text-gray-800">{viewVendor.major_clients || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {viewTab === 'documents' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Experience Certificate', path: viewVendor.experience_certificate_path },
                    { title: 'PAN Card', path: viewVendor.pan_card_path },
                    { title: 'GST Document', path: viewVendor.gst_certificate_path },
                    { title: 'Registration Certificate', path: viewVendor.registration_certificate_path }
                  ].map((doc, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                      <span className="font-semibold text-gray-700 mb-2">{doc.title}</span>
                      {doc.path ? (
                        <div className="space-y-2">
                          <img src={doc.path} alt={doc.title} className="w-full h-32 object-contain bg-white border border-gray-200 rounded" />
                          <a href={doc.path} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1 text-2xs font-semibold">
                            <Download size={13} /> View Full File
                          </a>
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 italic">
                          No document uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal matching PHP edit-vendor-info.phtml */}
      {isEditOpen && editVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-6 border border-gray-200 overflow-hidden">
            <div 
              className="px-4 py-2.5 flex items-center justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
            >
              <h2 className="text-sm font-bold tracking-tight">Edit Vendor Info</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Edit Tabs */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 pt-2 flex space-x-1 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'basicDetails', label: 'Vendor Details' },
                { id: 'bankGstDetails', label: 'Bank Details' },
                { id: 'financialDetails', label: 'Financial & GST' },
                { id: 'otherDetails', label: 'Other Details' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTab(t.id)}
                  className={`px-3.5 py-1.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    editTab === t.id
                      ? 'border-teal-600 text-teal-700 bg-white rounded-t'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-4">
              <div className="text-red-600 font-bold text-xs">
                * Fields are mandatory.
              </div>

              {/* Tab 1: Vendor Details */}
              {editTab === 'basicDetails' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Company/Vendor Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.nameOfCompany || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nameOfCompany: e.target.value.replace(/[^a-zA-Z0-9. ]/g, '') }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Proprietor/Director Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.propDirName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, propDirName: e.target.value.replace(/[^a-zA-Z. ]/g, '') }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Contact Person <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.contactPerson || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value.replace(/[^a-zA-Z. ]/g, '') }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Contact Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.contactNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email ID</label>
                      <input
                        type="email"
                        value={editForm.emailId || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emailId: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Registered/Head Office Address</label>
                      <textarea
                        rows={2}
                        value={editForm.regHeadOfficeAddress || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, regHeadOfficeAddress: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Bank Details */}
              {editTab === 'bankGstDetails' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Name <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={editForm.bankName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      >
                        <option value="">Please Select</option>
                        {masterData.bankList.map(b => (
                          <option key={b.id} value={b.bank_name}>{b.bank_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Branch Name</label>
                      <input
                        type="text"
                        value={editForm.bankBranchName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankBranchName: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Address</label>
                      <input
                        type="text"
                        value={editForm.bankAddress || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankAddress: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Contact Number</label>
                      <input
                        type="text"
                        value={editForm.bankContactNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankContactNumber: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Account Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.bankAccountNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bank MICR Code</label>
                      <input
                        type="text"
                        value={editForm.bankMicrCode || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankMicrCode: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bank RTGS (IFS) Code</label>
                      <input
                        type="text"
                        value={editForm.bankRtgsCode || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankRtgsCode: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank NEFT (IFS) Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.bankNeftCode || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bankNeftCode: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Financial & GST */}
              {editTab === 'financialDetails' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Number</label>
                      <input
                        type="text"
                        value={editForm.registrationNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PAN Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.panNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ESI Number</label>
                      <input
                        type="text"
                        value={editForm.esiNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, esiNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">PF Number</label>
                      <input
                        type="text"
                        value={editForm.pfNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pfNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">GST Number</label>
                      <input
                        type="text"
                        value={editForm.gstNumber || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">GST State</label>
                      <select
                        value={editForm.gstState || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, gstState: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">Please Select</option>
                        {masterData.states.map(s => (
                          <option key={s.id} value={s.state_name}>{s.state_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Other Details */}
              {editTab === 'otherDetails' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Type of Organization</label>
                      <select
                        value={editForm.organizationType || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, organizationType: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">Please Select</option>
                        {masterData.organizationTypeList.map(o => (
                          <option key={o.id} value={o.organization_type}>{o.organization_type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Total Team Available</label>
                      <select
                        value={editForm.totalTeam || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, totalTeam: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">Please Select</option>
                        {masterData.teamStrengthList.map(t => (
                          <option key={t.id} value={t.team_strength}>{t.team_strength}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Company Turnover</label>
                      <select
                        value={editForm.annualTurnover || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, annualTurnover: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="">Please Select</option>
                        {masterData.annualTurnoverList.map(a => (
                          <option key={a.id} value={a.annual_turnover}>{a.annual_turnover}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Work Capacity in One Year</label>
                      <select
                        value={editForm.annualWorkHandleCapacity || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, annualWorkHandleCapacity: e.target.value }))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Update Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVendors;
