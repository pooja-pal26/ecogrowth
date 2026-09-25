import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Ban, LogIn, X } from 'lucide-react';
import { fetchAssetTypes, createAssetType, updateAssetType, deleteAssetType } from '../../services/assetApi';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../utils/toast';
import Swal from 'sweetalert2';

const AssetType = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assetTypeName, setAssetTypeName] = useState('');
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await fetchAssetTypes();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading asset types:', err);
      showErrorToast('Failed to load asset type list.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  // Filter & Search
  const filteredTypes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return types;
    return types.filter(t => 
      (t.name || t.type || '').toLowerCase().includes(q)
    );
  }, [types, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTypes.length / entries) || 1;
  const paginatedTypes = useMemo(() => {
    const start = (currentPage - 1) * entries;
    return filteredTypes.slice(start, start + entries);
  }, [filteredTypes, currentPage, entries]);

  // Open Add Modal matching PHP #addAssetTypeModal
  const handleOpenAdd = () => {
    setAssetTypeName('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal matching PHP #editAssetTypeModal
  const handleOpenEdit = (item) => {
    setAssetTypeName(item.name || item.type || '');
    setEditId(item.id || item._id);
    setIsEditModalOpen(true);
  };

  // Submit Add Asset Type
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!assetTypeName.trim()) {
      showErrorToast('Please enter asset type name.', 'Asset Type Missing !');
      return;
    }

    try {
      setSubmitting(true);
      await createAssetType({ type: assetTypeName.trim(), name: assetTypeName.trim() });
      showSuccessToast('Asset Type has been saved successfully.', 'Success !');
      setIsAddModalOpen(false);
      setAssetTypeName('');
      loadTypes();
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to save asset type.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Asset Type
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!assetTypeName.trim()) {
      showErrorToast('Please enter asset type name.', 'Asset Type Missing !');
      return;
    }

    try {
      setSubmitting(true);
      await updateAssetType(editId, { type: assetTypeName.trim(), name: assetTypeName.trim() });
      showSuccessToast('Asset Type has been updated successfully.', 'Success !');
      setIsEditModalOpen(false);
      setAssetTypeName('');
      setEditId(null);
      loadTypes();
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to update asset type.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Activate, Deactivate, Delete matching PHP activateDeactivateDeleteAssetType
  const handleAction = async (item, action) => {
    const itemId = item.id || item._id;
    const actionLabel = action === 'deactivate' ? 'deactivate' : action === 'activate' ? 'activate' : 'delete';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionLabel} clicked asset type?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: action === 'delete' ? '#ef4444' : action === 'deactivate' ? '#d97706' : '#16a34a'
    });

    if (result.isConfirmed) {
      try {
        if (action === 'delete') {
          await deleteAssetType(itemId);
          showSuccessToast('Asset Type has been deleted successfully.', 'Deleted');
        } else if (action === 'deactivate') {
          await updateAssetType(itemId, { is_active: '0', status: 'Inactive' });
          showSuccessToast('Asset Type has been deactivated successfully.', 'Deactivated');
        } else if (action === 'activate') {
          await updateAssetType(itemId, { is_active: '1', status: 'Active' });
          showSuccessToast('Asset Type has been activated successfully.', 'Activated');
        }
        loadTypes();
      } catch (err) {
        showErrorToast(err.response?.data?.message || err.message || `Failed to ${actionLabel} asset type.`, 'Failed !');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP assets-type.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base font-bold tracking-tight">Asset Type List</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Asset Type</span>
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

          {/* Table matching PHP #assetTypeListTable */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 uppercase text-xs border-b border-gray-200 font-bold">
                  <th className="px-3.5 py-2 w-12 text-center">#</th>
                  <th className="px-3.5 py-2">Asset Type</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 bg-gray-50/50">
                      Loading asset types...
                    </td>
                  </tr>
                ) : paginatedTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 bg-gray-50/50">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedTypes.map((item, index) => {
                    const isActive = String(item.is_active) === '1' || item.status === 'Active';
                    return (
                      <tr key={item.id || item._id || index} className="border-b border-gray-100 hover:bg-teal-50/25 transition-colors">
                        <td className="px-3.5 py-2 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * entries + index + 1}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {item.type || item.name}
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
                                  onClick={() => handleOpenEdit(item)}
                                  title="Edit Asset Type"
                                  className="text-[#1DAA29] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item, 'deactivate')}
                                  title="Deactivate Asset Type"
                                  className="text-[#D66F00] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Ban size={15} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item, 'activate')}
                                  title="Activate Asset Type"
                                  className="text-[#1DAA29] hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <LogIn size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item, 'delete')}
                                  title="Delete Asset Type"
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
              Showing {filteredTypes.length > 0 ? (currentPage - 1) * entries + 1 : 0} to {Math.min(currentPage * entries, filteredTypes.length)} of {filteredTypes.length} entries
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

      {/* Add Asset Type Modal matching PHP #addAssetTypeModal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
            <div 
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">Add Asset Type</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 bg-white space-y-4">
              <div>
                <label htmlFor="add_asset_type" className="block text-xs font-semibold text-gray-700 mb-1">
                  Asset Type Name : <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  id="add_asset_type"
                  value={assetTypeName}
                  onChange={(e) => setAssetTypeName(e.target.value)}
                  placeholder="Enter Asset Type Name"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
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
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Type Modal matching PHP #editAssetTypeModal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
            <div 
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">Edit Asset Type</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 bg-white space-y-4">
              <div>
                <label htmlFor="edit_asset_type" className="block text-xs font-semibold text-gray-700 mb-1">
                  Asset Type Name : <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  id="edit_asset_type"
                  value={assetTypeName}
                  onChange={(e) => setAssetTypeName(e.target.value)}
                  placeholder="Enter Asset Type Name"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
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
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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

export default AssetType;
