import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

const AllocatedSiteStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Modal State
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    siteId: '',
    poNumber: '',
    dueDate: '',
    status: 'Allocated',
    closeStatus: 'Open',
    submitting: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/po-sites/allocated-site-status', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching allocated site status:', error);
      showErrorToast('Failed to load allocated site status.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Pagination
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      String(item.siteId || '').toLowerCase().includes(term) ||
      String(item.poNumber || '').toLowerCase().includes(term) ||
      String(item.dueDate || '').toLowerCase().includes(term) ||
      String(item.status || '').toLowerCase().includes(term) ||
      String(item.closeStatus || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleEdit = (row) => {
    setEditModal({
      open: true,
      id: row.id || row._id,
      siteId: row.siteId || '',
      poNumber: row.poNumber || '',
      dueDate: row.dueDate || '',
      status: row.status === 'Closed' ? 'Closed' : (row.status === 'Allocated' ? 'Allocated' : 'Pending'),
      closeStatus: row.closeStatus === 'Close' || row.closeStatus === 'Closed' ? 'Close' : 'Open',
      submitting: false
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editModal.id) return;

    try {
      setEditModal(prev => ({ ...prev, submitting: true }));
      const res = await axios.put(`http://localhost:5000/api/po-sites/allocated-site-status/${editModal.id}`, {
        status: editModal.status === 'Allocated' ? '1' : editModal.status === 'Closed' ? 'Closed' : '0',
        close_status: editModal.closeStatus === 'Close' ? '1' : '0'
      }, { withCredentials: true });

      if (res.data && res.data.success) {
        showSuccessToast('Allocated site status updated successfully!', 'Status Updated');
        setEditModal({ open: false, id: null, siteId: '', poNumber: '', dueDate: '', status: 'Allocated', closeStatus: 'Open', submitting: false });
        fetchData();
      } else {
        showErrorToast(res.data?.message || 'Failed to update site status.', 'Update Error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showErrorToast(err.response?.data?.message || 'Error updating site status.', 'Server Error');
    } finally {
      setEditModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const result = await confirmDeleteDialog({
      title: 'Delete Allocated Site Status?',
      text: 'Are you sure you want to delete this allocated site status record?'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/po-sites/allocated-sites/${id}?po_number=${row.poNumber}&site_id=${row.siteId}`, { withCredentials: true });
        if (res.data && res.data.success) {
          showSuccessToast('Record deleted successfully.', 'Deleted');
          fetchData();
        } else {
          showErrorToast(res.data?.message || 'Failed to delete record.', 'Delete Failed');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        showErrorToast('Failed to delete record.', 'Error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto">
      {/* Main Panel */}
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="text-cyan-200" />
            <h2 className="text-base font-bold tracking-wide">Allocated Site Status</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/po-sites/sites/allocated-site-list"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
            >
              <List size={14} />
              <span>Allocated Site List</span>
            </Link>
            <Link
              to="/po-sites/sites/allocate-site"
              className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>Allocate Site</span>
            </Link>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-4 sm:p-5 bg-white space-y-4">
          {/* Controls: Search & Page size */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by Site ID, PO..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">#</th>
                  <th className="px-3 py-2.5">Site ID</th>
                  <th className="px-3 py-2.5">PO Number</th>
                  <th className="px-3 py-2.5">Due Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Close Status</th>
                  <th className="px-3 py-2.5 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Loading site status records...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const rowId = row.id || row._id;
                    const isClosed = row.closeStatus === 'Close' || row.closeStatus === 'Closed' || row.status === 'Closed';
                    return (
                      <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                          {rowNumber}.
                        </td>
                        <td className="px-3 py-2.5 font-bold text-teal-700">
                          {row.siteId}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-gray-800">
                          {row.poNumber}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.dueDate}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.status === 'Allocated'
                              ? 'bg-blue-100 text-blue-800'
                              : row.status === 'Closed'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isClosed
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isClosed ? 'Close' : 'Open'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="text-green-600 hover:text-green-800 transition-colors p-1"
                              title="Update Status"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2 pt-2">
            <div>
              Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="inline-flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 py-1 font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Update Site Status</h3>
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Site ID</label>
                <input
                  type="text"
                  readOnly
                  value={editModal.siteId}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PO Number</label>
                <input
                  type="text"
                  readOnly
                  value={editModal.poNumber}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Due Date</label>
                <input
                  type="text"
                  readOnly
                  value={editModal.dueDate}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Allocated">Allocated</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Close Status</label>
                <select
                  value={editModal.closeStatus}
                  onChange={(e) => setEditModal(prev => ({ ...prev, closeStatus: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
                >
                  {editModal.submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocatedSiteStatus;
