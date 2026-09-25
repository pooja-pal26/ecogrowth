import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, ChevronDown, Check, Search } from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

// Helper to format names to Title Case matching PHP ucwords(strtolower($user['name']))
const formatName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Select2-like Multi-Select for Employee
const EmployeeMultiSelect = ({ users = [], selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId) => {
    const idStr = String(userId);
    if (selected.includes(idStr)) {
      onChange(selected.filter(id => id !== idStr));
    } else {
      onChange([...selected, idStr]);
    }
  };

  const removeUser = (e, userId) => {
    e.stopPropagation();
    onChange(selected.filter(id => id !== String(userId)));
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[34px] w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white flex flex-wrap items-center gap-1 cursor-pointer focus-within:ring-1 focus-within:ring-teal-500 focus-within:border-teal-500"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 select-none">Select Employee</span>
        ) : (
          selected.map(id => {
            const user = users.find(u => String(u.id) === String(id));
            const name = user ? formatName(user.name) : `User #${id}`;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 text-[11px] px-1.5 py-0.5 rounded font-medium"
              >
                {name}
                <button
                  type="button"
                  onClick={(e) => removeUser(e, id)}
                  className="text-teal-600 hover:text-teal-900 focus:outline-none"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })
        )}
        <div className="ml-auto pl-1 self-center text-gray-400">
          <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg text-xs">
          <div className="p-1.5 border-b border-gray-100 bg-gray-50 flex items-center gap-1 sticky top-0">
            <Search size={12} className="text-gray-400 ml-1" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
              autoFocus
            />
            {selected.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-[10px] text-red-600 hover:underline px-1 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="py-1">
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-center">No employees found</div>
            ) : (
              filteredUsers.map(user => {
                const isSelected = selected.includes(String(user.id));
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-teal-50 transition-colors ${
                      isSelected ? 'bg-teal-50/70 font-semibold text-teal-900' : 'text-gray-700'
                    }`}
                  >
                    <span>{formatName(user.name)}</span>
                    {isSelected && <Check size={13} className="text-teal-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ReportNewIncident = () => {
  const navigate = useNavigate();

  // Top Incident Type selector matching PHP: "" (Please Select), "1" (Office Incident), "2" (Site Incident)
  const [incidentType, setIncidentType] = useState('');

  // Initial masters from backend
  const [initData, setInitData] = useState({
    poList: [],
    sitesList: [],
    vendors: [],
    users: []
  });

  const getTodayISO = () => new Date().toISOString().substring(0, 10);

  // Site Incident Form State matching PHP site-incident-form.phtml
  const [siteForm, setSiteForm] = useState({
    incident_date: getTodayISO(),
    po_no: '',
    site_id: '',
    employee_id: [],
    vendor_id: '',
    incident_report: '',
    incident_effect: ''
  });

  // Office Incident Form State matching PHP office-incident-form.phtml
  const [officeForm, setOfficeForm] = useState({
    incident_date: getTodayISO(),
    employee_id: [],
    incident_report: '',
    incident_effect: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        setLoadingInit(true);
        const res = await axios.get('http://localhost:5000/api/po-sites/incidents-init', { withCredentials: true });
        if (res.data && res.data.success) {
          const d = res.data.data;
          setInitData({
            poList: Array.isArray(d.poList) ? d.poList : [],
            sitesList: Array.isArray(d.sitesList) ? d.sitesList : [],
            vendors: Array.isArray(d.vendors) ? d.vendors : [],
            users: Array.isArray(d.users) ? d.users : []
          });
        }
      } catch (err) {
        console.error('Error fetching incident init data:', err);
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInit();
  }, []);

  // Filter sites based on selected PO in Site Incident form
  const availableSites = (initData.sitesList || []).filter(s => {
    if (!siteForm.po_no) return false;
    return String(s.po_no || '').trim() === String(siteForm.po_no).trim();
  });

  // Handle PO selection change in Site Incident form
  const handleSitePoChange = (e) => {
    const selectedPo = e.target.value;
    setSiteForm(prev => ({
      ...prev,
      po_no: selectedPo,
      site_id: '' // reset site_id when PO changes, matching PHP
    }));
  };

  // Submit Site Incident matching PHP site-incident-form.phtml
  const handleSubmitSiteIncident = async (e) => {
    e.preventDefault();

    if (!siteForm.incident_date) {
      showErrorToast('Please select incident date.', 'Incident Date Missing!');
      return;
    }
    if (!siteForm.po_no) {
      showErrorToast('Please select PO number.', 'PO Number Missing!');
      return;
    }
    if (!siteForm.site_id) {
      showErrorToast('Please select site ID.', 'Site ID Missing!');
      return;
    }
    if (!siteForm.employee_id || siteForm.employee_id.length === 0) {
      showErrorToast('Please select employee.', 'Employee Missing!');
      return;
    }
    if (!siteForm.incident_report || !siteForm.incident_report.trim()) {
      showErrorToast('Please enter incident report.', 'Incident Report Missing!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        type: '2',
        incident_type: '2',
        incident_date: siteForm.incident_date,
        po_no: siteForm.po_no,
        site_id: siteForm.site_id,
        employee_id: siteForm.employee_id,
        vendor_id: siteForm.vendor_id || '',
        incident_report: siteForm.incident_report,
        incident_effect: siteForm.incident_effect || ''
      };

      const res = await axios.post('http://localhost:5000/api/po-sites/incidents', payload, { withCredentials: true });
      if (res.data && res.data.success) {
        showSuccessToast(res.data.message || 'Incident report has been saved successfully.', 'Success !');
        navigate('/po-sites/incidents-reporting/incidents-report');
      } else {
        showErrorToast(res.data?.message || 'Failed to save incident report.', 'Error !');
      }
    } catch (err) {
      console.error('Error submitting site incident:', err);
      showErrorToast(err.response?.data?.message || 'Failed to save incident report.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Office Incident matching PHP office-incident-form.phtml
  const handleSubmitOfficeIncident = async (e) => {
    e.preventDefault();

    if (!officeForm.incident_date) {
      showErrorToast('Please select incident date.', 'Incident Date Missing!');
      return;
    }
    if (!officeForm.employee_id || officeForm.employee_id.length === 0) {
      showErrorToast('Please select employee.', 'Employee Missing!');
      return;
    }
    if (!officeForm.incident_report || !officeForm.incident_report.trim()) {
      showErrorToast('Please enter incident report.', 'Incident Report Missing!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        type: '1',
        incident_type: '1',
        incident_date: officeForm.incident_date,
        employee_id: officeForm.employee_id,
        incident_report: officeForm.incident_report,
        incident_effect: officeForm.incident_effect || ''
      };

      const res = await axios.post('http://localhost:5000/api/po-sites/incidents', payload, { withCredentials: true });
      if (res.data && res.data.success) {
        showSuccessToast(res.data.message || 'Incident report has been saved successfully.', 'Success !');
        navigate('/po-sites/incidents-reporting/incidents-report');
      } else {
        showErrorToast(res.data?.message || 'Failed to save incident report.', 'Error !');
      }
    } catch (err) {
      console.error('Error submitting office incident:', err);
      showErrorToast(err.response?.data?.message || 'Failed to save incident report.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP report-new-incident.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Heading with exact gradient header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base font-bold tracking-tight">Report New Incident</h2>
          <Link
            to="/po-sites/incidents-reporting/incidents-report"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
        </div>

        {/* Panel Body - Normal White Background */}
        <div className="p-4 sm:p-5 bg-white space-y-4">
          {/* Mandatory notice */}
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#D60019]">
              * Fields are mandatory.
            </span>
          </div>

          {/* Incident Type Select Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="incidentTypeSelect" className="block text-xs font-bold text-gray-700 mb-1">
                Incident Type <span className="text-[#D60019] font-bold">*</span>
              </label>
              <select
                id="incidentTypeSelect"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
              >
                <option value="">Please Select</option>
                <option value="1">Office Incident</option>
                <option value="2">Site Incident</option>
              </select>
            </div>
          </div>

          {/* If no type selected, show prompt matching PHP hidden formDiv */}
          {!incidentType && (
            <div className="py-8 px-4 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
              Please select an Incident Type above to display the form.
            </div>
          )}

          {/* SITE INCIDENT FORM matching PHP site-incident-form.phtml */}
          {incidentType === '2' && (
            <div className="border-t border-gray-100 pt-4">
              <form onSubmit={handleSubmitSiteIncident} className="space-y-4">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#D60019]">
                    * Fields are mandatory.
                  </span>
                </div>

                {/* Row 1: Date of Incident, PO Number, Site ID, Employee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-start">
                  <div>
                    <label htmlFor="incident_date" className="block text-xs font-bold text-gray-700 mb-1">
                      Date of Incident <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      id="incident_date"
                      name="incident_date"
                      value={siteForm.incident_date}
                      onChange={(e) => setSiteForm({ ...siteForm, incident_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="po_no" className="block text-xs font-bold text-gray-700 mb-1">
                      PO Number <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <select
                      id="po_no"
                      name="po_no"
                      value={siteForm.po_no}
                      onChange={handleSitePoChange}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    >
                      <option value="">Select PO Number</option>
                      {initData.poList.map((po) => (
                        <option key={po.id || po.po_no} value={po.po_no}>
                          {po.po_no}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="site_id" className="block text-xs font-bold text-gray-700 mb-1">
                      Site ID <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <select
                      id="site_id"
                      name="site_id"
                      value={siteForm.site_id}
                      onChange={(e) => setSiteForm({ ...siteForm, site_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    >
                      <option value="">Select Site ID</option>
                      {availableSites.map((site) => (
                        <option key={site.id || site.site_id} value={site.site_id}>
                          {site.site_id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="employee_id" className="block text-xs font-bold text-gray-700 mb-1">
                      Employee <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <EmployeeMultiSelect
                      users={initData.users}
                      selected={siteForm.employee_id}
                      onChange={(newEmpIds) => setSiteForm({ ...siteForm, employee_id: newEmpIds })}
                    />
                  </div>
                </div>

                {/* Row 2: Vendor, Incident Report, Incident Consequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="vendor_id" className="block text-xs font-bold text-gray-700 mb-1">
                      Vendor
                    </label>
                    <select
                      id="vendor_id"
                      name="vendor_id"
                      value={siteForm.vendor_id}
                      onChange={(e) => setSiteForm({ ...siteForm, vendor_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                    >
                      <option value="">Please Select</option>
                      {initData.vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.vendor_name} ({v.contact_person || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="incident_report" className="block text-xs font-bold text-gray-700 mb-1">
                      Incident Report <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <textarea
                      id="incident_report"
                      name="incident_report"
                      rows="3"
                      value={siteForm.incident_report}
                      onChange={(e) => setSiteForm({ ...siteForm, incident_report: e.target.value })}
                      placeholder="Enter incident report..."
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="incident_effect" className="block text-xs font-bold text-gray-700 mb-1">
                      Incident Consequence
                    </label>
                    <textarea
                      id="incident_effect"
                      name="incident_effect"
                      rows="3"
                      value={siteForm.incident_effect}
                      onChange={(e) => setSiteForm({ ...siteForm, incident_effect: e.target.value })}
                      placeholder="Enter incident consequence..."
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                    />
                  </div>
                </div>

                {/* Row 3: Save Report Button matching PHP id="saveIncidentReport" */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="saveIncidentReport"
                    disabled={submitting}
                    className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-6 py-2.5 rounded shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{submitting ? 'Saving Report...' : 'Save Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OFFICE INCIDENT FORM matching PHP office-incident-form.phtml */}
          {incidentType === '1' && (
            <div className="border-t border-gray-100 pt-4">
              <form onSubmit={handleSubmitOfficeIncident} className="space-y-4">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#D60019]">
                    * Fields are mandatory.
                  </span>
                </div>

                {/* Row 1: Date of Incident, Employee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-start">
                  <div>
                    <label htmlFor="incident_date_office" className="block text-xs font-bold text-gray-700 mb-1">
                      Date of Incident <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      id="incident_date_office"
                      name="incident_date"
                      value={officeForm.incident_date}
                      onChange={(e) => setOfficeForm({ ...officeForm, incident_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="employee_id_office" className="block text-xs font-bold text-gray-700 mb-1">
                      Employee <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <EmployeeMultiSelect
                      users={initData.users}
                      selected={officeForm.employee_id}
                      onChange={(newEmpIds) => setOfficeForm({ ...officeForm, employee_id: newEmpIds })}
                    />
                  </div>
                </div>

                {/* Row 2: Incident Report, Incident Consequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-1 sm:col-span-1 md:col-span-2">
                    <label htmlFor="incident_report_office" className="block text-xs font-bold text-gray-700 mb-1">
                      Incident Report <span className="text-[#D60019] font-bold">*</span>
                    </label>
                    <textarea
                      id="incident_report_office"
                      name="incident_report"
                      rows="3"
                      value={officeForm.incident_report}
                      onChange={(e) => setOfficeForm({ ...officeForm, incident_report: e.target.value })}
                      placeholder="Enter incident report..."
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                      required
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-1 md:col-span-2">
                    <label htmlFor="incident_effect_office" className="block text-xs font-bold text-gray-700 mb-1">
                      Incident Consequence
                    </label>
                    <textarea
                      id="incident_effect_office"
                      name="incident_effect"
                      rows="3"
                      value={officeForm.incident_effect}
                      onChange={(e) => setOfficeForm({ ...officeForm, incident_effect: e.target.value })}
                      placeholder="Enter incident consequence..."
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                    />
                  </div>
                </div>

                {/* Row 3: Save Report Button matching PHP id="saveIncidentReport" */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="saveIncidentReportOffice"
                    disabled={submitting}
                    className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-6 py-2.5 rounded shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{submitting ? 'Saving Report...' : 'Save Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportNewIncident;
