import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const AddNewPO = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    state_id: sessionStorage.getItem('state_id') || '',
    client_id: sessionStorage.getItem('client_id') || '',
    po_type: 'Standard PO',
    po_amount: '',
    po_number: '',
    po_date: new Date().toISOString().substring(0, 10),
    revision: '0',
    site_type: '',
    operating_unit: '',
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
      sessionStorage.setItem('state_id', value);
      sessionStorage.removeItem('client_id');
    } else if (name === 'client_id') {
      setFormData({ ...formData, client_id: value });
      sessionStorage.setItem('client_id', value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Auto-fetch site matrix data matching PHP getInfratelId(count, site_id)
  const lookupSiteMatrix = async (rowId, siteIdVal) => {
    if (!siteIdVal || !siteIdVal.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/po-sites/get-site-matrix-data/${encodeURIComponent(siteIdVal.trim())}`, { withCredentials: true });
      if (res.data && res.data.infratel_id) {
        setSites(prev => prev.map(site => {
          if (site.id === rowId) {
            return {
              ...site,
              infratel_id: res.data.infratel_id || site.infratel_id,
              site_name: site.site_name || res.data.zone || '',
              location: site.location || res.data.zone || ''
            };
          }
          return site;
        }));
      }
    } catch (err) {
      console.error('Error looking up site matrix:', err);
    }
  };

  const handleSiteChange = (id, field, value) => {
    setSites(sites.map(site => site.id === id ? { ...site, [field]: value } : site));
  };

  const handleSiteIdBlur = (id, value) => {
    lookupSiteMatrix(id, value);
  };

  const addSiteRow = () => {
    setSites([...sites, { id: Date.now(), site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '' }]);
  };

  const removeSiteRow = (id) => {
    if (sites.length <= 1) {
      showErrorToast('At least one site row is required', 'Validation Error');
      return;
    }
    setSites(sites.filter(site => site.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.state_id) {
      showErrorToast('Please select state name.', 'State Missing!');
      return;
    }
    if (!formData.client_id) {
      showErrorToast('Please select client name.', 'Client Missing!');
      return;
    }
    if (!formData.po_type) {
      showErrorToast('Please select PO type.', 'PO Type Missing!');
      return;
    }
    if (!formData.po_amount) {
      showErrorToast('Please enter PO Amount.', 'PO Amount Missing!');
      return;
    }
    if (!formData.po_number.trim()) {
      showErrorToast('Please enter PO number.', 'PO Number Missing!');
      return;
    }
    if (!formData.po_date) {
      showErrorToast('Please enter PO date.', 'PO Date Missing!');
      return;
    }

    for (let i = 0; i < sites.length; i++) {
      if (!sites[i].site_id.trim()) {
        showErrorToast(`Row ${i + 1}: Site ID is mandatory`, 'Site ID Missing!');
        return;
      }
      if (!sites[i].location.trim()) {
        showErrorToast(`Row ${i + 1}: Location is mandatory`, 'Location Missing!');
        return;
      }
      if (!sites[i].work_type.trim()) {
        showErrorToast(`Row ${i + 1}: Work Type is mandatory`, 'Work Type Missing!');
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
        showSuccessToast(res.data.message || 'PO and Sites added successfully!', res.data.title || 'Added Successfully');
        setTimeout(() => {
          navigate('/po-sites/po/po-details');
        }, 1200);
      } else {
        showErrorToast(res.data?.message || 'Failed to add PO and Sites', res.data?.title || 'Error');
      }
    } catch (err) {
      console.error('Error submitting PO:', err);
      showErrorToast(err.response?.data?.message || err.message || 'Server error occurred', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3 font-sans">
      {/* Header Banner matching PHP add-po-and-sites.phtml panel-primary */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Add New PO</span>
        </h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/po-sites/po/po-details"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={13} />
            <span>PO Details</span>
          </Link>
        </div>
      </div>

      {/* Main Form Container with Clean White Background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="font-semibold text-xs text-[#D60019]">
              * Field is mandatory.
            </span>
          </div>

          {/* Row 1: State, Client Name, PO Type, PO Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                State <span className="text-red-500">*</span> :
              </label>
              <select 
                name="state_id" 
                value={formData.state_id} 
                onChange={handleInputChange} 
                required 
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Client Name <span className="text-red-500">*</span> :
              </label>
              <select 
                name="client_id" 
                value={formData.client_id} 
                onChange={handleInputChange} 
                required 
                disabled={!formData.state_id} 
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none disabled:bg-gray-100"
              >
                <option value="">{formData.state_id ? 'Select Client' : 'First Select State'}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PO Type <span className="text-red-500">*</span> :
              </label>
              <select 
                name="po_type" 
                value={formData.po_type} 
                onChange={handleInputChange} 
                required 
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="">Select PO Type</option>
                <option value="Standard PO">Standard PO</option>
                <option value="Rate Contract PO">Rate Contract PO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PO Amount <span className="text-red-500">*</span> :
              </label>
              <input 
                type="text" 
                name="po_amount" 
                value={formData.po_amount} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setFormData({ ...formData, po_amount: val });
                }} 
                required 
                placeholder="0.00"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              />
            </div>
          </div>

          {/* Row 2: PO Number, PO Date, Revision, Site Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PO Number <span className="text-red-500">*</span> :
              </label>
              <input 
                type="text" 
                name="po_number" 
                value={formData.po_number} 
                onChange={handleInputChange} 
                required 
                placeholder="PO Number"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PO Date <span className="text-red-500">*</span> :
              </label>
              <input 
                type="date" 
                name="po_date" 
                value={formData.po_date} 
                onChange={handleInputChange} 
                required 
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Revision :
              </label>
              <input 
                type="text" 
                name="revision" 
                value={formData.revision} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, revision: val });
                }} 
                placeholder="0"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Site Type :
              </label>
              <select 
                name="site_type" 
                value={formData.site_type} 
                onChange={handleInputChange} 
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="">Select Site Type</option>
                <option value="RTT">RTT</option>
                <option value="GBT">GBT</option>
                <option value="Upgrade">Upgrade</option>
              </select>
            </div>
          </div>

          {/* Site Details Section matching PHP add-po-and-sites.phtml */}
          <div className="pt-2 space-y-2">
            <h3 className="text-center font-bold text-sm text-gray-800 underline">
              Site Details
            </h3>
            
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead 
                  className="text-white text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
                  }}
                >
                  <tr>
                    <th className="px-2.5 py-2 text-center w-28">Site ID <span className="text-amber-200">*</span></th>
                    <th className="px-2.5 py-2 text-center w-36">Site Name</th>
                    <th className="px-2.5 py-2 text-center w-28">SO Number</th>
                    <th className="px-2.5 py-2 text-center w-28">Infratel ID</th>
                    <th className="px-2.5 py-2 text-center w-36">Location <span className="text-amber-200">*</span></th>
                    <th className="px-2.5 py-2 text-center w-24">Latitude</th>
                    <th className="px-2.5 py-2 text-center w-24">Longitude</th>
                    <th className="px-2.5 py-2 text-center w-32">Work Type <span className="text-amber-200">*</span></th>
                    <th className="px-2.5 py-2 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.site_id} 
                          onChange={(e) => handleSiteChange(site.id, 'site_id', e.target.value)} 
                          onBlur={(e) => handleSiteIdBlur(site.id, e.target.value)}
                          required 
                          placeholder="Site ID"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.site_name} 
                          onChange={(e) => handleSiteChange(site.id, 'site_name', e.target.value)} 
                          placeholder="Site Name"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.so_number} 
                          onChange={(e) => handleSiteChange(site.id, 'so_number', e.target.value)} 
                          placeholder="SO Number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.infratel_id} 
                          onChange={(e) => handleSiteChange(site.id, 'infratel_id', e.target.value)} 
                          placeholder="Infratel ID"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.location} 
                          onChange={(e) => handleSiteChange(site.id, 'location', e.target.value)} 
                          required 
                          placeholder="Location"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.latitude} 
                          onChange={(e) => handleSiteChange(site.id, 'latitude', e.target.value)} 
                          placeholder="Latitude"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.longitude} 
                          onChange={(e) => handleSiteChange(site.id, 'longitude', e.target.value)} 
                          placeholder="Longitude"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={site.work_type} 
                          onChange={(e) => handleSiteChange(site.id, 'work_type', e.target.value)} 
                          required 
                          placeholder="Work Type"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                        />
                      </td>
                      <td className="p-1 text-center">
                        {sites.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeSiteRow(site.id)} 
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button 
                type="button" 
                onClick={addSiteRow} 
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} /> <span>Add More Sites</span>
              </button>

              <button 
                type="submit" 
                disabled={loading} 
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-1.5 rounded text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Adding Sites...' : 'Add Sites'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPO;
