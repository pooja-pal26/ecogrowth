import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  List,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

const IncidentsReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initMasters, setInitMasters] = useState({
    poList: [],
    sitesList: [],
    users: []
  });

  // Filter states matching PHP
  const [searchFilters, setSearchFilters] = useState({
    incidentType: '',
    poNumber: '',
    siteId: '',
    userId: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    incidentType: '',
    poNumber: '',
    siteId: '',
    userId: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    poNumber: '',
    siteId: '',
    incidentReport: '',
    incidentEffect: '',
    submitting: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/po-sites/incidents', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching incidents data:', error);
      showErrorToast('Failed to load incident reports.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchMasters = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/po-sites/incidents-init', { withCredentials: true });
        if (res.data && res.data.success) {
          setInitMasters({
            poList: res.data.data.poList || [],
            sitesList: res.data.data.sitesList || [],
            users: res.data.data.users || []
          });
        }
      } catch (err) {
        console.error('Error fetching init masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Filtered site dropdown based on selected PO
  const filteredFilterSites = useMemo(() => {
    if (!searchFilters.poNumber) return [];
    return (initMasters.sitesList || []).filter(s =>
      String(s.po_no || '').trim() === String(searchFilters.poNumber).trim()
    );
  }, [initMasters.sitesList, searchFilters.poNumber]);

  // Client-side filtering matching PHP filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (appliedFilters.incidentType) {
        const typeNum = appliedFilters.incidentType === '1' ? 'Office Incident' : 'Site Incident';
        if (item.type !== typeNum && String(item.typeId) !== String(appliedFilters.incidentType)) return false;
      }
      if (appliedFilters.poNumber && String(item.poNumber || '').trim() !== String(appliedFilters.poNumber).trim()) {
        return false;
      }
      if (appliedFilters.siteId && String(item.siteId || '').trim() !== String(appliedFilters.siteId).trim()) {
        return false;
      }
      if (appliedFilters.userId) {
        const matchedUser = (initMasters.users || []).find(u => String(u.id) === String(appliedFilters.userId));
        const userName = matchedUser ? matchedUser.name.toLowerCase() : '';
        if (userName && !String(item.staffName || '').toLowerCase().includes(userName) && !String(item.reportedByName || '').toLowerCase().includes(userName)) {
          return false;
        }
      }
      return true;
    });
  }, [data, appliedFilters, initMasters.users]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handlers matching PHP forms
  const handleShowType = (e) => {
    e.preventDefault();
    setAppliedFilters(prev => ({
      ...prev,
      incidentType: searchFilters.incidentType
    }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchFilters.poNumber && !searchFilters.siteId && !searchFilters.userId) {
      showErrorToast('Please select at least one search criteria.', 'Search Value Missing!');
      return;
    }
    setAppliedFilters(prev => ({
      ...prev,
      poNumber: searchFilters.poNumber,
      siteId: searchFilters.siteId,
      userId: searchFilters.userId
    }));
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchFilters({
      incidentType: '',
      poNumber: '',
      siteId: '',
      userId: ''
    });
    setAppliedFilters({
      incidentType: '',
      poNumber: '',
      siteId: '',
      userId: ''
    });
    setCurrentPage(1);
  };

  // View Details Modal (matches PHP viewIncidentReportDetails)
  const handleViewDetails = (row) => {
    setDetailsModal({
      open: true,
      data: {
        poNumber: row.poNumber || '-',
        siteId: row.siteId || '-',
        incidentReport: row.incidentReport || row.description || 'No description provided.',
        incidentEffect: row.incidentEffect || row.consequence || 'No consequence / action recorded.'
      }
    });
  };

  // Edit Modal
  const handleEdit = (row) => {
    setEditModal({
      open: true,
      id: row._id || row.id,
      poNumber: row.poNumber || '-',
      siteId: row.siteId || '-',
      incidentReport: row.incidentReport || row.description || '',
      incidentEffect: row.incidentEffect || row.consequence || '',
      submitting: false
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal.id) return;
    try {
      setEditModal(prev => ({ ...prev, submitting: true }));
      const res = await axios.put(`http://localhost:5000/api/po-sites/incidents/${editModal.id}`, {
        incident: editModal.incidentReport,
        incident_report: editModal.incidentReport,
        incident_consequence: editModal.incidentEffect,
        incident_effect: editModal.incidentEffect
      }, { withCredentials: true });

      if (res.data && res.data.success) {
        showSuccessToast('Incident report updated successfully.', 'Updated');
        setEditModal({ open: false, id: null, poNumber: '', siteId: '', incidentReport: '', incidentEffect: '', submitting: false });
        fetchData();
      } else {
        showErrorToast(res.data?.message || 'Failed to update incident report.', 'Error');
      }
    } catch (err) {
      console.error('Error saving incident edit:', err);
      showErrorToast(err.response?.data?.message || 'Error updating incident report.', 'Server Error');
    } finally {
      setEditModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Delete matching PHP
  const handleDelete = async (row) => {
    const id = row._id || row.id;
    const result = await confirmDeleteDialog({
      title: 'Delete Incident Report?',
      text: 'Are you sure you want to delete this incident report?'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/po-sites/incidents/${id}`, { withCredentials: true });
        if (res.data && res.data.success) {
          showSuccessToast('Incident report deleted successfully.', 'Deleted');
          fetchData();
        } else {
          showErrorToast(res.data?.message || 'Failed to delete incident report.', 'Delete Failed');
        }
      } catch (error) {
        console.error('Error deleting incident:', error);
        showErrorToast('Failed to delete incident report.', 'Delete Error');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP site-incidents-report.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">Incidents Report</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/po-sites/incidents-reporting/report-new-incident"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Report Incident</span>
            </Link>
          </div>
        </div>

        {/* Filters Section matching PHP site-incidents-report.phtml */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-200 space-y-4">
          {/* Form 1: Incident Type Filter matching PHP searchIncidentTypeForm */}
          <form onSubmit={handleShowType} className="flex flex-wrap items-end gap-3 pb-3 border-b border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Incident Type <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={searchFilters.incidentType}
                onChange={(e) => setSearchFilters({ ...searchFilters, incidentType: e.target.value })}
                className="w-full sm:w-56 px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
              >
                <option value="">Select Incident Type</option>
                <option value="1">Office Incident</option>
                <option value="2">Site Incident</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-xs cursor-pointer"
            >
              Show
            </button>
          </form>

          {/* Form 2: PO Number, Site ID, Employee Name matching PHP searchIncidentForm */}
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-48">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                PO Number <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={searchFilters.poNumber}
                onChange={(e) => setSearchFilters({ ...searchFilters, poNumber: e.target.value, siteId: '' })}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
              >
                <option value="">Select PO Number</option>
                {(initMasters.poList || []).map(p => (
                  <option key={p.id || p.po_no} value={p.po_no}>{p.po_no}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Site ID <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={searchFilters.siteId}
                onChange={(e) => setSearchFilters({ ...searchFilters, siteId: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
              >
                <option value="">Select Site ID</option>
                {filteredFilterSites.map(s => (
                  <option key={s.id || s.site_id} value={s.site_id}>{s.site_id}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Employee Name :
              </label>
              <select
                value={searchFilters.userId}
                onChange={(e) => setSearchFilters({ ...searchFilters, userId: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
              >
                <option value="">Please Select</option>
                {(initMasters.users || []).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-xs cursor-pointer"
              >
                <Search size={14} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={clearSearch}
                title="Clear Search"
                className="p-1.5 text-[#D48611] hover:bg-amber-50 rounded border border-amber-300 transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Panel Body Table */}
        <div className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-2">
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
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">#</th>
                  <th className="px-3 py-2.5">PO Number</th>
                  <th className="px-3 py-2.5">Site ID</th>
                  <th className="px-3 py-2.5">Incident Date</th>
                  <th className="px-3 py-2.5">Staff Name</th>
                  <th className="px-3 py-2.5">Vendor Name</th>
                  <th className="px-3 py-2.5">Date of Reporting</th>
                  <th className="px-3 py-2.5 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Loading incident reports...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No incident reports found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const rowId = row._id || row.id;
                    return (
                      <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                          {rowNumber}.
                        </td>
                        <td className="px-3 py-2.5 font-bold text-teal-700">
                          {row.poNumber || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">
                          {row.siteId || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.incidentDate || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-800">
                          {row.staffName || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.vendorName || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {row.reportingDate || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center space-x-2">
                            {/* Green Eye Icon matching PHP fa fa-eye */}
                            <button
                              type="button"
                              onClick={() => handleViewDetails(row)}
                              className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Edit Pencil Icon */}
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer"
                              title="Edit Incident"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Delete Trash Icon */}
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                              title="Delete Incident"
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
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Incident Details matching PHP #myModal */}
      {detailsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Incident Details</h3>
              <button
                type="button"
                onClick={() => setDetailsModal({ open: false, data: null })}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                <div>
                  <span className="font-bold text-gray-600">PO Number: </span>
                  <span className="font-semibold text-gray-800">{detailsModal.data?.poNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-600">Site ID: </span>
                  <span className="font-semibold text-teal-700">{detailsModal.data?.siteId}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200 w-1/2 text-center">Incident Report</th>
                      <th className="px-3 py-2 w-1/2 text-center">Incident Consequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border-r border-gray-200 align-top text-gray-800 leading-relaxed text-xs">
                        {detailsModal.data?.incidentReport}
                      </td>
                      <td className="p-3 align-top text-gray-800 leading-relaxed text-xs">
                        {detailsModal.data?.incidentEffect}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsModal({ open: false, data: null })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-4 py-1.5 rounded transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Incident Report */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">Edit Incident Details</h3>
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-600">PO Number</label>
                  <p className="font-semibold text-gray-800 mt-0.5">{editModal.poNumber}</p>
                </div>
                <div>
                  <label className="block font-bold text-gray-600">Site ID</label>
                  <p className="font-semibold text-teal-700 mt-0.5">{editModal.siteId}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Incident Report <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  rows="3"
                  value={editModal.incidentReport}
                  onChange={(e) => setEditModal(prev => ({ ...prev, incidentReport: e.target.value }))}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Incident Consequence
                </label>
                <textarea
                  rows="3"
                  value={editModal.incidentEffect}
                  onChange={(e) => setEditModal(prev => ({ ...prev, incidentEffect: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 bg-white text-gray-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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

export default IncidentsReport;
