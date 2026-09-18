import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const AllocateSite = () => {
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
    site_completion_date: '',
  });

  const [siteDetails, setSiteDetails] = useState({
    infratel_id: '', zone: '', location: '', cluster: '',
    cluster_incharge: '', cluster_mobile: '', technician_name: '', technician_mobile: '',
    site_latitude: '', site_longitude: '', work_type: ''
  });

  const [allocations, setAllocations] = useState([
    { id: 1, nature_of_work: '', resource_type: '', vendor_id: '', supervisor_id: '', completion_date: '' }
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
        po_date: selectedPO?.po_date ? String(selectedPO.po_date).slice(0, 10) : ''
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
          if (res.data && res.data.success) {
            const data = res.data.data || {};
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
    setAllocations(allocations.map(alloc => alloc.id === id ? { ...alloc, [field]: value } : alloc));
  };

  const addAllocationRow = () => {
    setAllocations([...allocations, { id: Date.now(), nature_of_work: '', resource_type: '', vendor_id: '', supervisor_id: '', completion_date: '' }]);
  };

  const removeAllocationRow = (id) => {
    if (allocations.length <= 1) return;
    setAllocations(allocations.filter(alloc => alloc.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.siteId) {
      alert('Please select a Site ID');
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
        alert('Site Allocated Successfully!');
        window.location.href = '/po-sites/sites/allocated-site-list';
      } else {
        alert(res.data?.message || 'Failed to allocate site');
      }
    } catch (err) {
      console.error('Error allocating site:', err);
      alert(err.response?.data?.message || 'Error submitting site allocation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Allocate Site</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>PO & Sites</span>
            <span>/</span>
            <span className="text-gray-700">Allocate Site</span>
          </nav>
        </div>
        <a href="/po-sites/sites/allocated-site-list" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
          View Allocated Sites
        </a>
      </div>

      <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
              <select name="state_id" value={formData.state_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Select State</option>
                {(initData.states || []).map(s => (
                  <option key={s.id || s.state_id} value={s.state_id || s.id}>{s.state_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
              <select name="client_id" value={formData.client_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Select Client</option>
                {filteredClients.map(c => (
                  <option key={c.id} value={c.id}>{c.client_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number <span className="text-red-500">*</span></label>
              <select name="poNumber" value={formData.poNumber} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Select PO Number</option>
                {filteredPOs.map(p => (
                  <option key={p.id || p.po_no} value={p.po_no}>{p.po_no}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site ID <span className="text-red-500">*</span></label>
              <select name="siteId" value={formData.siteId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Select Site ID</option>
                {filteredSites.map(s => (
                  <option key={s.id || s.site_id} value={s.site_id}>{s.site_id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
              <input type="date" name="po_date" value={formData.po_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-gray-100" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Completion Date <span className="text-red-500">*</span></label>
              <input type="date" name="site_completion_date" value={formData.site_completion_date} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 bg-white" />
            </div>
          </div>

          <div className="mt-8 border-t border-blue-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Site Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.keys(siteDetails).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                  <input type="text" value={siteDetails[key]} readOnly className="w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-blue-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Nature Of Work & Resource Allocation</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full divide-y divide-gray-200 border bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature Of Work</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocate Resource Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="px-2 py-2">
                        <select value={alloc.nature_of_work} onChange={(e) => handleAllocationChange(alloc.id, 'nature_of_work', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                          <option value="">Please Select</option>
                          {(initData?.natureOfWork || []).map(n => (
                            <option key={n.id} value={n.nature_of_work}>{n.nature_of_work}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.resource_type} onChange={(e) => handleAllocationChange(alloc.id, 'resource_type', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                          <option value="">Please Select</option>
                          <option value="Staff">Staff</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Direct">Direct</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.vendor_id} onChange={(e) => handleAllocationChange(alloc.id, 'vendor_id', e.target.value)} disabled={alloc.resource_type !== 'Vendor'} className="w-full border border-gray-300 rounded p-2 text-sm bg-white disabled:bg-gray-100">
                          <option value="">Please Select</option>
                          {(initData?.vendors || []).map(v => (
                            <option key={v.id} value={v.id}>{v.vendor_company_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.supervisor_id} onChange={(e) => handleAllocationChange(alloc.id, 'supervisor_id', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                          <option value="">Please Select</option>
                          {(initData?.supervisors || [])
                            .filter(s => !alloc.vendor_id || String(s.company_vendor_id || s.vendor_id) === String(alloc.vendor_id))
                            .map(s => (
                              <option key={s.id} value={s.id}>{s.manpower_name || s.name}</option>
                            ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" value={alloc.completion_date} onChange={(e) => handleAllocationChange(alloc.id, 'completion_date', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeAllocationRow(alloc.id)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={allocations.length <= 1}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <button type="button" onClick={addAllocationRow} className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm">
                <Plus size={16} /> <span>Add More Row</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
              {submitting ? 'Allocating...' : 'Allocate Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocateSite;
