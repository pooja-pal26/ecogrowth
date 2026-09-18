import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Trash2, Search, AlertCircle, CheckCircle2, 
  ChevronLeft, ChevronRight, Building, Calendar, UserX
} from 'lucide-react';
import { 
  fetchUsers, 
  fetchUserMasterData, 
  activateUser, 
  deleteUserPermanent 
} from '../../services/userApi';

const DeactiveUsers = () => {
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

  // Pagination (10 per page matching PHP Zend_Paginator)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Activate Confirmation Modal
  const [activateConfirm, setActivateConfirm] = useState({
    isOpen: false,
    user: null,
    loading: false
  });

  // Permanent Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    user: null,
    loading: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [userList, master] = await Promise.all([
        fetchUsers('deactive'),
        fetchUserMasterData()
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      if (master) setMasterData(master);
    } catch (err) {
      console.error('Error loading deactive users:', err);
      showNotification('error', 'Failed to load deactivated user records.');
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
    const totalDeactive = users.length;
    const depts = new Set(users.map(u => u.department_name).filter(Boolean)).size;
    const thisYear = new Date().getFullYear().toString();
    const deactThisYear = users.filter(u => (u.updated || '').startsWith(thisYear)).length;
    return { totalDeactive, depts, deactThisYear };
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

  // Activate User Handler
  const handleConfirmActivate = async () => {
    if (!activateConfirm.user) return;
    try {
      setActivateConfirm(prev => ({ ...prev, loading: true }));
      const res = await activateUser(
        activateConfirm.user.id || activateConfirm.user._id,
        activateConfirm.user.name
      );
      showNotification('success', res.message || `${activateConfirm.user.name} has been activated successfully.`);
      setActivateConfirm({ isOpen: false, user: null, loading: false });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to activate user');
      setActivateConfirm({ isOpen: false, user: null, loading: false });
    }
  };

  // Permanent Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.user) return;
    try {
      setDeleteConfirm(prev => ({ ...prev, loading: true }));
      const res = await deleteUserPermanent(
        deleteConfirm.user.id || deleteConfirm.user._id,
        deleteConfirm.user.name
      );
      showNotification('success', res.message || `${deleteConfirm.user.name} has been deleted permanent successfully.`);
      setDeleteConfirm({ isOpen: false, user: null, loading: false });
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete user permanently');
      setDeleteConfirm({ isOpen: false, user: null, loading: false });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP deactive-users.phtml */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserX className="text-red-600" size={26} />
            <span>Deactive User's List</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Manage Users</span>
            <span>/</span>
            <span className="text-gray-700">Deactive Users</span>
          </nav>
        </div>
        <Link
          to="/manage-users/active-users"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Users size={18} />
          <span>Active Users</span>
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
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deactivated Users</p>
            <h3 className="text-2xl font-bold text-red-700 mt-0.5">{metrics.totalDeactive}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Departments Affected</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-0.5">{metrics.depts}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deactivated in {new Date().getFullYear()}</p>
            <h3 className="text-2xl font-bold text-gray-700 mt-0.5">{metrics.deactThisYear}</h3>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Departments</option>
              {masterData.departments.map(d => (
                <option key={d.id} value={d.id}>{d.department}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table matching PHP deactive-users.phtml */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading deactivated users...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserX className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-base font-semibold text-gray-700">No Deactive User Found !</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || selectedDept ? 'No records match your filter criteria.' : 'There are currently no deactivated users.'}
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
                    <th className="py-3.5 px-4">Date of Deactivation</th>
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
                      <td className="py-3 px-4 font-medium text-red-600 whitespace-nowrap">
                        {user.formattedUpdated || '-'}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        {/* Activate User Action matching PHP <i class="fa fa-sign-in"></i> */}
                        <button
                          onClick={() => setActivateConfirm({ isOpen: true, user, loading: false })}
                          title="Activate User"
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <UserCheck size={16} />
                        </button>

                        {/* Permanent Delete Action matching PHP <i class="fa fa-trash"></i> */}
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, user, loading: false })}
                          title="Permanent Delete"
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
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

      {/* Activate User Confirmation Modal matching PHP activateUserProfile */}
      {activateConfirm.isOpen && activateConfirm.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Are You Sure !</h3>
              <p className="text-sm text-gray-600 mt-1">
                Do you want to activate <strong>{activateConfirm.user.name}</strong>
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActivateConfirm({ isOpen: false, user: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={activateConfirm.loading}
                onClick={handleConfirmActivate}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {activateConfirm.loading ? 'Activating...' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal matching PHP deleteUserProfile */}
      {deleteConfirm.isOpen && deleteConfirm.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Are You Sure !</h3>
              <p className="text-sm text-gray-600 mt-1">
                Do you want to delete <strong>{deleteConfirm.user.name}</strong> permanently.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, user: null, loading: false })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm.loading}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
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

export default DeactiveUsers;
