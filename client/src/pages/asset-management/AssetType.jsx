import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Layers, AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { fetchAssetTypes, createAssetType, updateAssetType, deleteAssetType } from '../../services/assetApi';

const AssetType = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null,
    loading: false
  });

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await fetchAssetTypes();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading asset types:', err);
      showNotification('error', 'Failed to load asset types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', status: 'Active' });
    setFormError('');
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type) => {
    setFormData({
      name: type.name || type.type || '',
      description: type.description || '',
      status: type.status || (String(type.is_active) === '1' ? 'Active' : 'Inactive')
    });
    setFormError('');
    setIsEditing(true);
    setEditId(type.id || type._id);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Asset Type name is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (isEditing) {
        await updateAssetType(editId, formData);
        showNotification('success', 'Asset type updated successfully!');
      } else {
        await createAssetType(formData);
        showNotification('success', 'Asset type created successfully!');
      }

      setIsModalOpen(false);
      loadTypes();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDelete = (type) => {
    if (type.assetCount > 0) {
      showNotification('error', `Cannot delete "${type.name}": it is currently linked to ${type.assetCount} asset(s). Please reassign or remove those assets first.`);
      return;
    }
    setDeleteConfirm({ isOpen: true, type, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.type) return;
    try {
      setDeleteConfirm(prev => ({ ...prev, loading: true }));
      await deleteAssetType(deleteConfirm.type.id || deleteConfirm.type._id);
      showNotification('success', `Asset type "${deleteConfirm.type.name}" deleted successfully.`);
      setDeleteConfirm({ isOpen: false, type: null, loading: false });
      loadTypes();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete asset type');
      setDeleteConfirm({ isOpen: false, type: null, loading: false });
    }
  };

  const filteredTypes = types.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      (t.name || t.type || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header with Title and Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-green-600" size={26} />
            <span>Asset Type List</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Asset Management</span>
            <span>/</span>
            <span className="text-gray-700">Asset Type List</span>
          </nav>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Add Asset Type</span>
        </button>
      </div>

      {/* Notifications Banner */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 border ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search asset types by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading asset categories...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Layers className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No Asset Types Found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'No categories matched your search criteria.' : 'Start by adding your first asset type.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Type / Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Linked Assets</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredTypes.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{t.name || t.type}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                      {t.description || <span className="text-gray-400 italic">No description provided</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.assetCount > 0 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {t.assetCount || 0} Assets
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'Active' || String(t.is_active) === '1'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        title="Edit Type"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRequestDelete(t)}
                        title={t.assetCount > 0 ? "Cannot delete: assets assigned" : "Delete Type"}
                        className={`p-1.5 rounded-md transition-colors ${
                          t.assetCount > 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Edit Asset Type' : 'Add New Asset Type'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type / Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. IT Assets, Vehicles, Power Tools"
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe equipment or items included in this category..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEditing ? 'Update Type' : 'Create Type')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Confirm Delete</h4>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete the asset type <strong className="text-gray-800">"{deleteConfirm.type?.name}"</strong>?
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, type: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm.loading}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleteConfirm.loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetType;
