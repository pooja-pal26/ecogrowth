import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Ban, LogIn, X } from 'lucide-react';
import { fetchAssets, fetchAssetInitData, createAsset, updateAsset, deleteAsset } from '../../services/assetApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Swal from 'sweetalert2';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Add / Edit Form State matching PHP asset.phtml
  const [formData, setFormData] = useState({
    asset_type: '',
    asset_code: '',
    asset_name: '',
    warranty_date: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, initData] = await Promise.all([
        fetchAssets(),
        fetchAssetInitData()
      ]);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      if (initData && Array.isArray(initData.types)) {
        setAssetTypes(initData.types.filter(t => String(t.is_active) !== '2' && String(t.is_active) !== '0'));
      }
    } catch (err) {
      console.error('Error loading assets data:', err);
      showErrorToast('Failed to load asset details.', 'Error !');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format date to DD/MM/YYYY matching PHP date('d/m/Y', strtotime(...))
  const formatDisplayDate = (dStr) => {
    if (!dStr) return '-';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert to ISO date YYYY-MM-DD for <input type="date">
  const toInputDate = (dStr) => {
    if (!dStr) return '';
    if (dStr.includes('/')) {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().substring(0, 10);
  };

  // Search logic
  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return assets;
    return assets.filter(a => {
      const code = (a.code || '').toLowerCase();
      const name = (a.name || '').toLowerCase();
      const type = (a.typeName || a.type || '').toLowerCase();
      const warranty = formatDisplayDate(a.warranty_date).toLowerCase();
      return code.includes(q) || name.includes(q) || type.includes(q) || warranty.includes(q);
    });
  }, [assets, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / entries) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * entries;
    return filteredAssets.slice(start, start + entries);
  }, [filteredAssets, currentPage, entries]);

  // Open Add Modal matching PHP #addAssetModal
  const handleOpenAdd = () => {
    setFormData({
      asset_type: '',
      asset_code: '',
      asset_name: '',
      warranty_date: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal matching PHP editDeactiveActiveDeleteAsset(id, 'edit')
  const handleOpenEdit = (asset) => {
    setFormData({
      asset_type: asset.asset_type_id || '',
      asset_code: asset.code || '',
      asset_name: asset.name || '',
      warranty_date: toInputDate(asset.warranty_date)
    });
    setEditId(asset.id || asset._id);
    setIsEditModalOpen(true);
  };

  // Submit Add Asset matching PHP submitAssetForm click handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.asset_type) {
      showErrorToast('Please select asset type.', 'Asset Type Missing !');
      return;
    }
    if (!formData.asset_code.trim()) {
      showErrorToast('Please enter asset code.', 'Asset Code Missing !');
      return;
    }
    if (!formData.asset_name.trim()) {
      showErrorToast('Please enter asset name.', 'Asset Name Missing !');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        asset_type_id: formData.asset_type,
        code: formData.asset_code.trim(),
        name: formData.asset_name.trim(),
        warranty_date: formData.warranty_date || ''
      };

      await createAsset(payload);
      showSuccessToast('Asset has been saved successfully.', 'Saved Successfully');
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to save asset.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Asset matching PHP editAssetFormSubmit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.asset_type) {
      showErrorToast('Please select asset type.', 'Asset Type Missing !');
      return;
    }
    if (!formData.asset_code.trim()) {
      showErrorToast('Please enter asset code.', 'Asset Code Missing !');
      return;
    }
    if (!formData.asset_name.trim()) {
      showErrorToast('Please enter asset name.', 'Asset Name Missing !');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        asset_type_id: formData.asset_type,
        code: formData.asset_code.trim(),
        name: formData.asset_name.trim(),
        warranty_date: formData.warranty_date || ''
      };

      await updateAsset(editId, payload);
      showSuccessToast('Asset has been updated successfully.', 'Updated Successfully');
      setIsEditModalOpen(false);
      setEditId(null);
      loadData();
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to update asset.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Activate / Deactivate / Delete matching PHP editDeactiveActiveDeleteAsset
  const handleAction = async (asset, action) => {
    const assetId = asset.id || asset._id;
    const actionLabel = action === 'deactivate' ? 'deactivate' : action === 'activate' ? 'activate' : 'delete';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionLabel} clicked asset ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: action === 'delete' ? '#ef4444' : action === 'deactivate' ? '#d97706' : '#16a34a'
    });

    if (result.isConfirmed) {
      try {
        if (action === 'delete') {
          await deleteAsset(assetId);
          showSuccessToast('Asset has been deleted successfully.', 'Deleted');
        } else if (action === 'deactivate') {
          await updateAsset(assetId, { is_active: '0', status: 'Inactive' });
          showSuccessToast('Asset has been deactivated successfully.', 'Deactivated');
        } else if (action === 'activate') {
          await updateAsset(assetId, { is_active: '1', status: 'Available' });
          showSuccessToast('Asset has been activated successfully.', 'Activated');
        }
        loadData();
      } catch (err) {
        showErrorToast(err.response?.data?.message || err.message || `Failed to ${actionLabel} asset.`, 'Failed !');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP asset.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base font-bold tracking-tight">Asset Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Asset</span>
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-3.5 sm:p-4 bg-white">
          {/* Controls: Show Entries & Search matching DataTable */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 w-full">
            <div className="flex items-center text-xs text-gray-600">
              <span>Show</span>
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-1.5 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-700 mr-2 shrink-0">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="border border-gray-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-56 focus:outline-none bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Table matching PHP #assetTypeListTable in asset.phtml */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 uppercase text-xs border-b border-gray-200 font-bold">
                  <th className="px-3.5 py-2 w-12 text-center">#</th>
                  <th className="px-3.5 py-2">Code</th>
                  <th className="px-3.5 py-2">Name</th>
                  <th className="px-3.5 py-2">Asset Type</th>
                  <th className="px-3.5 py-2">Warranty Date</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 bg-gray-50/50">
                      Loading assets...
                    </td>
                  </tr>
                ) : paginatedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400 bg-gray-50/50">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedAssets.map((asset, index) => {
                    const isActive = String(asset.is_active) === '1' || asset.status === 'Active' || asset.status === 'Available' || asset.status === 'Assigned';
                    return (
                      <tr key={asset.id || asset._id || index} className="border-b border-gray-100 hover:bg-teal-50/25 transition-colors">
                        <td className="px-3.5 py-2 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * entries + index + 1}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asset.code}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asset.name}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asset.typeName || asset.type || '-'}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {formatDisplayDate(asset.warranty_date)}
                        </td>
                        <td className="px-3.5 py-2 font-medium">
                          <span className={isActive ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                            {isActive ? 'Active' : 'Deactive'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {isActive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(asset)}
                                  title="Edit Asset"
                                  className="text-[#1DAA29] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(asset, 'deactivate')}
                                  title="Deactivate Asset"
                                  className="text-[#D66F00] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Ban size={15} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(asset, 'activate')}
                                  title="Activate Asset"
                                  className="text-[#1DAA29] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <LogIn size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(asset, 'delete')}
                                  title="Delete Asset"
                                  className="text-red-600 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-3 gap-3 text-xs text-gray-500 w-full pt-2 border-t border-gray-100">
            <div>
              Showing {filteredAssets.length > 0 ? (currentPage - 1) * entries + 1 : 0} to {Math.min(currentPage * entries, filteredAssets.length)} of {filteredAssets.length} entries
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 border rounded text-xs transition-colors cursor-pointer ${
                    currentPage === i + 1
                      ? 'border-transparent bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold shadow-xs'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Asset Modal matching PHP #addAssetModal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-200">
            <div 
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">Add Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 bg-white space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Asset Type */}
                <div>
                  <label htmlFor="asset_type" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Type <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    id="asset_type"
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Please Select</option>
                    {assetTypes.map(at => (
                      <option key={at.id || at._id} value={at.id || at._id}>
                        {at.type || at.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Code */}
                <div>
                  <label htmlFor="asset_code" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Code <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="asset_code"
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    placeholder="Enter Asset Code"
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Asset Name */}
                <div>
                  <label htmlFor="asset_name" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="asset_name"
                    value={formData.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                    placeholder="Enter Asset Name"
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Warranty Date */}
                <div>
                  <label htmlFor="warranty_date" className="block text-xs font-semibold text-gray-700 mb-1">
                    Warranty Date
                  </label>
                  <input
                    type="date"
                    id="warranty_date"
                    value={formData.warranty_date}
                    onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal matching PHP #editAssetNameModal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-200">
            <div 
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">Edit Asset</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 bg-white space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Asset Type */}
                <div>
                  <label htmlFor="edit_asset_type" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Type <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    id="edit_asset_type"
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Please Select</option>
                    {assetTypes.map(at => (
                      <option key={at.id || at._id} value={at.id || at._id}>
                        {at.type || at.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Code */}
                <div>
                  <label htmlFor="edit_asset_code" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Code <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit_asset_code"
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    placeholder="Enter Asset Code"
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Asset Name */}
                <div>
                  <label htmlFor="edit_asset_name" className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit_asset_name"
                    value={formData.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                    placeholder="Enter Asset Name"
                    required
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Warranty Date */}
                <div>
                  <label htmlFor="edit_warranty_date" className="block text-xs font-semibold text-gray-700 mb-1">
                    Warranty Date
                  </label>
                  <input
                    type="date"
                    id="edit_warranty_date"
                    value={formData.warranty_date}
                    onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
