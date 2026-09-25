import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  List,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

const POStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    po_no: '',
    status: 'Open',
    po_completion_status: '0'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/po-sites/po-status', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorToast('Failed to load PO status records.', 'Error');
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
      String(item.po_no || item.poNumber || '').toLowerCase().includes(term) ||
      String(item.site_type || '').toLowerCase().includes(term) ||
      String(item.status || '').toLowerCase().includes(term) ||
      String(item.order_date || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleEdit = (row) => {
    setFormData({
      po_no: row.po_no || row.poNumber || '',
      status: row.status || 'Open',
      po_completion_status: String(row.po_completion_status || (row.status === 'Closed' ? '100' : '0'))
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const result = await confirmDeleteDialog({
      title: 'Delete PO Status?',
      text: 'Are you sure you want to delete this PO status record? This cannot be undone.'
    });
    if (result.isConfirmed) {
      setData(prev => prev.filter(v => (v.id || v._id) !== id));
      showSuccessToast('PO Status record deleted successfully.', 'Record Deleted');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editId) {
        await axios.put(`http://localhost:5000/api/po-sites/po-status/${editId}`, formData, { withCredentials: true });
        showSuccessToast('PO Status updated successfully!', 'Status Updated');
      } else {
        await axios.post('http://localhost:5000/api/po-sites/po-status', formData, { withCredentials: true });
        showSuccessToast('PO Status created successfully!', 'Status Created');
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      showErrorToast(error.response?.data?.message || 'Error saving data', 'Save Failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP po-status.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">PO Status</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/po-sites/po/po-details"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <List size={14} />
              <span>PO Details</span>
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
                placeholder="Search PO Status..."
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
                  <th className="px-3 py-2.5">PO Number</th>
                  <th className="px-3 py-2.5">Order Date</th>
                  <th className="px-3 py-2.5">PO Amount</th>
                  <th className="px-3 py-2.5">Site Type</th>
                  <th className="px-3 py-2.5 text-center">Total Sites</th>
                  <th className="px-3 py-2.5 text-center">Allocated Sites</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Completion %</th>
                  <th className="px-3 py-2.5 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      Loading PO status records...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const rowId = row.id || row._id;
                    const isClosed = (row.status || '').toLowerCase() === 'closed' || (row.status || '').toLowerCase() === 'completed';
                    return (
                      <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                          {rowNumber}.
                        </td>
                        <td className="px-3 py-2.5 font-bold text-teal-700">
                          {row.po_no || row.poNumber || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {formatDate(row.order_date)}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">
                          {row.po_amount ? `₹${parseFloat(row.po_amount).toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.site_type || 'Standard'}
                        </td>
                        <td className="px-3 py-2.5 text-center font-semibold text-gray-700">
                          {row.totalSites ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-center font-semibold text-blue-700">
                          {row.allocatedSites ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            (row.status || '').toLowerCase() === 'open'
                              ? 'bg-blue-100 text-blue-800'
                              : isClosed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status || 'Open'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium text-gray-700">
                          {row.po_completion_status || (isClosed ? '100' : '0')}%
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="text-green-600 hover:text-green-800 transition-colors p-1 cursor-pointer"
                              title="Update Status"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
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

      {/* Edit PO Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Update PO Status</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PO Number</label>
                <input
                  type="text"
                  readOnly
                  value={formData.po_no}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Completion % (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.po_completion_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, po_completion_status: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POStatus;
