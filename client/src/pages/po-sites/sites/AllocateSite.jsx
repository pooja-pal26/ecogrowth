import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AllocateSite = () => {
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllocationChange = (id, field, value) => {
    setAllocations(allocations.map(alloc => alloc.id === id ? { ...alloc, [field]: value } : alloc));
  };

  const addAllocationRow = () => {
    setAllocations([...allocations, { id: Date.now(), nature_of_work: '', resource_type: '', vendor_id: '', supervisor_id: '', completion_date: '' }]);
  };

  const removeAllocationRow = (id) => {
    setAllocations(allocations.filter(alloc => alloc.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Allocation Data:', formData, siteDetails, allocations);
    alert('Site Allocated Successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
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
              <select name="state_id" value={formData.state_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select State</option>
                <option value="1">Maharashtra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
              <select name="client_id" value={formData.client_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Client</option>
                <option value="1">Client A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number <span className="text-red-500">*</span></label>
              <select name="poNumber" value={formData.poNumber} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select PO Number</option>
                <option value="PO-1001">PO-1001</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site ID <span className="text-red-500">*</span></label>
              <select name="siteId" value={formData.siteId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Site ID</option>
                <option value="SITE-001">SITE-001</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
              <input type="date" name="po_date" value={formData.po_date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-gray-100" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Completion Date <span className="text-red-500">*</span></label>
              <input type="date" name="site_completion_date" value={formData.site_completion_date} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div className="mt-8 border-t border-blue-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Site Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.keys(siteDetails).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace('_', ' ')}</label>
                  <input type="text" value={siteDetails[key]} readOnly className="w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-blue-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Nature Of Work & Resource Allocation</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border bg-white">
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
                        <select value={alloc.nature_of_work} onChange={(e) => handleAllocationChange(alloc.id, 'nature_of_work', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm">
                          <option value="">Please Select</option>
                          <option value="Civil Work">Civil Work</option>
                          <option value="Electrical Work">Electrical Work</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.resource_type} onChange={(e) => handleAllocationChange(alloc.id, 'resource_type', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm">
                          <option value="">Please Select</option>
                          <option value="Staff">Staff</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Direct">Direct</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.vendor_id} onChange={(e) => handleAllocationChange(alloc.id, 'vendor_id', e.target.value)} disabled={alloc.resource_type !== 'Vendor'} className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 disabled:bg-gray-200">
                          <option value="">Please Select</option>
                          <option value="1">Vendor A</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={alloc.supervisor_id} onChange={(e) => handleAllocationChange(alloc.id, 'supervisor_id', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm">
                          <option value="">Please Select</option>
                          <option value="1">Supervisor John</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" value={alloc.completion_date} onChange={(e) => handleAllocationChange(alloc.id, 'completion_date', e.target.value)} required className="w-full border border-gray-300 rounded p-2 text-sm" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeAllocationRow(alloc.id)} className="text-red-500 hover:text-red-700">
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
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
              Allocate Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocateSite;
