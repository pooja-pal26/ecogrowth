import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const [swalAlert, setSwalAlert] = useState({ isOpen: false, title: '', text: '', icon: 'error', tabTarget: '', focusField: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Initial Form State matching PHP tbl_vendor and tbl_vendor_bank_and_gst_details
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
    const file = e.target.files[0];
    if (!file) return;

    // Validate image format matching PHP: jpg, jpeg, png, gif
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validExtensions.includes(file.type)) {
      setSwalAlert({
        isOpen: true,
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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

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

  const closeSwalAlert = () => {
    if (swalAlert.tabTarget) {
      setActiveTab(swalAlert.tabTarget);
    }
    const focusTarget = swalAlert.focusField;
    setSwalAlert({ isOpen: false, title: '', text: '', icon: 'error', tabTarget: '', focusField: '' });
    if (focusTarget) {
      setTimeout(() => {
        const el = document.getElementById(focusTarget);
        if (el) el.focus();
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validations matching PHP validateInputData() in create-vendor.phtml
    if (!formData.nameOfCompany || !formData.nameOfCompany.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Company Name Missing !',
        text: 'Please Enter Company Name.',
        icon: 'error',
        tabTarget: 'basicDetails',
        focusField: 'nameOfCompany'
      });
      return;
    }
    if (!formData.propDirName || !formData.propDirName.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Prop/Dir Name Missing !',
        text: 'Please Enter Proprietor/Director Name.',
        icon: 'error',
        tabTarget: 'basicDetails',
        focusField: 'propDirName'
      });
      return;
    }
    if (!formData.contactPerson || !formData.contactPerson.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Contact Person Missing !',
        text: 'Please Enter Contact Person Name.',
        icon: 'error',
        tabTarget: 'basicDetails',
        focusField: 'contactPerson'
      });
      return;
    }
    if (!formData.contactNumber || !formData.contactNumber.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Expense Amount Missing !',
        text: 'Please Enter Transfer Amount.',
        icon: 'error',
        tabTarget: 'basicDetails',
        focusField: 'contactNumber'
      });
      return;
    }
    if (!formData.address || !formData.address.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Address Missing !',
        text: 'Please Enter Address.',
        icon: 'error',
        tabTarget: 'basicDetails',
        focusField: 'address'
      });
      return;
    }
    if (!formData.bankName || !formData.bankName.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Bank Name Missing !',
        text: 'Please Select Bank Name.',
        icon: 'error',
        tabTarget: 'bankGstDetails',
        focusField: 'bankName'
      });
      return;
    }
    if (!formData.bankAccountNumber || !formData.bankAccountNumber.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Bank Account Missing !',
        text: 'Please Enter Bank Account Number.',
        icon: 'error',
        tabTarget: 'bankGstDetails',
        focusField: 'bankAccountNumber'
      });
      return;
    }
    if (!formData.bankNeftCode || !formData.bankNeftCode.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Bank IFSC Missing !',
        text: 'Please Enter Bank IFS Code.',
        icon: 'error',
        tabTarget: 'bankGstDetails',
        focusField: 'bankNeftCode'
      });
      return;
    }
    if (!formData.panNumber || !formData.panNumber.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'PAN Number Missing !',
        text: 'Please Enter PAN Number.',
        icon: 'error',
        tabTarget: 'financialDetails',
        focusField: 'panNumber'
      });
      return;
    }

    try {
      setLoading(true);
      let res;
      if (isEditMode) {
        res = await updateVendor(id, formData);
        setSuccessMsg(res.message || 'Vendor details has been updated successfully.');
        setSwalAlert({
          isOpen: true,
          title: 'Success !',
          text: res.message || 'Vendor details has been updated successfully.',
          icon: 'success'
        });
      } else {
        res = await createVendor(formData);
        setSuccessMsg(res.message || 'Vendor details has been saved successfully.');
        setSwalAlert({
          isOpen: true,
          title: 'Success !',
          text: res.message || 'Vendor details has been saved successfully.',
          icon: 'success'
        });
      }

      setTimeout(() => {
        navigate('/manage-vendors/active-vendors');
      }, 1500);
    } catch (err) {
      setSwalAlert({
        isOpen: true,
        title: 'Error !',
        text: err.message || 'Failed to save vendor details',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 w-full max-w-7xl mx-auto space-y-3 font-sans">
      {/* Top Header matching PHP panel-heading */}
      <div className="flex justify-between items-center bg-[#337ab7] text-white px-5 py-3 rounded-t-md shadow-sm">
        <h3 className="text-base sm:text-lg font-bold">
          {isEditMode ? 'Edit Vendor Details' : 'Add New Vendor'}
        </h3>
        <Link
          to="/manage-vendors/active-vendors"
          className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm"
        >
          View All Vendor
        </Link>
      </div>

      {/* Main Form Box matching PHP .mainDiv */}
      <div className="bg-[#DCF2FE] p-2.5 sm:p-3.5 rounded-md border border-[#bce8f1]">
        {/* Inner Border Box matching PHP .siteExpenseDiv */}
        <div className="border-[5px] border-[#b0d5ea] bg-[#DCF2FE] rounded-md p-3 sm:p-5 shadow-xs">
          
          {/* Header Banner matching PHP H2 */}
          <div className="text-center mb-4">
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-[#EAECEB] bg-[#74817E] py-2 px-4 rounded-md tracking-wider uppercase underline">
              VENDOR EVALUATION FORM - NEW VENDOR
            </h2>
          </div>

          {/* Wizard Nav Tabs matching PHP #formTab .nav-tabs and User Screenshot 1-to-1 */}
          <div className="mb-0 overflow-x-auto">
            <ul className="flex flex-wrap items-end gap-1 border-b-2 border-[#5c8bd6] pb-0">
              {tabList.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id} className="inline-block">
                    <button
                      type="button"
                      onClick={() => handleTabClick(tab.id)}
                      className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-t-md transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-white text-gray-800 border-2 border-b-0 border-[#5c8bd6] relative z-10 shadow-sm'
                          : 'bg-[#5c8bd6] text-white hover:bg-[#4a7ec9]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Form Content Container directly under tabs */}
          <div className="bg-[#DCF2FE] pt-4 pb-2 px-1">
            <div className="mb-3">
              <span className="text-sm sm:text-base font-bold text-[#D60019]">* Fields are mandatory.</span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* TAB 1: Vendor Details */}
              {activeTab === 'basicDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Company/Vendor Name<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="nameOfCompany"
                        placeholder="Enter company/vndor name"
                        value={formData.nameOfCompany}
                        onChange={(e) => handleChange('nameOfCompany', e.target.value.replace(/[^a-zA-Z0-9. ]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Proprietor/Director Name<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="propDirName"
                        placeholder="Enter proprietor/director name"
                        value={formData.propDirName}
                        onChange={(e) => handleChange('propDirName', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Contact Person<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactPerson"
                        placeholder="Enter contact person name"
                        value={formData.contactPerson}
                        onChange={(e) => handleChange('contactPerson', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Contact Number<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactNumber"
                        maxLength={10}
                        placeholder="Enter contact number"
                        value={formData.contactNumber}
                        onChange={(e) => handleChange('contactNumber', e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Email ID
                      </label>
                      <input
                        type="email"
                        id="emailId"
                        placeholder="Enter email ID"
                        value={formData.emailId}
                        onChange={(e) => handleChange('emailId', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Address<span className="text-red-600 font-bold">*</span>
                      </label>
                      <textarea
                        rows="2"
                        id="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Registered/Head Office Address
                      </label>
                      <textarea
                        rows="2"
                        id="regHeadOfficeAddress"
                        placeholder="Enter Registered/Head Office Address"
                        value={formData.regHeadOfficeAddress}
                        onChange={(e) => handleChange('regHeadOfficeAddress', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons: Next on bottom right */}
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-5 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <span className="text-base font-bold">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Bank Details */}
              {activeTab === 'bankGstDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank Name<span className="text-red-600 font-bold">*</span>
                      </label>
                      <select
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.bankList.map(b => (
                          <option key={b.id} value={b.bank_name}>{b.bank_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank Branch Name
                      </label>
                      <input
                        type="text"
                        id="bankBranchName"
                        placeholder="Enter bank branch name"
                        value={formData.bankBranchName}
                        onChange={(e) => handleChange('bankBranchName', e.target.value.replace(/[^a-zA-Z. ]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank Address
                      </label>
                      <input
                        type="text"
                        id="bankAddress"
                        placeholder="Enter bank address "
                        value={formData.bankAddress}
                        onChange={(e) => handleChange('bankAddress', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank Contact Number
                      </label>
                      <input
                        type="text"
                        id="bankContactNumber"
                        placeholder="Enter bank contact number"
                        value={formData.bankContactNumber}
                        onChange={(e) => handleChange('bankContactNumber', e.target.value.replace(/[^0-9\-_]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank Account Number<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="bankAccountNumber"
                        placeholder="Enter bank account number"
                        value={formData.bankAccountNumber}
                        onChange={(e) => handleChange('bankAccountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank MICR Code
                      </label>
                      <input
                        type="text"
                        id="bankMicrCode"
                        placeholder="Enter bank MICR code"
                        value={formData.bankMicrCode}
                        onChange={(e) => handleChange('bankMicrCode', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank RTGS (IFS) Code
                      </label>
                      <input
                        type="text"
                        id="bankRtgsCode"
                        placeholder="Enter bank RTGS (IFS) name"
                        value={formData.bankRtgsCode}
                        onChange={(e) => handleChange('bankRtgsCode', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Bank NEFT (IFS) Code<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="bankNeftCode"
                        placeholder="Enter bank NEFT (IFS) name"
                        value={formData.bankNeftCode}
                        onChange={(e) => handleChange('bankNeftCode', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons: Previous and Next together on bottom right matching PHP */}
                  <div className="flex justify-end items-center space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold">&larr;</span>
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-5 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <span className="text-base font-bold">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Financial & GST Details (Matches User Screenshot 1-to-1) */}
              {activeTab === 'financialDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        id="registrationNumber"
                        placeholder="Enter registration number"
                        value={formData.registrationNumber}
                        onChange={(e) => handleChange('registrationNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        PAN Number<span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        id="panNumber"
                        maxLength={10}
                        placeholder="Enter PAN number"
                        value={formData.panNumber}
                        onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        ESI Number
                      </label>
                      <input
                        type="text"
                        id="esiNumber"
                        placeholder="Enter ESI number"
                        value={formData.esiNumber}
                        onChange={(e) => handleChange('esiNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        PF Number
                      </label>
                      <input
                        type="text"
                        id="pfNumber"
                        placeholder="Enter PF number"
                        value={formData.pfNumber}
                        onChange={(e) => handleChange('pfNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        id="gstNumber"
                        placeholder="Enter GST number"
                        value={formData.gstNumber}
                        onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        GST State
                      </label>
                      <select
                        id="gstState"
                        value={formData.gstState}
                        onChange={(e) => handleChange('gstState', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
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
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Annual Company Turnover
                      </label>
                      <select
                        id="annualTurnover"
                        value={formData.annualTurnover}
                        onChange={(e) => handleChange('annualTurnover', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.annualTurnoverList.map(t => (
                          <option key={t.id} value={t.annual_turnover}>{t.annual_turnover}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Audited Balance Sheet (last 3 years)
                      </label>
                      <select
                        id="auditedBalanceSheet"
                        value={formData.auditedBalanceSheet}
                        onChange={(e) => handleChange('auditedBalanceSheet', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Amount of Work can be handled in one year
                      </label>
                      <select
                        id="annualWorkHandleCapacity"
                        value={formData.annualWorkHandleCapacity}
                        onChange={(e) => handleChange('annualWorkHandleCapacity', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.workHandlingAmountList.map(w => (
                          <option key={w.id} value={w.work_handling_amount}>{w.work_handling_amount}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Navigation Buttons: Previous and Next together on bottom right matching PHP */}
                  <div className="flex justify-end items-center space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold">&larr;</span>
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-5 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <span className="text-base font-bold">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Other Details */}
              {activeTab === 'otherDetails' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Type of Organization
                      </label>
                      <select
                        id="organizationType"
                        value={formData.organizationType}
                        onChange={(e) => handleChange('organizationType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.organizationTypeList.map(o => (
                          <option key={o.id} value={o.organization_type}>{o.organization_type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Total Team Available
                      </label>
                      <select
                        id="totalTeam"
                        value={formData.totalTeam}
                        onChange={(e) => handleChange('totalTeam', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.teamStrengthList.map(t => (
                          <option key={t.id} value={t.team_strength}>{t.team_strength}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Plant and Machinery
                      </label>
                      <select
                        id="plantAndMechnery"
                        value={formData.plantAndMechnery}
                        onChange={(e) => handleChange('plantAndMechnery', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="owned">Owned</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Organization Chart
                      </label>
                      <select
                        id="organizationChart"
                        value={formData.organizationChart}
                        onChange={(e) => handleChange('organizationChart', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Interested in other work
                      </label>
                      <select
                        id="interestOtherWorkType"
                        value={formData.interestOtherWorkType}
                        onChange={(e) => handleChange('interestOtherWorkType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Association with Logimetrix
                      </label>
                      <select
                        id="associationWithRil"
                        value={formData.associationWithRil}
                        onChange={(e) => handleChange('associationWithRil', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.associationYearsList.map(a => (
                          <option key={a.id} value={a.association_years}>{a.association_years}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Geographical Presense
                      </label>
                      <select
                        id="geographicalPresence"
                        value={formData.geographicalPresence}
                        onChange={(e) => handleChange('geographicalPresence', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.geographicalPresenceList.map(g => (
                          <option key={g.id} value={g.geographical_presence}>{g.geographical_presence}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Major Clients
                      </label>
                      <select
                        id="majorClients"
                        value={formData.majorClients}
                        onChange={(e) => handleChange('majorClients', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.vendorMajorClientsList.map(m => (
                          <option key={m.id} value={m.major_clients}>{m.major_clients}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        SOP-QAP Sign Off
                      </label>
                      <select
                        id="sopQapSignOff"
                        value={formData.sopQapSignOff}
                        onChange={(e) => handleChange('sopQapSignOff', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        SOP for Quality (Manual)
                      </label>
                      <select
                        id="sopForQuality"
                        value={formData.sopForQuality}
                        onChange={(e) => handleChange('sopForQuality', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Relative Experience
                      </label>
                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleChange('experience', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
                      >
                        <option value="">Please Select</option>
                        {masterData.relativeExperienceList.map(r => (
                          <option key={r.id} value={r.experience}>{r.experience}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Navigation Buttons: Previous and Next together on bottom right matching PHP */}
                  <div className="flex justify-end items-center space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold">&larr;</span>
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-5 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <span className="text-base font-bold">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: Attach Documents */}
              {activeTab === 'documnetAttachment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Experience Certificate
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        id="experienceCertificate"
                        onChange={(e) => handleFileChange('experienceCertificate', e)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:border-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        PAN Card <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        id="panCard"
                        onChange={(e) => handleFileChange('panCard', e)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:border-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        GST Registration
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        id="gstDocument"
                        onChange={(e) => handleFileChange('gstDocument', e)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:border-blue-500 outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                        Registration Certificate
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        id="registrationCertificate"
                        onChange={(e) => handleFileChange('registrationCertificate', e)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:border-blue-500 outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Previews Row matching PHP image tags (200px x 80px) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      {previews.experienceCertificate && (
                        <img
                          id="expCertificateImage"
                          src={previews.experienceCertificate}
                          alt="Experience Certificate Preview"
                          className="w-[200px] h-[80px] object-contain border border-gray-300 bg-white rounded-md p-1 shadow-xs"
                        />
                      )}
                    </div>

                    <div>
                      {previews.panCard && (
                        <img
                          id="panCardImage"
                          src={previews.panCard}
                          alt="PAN Card Preview"
                          className="w-[200px] h-[80px] object-contain border border-gray-300 bg-white rounded-md p-1 shadow-xs"
                        />
                      )}
                    </div>

                    <div>
                      {previews.gstDocument && (
                        <img
                          id="gstCertificateImage"
                          src={previews.gstDocument}
                          alt="GST Certificate Preview"
                          className="w-[200px] h-[80px] object-contain border border-gray-300 bg-white rounded-md p-1 shadow-xs"
                        />
                      )}
                    </div>

                    <div>
                      {previews.registrationCertificate && (
                        <img
                          id="registrationImage"
                          src={previews.registrationCertificate}
                          alt="Registration Certificate Preview"
                          className="w-[200px] h-[80px] object-contain border border-gray-300 bg-white rounded-md p-1 shadow-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons: Previous and Save/Update Details together on bottom right matching PHP */}
                  <div className="flex justify-end items-center space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold">&larr;</span>
                      <span>Previous</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Saving...' : isEditMode ? 'Update Details' : 'Save Details'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* SweetAlert Modal matching PHP swal() exactly */}
      {swalAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              {swalAlert.icon === 'error' ? (
                <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center bg-red-50 text-red-600 text-3xl font-bold">
                  &times;
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center bg-green-50 text-green-600 text-3xl font-bold">
                  &#10003;
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {swalAlert.title}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {swalAlert.text}
            </p>

            <button
              type="button"
              onClick={closeSwalAlert}
              className="w-full bg-[#7cd1f9] hover:bg-[#68c6f3] text-white font-bold py-2 px-4 rounded transition-colors text-sm uppercase cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewVendor;
