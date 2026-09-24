import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const AddNewPOSites = () => {
  const navigate = useNavigate();

  const [po, setPo] = useState('');
  const [sites, setSites] = useState([
    { id: 1, site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '', site_type: 'RTT' }
  ]);

  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamically load active PO numbers
  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/po-sites/init-data', { withCredentials: true });
        if (res.data && res.data.success) {
          const list = (res.data.poList || []).map(p => ({
            id: p.po_no,
            name: p.po_no
          }));
          setPos(list);
        }
      } catch (err) {
        console.error('Error fetching PO list:', err);
      }
    };
    fetchPOs();
  }, []);

  const handleSiteChange = (id, field, value) => {
    setSites(sites.map(site => site.id === id ? { ...site, [field]: value } : site));
  };

  const addSiteRow = () => {
    setSites([...sites, { id: Date.now(), site_id: '', site_name: '', so_number: '', infratel_id: '', location: '', latitude: '', longitude: '', work_type: '', site_type: 'RTT' }]);
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
    if (!po) {
      showErrorToast("Please select PO", "PO Missing!");
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
      if (!sites[i].site_type) {
        showErrorToast(`Row ${i + 1}: Site Type is mandatory`, 'Site Type Missing!');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        po: po,
        sites: sites.map(({ id, ...rest }) => rest)
      };

      const res = await axios.post('http://localhost:5000/api/po-sites/add-po-sites', payload, { withCredentials: true });
      if (res.data && res.data.flag) {
        showSuccessToast(res.data.message || 'Sites added to PO successfully!', 'Added Successfully');
        setTimeout(() => {
          navigate('/po-sites/po/po-details');
        }, 1200);
      } else {
        showErrorToast(res.data?.message || 'Failed to add sites to PO', res.data?.title || 'Error');
      }
    } catch (err) {
      console.error('Error submitting PO sites:', err);
      showErrorToast(err.response?.data?.message || err.message || 'Server error occurred', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto">
      {/* Main Panel matching PHP add-po-sites.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 sm:px-5 sm:py-3 flex justify-between items-center shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Add PO Sites</h2>
        </div>

        {/* Panel Body */}
        <div className="p-3 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#D60019]">
                *&nbsp;Field is mandatory.
              </span>
            </div>

              {/* PO Dropdown Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    PO <span className="text-red-600">*</span> :
                  </label>
                  <select 
                    name="po" 
                    value={po} 
                    onChange={(e) => setPo(e.target.value)} 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select PO</option>
                    {pos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Site Details Section */}
              <div className="pt-2">
                <h3 className="text-center font-bold text-base text-gray-800 underline mb-3">
                  Site Details
                </h3>
                
                <div className="overflow-x-auto bg-white rounded-md border border-gray-300 shadow-xs">
                  <table className="min-w-[950px] w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300 uppercase">
                      <tr>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Site ID <span className="text-red-500">*</span></th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Site Name</th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">SO Number</th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Infratel ID</th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Location <span className="text-red-500">*</span></th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Latitude</th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Longitude</th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Work Type <span className="text-red-500">*</span></th>
                        <th className="px-3 py-2.5 text-center border-r border-gray-300">Site Type <span className="text-red-500">*</span></th>
                        <th className="px-3 py-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sites.map((site) => (
                        <tr key={site.id} className="hover:bg-blue-50/30">
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.site_id} 
                              onChange={(e) => handleSiteChange(site.id, 'site_id', e.target.value)} 
                              required 
                              placeholder="Site ID"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.site_name} 
                              onChange={(e) => handleSiteChange(site.id, 'site_name', e.target.value)} 
                              placeholder="Site Name"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.so_number} 
                              onChange={(e) => handleSiteChange(site.id, 'so_number', e.target.value)} 
                              placeholder="SO Number"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.infratel_id} 
                              onChange={(e) => handleSiteChange(site.id, 'infratel_id', e.target.value)} 
                              placeholder="Infratel ID"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.location} 
                              onChange={(e) => handleSiteChange(site.id, 'location', e.target.value)} 
                              required 
                              placeholder="Location"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.latitude} 
                              onChange={(e) => handleSiteChange(site.id, 'latitude', e.target.value)} 
                              placeholder="Latitude"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.longitude} 
                              onChange={(e) => handleSiteChange(site.id, 'longitude', e.target.value)} 
                              placeholder="Longitude"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <input 
                              type="text" 
                              value={site.work_type} 
                              onChange={(e) => handleSiteChange(site.id, 'work_type', e.target.value)} 
                              required 
                              placeholder="Work Type"
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                          </td>
                          <td className="p-1.5 border-r border-gray-200">
                            <select 
                              value={site.site_type} 
                              onChange={(e) => handleSiteChange(site.id, 'site_type', e.target.value)} 
                              required 
                              className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="RTT">RTT</option>
                              <option value="GBT">GBT</option>
                              <option value="Upgradation">Upgradation</option>
                            </select>
                          </td>
                          <td className="p-1.5 text-center">
                            {sites.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeSiteRow(site.id)} 
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
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

                <div className="mt-3">
                  <button 
                    type="button" 
                    onClick={addSiteRow} 
                    className="inline-flex items-center gap-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={15} /> <span>Add More Sites</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Adding Sites...' : 'Add Sites'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewPOSites;
