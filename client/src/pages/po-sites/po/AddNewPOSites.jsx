import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AddNewPOSites = () => {
  const [po, setPo] = useState('');
  const [sites, setSites] = useState([
    { id: 1, site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '', site_type: '' }
  ]);

  const pos = [
    { id: 'PO-1001', name: 'PO-1001' },
    { id: 'PO-1002', name: 'PO-1002' },
  ];

  const handleSiteChange = (id, field, value) => {
    setSites(sites.map(site => site.id === id ? { ...site, [field]: value } : site));
  };

  const addSiteRow = () => {
    setSites([...sites, { id: Date.now(), site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '', site_type: '' }]);
  };

  const removeSiteRow = (id) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!po) {
      alert("Please select PO");
      return;
    }
    console.log('PO:', po);
    console.log('Sites:', sites);
    alert('Sites added to PO successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add PO Sites</h1>
        <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>PO & Sites</span>
          <span>/</span>
          <span className="text-gray-700">Add PO Sites</span>
        </nav>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO <span className="text-red-500">*</span></label>
              <select name="po" value={po} onChange={(e) => setPo(e.target.value)} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select PO</option>
                {pos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Site Details</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site ID *</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO Number</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Infratel ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location *</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Type *</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Type *</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map((site) => (
                    <tr key={site.id}>
                      <td className="px-2 py-2">
                        <input type="text" value={site.site_id} onChange={(e) => handleSiteChange(site.id, 'site_id', e.target.value)} required className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.site_name} onChange={(e) => handleSiteChange(site.id, 'site_name', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.so_number} onChange={(e) => handleSiteChange(site.id, 'so_number', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.infratel_id} onChange={(e) => handleSiteChange(site.id, 'infratel_id', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.location} onChange={(e) => handleSiteChange(site.id, 'location', e.target.value)} required className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.latitude} onChange={(e) => handleSiteChange(site.id, 'latitude', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.longitude} onChange={(e) => handleSiteChange(site.id, 'longitude', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={site.work_type} onChange={(e) => handleSiteChange(site.id, 'work_type', e.target.value)} required className="w-full border border-gray-300 rounded p-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={site.site_type} onChange={(e) => handleSiteChange(site.id, 'site_type', e.target.value)} required className="w-full border border-gray-300 rounded p-1 text-sm">
                          <option value="">Select</option>
                          <option value="RTT">RTT</option>
                          <option value="GBT">GBT</option>
                          <option value="Upgradation">Upgradation</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeSiteRow(site.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <button type="button" onClick={addSiteRow} className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm">
                <Plus size={16} /> <span>Add More Sites</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Add Sites
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPOSites;
