import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  fetchVendorMasterData, 
  createVendor, 
  fetchVendorById, 
  updateVendor 
} from '../../services/vendorApi';

const AddNewVendor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState('basicDetails');
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

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State matching PHP tbl_vendor and tbl_vendor_bank_and_gst_details
  const initialForm = {
    // 1. Basic Details
    nameOfCompany: '',
    propDirName: '',
    contactPerson: '',
    contactNumber: '',
    emailId: '',
    address: '',
    regHeadOfficeAddress: '',

    // 2. Bank Details
    bankName: '',
    bankBranchName: '',
    bankAddress: '',
    bankContactNumber: '',
    bankAccountNumber: '',
    bankMicrCode: '',
    bankRtgsCode: '',
    bankNeftCode: '',

    // 3. Financial & GST Details
    registrationNumber: '',
    panNumber: '',
    esiNumber: '',
    pfNumber: '',
    gstNumber: '',
    gstState: '',
    annualTurnover: '',
    auditedBalanceSheet: '',
    annualWorkHandleCapacity: '',

    // 4. Other Details
    organizationType: '',
    totalTeam: '',
    plantAndMechnery: '',
    organizationChart: '',
    interestOtherWorkType: '',
    associationWithRil: '',
    geographicalPresence: '',
    majorClients: '',
    sopQapSignOff: '',
    sopForQuality: '',
    experience: '',

    // 5. Documents
    experienceCertificate: '',
    panCard: '',
    gstDocument: '',
    registrationCertificate: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // File Preview States
  const [previews, setPreviews] = useState({
    experienceCertificate: '',
    panCard: '',
    gstDocument: '',
    registrationCertificate: ''
  });

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const data = await fetchVendorMasterData();
        if (data) setMasterData(data);
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    };
    loadMaster();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const loadExistingVendor = async () => {
        try {
          setLoading(true);
          const vendor = await fetchVendorById(id);
          if (vendor) {
            setFormData({
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

            setPreviews({
              experienceCertificate: vendor.experience_certificate_path || '',
              panCard: vendor.pan_card_path || '',
              gstDocument: vendor.gst_certificate_path || '',
              registrationCertificate: vendor.registration_certificate_path || ''
            });
          }
        } catch (err) {
          console.error('Error loading vendor for edit:', err);
        } finally {
          setLoading(false);
        }
      };
      loadExistingVendor();
    }
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validExtensions.includes(file.type)) {
      Swal.fire({
        title: 'Image Type Not Supported!',
        text: 'Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.',
        icon: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setPreviews(prev => ({ ...prev, [field]: base64Data }));
      setFormData(prev => ({ ...prev, [field]: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  const tabList = [
    { id: 'basicDetails', label: 'Vendor Details' },
    { id: 'bankGstDetails', label: 'Bank Details' },
    { id: 'financialDetails', label: 'Financial & GST Details' },
    { id: 'otherDetails', label: 'Other Details' },
    { id: 'documnetAttachment', label: 'Attach Documents' }
  ];

  const handleNext = () => {
    const currentIndex = tabList.findIndex(t => t.id === activeTab);
    if (currentIndex < tabList.length - 1) {
      setActiveTab(tabList[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = tabList.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabList[currentIndex - 1].id);
    }
  };

  // Validations matching PHP validateInputData() in create-vendor.phtml
  const validateForm = () => {
    if (!formData.nameOfCompany || !formData.nameOfCompany.trim()) {
      Swal.fire({
        title: 'Company Name Missing !',
        text: 'Please Enter Company Name.',
        icon: 'error'
      }).then(() => {
        setActiveTab('basicDetails');
      });
      return false;
    }

    if (!formData.propDirName || !formData.propDirName.trim()) {
      Swal.fire({
        title: 'Prop/Dir Name Missing !',
        text: 'Please Enter Proprietor/Director Name.',
        icon: 'error'
      }).then(() => {
        setActiveTab('basicDetails');
      });
      return false;
    }

    if (!formData.contactPerson || !formData.contactPerson.trim()) {
      Swal.fire({
        title: 'Contact Person Missing !',
        text: 'Please Enter Contact Person Name.',
        icon: 'error'
      }).then(() => {
        setActiveTab('basicDetails');
      });
      return false;
    }

    if (!formData.contactNumber || !formData.contactNumber.trim()) {
      Swal.fire({
        title: 'Expense Amount Missing !',
        text: 'Please Enter Transfer Amount.',
        icon: 'error'
      }).then(() => {
        setActiveTab('basicDetails');
      });
      return false;
    }

    if (!formData.address || !formData.address.trim()) {
      Swal.fire({
        title: 'Address Missing !',
        text: 'Please Enter Address.',
        icon: 'error'
      }).then(() => {
        setActiveTab('basicDetails');
      });
      return false;
    }

    if (!formData.bankName) {
      Swal.fire({
        title: 'Bank Name Missing !',
        text: 'Please Select Bank Name.',
        icon: 'error'
      }).then(() => {
        setActiveTab('bankGstDetails');
      });
      return false;
    }

    if (!formData.bankAccountNumber || !formData.bankAccountNumber.trim()) {
      Swal.fire({
        title: 'Bank Account Missing !',
        text: 'Please Enter Bank Account Number.',
        icon: 'error'
      }).then(() => {
        setActiveTab('bankGstDetails');
      });
      return false;
    }

    if (!formData.bankNeftCode || !formData.bankNeftCode.trim()) {
      Swal.fire({
        title: 'Bank IFSC Missing !',
        text: 'Please Enter Bank IFS Code.',
        icon: 'error'
      }).then(() => {
        setActiveTab('bankGstDetails');
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (isEditMode) {
        await updateVendor(id, formData);
        Swal.fire({
          title: 'Success !',
          text: 'Vendor details updated successfully',
          icon: 'success'
        }).then(() => {
          navigate('/manage-vendors/active-vendors');
        });
      } else {
        await createVendor(formData);
        Swal.fire({
          title: 'Success !',
          text: 'Vendor has been created successfully',
          icon: 'success'
        }).then(() => {
          navigate('/manage-vendors/active-vendors');
        });
      }
    } catch (err) {
      Swal.fire('Error !', err.message || 'Failed to save vendor details. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (Add New Vendor) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>{isEditMode ? 'Edit Vendor Info' : 'Add New Vendor'}</span>
        </h1>
        <Link
          to="/manage-vendors/active-vendors"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Building2 size={14} />
          <span>View All Vendor</span>
        </Link>
      </div>

      {/* Main Form Container with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Sub Header matching PHP VENDOR EVALUATION FORM */}
        <div className="bg-slate-700 text-slate-100 text-center py-2 px-3 rounded text-xs sm:text-sm font-bold tracking-wide">
          VENDOR EVALUATION FORM - {isEditMode ? 'UPDATE VENDOR' : 'NEW VENDOR'}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 flex space-x-1 overflow-x-auto text-xs font-semibold pb-1">
          {tabList.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mandatory notice */}
        <div className="text-red-600 font-bold text-xs">
          * Fields are mandatory.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TAB 1: VENDOR DETAILS */}
          {activeTab === 'basicDetails' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company/Vendor Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="nameOfCompany"
                    value={formData.nameOfCompany}
                    onChange={(e) => handleChange('nameOfCompany', e.target.value.replace(/[^a-zA-Z0-9. ]/g, ''))}
                    placeholder="Enter company/vendor name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Proprietor/Director Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="propDirName"
                    value={formData.propDirName}
                    onChange={(e) => handleChange('propDirName', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                    placeholder="Enter proprietor/director name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Person <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                    placeholder="Enter contact person name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Number <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    maxLength={10}
                    value={formData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter contact number"
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
                    id="emailId"
                    value={formData.emailId}
                    onChange={(e) => handleChange('emailId', e.target.value)}
                    placeholder="Enter email ID"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Address <span className="text-red-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter Address"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registered/Head Office Address</label>
                  <textarea
                    rows={2}
                    id="regHeadOfficeAddress"
                    value={formData.regHeadOfficeAddress}
                    onChange={(e) => handleChange('regHeadOfficeAddress', e.target.value)}
                    placeholder="Enter Registered/Head Office Address"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BANK DETAILS */}
          {activeTab === 'bankGstDetails' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <select
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
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
                    id="bankBranchName"
                    value={formData.bankBranchName}
                    onChange={(e) => handleChange('bankBranchName', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                    placeholder="Enter bank branch name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Address</label>
                  <input
                    type="text"
                    id="bankAddress"
                    value={formData.bankAddress}
                    onChange={(e) => handleChange('bankAddress', e.target.value)}
                    placeholder="Enter bank address"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Contact Number</label>
                  <input
                    type="text"
                    id="bankContactNumber"
                    value={formData.bankContactNumber}
                    onChange={(e) => handleChange('bankContactNumber', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter bank contact number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Account Number <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleChange('bankAccountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter bank account number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank MICR Code</label>
                  <input
                    type="text"
                    id="bankMicrCode"
                    value={formData.bankMicrCode}
                    onChange={(e) => handleChange('bankMicrCode', e.target.value.toUpperCase())}
                    placeholder="Enter bank MICR code"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank RTGS (IFS) Code</label>
                  <input
                    type="text"
                    id="bankRtgsCode"
                    value={formData.bankRtgsCode}
                    onChange={(e) => handleChange('bankRtgsCode', e.target.value.toUpperCase())}
                    placeholder="Enter bank RTGS code"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank NEFT (IFS) Code <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="bankNeftCode"
                    value={formData.bankNeftCode}
                    onChange={(e) => handleChange('bankNeftCode', e.target.value.toUpperCase())}
                    placeholder="Enter bank NEFT code"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL & GST DETAILS */}
          {activeTab === 'financialDetails' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value.toUpperCase())}
                    placeholder="Enter registration number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PAN Number <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="panNumber"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="Enter PAN number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ESI Number</label>
                  <input
                    type="text"
                    id="esiNumber"
                    value={formData.esiNumber}
                    onChange={(e) => handleChange('esiNumber', e.target.value.toUpperCase())}
                    placeholder="Enter ESI number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PF Number</label>
                  <input
                    type="text"
                    id="pfNumber"
                    value={formData.pfNumber}
                    onChange={(e) => handleChange('pfNumber', e.target.value.toUpperCase())}
                    placeholder="Enter PF number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    id="gstNumber"
                    maxLength={15}
                    value={formData.gstNumber}
                    onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                    placeholder="Enter GST number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST State</label>
                  <select
                    id="gstState"
                    value={formData.gstState}
                    onChange={(e) => handleChange('gstState', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.states.map(s => (
                      <option key={s.id} value={s.state_name}>{s.state_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Company Turnover</label>
                  <select
                    id="annualTurnover"
                    value={formData.annualTurnover}
                    onChange={(e) => handleChange('annualTurnover', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.annualTurnoverList.map(a => (
                      <option key={a.id} value={a.annual_turnover}>{a.annual_turnover}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Audited Balance Sheet (last 3 years)</label>
                  <select
                    id="auditedBalanceSheet"
                    value={formData.auditedBalanceSheet}
                    onChange={(e) => handleChange('auditedBalanceSheet', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount of Work handled in one year</label>
                  <select
                    id="annualWorkHandleCapacity"
                    value={formData.annualWorkHandleCapacity}
                    onChange={(e) => handleChange('annualWorkHandleCapacity', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.workHandlingAmountList.map(w => (
                      <option key={w.id} value={w.work_handling_amount}>{w.work_handling_amount}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: OTHER DETAILS */}
          {activeTab === 'otherDetails' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type of Organization</label>
                  <select
                    id="organizationType"
                    value={formData.organizationType}
                    onChange={(e) => handleChange('organizationType', e.target.value)}
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
                    id="totalTeam"
                    value={formData.totalTeam}
                    onChange={(e) => handleChange('totalTeam', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.teamStrengthList.map(t => (
                      <option key={t.id} value={t.team_strength}>{t.team_strength}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Plant and Machinery</label>
                  <select
                    id="plantAndMechnery"
                    value={formData.plantAndMechnery}
                    onChange={(e) => handleChange('plantAndMechnery', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="owned">Owned</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Chart</label>
                  <select
                    id="organizationChart"
                    value={formData.organizationChart}
                    onChange={(e) => handleChange('organizationChart', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Interested in other work</label>
                  <select
                    id="interestOtherWorkType"
                    value={formData.interestOtherWorkType}
                    onChange={(e) => handleChange('interestOtherWorkType', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Association with Logimetrix</label>
                  <select
                    id="associationWithRil"
                    value={formData.associationWithRil}
                    onChange={(e) => handleChange('associationWithRil', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.associationYearsList.map(a => (
                      <option key={a.id} value={a.association_years}>{a.association_years}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Geographical Presence</label>
                  <select
                    id="geographicalPresence"
                    value={formData.geographicalPresence}
                    onChange={(e) => handleChange('geographicalPresence', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.geographicalPresenceList.map(g => (
                      <option key={g.id} value={g.geographical_presence}>{g.geographical_presence}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Major Clients</label>
                  <select
                    id="majorClients"
                    value={formData.majorClients}
                    onChange={(e) => handleChange('majorClients', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.vendorMajorClientsList.map(m => (
                      <option key={m.id} value={m.major_clients}>{m.major_clients}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">SOP-QAP Sign Off</label>
                  <select
                    id="sopQapSignOff"
                    value={formData.sopQapSignOff}
                    onChange={(e) => handleChange('sopQapSignOff', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">SOP for Quality (Manual)</label>
                  <select
                    id="sopForQuality"
                    value={formData.sopForQuality}
                    onChange={(e) => handleChange('sopForQuality', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Relative Experience</label>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Please Select</option>
                    {masterData.relativeExperienceList.map(r => (
                      <option key={r.id} value={r.experience}>{r.experience}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ATTACH DOCUMENTS */}
          {activeTab === 'documnetAttachment' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Experience Certificate */}
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience Certificate</label>
                  <input
                    type="file"
                    id="experienceCertificate"
                    accept="image/*"
                    onChange={(e) => handleFileChange('experienceCertificate', e)}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700"
                  />
                  {previews.experienceCertificate && (
                    <img src={previews.experienceCertificate} alt="Preview" className="w-full h-24 object-contain mt-2 border border-gray-300 rounded bg-white" />
                  )}
                </div>

                {/* 2. PAN Card */}
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PAN Card <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="file"
                    id="panCard"
                    accept="image/*"
                    onChange={(e) => handleFileChange('panCard', e)}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700"
                  />
                  {previews.panCard && (
                    <img src={previews.panCard} alt="Preview" className="w-full h-24 object-contain mt-2 border border-gray-300 rounded bg-white" />
                  )}
                </div>

                {/* 3. GST Document */}
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST Registration</label>
                  <input
                    type="file"
                    id="gstDocument"
                    accept="image/*"
                    onChange={(e) => handleFileChange('gstDocument', e)}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700"
                  />
                  {previews.gstDocument && (
                    <img src={previews.gstDocument} alt="Preview" className="w-full h-24 object-contain mt-2 border border-gray-300 rounded bg-white" />
                  )}
                </div>

                {/* 4. Registration Certificate */}
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Certificate</label>
                  <input
                    type="file"
                    id="registrationCertificate"
                    accept="image/*"
                    onChange={(e) => handleFileChange('registrationCertificate', e)}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700"
                  />
                  {previews.registrationCertificate && (
                    <img src={previews.registrationCertificate} alt="Preview" className="w-full h-24 object-contain mt-2 border border-gray-300 rounded bg-white" />
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddNewVendor;
