import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Trash2, Search, LogIn,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  fetchUsers, 
  fetchUserMasterData, 
  activateUser, 
  deleteUserPermanent 
} from '../../services/userApi';

const formatUcwords = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const DeactiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [masterData, setMasterData] = useState({
    departments: [],
    roleTypes: [],
    roles: []
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
      Swal.fire('Error !', 'Failed to load deactivated users list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Activate User Handler matching PHP activateUserProfile
  const handleActivate = async (user) => {
    const userName = formatUcwords(user.name);
    const result = await Swal.fire({
      title: 'Are You Sure !',
      text: `Do you want to activate ${userName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Activate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await activateUser(user.id || user._id, userName);
        Swal.fire({
          title: 'Activated Successfully',
          text: res.message || `${userName} has been activated successfully.`,
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong', err.message || 'Failed to activate user', 'error');
      }
    }
  };

  // Permanent Delete Handler matching PHP permanentDeleteUser
  const handlePermanentDelete = async (user) => {
    const userName = formatUcwords(user.name);
    const result = await Swal.fire({
      title: 'Are You Sure !',
      text: `Do you want to delete ${userName} permanently.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteUserPermanent(user.id || user._id, userName);
        Swal.fire({
          title: 'Deleted Successfully',
          text: res.message || `${userName} has been deleted permanently.`,
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong', err.message || 'Failed to delete user permanently', 'error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (Deactive User's List) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Deactive User's List</span>
        </h1>
        <Link
          to="/manage-users/active-users"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Users size={14} />
          <span>Active Users</span>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-600 font-medium">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-600 font-medium">entries</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-48 border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">All Departments</option>
              {masterData.departments.map(d => (
                <option key={d.id} value={d.id}>{d.department}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Data Table matching PHP deactiveUserListTable */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-r-transparent mb-2" />
            <p className="text-xs font-medium">Loading Deactive Users...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Users className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-gray-700">No Deactive User Found !</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Phone</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Email</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Department</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date of Joining</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date of Deactivation</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedUsers.map((user, idx) => (
                  <tr key={user.id || idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center font-medium text-gray-500 whitespace-nowrap">
                      {(currentPage - 1) * pageSize + idx + 1}.
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {formatUcwords(user.name)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {user.contact_no || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                      {user.email_id || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {user.department_name || user.department || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {formatDate(user.date_of_joining)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-700">
                      {formatDate(user.updated)}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Activate User matching PHP <i class="fa fa-sign-in" style="color: #11CC00"></i> */}
                        <button
                          onClick={() => handleActivate(user)}
                          title="Activate User"
                          className="text-[#11CC00] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <LogIn size={17} />
                        </button>

                        {/* Permanent Delete matching PHP <i class="fa fa-trash" style="color: red;"></i> */}
                        <button
                          onClick={() => handlePermanentDelete(user)}
                          title="Permanent Delete"
                          className="text-red-600 hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2 text-xs text-gray-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700 bg-gray-100 rounded border border-gray-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactiveUsers;
