import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Edit, Trash2, X, RefreshCw, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

const PODetails = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });

  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Site List Modal State (PHP get-site-list-by-po-number.phtml parity)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [siteDetails, setSiteDetails] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const fetchPODetails = async (withFilters = false) => {
    setLoading(true);
    try {
      const params = {};
      if (withFilters && filters.fromDate) params.fromDate = filters.fromDate;
      if (withFilters && filters.toDate) params.toDate = filters.toDate;

      const res = await axios.get('http://localhost:5000/api/po-sites/po-details', { params, withCredentials: true });
      if (res.data && res.data.success) {
        setPoList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching PO Details:', err);
      showErrorToast('Failed to load PO details', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetails(false);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPODetails(true);
  };

  const handleReset = () => {
    setFilters({ fromDate: '', toDate: '' });
    setLoading(true);
    axios.get('http://localhost:5000/api/po-sites/po-details', { withCredentials: true })
      .then(res => {
        if (res.data?.success) setPoList(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Open Site List Modal (PHP get-site-list-by-po-number.phtml parity)
  const getSiteList = async (poNumber) => {
    setSelectedPoNumber(poNumber);
    setIsModalOpen(true);
    setLoadingSites(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/po-sites/po-sites-list',
        { po_number: poNumber },
        { withCredentials: true }
      );
      if (res.data && res.data.success) {
        setSiteDetails(res.data.data || []);
      } else {
        setSiteDetails([]);
      }
    } catch (err) {
      console.error('Error fetching sites for PO:', err);
      setSiteDetails([]);
    } finally {
      setLoadingSites(false);
    }
  };

  // Export Excel CSV (PHP export-po-details parity)
  const handleExport = () => {
    if (poList.length === 0) {
      showErrorToast('No data to export', 'Export Failed');
      return;
    }

    const headers = ['#', 'PO Number', 'PO Order Date', 'Revision', 'Amount', 'Site Type', 'Exclusive Tax', 'Total Tax', 'Status'];
    const rows = poList.map((po, idx) => [
      idx + 1,
      `"${po.po_no || ''}"`,
      `"${formatDate(po.order_date)}"`,
      `"${po.rev || '0'}"`,
      `"${po.po_amount || '0'}"`,
      `"${po.site_type || ''}"`,
      `"${po.exclusive_tax || '0'}"`,
      `"${po.tax_amount || '0'}"`,
      `"${po.status || 'Open'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `po_details_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast('PO Details exported successfully', 'Export Complete');
  };

  // Delete PO Handler
  const handleDelete = async (id, poNo) => {
    const result = await confirmDeleteDialog({
      title: 'Delete PO?',
      text: `Are you sure you want to delete PO "${poNo || id}"? All associated sites will also be deleted.`
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/po-sites/po-details/${id}`, { withCredentials: true });
        if (res.data && res.data.success) {
          showSuccessToast('PO deleted successfully', 'Deleted');
          fetchPODetails(Boolean(filters.fromDate || filters.toDate));
        } else {
          showErrorToast(res.data?.message || 'Failed to delete PO', 'Delete Failed');
        }
      } catch (err) {
        console.error('Error deleting PO:', err);
        showErrorToast(err.response?.data?.message || err.message || 'Error deleting PO', 'Delete Error');
      }
    }
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

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP po-details.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Heading with Action Buttons matching PHP layout */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">PO Details</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Excel matching PHP class="btn btn-info" */}
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 border border-cyan-500 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Export Excel"
            >
              <Download size={15} />
              <span>Export Excel</span>
            </button>

            {/* Add New PO matching PHP class="btn btn-success" */}
            <Link
              to="/po-sites/po/add-new-po"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New PO</span>
            </Link>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Filter Form matching PHP po-details.phtml */}
          <form onSubmit={handleSearch} className="bg-gray-50/80 p-2.5 sm:p-3 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs sm:text-sm text-gray-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="From Date"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs sm:text-sm text-gray-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="To Date"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* Table matching PHP id="poDetailsTable" */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 text-xs sm:text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-3.5 py-2.5 font-bold w-12">#</th>
                  <th className="px-3.5 py-2.5 font-bold">PO Number</th>
                  <th className="px-3.5 py-2.5 font-bold">PO Order Date</th>
                  <th className="px-3.5 py-2.5 font-bold">Revision</th>
                  <th className="px-3.5 py-2.5 font-bold">Amount</th>
                  <th className="px-3.5 py-2.5 font-bold">Site Type</th>
                  <th className="px-3.5 py-2.5 font-bold">Exclusive Tax</th>
                  <th className="px-3.5 py-2.5 font-bold">Total Tax</th>
                  <th className="px-3.5 py-2.5 font-bold">Status</th>
                  <th className="px-3.5 py-2.5 font-bold text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                      <RefreshCw size={20} className="animate-spin inline mr-2 text-teal-600" />
                      Loading PO details...
                    </td>
                  </tr>
                ) : poList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                      No POs found.
                    </td>
                  </tr>
                ) : (
                  poList.map((po, index) => (
                    <tr key={po.id || po._id || index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3.5 py-2.5 text-gray-500">{index + 1}.</td>
                      <td className="px-3.5 py-2.5 font-semibold">
                        <button
                          type="button"
                          onClick={() => getSiteList(po.po_no)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          title="View Sites"
                        >
                          {po.po_no}
                        </button>
                      </td>
                      <td className="px-3.5 py-2.5 text-gray-600">{formatDate(po.order_date)}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{po.rev || '0'}</td>
                      <td className="px-3.5 py-2.5 font-medium text-gray-900">
                        {po.po_amount ? `₹${parseFloat(po.po_amount).toLocaleString('en-IN')}` : '0'}
                      </td>
                      <td className="px-3.5 py-2.5 text-gray-600">{po.site_type || '-'}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{po.exclusive_tax || '-'}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{po.tax_amount || '-'}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (po.status || '').toLowerCase() === 'open' || (po.status || '').toLowerCase() === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {po.status || 'Open'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => getSiteList(po.po_no)}
                            className="text-teal-600 hover:text-teal-800 p-1 hover:bg-teal-50 rounded transition-colors inline-block cursor-pointer"
                            title="View Sites"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(po.id || po._id || po.po_no, po.po_no)}
                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition-colors inline-block cursor-pointer"
                            title="Delete PO"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Site(s) List Modal matching PHP get-site-list-by-po-number.phtml */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div 
              className="px-5 py-3 text-white flex justify-between items-center shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-base sm:text-lg font-bold">
                PO Number: {selectedPoNumber} Site(s) List
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {loadingSites ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
                  <span>Loading site list...</span>
                </div>
              ) : siteDetails.length === 0 ? (
                <div className="py-8 text-center text-red-600 font-semibold text-sm">
                  Site(s) Not Found!
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left">#</th>
                        <th className="px-3.5 py-2.5 text-left">Site Id</th>
                        <th className="px-3.5 py-2.5 text-left">Site Allocated</th>
                        <th className="px-3.5 py-2.5 text-left">Allocation Date</th>
                        <th className="px-3.5 py-2.5 text-left">Site Expense</th>
                        <th className="px-3.5 py-2.5 text-left">Site Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {siteDetails.map((site, sIdx) => (
                        <tr key={site.id || site._id || sIdx} className="hover:bg-gray-50/80">
                          <td className="px-3.5 py-2 text-gray-500">{sIdx + 1}</td>
                          <td className="px-3.5 py-2 font-semibold text-blue-600">{site.site_id}</td>
                          <td className="px-3.5 py-2">{site.site_allocation_id ? 'Yes' : 'No'}</td>
                          <td className="px-3.5 py-2 text-gray-600">{formatDate(site.site_allocation_date)}</td>
                          <td className="px-3.5 py-2 text-gray-900 font-medium">
                            {site.total_site_expense ? `₹${parseFloat(site.total_site_expense).toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-3.5 py-2 text-gray-600">{formatDate(site.site_due_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PODetails;
