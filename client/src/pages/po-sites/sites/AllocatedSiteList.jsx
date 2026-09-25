import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  Plus,
  Search,
  Info,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

const AllocatedSiteList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [detailsModal, setDetailsModal] = useState({ open: false, loading: false, data: null });
  const [closeStatusModal, setCloseStatusModal] = useState({ open: false, allocationId: null, status: '1', submitting: false });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/po-sites/allocated-sites', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching allocated sites:', error);
      showErrorToast('Failed to load allocated sites.', 'Error');
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
      String(item.poNumber || '').toLowerCase().includes(term) ||
      String(item.siteId || '').toLowerCase().includes(term) ||
      String(item.poDate || '').toLowerCase().includes(term) ||
      String(item.dueDate || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Open Details Modal (matches PHP viewAllocatedSiteDetails)
  const handleViewDetails = async (row) => {
    const id = row.id || row._id;
    try {
      setDetailsModal({ open: true, loading: true, data: null });
      const res = await axios.get(`http://localhost:5000/api/po-sites/allocated-sites/${id}/details`, { withCredentials: true });
      if (res.data && res.data.success) {
        setDetailsModal({ open: true, loading: false, data: res.data.data });
      } else {
        // Fallback to row data if endpoint not found
        setDetailsModal({
          open: true,
          loading: false,
          data: {
            po_no: row.poNumber,
            po_date: row.poDate,
            site_id: row.siteId,
            due_date: row.dueDate,
            works: [{
              nature_of_work: row.workType || 'Civil & Electrical Work',
              allocation_type: 'Staff',
              vendor_name: '-',
              supervisor_name: '-',
              due_date: row.dueDate
            }]
          }
        });
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setDetailsModal({
        open: true,
        loading: false,
        data: {
          po_no: row.poNumber,
          po_date: row.poDate,
          site_id: row.siteId,
          due_date: row.dueDate,
          works: [{
            nature_of_work: row.workType || 'Civil & Electrical Work',
            allocation_type: 'Staff',
            vendor_name: '-',
            supervisor_name: '-',
            due_date: row.dueDate
          }]
        }
      });
    }
  };

  // Open Set Site Close Status Modal (matches PHP SetSiteCloseStatus)
  const handleOpenCloseModal = (id) => {
    setCloseStatusModal({ open: true, allocationId: id, status: '1', submitting: false });
  };

  const handleSubmitCloseStatus = async (e) => {
    e.preventDefault();
    if (!closeStatusModal.allocationId) return;
    try {
      setCloseStatusModal(prev => ({ ...prev, submitting: true }));
      const res = await axios.post('http://localhost:5000/api/po-sites/site-close-status', {
        allocation_id: closeStatusModal.allocationId,
        close_status: closeStatusModal.status
      }, { withCredentials: true });

      if (res.data && res.data.success) {
        showSuccessToast('Site Closed Successfully! Closed status has been set successfully.', 'Status Updated');
        setCloseStatusModal({ open: false, allocationId: null, status: '1', submitting: false });
        fetchData();
      } else {
        showErrorToast(res.data?.message || 'Failed to update site close status.', 'Status Error');
      }
    } catch (err) {
      console.error('Error closing site:', err);
      showErrorToast(err.response?.data?.message || 'Error updating status.', 'Server Error');
    } finally {
      setCloseStatusModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Delete Allocated Site (matches PHP deleteAllocatedSite)
  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const result = await confirmDeleteDialog({
      title: 'Are you sure?',
      text: 'Do you want to delete this allocated site?'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/po-sites/allocated-sites/${id}?po_number=${row.poNumber}&site_id=${row.siteId}`, { withCredentials: true });
        if (res.data && res.data.success) {
          showSuccessToast(res.data.message || 'Site allocation has been deleted successfully.', 'Deleted Successfully');
          fetchData();
        } else {
          showErrorToast(res.data?.message || 'Failed to delete site allocation.', 'Delete Failed');
        }
      } catch (error) {
        console.error('Error deleting site allocation:', error);
        showErrorToast('Please try again after refreshing the page.', 'Error Deleting');
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
            <List size={18} className="text-cyan-200" />
            <h2 className="text-base font-bold tracking-wide">Allocated Site List</h2>
          </div>
          <Link
            to="/po-sites/sites/allocate-site"
            className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Allocate Site</span>
          </Link>
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
                placeholder="Search by PO, Site ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Table (matching PHP siteallocation/index.phtml columns) */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">#</th>
                  <th className="px-3 py-2.5">PO Number</th>
                  <th className="px-3 py-2.5">PO Date</th>
                  <th className="px-3 py-2.5">Site ID</th>
                  <th className="px-3 py-2.5">Due Date</th>
                  <th className="px-3 py-2.5 text-center w-48">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Loading allocated sites...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No allocated sites found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const rowId = row.id || row._id;
                    return (
                      <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                          {rowNumber}.
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-gray-800">
                          {row.poNumber}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.poDate}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-teal-700">
                          {row.siteId}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.dueDate}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center space-x-2">
                            {/* View Details Info Icon */}
                            <button
                              type="button"
                              onClick={() => handleViewDetails(row)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="View Details"
                            >
                              <Info size={16} />
                            </button>

                            {/* Edit Pencil Icon */}
                            <Link
                              to="/po-sites/sites/allocate-site"
                              className="text-green-600 hover:text-green-800 transition-colors p-1"
                              title="Edit Allocation"
                            >
                              <Pencil size={16} />
                            </Link>

                            {/* Delete Trash Icon */}
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete Allocated Site"
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* Site Close Button (matches PHP) */}
                            <button
                              type="button"
                              onClick={() => handleOpenCloseModal(rowId)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded shadow-sm transition-colors cursor-pointer"
                              title="Set Site Close Status"
                            >
                              Site Close
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

      {/* Modal 1: Allocated Site Details (matches PHP view-allocated-site-details.phtml) */}
      {detailsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Allocated Site Details</h3>
              <button
                type="button"
                onClick={() => setDetailsModal({ open: false, loading: false, data: null })}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {detailsModal.loading ? (
                <div className="text-center py-6 text-gray-500">Loading details...</div>
              ) : detailsModal.data ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-600">PO Number</label>
                      <input
                        type="text"
                        readOnly
                        value={detailsModal.data.po_no || '-'}
                        className="w-full mt-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600">PO Date</label>
                      <input
                        type="text"
                        readOnly
                        value={detailsModal.data.po_date || '-'}
                        className="w-full mt-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600">Site ID</label>
                      <input
                        type="text"
                        readOnly
                        value={detailsModal.data.site_id || '-'}
                        className="w-full mt-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800 font-semibold text-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600">Site Completion Date</label>
                      <input
                        type="text"
                        readOnly
                        value={detailsModal.data.due_date || '-'}
                        className="w-full mt-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Allocated Nature of Work</h4>
                    <div className="overflow-x-auto border border-gray-200 rounded">
                      <table className="w-full text-left text-xs divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-700 font-bold">
                          <tr>
                            <th className="px-3 py-2 border-r border-gray-200">Nature of Work</th>
                            <th className="px-3 py-2 border-r border-gray-200">Allocated Resource</th>
                            <th className="px-3 py-2 border-r border-gray-200">Vendor Name</th>
                            <th className="px-3 py-2 border-r border-gray-200">Supervisor Name</th>
                            <th className="px-3 py-2">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(detailsModal.data.works || []).map((w, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 border-r border-gray-200">{w.nature_of_work}</td>
                              <td className="px-3 py-2 border-r border-gray-200">{w.allocation_type}</td>
                              <td className="px-3 py-2 border-r border-gray-200">{w.vendor_name || '-'}</td>
                              <td className="px-3 py-2 border-r border-gray-200">{w.supervisor_name || '-'}</td>
                              <td className="px-3 py-2">{w.due_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsModal({ open: false, loading: false, data: null })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-4 py-1.5 rounded transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Site Close Status (matches PHP setSiteCloseStatusModal) */}
      {closeStatusModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Site Close Status</h3>
              <button
                type="button"
                onClick={() => setCloseStatusModal({ open: false, allocationId: null, status: '1', submitting: false })}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCloseStatus} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Status :
                </label>
                <select
                  value={closeStatusModal.status}
                  onChange={(e) => setCloseStatusModal(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                >
                  <option value="">--Select Status--</option>
                  <option value="1">Close</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseStatusModal({ open: false, allocationId: null, status: '1', submitting: false })}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closeStatusModal.submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
                >
                  {closeStatusModal.submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocatedSiteList;
