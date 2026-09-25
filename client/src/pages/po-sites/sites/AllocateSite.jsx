import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const AllocateSite = () => {
  const navigate = useNavigate();
  const [initData, setInitData] = useState({
    states: [],
    clients: [],
    pos: [],
    sites: [],
    natureOfWork: [],
    vendors: [],
    supervisors: []
  });
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    state_id: '',
    client_id: '',
    poNumber: '',
    siteId: '',
    po_date: '',
    site_completion_date: new Date().toISOString().substring(0, 10),
  });

  const [siteDetails, setSiteDetails] = useState({
    infratel_id: '',
    zone: '',
    location: '',
    cluster: '',
    cluster_incharge: '',
    cluster_mobile: '',
    technician_name: '',
    technician_mobile: '',
    site_latitude: '',
    site_longitude: '',
    work_type: ''
  });

  const [allocations, setAllocations] = useState([
    {
      id: 1,
      nature_of_work: '',
      resource_type: '',
      vendor_id: '',
      supervisor_id: '',
      completion_date: new Date().toISOString().substring(0, 10)
    }
  ]);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        setLoadingInit(true);
        const res = await axios.get('http://localhost:5000/api/po-sites/allocation-init', { withCredentials: true });
        if (res.data) {
          const payload = res.data.data || res.data;
          setInitData({
            states: Array.isArray(payload.states) ? payload.states : [],
            clients: Array.isArray(payload.clients) ? payload.clients : [],
            pos: Array.isArray(payload.pos) ? payload.pos : (Array.isArray(payload.poList) ? payload.poList : []),
            sites: Array.isArray(payload.sites) ? payload.sites : (Array.isArray(payload.sitesList) ? payload.sitesList : []),
            natureOfWork: Array.isArray(payload.natureOfWork) ? payload.natureOfWork : [],
            vendors: Array.isArray(payload.vendors) ? payload.vendors : [],
            supervisors: Array.isArray(payload.supervisors) ? payload.supervisors : []
          });
        }
      } catch (err) {
        console.error('Error loading allocation init masters:', err);
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInit();
  }, []);

  // Filtered dropdown lists based on cascade
  const filteredClients = (initData?.clients || []).filter(c => {
    if (!formData.state_id) return true;
    return String(c.state_id) === String(formData.state_id);
  });

  const filteredPOs = (initData?.pos || []).filter(po => {
    if (formData.client_id && String(po.client_id) !== String(formData.client_id)) return false;
    if (formData.state_id && po.state_id && String(po.state_id) !== String(formData.state_id)) return false;
    return true;
  });

  const filteredSites = (initData?.sites || []).filter(s => {
    if (!formData.poNumber) return true;
    return String(s.po_no || '').trim() === String(formData.poNumber || '').trim();
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'state_id') {
      setFormData(prev => ({ ...prev, state_id: value, client_id: '', poNumber: '', siteId: '', po_date: '' }));
      setSiteDetails({
        infratel_id: '', zone: '', location: '', cluster: '',
        cluster_incharge: '', cluster_mobile: '', technician_name: '', technician_mobile: '',
        site_latitude: '', site_longitude: '', work_type: ''
      });
    } else if (name === 'client_id') {
      setFormData(prev => ({ ...prev, client_id: value, poNumber: '', siteId: '', po_date: '' }));
      setSiteDetails({
        infratel_id: '', zone: '', location: '', cluster: '',
        cluster_incharge: '', cluster_mobile: '', technician_name: '', technician_mobile: '',
        site_latitude: '', site_longitude: '', work_type: ''
      });
    } else if (name === 'poNumber') {
      const selectedPO = initData.pos.find(p => String(p.po_no || '').trim() === String(value || '').trim());
      setFormData(prev => ({
        ...prev,
        poNumber: value,
        siteId: '',
        po_date: selectedPO?.order_date || selectedPO?.po_date ? String(selectedPO.order_date || selectedPO.po_date).slice(0, 10) : ''
      }));
      setSiteDetails({
        infratel_id: '', zone: '', location: '', cluster: '',
        cluster_incharge: '', cluster_mobile: '', technician_name: '', technician_mobile: '',
        site_latitude: '', site_longitude: '', work_type: ''
      });
    } else if (name === 'siteId') {
      setFormData(prev => ({ ...prev, siteId: value }));
      if (value) {
        try {
          const res = await axios.get(`http://localhost:5000/api/po-sites/site-technical-details?site_id=${value}&po_no=${formData.poNumber}`, { withCredentials: true });
          if (res.data && (res.data.success || res.data.data)) {
            const data = res.data.data || res.data.details || {};
            setSiteDetails({
              infratel_id: data.infratel_id || '',
              zone: data.zone || 'North',
              location: data.location || '',
              cluster: data.cluster || '',
              cluster_incharge: data.cluster_incharge || '',
              cluster_mobile: data.cluster_mobile || '',
              technician_name: data.technician_name || '',
              technician_mobile: data.technician_mobile || '',
              site_latitude: data.site_latitude || '',
              site_longitude: data.site_longitude || '',
              work_type: data.work_type || ''
            });
            if (data.po_date && !formData.po_date) {
              setFormData(prev => ({ ...prev, po_date: String(data.po_date).slice(0, 10) }));
            }
          }
        } catch (err) {
          console.error('Error fetching site technical details:', err);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAllocationChange = (id, field, value) => {
    setAllocations(allocations.map(alloc => {
      if (alloc.id !== id) return alloc;
      const updated = { ...alloc, [field]: value };
      if (field === 'resource_type' && value !== 'Vendor') {
        updated.vendor_id = '';
      }
      return updated;
    }));
  };

  const addAllocationRow = () => {
    setAllocations([
      ...allocations,
      {
        id: Date.now(),
        nature_of_work: '',
        resource_type: '',
        vendor_id: '',
        supervisor_id: '',
        completion_date: new Date().toISOString().substring(0, 10)
      }
    ]);
  };

  const removeAllocationRow = (id) => {
    if (allocations.length <= 1) return;
    setAllocations(allocations.filter(alloc => alloc.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state_id) {
      showErrorToast('Please select State.', 'State Missing');
      return;
    }
    if (!formData.client_id) {
      showErrorToast('Please select Client Name.', 'Client Missing');
      return;
    }
    if (!formData.poNumber) {
      showErrorToast('Please select PO Number.', 'PO Number Missing');
      return;
    }
    if (!formData.siteId) {
      showErrorToast('Please select Site ID.', 'Site ID Missing');
      return;
    }
    if (!formData.site_completion_date) {
      showErrorToast('Please select Site Completion Date.', 'Date Missing');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post('http://localhost:5000/api/po-sites/allocate-site', {
        formData,
        siteDetails,
        allocations
      }, { withCredentials: true });

      if (res.data && res.data.success) {
        showSuccessToast(`Site ${formData.siteId} has been allocated successfully!`, 'Site Allocated');
        navigate('/po-sites/sites/allocated-site-list');
      } else {
        showErrorToast(res.data?.message || 'Failed to allocate site.', 'Allocation Error');
      }
    } catch (err) {
      console.error('Error allocating site:', err);
      showErrorToast(err.response?.data?.message || 'Error submitting site allocation.', 'Server Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto">
      {/* Main Panel */}
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-wide">Allocate New Site</h2>
          <Link
            to="/po-sites/sites/allocated-site-list"
            className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            <List size={14} />
            <span>View Allocated Sites</span>
          </Link>
        </div>

        {/* Panel Body - Normal White Background */}
        <div className="p-4 sm:p-5 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mandatory note */}
            <div>
              <span className="font-bold text-xs sm:text-sm text-red-600">
                * Fields are mandatory.
              </span>
            </div>

            {/* Top Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  State <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                >
                  <option value="">Select State</option>
                  {(initData.states || []).map(s => (
                    <option key={s.id || s.state_id} value={s.id || s.state_id}>
                      {s.state_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Client Name <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                >
                  <option value="">Select Client</option>
                  {filteredClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  PO Number <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                >
                  <option value="">Select PO Number</option>
                  {filteredPOs.map(p => (
                    <option key={p.id || p.po_no} value={p.po_no}>
                      {p.po_no}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Site ID <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                >
                  <option value="">Select Site ID</option>
                  {filteredSites.map(s => (
                    <option key={s.id || s.site_id} value={s.site_id}>
                      {s.site_id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  PO Date
                </label>
                <input
                  type="date"
                  name="po_date"
                  value={formData.po_date}
                  readOnly
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Site Completion Date (Tentative) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  name="site_completion_date"
                  value={formData.site_completion_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Box 1: Site Details (clean bordered section) */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-3">
              <h3 className="text-center font-bold text-sm sm:text-base text-gray-800 underline">
                Site Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Infratel ID</label>
                  <input
                    type="text"
                    value={siteDetails.infratel_id}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Zone</label>
                  <input
                    type="text"
                    value={siteDetails.zone}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={siteDetails.location}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cluster</label>
                  <input
                    type="text"
                    value={siteDetails.cluster}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cluster Incharge</label>
                  <input
                    type="text"
                    value={siteDetails.cluster_incharge}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cluster Mobile Number</label>
                  <input
                    type="text"
                    value={siteDetails.cluster_mobile}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={siteDetails.technician_name}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Technician Mobile Number</label>
                  <input
                    type="text"
                    value={siteDetails.technician_mobile}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Site Latitude</label>
                  <input
                    type="text"
                    value={siteDetails.site_latitude}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Site Longitude</label>
                  <input
                    type="text"
                    value={siteDetails.site_longitude}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Work Type</label>
                  <input
                    type="text"
                    value={siteDetails.work_type}
                    readOnly
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Nature Of Work & Resource Allocation */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-3">
              <h3 className="text-center font-bold text-sm sm:text-base text-gray-800 underline">
                Nature Of Work & Resource Allocation
              </h3>

              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200">Nature Of Work</th>
                      <th className="px-3 py-2 border-r border-gray-200">Allocate Resource Type</th>
                      <th className="px-3 py-2 border-r border-gray-200">Vendor Name</th>
                      <th className="px-3 py-2 border-r border-gray-200">Supervisor Name</th>
                      <th className="px-3 py-2 border-r border-gray-200">Due Date</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {allocations.map((alloc, idx) => (
                      <tr key={alloc.id} className="hover:bg-gray-50">
                        <td className="p-2 border-r border-gray-200 min-w-[160px]">
                          <select
                            value={alloc.nature_of_work}
                            onChange={(e) => handleAllocationChange(alloc.id, 'nature_of_work', e.target.value)}
                            required
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                          >
                            <option value="">Please Select</option>
                            {(initData?.natureOfWork || []).map(n => (
                              <option key={n.id} value={n.nature_of_work}>
                                {n.nature_of_work}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2 border-r border-gray-200 min-w-[140px]">
                          <select
                            value={alloc.resource_type}
                            onChange={(e) => handleAllocationChange(alloc.id, 'resource_type', e.target.value)}
                            required
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                          >
                            <option value="">Please Select</option>
                            <option value="Staff">Staff</option>
                            <option value="Vendor">Vendor</option>
                            <option value="Direct">Direct</option>
                          </select>
                        </td>

                        <td className="p-2 border-r border-gray-200 min-w-[160px]">
                          {alloc.resource_type === 'Vendor' ? (
                            <select
                              value={alloc.vendor_id}
                              onChange={(e) => handleAllocationChange(alloc.id, 'vendor_id', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                            >
                              <option value="">Please Select</option>
                              {(initData?.vendors || []).map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.vendor_company_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              readOnly
                              disabled
                              className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
                            />
                          )}
                        </td>

                        <td className="p-2 border-r border-gray-200 min-w-[160px]">
                          <select
                            value={alloc.supervisor_id}
                            onChange={(e) => handleAllocationChange(alloc.id, 'supervisor_id', e.target.value)}
                            required
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                          >
                            <option value="">Please Select</option>
                            {(initData?.supervisors || [])
                              .filter(s => !alloc.vendor_id || String(s.company_vendor_id || s.vendor_id) === String(alloc.vendor_id))
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.manpower_name || s.name}
                                </option>
                              ))}
                          </select>
                        </td>

                        <td className="p-2 border-r border-gray-200 min-w-[130px]">
                          <input
                            type="date"
                            value={alloc.completion_date}
                            onChange={(e) => handleAllocationChange(alloc.id, 'completion_date', e.target.value)}
                            required
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                          />
                        </td>

                        <td className="p-2 text-center min-w-[60px]">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => removeAllocationRow(alloc.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete Row"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <button
                  type="button"
                  onClick={addAllocationRow}
                  className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add More Row</span>
                </button>
              </div>
            </div>

            {/* Bottom Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-6 py-2.5 rounded transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>{submitting ? 'Allocating...' : 'Allocate Site'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AllocateSite;
