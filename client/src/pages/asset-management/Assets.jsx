import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Plus, Search, Filter, Eye, Edit2, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck, Wrench, Clock, X, ChevronLeft, ChevronRight, 
  ArrowUpDown, UserCheck, Calendar, DollarSign, MapPin
} from 'lucide-react';
import { fetchAssets, fetchAssetInitData, createAsset, updateAsset, deleteAsset } from '../../services/assetApi';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [initData, setInitData] = useState({
    types: [],
    employees: [],
    availableAssets: [],
    conditions: ['New', 'Good', 'Fair', 'Needs Repair'],
    statuses: ['Available', 'Assigned', 'In Maintenance', 'Archived'],
    locations: []
  });

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    asset: null,
    loading: false
  });

  const initialForm = {
    code: '',
    name: '',
    asset_type_id: '',
    serial_number: '',
    purchase_date: new Date().toISOString().substring(0, 10),
    warranty_date: '',
    purchase_cost: '',
    value: '',
    condition: 'Good',
    status: 'Available',
    location: 'Head Office Lucknow',
    assigned_to: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [assetList, masterData] = await Promise.all([
        fetchAssets(),
        fetchAssetInitData()
      ]);
      setAssets(Array.isArray(assetList) ? assetList : []);
      if (masterData) setInitData(masterData);
    } catch (err) {
      console.error('Error loading assets data:', err);
      showNotification('error', 'Failed to load assets data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  // Top Metrics
  const metrics = useMemo(() => {
    const total = assets.length;
    const available = assets.filter(a => a.status === 'Available').length;
    const assigned = assets.filter(a => a.status === 'Assigned').length;
    const maintenance = assets.filter(a => a.status === 'In Maintenance' || a.condition === 'Needs Repair').length;
    return { total, available, assigned, maintenance };
  }, [assets]);

  // Filtering & Sorting
  const filteredAndSortedAssets = useMemo(() => {
    let result = [...assets];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.code || '').toLowerCase().includes(q) ||
        (a.name || '').toLowerCase().includes(q) ||
        (a.serial_number || '').toLowerCase().includes(q) ||
        (a.typeName || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.assignedToName || '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType) {
      result = result.filter(a => String(a.asset_type_id) === String(selectedType));
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter(a => a.status === selectedStatus);
    }

    // Condition filter
    if (selectedCondition) {
      result = result.filter(a => a.condition === selectedCondition);
    }

    // Location filter
    if (selectedLocation) {
      result = result.filter(a => a.location === selectedLocation);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'value' || sortField === 'purchase_cost') {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      } else if (sortField === 'id') {
        valA = parseInt(valA || 0, 10);
        valB = parseInt(valB || 0, 10);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [assets, searchQuery, selectedType, selectedStatus, selectedCondition, selectedLocation, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedAssets.length / pageSize));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedAssets.slice(start, start + pageSize);
  }, [filteredAndSortedAssets, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormError('');
    setIsEditing(false);
    setEditId(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setFormData({
      code: asset.code || '',
      name: asset.name || '',
      asset_type_id: asset.asset_type_id || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      warranty_date: asset.warranty_date || '',
      purchase_cost: asset.purchase_cost || asset.value || '',
      value: asset.value || asset.purchase_cost || '',
      condition: asset.condition || 'Good',
      status: asset.status || 'Available',
      location: asset.location || '',
      assigned_to: asset.assigned_to || '',
      notes: asset.notes || ''
    });
    setFormError('');
    setIsEditing(true);
    setEditId(asset.id || asset._id);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (asset) => {
    setViewAsset(asset);
    setIsViewOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Asset Name is required');
      return;
    }
    if (!formData.asset_type_id) {
      setFormError('Please select an Asset Type');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (isEditing) {
        await updateAsset(editId, formData);
        showNotification('success', 'Asset updated successfully!');
      } else {
        await createAsset(formData);
        showNotification('success', 'Asset created successfully!');
      }

      setIsAddEditOpen(false);
      loadAll();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.asset) return;
    try {
      setDeleteConfirm(prev => ({ ...prev, loading: true }));
      await deleteAsset(deleteConfirm.asset.id || deleteConfirm.asset._id);
      showNotification('success', `Asset "${deleteConfirm.asset.name}" archived/deleted.`);
      setDeleteConfirm({ isOpen: false, asset: null, loading: false });
      loadAll();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete asset');
      setDeleteConfirm({ isOpen: false, asset: null, loading: false });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedCondition('');
    setSelectedLocation('');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-green-600" size={26} />
            <span>Asset Details</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Asset Management</span>
            <span>/</span>
            <span className="text-gray-700">Asset Details</span>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/asset-management/asset-assignments"
            className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <UserCheck size={16} />
            <span>Assigned Systems</span>
          </a>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Add New Asset</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Assets</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Available</p>
            <h3 className="text-2xl font-bold text-green-700 mt-0.5">{metrics.available}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">In-Use / Assigned</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-0.5">{metrics.assigned}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Maintenance</p>
            <h3 className="text-2xl font-bold text-red-700 mt-0.5">{metrics.maintenance}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search code, name, serial, location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Asset Types</option>
              {(initData.types || []).map(t => (
                <option key={t.id} value={t.id}>{t.name || t.type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="In Maintenance">In Maintenance</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => { setSelectedCondition(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedType || selectedStatus || selectedCondition || selectedLocation) && (
          <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
            <span>Showing filtered results ({filteredAndSortedAssets.length} found)</span>
            <button
              onClick={clearAllFilters}
              className="text-green-700 hover:text-green-900 font-semibold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Asset Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading asset inventory...</p>
          </div>
        ) : paginatedAssets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No Assets Found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search criteria or add new equipment to the system.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('code')}>
                      <div className="flex items-center space-x-1">
                        <span>Asset Code</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center space-x-1">
                        <span>Asset Name</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Serial No.</th>
                    <th className="py-3.5 px-4 cursor-pointer text-center" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center space-x-1">
                        <span>Status</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 cursor-pointer text-right" onClick={() => handleSort('value')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Value (₹)</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-800 text-xs">
                        {asset.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block">{asset.name}</span>
                        <span className="text-xs text-gray-400">{asset.condition} condition</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {asset.typeName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">
                        {asset.serial_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          asset.status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : asset.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : asset.status === 'In Maintenance'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {asset.assigned_to ? (
                          <span className="font-medium text-gray-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {asset.assignedToName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs truncate max-w-[150px]">
                        {asset.location || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-800">
                        {asset.value ? `₹${parseFloat(asset.value).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenView(asset)}
                          title="View Details"
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          title="Edit Asset"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, asset, loading: false })}
                          title="Delete/Archive Asset"
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3.5 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-600 gap-3">
              <div>
                Showing <strong className="text-gray-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-gray-800">
                  {Math.min(currentPage * pageSize, filteredAndSortedAssets.length)}
                </strong>{' '}
                of <strong className="text-gray-800">{filteredAndSortedAssets.length}</strong> items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Asset Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Edit Asset Details' : 'Add New Asset to Inventory'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Auto-generated if blank (e.g. AST-009)"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dell XPS 15, Honda Generator"
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Type / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.asset_type_id}
                    onChange={(e) => setFormData({ ...formData, asset_type_id: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select Asset Category</option>
                    {(initData.types || []).map(t => (
                      <option key={t.id} value={t.id}>{t.name || t.type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Serial Number / Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="e.g. SN-8921-X"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Warranty Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.warranty_date}
                    onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Asset Value / Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.value || formData.purchase_cost}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value, purchase_cost: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location / Department
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Head Office Lucknow, Warehouse"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Maintenance">In Maintenance</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Employee (Optional)
                  </label>
                  <select
                    value={formData.assigned_to || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setFormData({ 
                        ...formData, 
                        assigned_to: empId,
                        status: empId ? 'Assigned' : formData.status 
                      });
                    }}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">-- No Employee Assigned (Available) --</option>
                    {(initData.employees || []).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notes & Specifications
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Model specs, configuration, accessories included..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Asset Details Modal */}
      {isViewOpen && viewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <span className="font-mono text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                  {viewAsset.code}
                </span>
                <h3 className="text-lg font-bold text-gray-800 mt-1">{viewAsset.name}</h3>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Category</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.typeName}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.status}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Serial Number</p>
                  <p className="font-mono font-medium text-gray-800 mt-0.5">{viewAsset.serial_number || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Condition</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.condition}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Location</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Value / Cost</p>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {viewAsset.value ? `₹${parseFloat(viewAsset.value).toLocaleString('en-IN')}` : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Purchase Date</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.purchase_date || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Warranty Expiry</p>
                  <p className="font-medium text-gray-800 mt-0.5">{viewAsset.warranty_date || '-'}</p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold uppercase">Currently Assigned To</p>
                <p className="font-bold text-gray-800 mt-0.5">
                  {viewAsset.assignedToName || 'Unassigned / In Stockroom'}
                </p>
              </div>

              {viewAsset.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Notes</p>
                  <p className="text-gray-700 mt-0.5">{viewAsset.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Archive / Delete Asset</h4>
                <p className="text-xs text-gray-500">Record will be archived and marked inactive.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to remove <strong className="text-gray-800">{deleteConfirm.asset?.code} ({deleteConfirm.asset?.name})</strong> from active inventory?
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, asset: null, loading: false })}
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

export default Assets;
