import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';

const ReportNewIncident = () => {
  const [initData, setInitData] = useState({
    poList: [],
    sitesList: [],
    vendors: [],
    users: [],
    types: [
      { id: '1', label: 'Office Incident' },
      { id: '2', label: 'Site Incident' }
    ]
  });

  const [formData, setFormData] = useState({
    type: '2', // Default to Site Incident matching PHP
    poNumber: '',
    siteId: '',
    incidentDate: new Date().toISOString().substring(0, 10),
    vendorId: '',
    employeeIds: [],
    description: '',
    consequence: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/po-sites/incidents-init', { withCredentials: true });
        if (res.data && res.data.success) {
          const d = res.data.data;
          setInitData({
            poList: Array.isArray(d.poList) ? d.poList : [],
            sitesList: Array.isArray(d.sitesList) ? d.sitesList : [],
            vendors: Array.isArray(d.vendors) ? d.vendors : [],
            users: Array.isArray(d.users) ? d.users : [],
            types: [
              { id: '1', label: 'Office Incident' },
              { id: '2', label: 'Site Incident' }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching incident init data:', err);
      }
    };
    fetchInit();
  }, []);

  // Filter sites according to selected PO
  const filteredSites = (initData?.sitesList || []).filter(s => {
    if (!formData.poNumber) return true;
    return String(s.po_no || '').trim() === String(formData.poNumber || '').trim();
  });

  const handlePOChange = (e) => {
    const po = e.target.value;
    setFormData(prev => ({
      ...prev,
      poNumber: po,
      siteId: ''
    }));
  };

  const handleEmployeeToggle = (userId) => {
    setFormData(prev => {
      const current = prev.employeeIds || [];
      const idStr = String(userId);
      if (current.includes(idStr)) {
        return { ...prev, employeeIds: current.filter(id => id !== idStr) };
      } else {
        return { ...prev, employeeIds: [...current, idStr] };
      }
    });
  };

  const removeEmployee = (userId) => {
    setFormData(prev => ({
      ...prev,
      employeeIds: (prev.employeeIds || []).filter(id => id !== String(userId))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });

    if (!formData.type) {
      alert('Please select Incident Type.');
      return;
    }

    if (formData.type === '2') {
      if (!formData.poNumber) {
        alert('Please select PO Number.');
        return;
      }
      if (!formData.siteId) {
        alert('Please select Site ID.');
        return;
      }
    }

    if (!formData.employeeIds || formData.employeeIds.length === 0) {
      alert('Please select at least one Employee.');
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      alert('Please enter Incident Report description.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type: formData.type,
        incident_type: formData.type,
        po_no: formData.poNumber,
        poNumber: formData.poNumber,
        site_id: formData.siteId,
        siteId: formData.siteId,
        incident_date: formData.incidentDate,
        incidentDate: formData.incidentDate,
        employee_id: formData.employeeIds,
        employee_ids: formData.employeeIds.join(','),
        vendor_id: formData.vendorId,
        vendorId: formData.vendorId,
        incident_report: formData.description,
        incident: formData.description,
        description: formData.description,
        incident_effect: formData.consequence,
        incident_consequence: formData.consequence,
        consequence: formData.consequence
      };

      const res = await axios.post('http://localhost:5000/api/po-sites/incidents', payload, { withCredentials: true });
      if (res.data && res.data.success) {
        setSubmitMessage({ type: 'success', text: res.data.message || 'Incident report has been saved successfully.' });
        setTimeout(() => {
          window.location.href = '/po-sites/incidents-reporting/incidents-report';
        }, 1200);
      } else {
        setSubmitMessage({ type: 'error', text: res.data?.message || 'Failed to submit incident' });
      }
    } catch (err) {
      console.error('Error submitting incident:', err);
      setSubmitMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error submitting incident report'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP page-wrapper layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Report New Incident</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>PO & Sites</span>
            <span>/</span>
            <span>Incidents Reporting</span>
            <span>/</span>
            <span className="text-gray-700">Report New Incident</span>
          </nav>
        </div>
        <a 
          href="/po-sites/incidents-reporting/incidents-report" 
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Incidents Report</span>
        </a>
      </div>

      {submitMessage.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          submitMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {submitMessage.text}
        </div>
      )}

      {/* Main Form container matching PHP mainDiv */}
      <div className="bg-[#DCF2FE] border border-[#b0d5ea] rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <span className="font-bold text-sm text-[#D60019]">* Fields are mandatory.</span>
        </div>

        {/* Top Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Incident Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
            >
              <option value="">Please Select</option>
              <option value="1">Office Incident</option>
              <option value="2">Site Incident</option>
            </select>
          </div>
        </div>

        {/* Dynamic Form matching PHP site-incident-form / office-incident-form */}
        {formData.type ? (
          <form onSubmit={handleSubmit} className="bg-white border-2 border-[#b0d5ea] rounded-xl p-6 space-y-6 shadow-xs">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              {formData.type === '1' ? 'Office Incident Details' : 'Site Incident Details'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date of Incident */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Incident <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.incidentDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  required
                />
              </div>

              {/* Site Incident Fields */}
              {formData.type === '2' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PO Number <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.poNumber}
                      onChange={handlePOChange}
                      required={formData.type === '2'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
                    >
                      <option value="">Select PO Number</option>
                      {(initData.poList || []).map(p => (
                        <option key={p.id || p.po_no} value={p.po_no}>{p.po_no}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site ID <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.siteId}
                      onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                      required={formData.type === '2'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
                    >
                      <option value="">Select Site ID</option>
                      {filteredSites.map(s => (
                        <option key={s.id || s.site_id} value={s.site_id}>{s.site_id}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Vendor (Site Incident Only) */}
              {formData.type === '2' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
                  >
                    <option value="">Please Select Vendor</option>
                    {(initData.vendors || []).map(v => (
                      <option key={v.id} value={v.id}>
                        {v.label || `${v.vendor_name || v.vendor_company_name}${v.contact_person ? ` (${v.contact_person})` : ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Employee Selection (Multi-select) */}
              <div className={formData.type === '1' ? 'md:col-span-3' : 'md:col-span-4'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsible Employee(s) <span className="text-red-500">*</span>
                </label>
                
                {/* Selected chips */}
                {formData.employeeIds && formData.employeeIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.employeeIds.map(empId => {
                      const user = (initData.users || []).find(u => String(u.id) === String(empId));
                      return (
                        <span 
                          key={empId} 
                          className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {user ? user.name : `User #${empId}`}
                          <button
                            type="button"
                            onClick={() => removeEmployee(empId)}
                            className="ml-1.5 text-green-700 hover:text-green-900 focus:outline-none"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleEmployeeToggle(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
                >
                  <option value="">-- Click to add an Employee --</option>
                  {(initData.users || []).map(u => (
                    <option 
                      key={u.id} 
                      value={u.id}
                      disabled={(formData.employeeIds || []).includes(String(u.id))}
                    >
                      {u.name} {(formData.employeeIds || []).includes(String(u.id)) ? '(Selected)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select one or multiple employees responsible for or involved in this incident.</p>
              </div>

              {/* Incident Report */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Report <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows="4"
                  value={formData.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  placeholder="Enter detailed incident report description..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Incident Consequence */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Consequence / Effect
                </label>
                <textarea 
                  rows="4"
                  value={formData.consequence}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  placeholder="Enter consequences, actions taken, or outcomes..."
                  onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
              >
                <Save size={18} />
                <span>{loading ? 'Saving Report...' : 'Save Report'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#b0d5ea] rounded-xl p-8 text-center text-gray-500">
            Please select an Incident Type above to display the report form.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportNewIncident;
