import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Search, Trash2, LogIn, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  fetchVendors, 
  activateVendor, 
  deleteVendor 
} from '../../services/vendorApi';

const DeactiveVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchVendors('deactive');
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading deactive vendors:', err);
      Swal.fire('Error !', 'Failed to load deactivated vendor records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered List
  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(v =>
        (v.vendor_name && v.vendor_name.toLowerCase().includes(q)) ||
        (v.prop_director_name && v.prop_director_name.toLowerCase().includes(q)) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(q)) ||
        (v.contact_number && v.contact_number.toLowerCase().includes(q))
      );
    }

    return result;
  }, [vendors, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Activate Profile matching PHP activateVendorProfile
  const handleActivate = async (vendor) => {
    const result = await Swal.fire({
      title: 'Are you sure!',
      text: 'Do you want to activate clicked vendor profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, activate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await activateVendor(vendor.id || vendor._id);
        Swal.fire({
          title: 'Activated',
          text: res.message || 'Vendor Profile has been activated successfully.',
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong!', err.message || 'Failed to activate vendor', 'error');
      }
    }
  };

  // Delete Profile matching PHP deleteVendorProfile
  const handleDelete = async (vendor) => {
    const result = await Swal.fire({
      title: 'Are you sure!',
      text: 'Do you want to delete clicked vendor profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteVendor(vendor.id || vendor._id);
        Swal.fire({
          title: 'Deleted',
          text: res.message || 'Vendor Profile has been deleted successfully.',
          icon: 'success'
        });
        loadData();
      } catch (err) {
        Swal.fire('Something Went Wrong!', err.message || 'Failed to delete vendor', 'error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (Deactivated Vendor List) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Deactivated Vendor List</span>
        </h1>
        <Link
          to="/manage-vendors/active-vendors"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Building2 size={14} />
          <span>View All Vendors</span>
        </Link>
      </div>

      {/* Main Table Card with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Top Controls: Show entries & Search */}
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

        {/* Data Table matching PHP deactivatedVendorDetails table */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-r-transparent mb-2" />
            <p className="text-xs font-medium">Loading Deactivated Vendors...</p>
          </div>
        ) : paginatedVendors.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Building2 className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-gray-700">No Deactivated Vendor Found !</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Vendor Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Proprietor/Director Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact Person</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact Number</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedVendors.map((vendor, idx) => (
                  <tr key={vendor.id || idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center font-medium text-gray-500 whitespace-nowrap">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {vendor.vendor_name}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {vendor.prop_director_name || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {vendor.contact_person || '-'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {vendor.contact_number || '-'}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2.5">
                        {/* Activate Profile matching PHP <i class="fa fa-sign-in" style="color: #1DAA29;"> */}
                        <button
                          onClick={() => handleActivate(vendor)}
                          title="Activate Profile"
                          className="text-[#1DAA29] hover:opacity-80 transition-opacity p-0.5"
                        >
                          <LogIn size={17} />
                        </button>

                        {/* Delete Profile matching PHP <i class="fa fa-trash" style="color: red;"> */}
                        <button
                          onClick={() => handleDelete(vendor)}
                          title="Delete Profile"
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
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredVendors.length)} of {filteredVendors.length} entries
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

export default DeactiveVendors;
