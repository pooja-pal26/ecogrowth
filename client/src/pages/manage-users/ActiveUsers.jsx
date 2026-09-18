import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Info, Edit2, Smartphone, Ban, 
  AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight, 
  Building, Calendar, ShieldCheck, Mail, Phone, MapPin
} from 'lucide-react';
import { 
  fetchUsers, 
  fetchUserMasterData, 
  updateUser, 
  deactivateUser, 
  clearUserDeviceId 
} from '../../services/userApi';

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [masterData, setMasterData] = useState({
    departments: [],
    roleTypes: [],
    roles: []
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Exactly matches PHP setItemCountPerPage(10)

  // View Profile Modal State
  const [viewUser, setViewUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit User Modal State
  const [editUser, setEditUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    alternate_mobile: '',
    email_id: '',
    department: '',
    role_type: '',
    role: '',
    doj: '',
    p_address: '',
    c_address: '',
    password: ''
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Deactivate Confirmation Modal
  const [deactivateConfirm, setDeactivateConfirm] = useState({
    isOpen: false,
    user: null,
    loading: false
  });

  // Clear Device Confirmation Modal
  const [clearDeviceConfirm, setClearDeviceConfirm] = useState({
    isOpen: false,
    user: null,
    loading: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [userList, master] = await Promise.all([
        fetchUsers('active'),
        fetchUserMasterData()
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      if (master) setMasterData(master);
    } catch (err) {
      console.error('Error loading active users:', err);
      showNotification('error', 'Failed to load user records.');
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

  // Metrics
  const metrics = useMemo(() => {
    const totalActive = users.length;
    const depts = new Set(users.map(u => u.department_name).filter(Boolean)).size;
    const thisYear = new Date().getFullYear().toString();
    const joinedThisYear = users.filter(u => (u.date_of_joining || '').startsWith(thisYear)).length;
    return { totalActive, depts, joinedThisYear };
  }, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (selectedDept) {
      result = result.filter(u => String(u.department) === String(selectedDept));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.contact_no && u.contact_no.toLowerCase().includes(q)) ||
        (u.email_id && u.email_id.toLowerCase().includes(q)) ||
        (u.department_name && u.department_name.toLowerCase().includes(q)) ||
        (u.role_name && u.role_name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [users, selectedDept, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // View Profile Handler
  const handleOpenView = (user) => {
    setViewUser(user);
    setIsViewOpen(true);
  };

  // Edit Profile Handler
  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || (user.name ? user.name.split(' ')[0] : ''),
      last_name: user.last_name || (user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : ''),
      mobile_number: user.contact_no || '',
      alternate_mobile: user.alternate_mobile || '',
      email_id: user.email_id || '',
      department: user.department || '',
      role_type: user.role_type || '',
      role: user.role || '',
      doj: user.date_of_joining ? user.date_of_joining.substring(0, 10) : '',
      p_address: user.permanent_address || '',
      c_address: user.current_address || '',
      password: ''
    });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.first_name.trim()) {
      setEditError('Please enter First Name');
      return;
    }
    if (!editForm.mobile_number.trim() || editForm.mobile_number.trim().length !== 10) {
      setEditError('Please enter 10 Digit Mobile Number');
      return;
    }
    if (!editForm.email_id.trim() || !editForm.email_id.includes('@')) {
      setEditError('Please enter valid Email ID');
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError('');
      await updateUser(editUser.id || editUser._id, editForm);
      showNotification('success', 'User details have been updated successfully');
      setIsEditOpen(false);
      setEditUser(null);
      loadData();
    } catch (err) {
      setEditError(err.message || 'Failed to update user details');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Clear Device ID Handler
  const handleConfirmClearDevice = async () => {
    if (!clearDeviceConfirm.user) return;
    try {
      setClearDeviceConfirm(prev => ({ ...prev, loading: true }));
      const res = await clearUserDeviceId(
        clearDeviceConfirm.user.id || clearDeviceConfirm.user._id,
        clearDeviceConfirm.user.name
      );
      showNotification('success', res.message || `${clearDeviceConfirm.user.name}'s device ID has been cleared successfully.`);
      setClearDeviceConfirm({ isOpen: false, user: null, loading: false });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to clear device ID');
      setClearDeviceConfirm({ isOpen: false, user: null, loading: false });
    }
  };

  // Deactivate Profile Handler
  const handleConfirmDeactivate = async () => {
    if (!deactivateConfirm.user) return;
    try {
      setDeactivateConfirm(prev => ({ ...prev, loading: true }));
      const res = await deactivateUser(
        deactivateConfirm.user.id || deactivateConfirm.user._id,
        deactivateConfirm.user.name
      );
      showNotification('success', res.message || `${deactivateConfirm.user.name} has been deactivated successfully.`);
      setDeactivateConfirm({ isOpen: false, user: null, loading: false });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to deactivate user');
      setDeactivateConfirm({ isOpen: false, user: null, loading: false });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP index.phtml (User List) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-green-600" size={26} />
            <span>User List</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Manage Users</span>
            <span>/</span>
            <span className="text-gray-700">Active Users</span>
          </nav>
        </div>
        <Link
          to="/manage-users/add-new-user"
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          <span>Create User</span>
        </Link>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Users</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-0.5">{metrics.totalActive}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Departments</p>
            <h3 className="text-2xl font-bold text-green-700 mt-0.5">{metrics.depts}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Joined in {new Date().getFullYear()}</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-0.5">{metrics.joinedThisYear}</h3>
          </div>
        </div>
      </div>

      {/* Search & Department Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search user name, phone, email, department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Departments</option>
              {masterData.departments.map(d => (
                <option key={d.id} value={d.id}>{d.department}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table matching PHP index.phtml */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading user list...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No User Found !</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || selectedDept ? 'No users matched your filter criteria.' : 'Create your first user to populate this list.'}
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
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Date of Joining</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedUsers.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-gray-400">
                        {(currentPage - 1) * pageSize + idx + 1}.
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 text-xs">
                        {user.contact_no}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.email_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {user.department_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-600 whitespace-nowrap">
                        {user.formattedDOJ}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        {/* View Profile */}
                        <button
                          onClick={() => handleOpenView(user)}
                          title="View Profile"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Info size={16} />
                        </button>

                        {/* Edit Profile */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit Profile"
                          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Clear Device ID */}
                        <button
                          onClick={() => setClearDeviceConfirm({ isOpen: true, user, loading: false })}
                          title="Clear Device ID"
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <Smartphone size={16} />
                        </button>

                        {/* Deactivate Profile */}
                        <button
                          onClick={() => setDeactivateConfirm({ isOpen: true, user, loading: false })}
                          title="Deactivate Profile"
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Ban size={16} />
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
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </strong>{' '}
                of <strong className="text-gray-800">{filteredUsers.length}</strong> records
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Profile Modal matching PHP view-user-profile.phtml */}
      {isViewOpen && viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
            {/* Header banner with cover & avatar */}
            <div className="relative bg-linear-to-r from-green-600 to-teal-700 h-28 px-6 pt-4 flex justify-between items-start text-white">
              <span className="text-sm font-semibold tracking-wider uppercase opacity-90">User Profile</span>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-white/80 hover:text-white bg-black/20 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              {/* Profile Avatar & Name */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
                <div className="flex items-end space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md shrink-0">
                    {viewUser.profile_path ? (
                      <img
                        src={viewUser.profile_path}
                        alt={viewUser.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-100 text-green-700 font-bold text-2xl flex items-center justify-center rounded-xl">
                        {viewUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{viewUser.name}</h2>
                    <p className="text-xs text-gray-500 font-medium">{viewUser.role_name} • {viewUser.department_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsViewOpen(false);
                    handleOpenEdit(viewUser);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Profile Details Table matching PHP view-user-profile */}
              <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600 w-1/4">Mobile Number :</th>
                      <td className="py-2.5 px-4 text-gray-800 w-1/4 font-mono">{viewUser.contact_no || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600 w-1/4">Alternate Mobile :</th>
                      <td className="py-2.5 px-4 text-gray-800 w-1/4 font-mono">{viewUser.alternate_mobile || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Email ID :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.email_id || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Date of Joining :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.formattedDOJ || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Current Address :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.current_address || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Permanent Address :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.permanent_address || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Department :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.department_name || '-'}</td>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Role Type :</th>
                      <td className="py-2.5 px-4 text-gray-800">{viewUser.role_type_name || '-'}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-4 bg-gray-50 font-semibold text-gray-600">Role :</th>
                      <td colSpan={3} className="py-2.5 px-4 text-gray-800 font-medium">{viewUser.role_name || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal matching PHP edit-user-info.phtml */}
      {isEditOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Edit User Info</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value.replace(/[^A-Za-z ]/g, '') })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value.replace(/[^A-Za-z ]/g, '') })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.mobile_number}
                    onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alternate Mobile Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.alternate_mobile}
                    onChange={(e) => setEditForm({ ...editForm, alternate_mobile: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email_id}
                    onChange={(e) => setEditForm({ ...editForm, email_id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">---Select Department---</option>
                    {masterData.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.role_type}
                    onChange={(e) => setEditForm({ ...editForm, role_type: e.target.value, role: '' })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">---Select Role Type---</option>
                    {masterData.roleTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.role_type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">---Select Role---</option>
                    {masterData.roles
                      .filter(r => !editForm.role_type || String(r.role_type) === String(editForm.role_type))
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.role}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editForm.doj}
                    onChange={(e) => setEditForm({ ...editForm, doj: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reset Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep existing password"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Permanent Address
                </label>
                <textarea
                  rows="2"
                  value={editForm.p_address}
                  onChange={(e) => setEditForm({ ...editForm, p_address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Address
                </label>
                <textarea
                  rows="2"
                  value={editForm.c_address}
                  onChange={(e) => setEditForm({ ...editForm, c_address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Device ID Confirmation Modal matching PHP clearUserDeviceId */}
      {clearDeviceConfirm.isOpen && clearDeviceConfirm.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Are You Sure !</h3>
              <p className="text-sm text-gray-600 mt-1">
                Do you want to clear <strong>{clearDeviceConfirm.user.name}</strong>'s device ID.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setClearDeviceConfirm({ isOpen: false, user: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearDeviceConfirm.loading}
                onClick={handleConfirmClearDevice}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {clearDeviceConfirm.loading ? 'Clearing...' : 'Yes, Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Confirmation Modal matching PHP deactivateUserProfile */}
      {deactivateConfirm.isOpen && deactivateConfirm.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Ban size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Are You Sure !</h3>
              <p className="text-sm text-gray-600 mt-1">
                Do you want to deactivate <strong>{deactivateConfirm.user.name}</strong>
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateConfirm({ isOpen: false, user: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deactivateConfirm.loading}
                onClick={handleConfirmDeactivate}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {deactivateConfirm.loading ? 'Deactivating...' : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
