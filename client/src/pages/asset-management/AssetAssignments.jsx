import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, Plus, Search, Filter, RotateCcw, ArrowRightLeft, 
  Calendar, CheckCircle2, AlertCircle, Clock, Package, User, 
  X, ChevronLeft, ChevronRight, FileText, CheckCircle, ShieldAlert
} from 'lucide-react';
import { 
  fetchAssignments, 
  fetchAssetInitData, 
  assignAsset, 
  returnAsset, 
  transferAsset 
} from '../../services/assetApi';

const AssetAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [initData, setInitData] = useState({
    types: [],
    employees: [],
    availableAssets: [],
    conditions: ['New', 'Good', 'Fair', 'Needs Repair'],
    statuses: []
  });

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Tab: 'active' | 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    asset_type_id: '',
    asset_id: '',
    assigned_to: '',
    assign_date: new Date().toISOString().substring(0, 10),
    condition_on_assign: 'Good',
    notes: ''
  });

  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnForm, setReturnForm] = useState({
    return_date: new Date().toISOString().substring(0, 10),
    condition_on_return: 'Good',
    notes: ''
  });

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferForm, setTransferForm] = useState({
    to_employee_id: '',
    transfer_date: new Date().toISOString().substring(0, 10),
    notes: ''
  });

  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asgList, masterData] = await Promise.all([
        fetchAssignments(),
        fetchAssetInitData()
      ]);
      setAssignments(Array.isArray(asgList) ? asgList : []);
      if (masterData) setInitData(masterData);
    } catch (err) {
      console.error('Error loading assignments:', err);
      showNotification('error', 'Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  // Top Metrics
  const metrics = useMemo(() => {
    const active = assignments.filter(a => a.status === 'Active').length;
    const returned = assignments.filter(a => a.status === 'Returned').length;
    const available = (initData.availableAssets || []).length;
    return { active, returned, available, total: assignments.length };
  }, [assignments, initData]);

  // Filtering
  const filteredAssignments = useMemo(() => {
    let result = [...assignments];

    // Tab filter
    if (activeTab === 'active') {
      result = result.filter(a => a.status === 'Active');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.assetCode || '').toLowerCase().includes(q) ||
        (a.assetName || '').toLowerCase().includes(q) ||
        (a.assetType || '').toLowerCase().includes(q) ||
        (a.assignedToName || '').toLowerCase().includes(q) ||
        (a.assignedByName || '').toLowerCase().includes(q)
      );
    }

    // Employee filter
    if (filterEmployee) {
      result = result.filter(a => String(a.assigned_to) === String(filterEmployee));
    }

    // Type filter
    if (filterType) {
      result = result.filter(a => (a.assetType || '').toLowerCase() === filterType.toLowerCase());
    }

    // Status filter (for history view)
    if (filterStatus) {
      result = result.filter(a => a.status === filterStatus);
    }

    // Date range filters
    if (dateFrom) {
      result = result.filter(a => a.assign_date && a.assign_date.substring(0, 10) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(a => a.assign_date && a.assign_date.substring(0, 10) <= dateTo);
    }

    return result;
  }, [assignments, activeTab, searchQuery, filterEmployee, filterType, filterStatus, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage]);

  // Handle Assign Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.asset_id) {
      setModalError('Please select an asset to assign');
      return;
    }
    if (!assignForm.assigned_to) {
      setModalError('Please select an employee');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      await assignAsset(assignForm);
      showNotification('success', 'Asset successfully assigned!');
      setIsAssignOpen(false);
      setAssignForm({
        asset_type_id: '',
        asset_id: '',
        assigned_to: '',
        assign_date: new Date().toISOString().substring(0, 10),
        condition_on_assign: 'Good',
        notes: ''
      });
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to assign asset');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Return Modal
  const handleOpenReturn = (asg) => {
    setReturnTarget(asg);
    setReturnForm({
      return_date: new Date().toISOString().substring(0, 10),
      condition_on_return: asg.condition_on_assign || 'Good',
      notes: ''
    });
    setModalError('');
    setIsReturnOpen(true);
  };

  // Handle Return Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError('');
      await returnAsset({
        assignment_id: returnTarget.id || returnTarget._id,
        asset_id: returnTarget.asset_id,
        return_date: returnForm.return_date,
        condition_on_return: returnForm.condition_on_return,
        notes: returnForm.notes
      });
      showNotification('success', `Asset "${returnTarget.assetCode}" returned successfully!`);
      setIsReturnOpen(false);
      setReturnTarget(null);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to return asset');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Transfer Modal
  const handleOpenTransfer = (asg) => {
    setTransferTarget(asg);
    setTransferForm({
      to_employee_id: '',
      transfer_date: new Date().toISOString().substring(0, 10),
      notes: ''
    });
    setModalError('');
    setIsTransferOpen(true);
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.to_employee_id) {
      setModalError('Please select the employee to transfer asset to');
      return;
    }
    if (String(transferForm.to_employee_id) === String(transferTarget.assigned_to)) {
      setModalError('Please choose a different employee than current custodian');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      await transferAsset({
        assignment_id: transferTarget.id || transferTarget._id,
        asset_id: transferTarget.asset_id,
        to_employee_id: transferForm.to_employee_id,
        transfer_date: transferForm.transfer_date,
        notes: transferForm.notes
      });
      showNotification('success', `Asset "${transferTarget.assetCode}" transferred successfully!`);
      setIsTransferOpen(false);
      setTransferTarget(null);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to transfer asset');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterEmployee('');
    setFilterType('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP Assigned System Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-green-600" size={26} />
            <span>Assigned System Details</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Asset Management</span>
            <span>/</span>
            <span className="text-gray-700">Assigned System Details</span>
          </nav>
        </div>
        <button
          onClick={() => { setModalError(''); setIsAssignOpen(true); }}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Assign Asset</span>
        </button>
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Currently Assigned</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-0.5">{metrics.active}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Available to Issue</p>
            <h3 className="text-2xl font-bold text-green-700 mt-0.5">{metrics.available}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <RotateCcw size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Returned Total</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-0.5">{metrics.returned}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Lifecycle Logs</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-0.5">{metrics.total}</h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3">
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active Assignments ({metrics.active})
            </button>
            <button
              onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Complete History ({metrics.total})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search code, asset, employee..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Employee</label>
            <select
              value={filterEmployee}
              onChange={(e) => { setFilterEmployee(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Employees</option>
              {(initData.employees || []).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Asset Category</label>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Categories</option>
              {(initData.types || []).map(t => (
                <option key={t.id} value={t.name || t.type}>{t.name || t.type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {(searchQuery || filterEmployee || filterType || filterStatus || dateFrom || dateTo) && (
          <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
            <span>Showing {filteredAssignments.length} filtered records</span>
            <button
              onClick={clearFilters}
              className="text-green-700 hover:text-green-900 font-semibold underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading assignment records...</p>
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserCheck className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No Assignment Records Found</p>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'active' 
                ? 'There are currently no active asset allocations.' 
                : 'No historical assignments match your filter settings.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">System Code</th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-4">Assigned Date</th>
                    <th className="py-3.5 px-4">Assigned Time</th>
                    <th className="py-3.5 px-4">Return Date</th>
                    <th className="py-3.5 px-4">Return Time</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedList.map((asg, idx) => (
                    <tr key={asg.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-gray-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block">{asg.assetName}</span>
                        <span className="text-xs text-gray-400">{asg.assetType}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800 text-xs">
                        {asg.assetCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {asg.assignedToName}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-600 whitespace-nowrap">
                        {asg.formattedAssignDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {asg.assignTime || '10:00:00'}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-600 whitespace-nowrap">
                        {asg.formattedReturnDate && asg.formattedReturnDate !== '-' ? asg.formattedReturnDate : ''}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {asg.returnTime && asg.returnTime !== '-' ? asg.returnTime : ''}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          asg.status === 'Active' || asg.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {asg.status === 'Active' || asg.status === 'Assigned' ? 'Assigned' : 'Returned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        {asg.status === 'Active' || asg.status === 'Assigned' ? (
                          <>
                            <button
                              onClick={() => handleOpenReturn(asg)}
                              title="Return Device"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors shadow-2xs"
                            >
                              <RotateCcw size={13} />
                              <span>Return</span>
                            </button>
                            <button
                              onClick={() => handleOpenTransfer(asg)}
                              title="Transfer Device"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors shadow-2xs"
                            >
                              <ArrowRightLeft size={13} />
                              <span>Transfer</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Returned</span>
                        )}
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
                  {Math.min(currentPage * pageSize, filteredAssignments.length)}
                </strong>{' '}
                of <strong className="text-gray-800">{filteredAssignments.length}</strong> records
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

      {/* Assign / Issue Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Assign Asset</h3>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-sm">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Asset Type
                </label>
                <select
                  value={assignForm.asset_type_id}
                  onChange={(e) => setAssignForm({ ...assignForm, asset_type_id: e.target.value, asset_id: '' })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">All Asset Types</option>
                  {(initData.types || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name || t.type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Asset <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.asset_id}
                  onChange={(e) => setAssignForm({ ...assignForm, asset_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Choose an Available Asset --</option>
                  {(initData.availableAssets || [])
                    .filter(a => !assignForm.asset_type_id || String(a.asset_type_id) === String(assignForm.asset_type_id))
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                </select>
                {(initData.availableAssets || []).filter(a => !assignForm.asset_type_id || String(a.asset_type_id) === String(assignForm.asset_type_id)).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No unallocated assets match the selected type.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assign To Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.assigned_to}
                  onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Select Employee --</option>
                  {(initData.employees || []).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignForm.assign_date}
                    onChange={(e) => setAssignForm({ ...assignForm, assign_date: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Condition on Issue
                  </label>
                  <select
                    value={assignForm.condition_on_assign}
                    onChange={(e) => setAssignForm({ ...assignForm, condition_on_assign: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assignment Notes / Accessories Included
                </label>
                <textarea
                  rows="3"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="e.g. Issued with laptop charger, bag, and mouse. Signed handover form."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (initData.availableAssets || []).length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Assign Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {isReturnOpen && returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Return Asset to Stock</h3>
              <button
                onClick={() => setIsReturnOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4 text-sm">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-xs text-gray-500 font-semibold uppercase">Asset</p>
                <p className="font-bold text-gray-800">{returnTarget.assetCode} — {returnTarget.assetName}</p>
                <p className="text-xs text-gray-600">Issued to: <strong>{returnTarget.assignedToName}</strong> on {returnTarget.formattedAssignDate}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Return Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={returnForm.return_date}
                  onChange={(e) => setReturnForm({ ...returnForm, return_date: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Condition Upon Return <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnForm.condition_on_return}
                  onChange={(e) => setReturnForm({ ...returnForm, condition_on_return: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="Good">Good (Mark Available)</option>
                  <option value="New">New / Like-New (Mark Available)</option>
                  <option value="Fair">Fair (Mark Available)</option>
                  <option value="Needs Repair">Needs Repair (Mark In Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Return Inspection Remarks
                </label>
                <textarea
                  rows="3"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  placeholder="Note any physical damage, missing components, or maintenance required..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReturnOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Asset Modal */}
      {isTransferOpen && transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Transfer Asset</h3>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-sm">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                <p className="text-xs text-amber-800 font-semibold uppercase">Current Holder</p>
                <p className="font-bold text-gray-800">{transferTarget.assetCode} — {transferTarget.assetName}</p>
                <p className="text-xs text-gray-600">Currently with: <strong>{transferTarget.assignedToName}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Transfer To Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferForm.to_employee_id}
                  onChange={(e) => setTransferForm({ ...transferForm, to_employee_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Choose New Employee --</option>
                  {(initData.employees || [])
                    .filter(u => String(u.id) !== String(transferTarget.assigned_to))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Transfer Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={transferForm.transfer_date}
                  onChange={(e) => setTransferForm({ ...transferForm, transfer_date: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Transfer Reason / Handover Notes
                </label>
                <textarea
                  rows="3"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="Reason for transfer, reallocated site, or project requirements..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAssignments;
