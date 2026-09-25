import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Info, Pencil, Smartphone, Ban, 
  X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Phone, Mail, Calendar, Building, ShieldCheck, MapPin, Edit3
} from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  fetchUsers, 
  fetchUserMasterData, 
  updateUser, 
  deactivateUser, 
  clearUserDeviceId 
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

const ActiveUsers = () => {
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

  // View Profile Modal State (matches PHP view-user-profile.phtml)
  const [viewUser, setViewUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit User Modal State (matches PHP edit-user-info.phtml)
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
    password: '',
    confirmPassword: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

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
      Swal.fire('Error !', 'Failed to load user records. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list
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

  // Open View Profile
  const handleOpenView = (user) => {
    setViewUser(user);
    setIsViewOpen(true);
  };

  // Open Edit Profile
  const handleOpenEdit = (user) => {
    setEditUser(user);
    const names = (user.name || '').trim().split(' ');
    const fName = user.first_name || names[0] || '';
    const lName = user.last_name || (names.length > 1 ? names.slice(1).join(' ') : '');

    let dojVal = '';
    if (user.date_of_joining) {
      const d = new Date(user.date_of_joining);
      if (!isNaN(d.getTime())) {
        dojVal = d.toISOString().substring(0, 10);
      }
    }

    setEditForm({
      first_name: fName,
      last_name: lName,
      mobile_number: user.contact_no || '',
      alternate_mobile: user.alternate_mobile || '',
      email_id: user.email_id || '',
      department: user.department || '',
      role_type: user.role_type || '',
      role: user.role || '',
      doj: dojVal,
      p_address: user.permanent_address || '',
      c_address: user.current_address || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditOpen(true);
  };

  // Filter roles dynamically based on editForm.role_type
  const editFilteredRoles = useMemo(() => {
    if (!editForm.role_type) return masterData.roles || [];
    return (masterData.roles || []).filter(
      r => String(r.role_type) === String(editForm.role_type)
    );
  }, [masterData.roles, editForm.role_type]);

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.first_name.trim()) {
      Swal.fire({
        title: 'First Name Missing !',
        text: 'Please Enter First Name',
        icon: 'error'
      });
      return;
    }
    if (!editForm.mobile_number.trim()) {
      Swal.fire({
        title: 'Mobile Number Missing !',
        text: 'Please Enter Mobile Number',
        icon: 'error'
      });
      return;
    }
    if (isNaN(editForm.mobile_number)) {
      Swal.fire({
        title: 'Invalid Number !',
        text: 'Please Enter Numbers Only',
        icon: 'error'
      });
      return;
    }
    if (editForm.mobile_number.trim().length !== 10) {
      Swal.fire({
        title: 'Invalid Number !',
        text: 'Please Enter 10 Digit Mobile Number',
        icon: 'error'
      });
      return;
    }
    if (editForm.alternate_mobile.trim()) {
      if (isNaN(editForm.alternate_mobile) || editForm.alternate_mobile.trim().length !== 10) {
        Swal.fire({
          title: 'Invalid Alternate Number !',
          text: 'Please Enter 10 Digit Mobile Number',
          icon: 'error'
        });
        return;
      }
    }
    if (!editForm.email_id.trim() || !editForm.email_id.includes('@')) {
      Swal.fire({
        title: 'Email ID Missing !',
        text: 'Please Enter Email ID',
        icon: 'error'
      });
      return;
    }
    if (!editForm.department) {
      Swal.fire({
        title: 'Department Missing !',
        text: 'Please Select Department',
        icon: 'error'
      });
      return;
    }
    if (!editForm.role_type) {
      Swal.fire({
        title: 'Role Type Missing !',
        text: 'Please Select Role Type',
        icon: 'error'
      });
      return;
    }
    if (!editForm.role) {
      Swal.fire({
        title: 'Role Missing !',
        text: 'Please Select Role',
        icon: 'error'
      });
      return;
    }
    if (!editForm.doj) {
      Swal.fire({
        title: 'Joining Date Missing !',
        text: 'Please Select Date of Joining',
        icon: 'error'
      });
      return;
    }
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      Swal.fire({
        title: 'Confirm Password Mismatch !',
        text: 'Confirm Password should be same as Password',
        icon: 'error'
      });
      return;
    }

    try {
      setEditSubmitting(true);
      await updateUser(editUser.id || editUser._id, editForm);
      Swal.fire({
        title: 'Updated Successfully',
        text: 'User details have been updated successfully.',
        icon: 'success'
      });
      setIsEditOpen(false);
      setEditUser(null);
      loadData();
    } catch (err) {
      Swal.fire('Error !', err.message || 'Failed to update user details', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Clear Device ID - exactly matching PHP clearUserDeviceId
  const handleClearDeviceId = async (user) => {
    const userName = user.name || 'User';
    const result = await Swal.fire({
      title: 'Are You Sure !',
      text: `Do you want to clear ${userName}'s device ID.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Clear',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await clearUserDeviceId(user.id || user._id, userName);
        Swal.fire({
          title: res.title || 'Device ID Cleared !',
          text: res.message || `${userName}'s device ID has been cleared successfully.`,
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Error !', err.message || 'Failed to clear device ID', 'error');
      }
    }
  };

  // Deactivate Profile - exactly matching PHP deactivateUserProfile
  const handleDeactivate = async (user) => {
    const userName = formatUcwords(user.name);
    const result = await Swal.fire({
      title: 'Are You Sure !',
      text: `Do you want to deactivate ${userName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Deactivate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await deactivateUser(user.id || user._id, userName);
        Swal.fire({
          title: 'Deactivated Successfully',
          text: res.message || `${userName} has been deactivated successfully.`,
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong', err.message || 'Failed to deactivate user', 'error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (User List) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>User List</span>
        </h1>
        <Link
          to="/manage-users/add-new-user"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <UserPlus size={14} />
          <span>Create User</span>
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

        {/* Data Table matching PHP userListTable */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-r-transparent mb-2" />
            <p className="text-xs font-medium">Loading User List...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Users className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-gray-700">No User Found !</p>
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
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        {/* View Profile matching PHP <i class="fa fa-info-circle" style="color: #187CC9"></i> */}
                        <button
                          onClick={() => handleOpenView(user)}
                          title="View Profile"
                          className="text-[#187CC9] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Info size={17} />
                        </button>

                        {/* Edit Profile matching PHP <i class="fa fa-pencil"></i> */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit Profile"
                          className="text-gray-700 hover:text-black transition-colors p-0.5"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Clear Device ID matching PHP <i class="fa fa-mobile" style="color: #11CC00"></i> */}
                        <button
                          onClick={() => handleClearDeviceId(user)}
                          title="Clear Device ID"
                          className="text-[#11CC00] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Smartphone size={17} />
                        </button>

                        {/* Deactivate Profile matching PHP <i class="fa fa-ban" style="color: red;"></i> */}
                        <button
                          onClick={() => handleDeactivate(user)}
                          title="Deactivate Profile"
                          className="text-red-600 hover:opacity-80 transition-opacity p-0.5"
                        >
                          <Ban size={17} />
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

      {/* View User Profile Modal matching PHP view-user-profile.phtml */}
      {isViewOpen && viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200">
            {/* Header banner and avatar */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-28 flex items-end p-4">
              <button
                onClick={() => setIsViewOpen(false)}
                className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 left-6 flex items-end gap-3">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md border-2 border-white">
                  {viewUser.profile_path ? (
                    <img 
                      src={viewUser.profile_path} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl">
                      {(viewUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile name and edit button */}
            <div className="pt-12 px-6 pb-2 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>{formatUcwords(viewUser.name)}</span>
                </h2>
                <p className="text-xs text-gray-500">{viewUser.role_name || viewUser.role || 'Member'}</p>
              </div>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  handleOpenEdit(viewUser);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Details Table matching view-user-profile.phtml */}
            <div className="p-6">
              <table className="w-full text-xs text-left border border-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">
                      Mobile Number :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800 w-1/4 border-r border-gray-200">
                      {viewUser.contact_no || '-'}
                    </td>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 w-1/4 border-r border-gray-200">
                      Alternate Mobile :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800 w-1/4">
                      {viewUser.alternate_mobile || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Email ID :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">
                      {viewUser.email_id || '-'}
                    </td>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Date of Joining :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800">
                      {formatDate(viewUser.date_of_joining)}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Current Address :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">
                      {viewUser.current_address || '-'}
                    </td>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Permanent Address :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800">
                      {viewUser.permanent_address || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Department :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">
                      {viewUser.department_name || viewUser.department || '-'}
                    </td>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Role Type :
                    </th>
                    <td className="py-2.5 px-3 text-gray-800">
                      {viewUser.role_type_name || viewUser.role_type || '-'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
                      Role :
                    </th>
                    <td colSpan={3} className="py-2.5 px-3 text-gray-800">
                      {viewUser.role_name || viewUser.role || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Info Modal matching PHP edit-user-info.phtml */}
      {isEditOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-6 border border-gray-200 overflow-hidden">
            <div 
              className="px-4 py-2.5 flex items-center justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
            >
              <h2 className="text-sm font-bold tracking-tight">Edit User Info</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-4">
              <div className="text-red-600 font-bold text-xs">
                * Fields are mandatory.
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z ]/g, '');
                      setEditForm(prev => ({ ...prev, first_name: val }));
                    }}
                    placeholder="Enter First Name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z ]/g, '');
                      setEditForm(prev => ({ ...prev, last_name: val }));
                    }}
                    placeholder="Enter Last Name"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.mobile_number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEditForm(prev => ({ ...prev, mobile_number: val }));
                    }}
                    placeholder="Enter Mobile Number"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEditForm(prev => ({ ...prev, alternate_mobile: val }));
                    }}
                    placeholder="Enter Alternate Mobile"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email_id}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email_id: e.target.value }))}
                    placeholder="Enter Email ID"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">---Select Department---</option>
                    {masterData.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editForm.role_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role_type: e.target.value, role: '' }))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                    Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">---Select Role---</option>
                    {editFilteredRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Joining <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={editForm.doj}
                    onChange={(e) => setEditForm(prev => ({ ...prev, doj: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Permanent Address
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.p_address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, p_address: e.target.value }))}
                    placeholder="Permanent Address"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Address
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.c_address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, c_address: e.target.value }))}
                    placeholder="Current Address"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Change Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to keep same"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveUsers;
