import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddNewPO = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    state_id: '',
    client_id: '',
    po_type: 'Standard PO',
    po_amount: '',
    po_number: '',
    po_date: new Date().toISOString().substring(0, 10),
    revision: '0',
    site_type: '',
  });

  const [sites, setSites] = useState([
    { id: Date.now(), site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '' }
  ]);

  const [states, setStates] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic masters from backend
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/po-sites/init-data', { withCredentials: true });
        if (res.data && res.data.success) {
          setStates(res.data.states || []);
          setAllClients(res.data.clients || []);
        }
      } catch (err) {
        console.error('Error loading masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Filter clients by selected state
  const clients = formData.state_id 
    ? allClients.filter(c => String(c.state_id) === String(formData.state_id))
    : allClients;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state_id') {
      setFormData({ ...formData, state_id: value, client_id: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSiteChange = (id, field, value) => {
    setSites(sites.map(site => site.id === id ? { ...site, [field]: value } : site));
  };

  const addSiteRow = () => {
    setSites([...sites, { id: Date.now(), site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '' }]);
  };

  const removeSiteRow = (id) => {
    if (sites.length <= 1) {
      alert('At least one site row is required');
      return;
    }
    setSites(sites.filter(site => site.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.state_id) {
      alert('Please select State');
      return;
    }
    if (!formData.client_id) {
      alert('Please select Client');
      return;
    }
    if (!formData.po_amount) {
      alert('Please enter PO Amount');
      return;
    }
    if (!formData.po_number.trim()) {
      alert('Please enter PO Number');
      return;
    }
    if (!formData.po_date) {
      alert('Please enter PO Date');
      return;
    }

    for (let i = 0; i < sites.length; i++) {
      if (!sites[i].site_id.trim()) {
        alert(`Row ${i + 1}: Site ID is mandatory`);
        return;
      }
      if (!sites[i].location.trim()) {
        alert(`Row ${i + 1}: Location is mandatory`);
        return;
      }
      if (!sites[i].work_type.trim()) {
        alert(`Row ${i + 1}: Work Type is mandatory`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        sites: sites.map(({ id, ...rest }) => rest)
      };

      const res = await axios.post('http://localhost:5000/api/po-sites/add-po-and-sites', payload, { withCredentials: true });
      if (res.data && res.data.flag) {
        alert(res.data.message || 'PO and Sites added successfully!');
        navigate('/po-sites/po/po-details');
      } else {
        alert(res.data?.message || 'Failed to add PO and Sites');
      }
    } catch (err) {
      console.error('Error submitting PO:', err);
      alert(err.response?.data?.message || err.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New PO</h1>
        <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>PO & Sites</span>
          <span>/</span>
          <span className="text-gray-700">Add New PO</span>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
              <select name="state_id" value={formData.state_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
              <select name="client_id" value={formData.client_id} onChange={handleInputChange} required disabled={!formData.state_id} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-50">
                <option value="">{formData.state_id ? 'Select Client' : 'First Select State'}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Type <span className="text-red-500">*</span></label>
              <select name="po_type" value={formData.po_type} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="Standard PO">Standard PO</option>
                <option value="Rate Contract PO">Rate Contract PO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Amount <span className="text-red-500">*</span></label>
              <input type="number" step="any" name="po_amount" value={formData.po_amount} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number <span className="text-red-500">*</span></label>
              <input type="text" name="po_number" value={formData.po_number} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Date <span className="text-red-500">*</span></label>
              <input type="date" name="po_date" value={formData.po_date} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revision</label>
              <input type="number" name="revision" value={formData.revision} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Type</label>
              <select name="site_type" value={formData.site_type} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Site Type</option>
                <option value="RTT">RTT</option>
                <option value="GBT">GBT</option>
                <option value="Upgrade">Upgrade</option>
              </select>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center underline">Site Details</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full divide-y divide-gray-200 border">
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
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map((site, index) => (
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
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Sites'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPO;
