import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Eye, Download, 
  ChevronLeft, ChevronRight, X, Pencil
} from 'lucide-react';
import { fetchStockInReport, fetchStockInDetails, fetchReportFilters } from '../../../services/reportApi';

const StockInReport = () => {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({ productTypes: [], suppliers: [], brands: [] });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedStockIn, setSelectedStockIn] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Filters & Report Data
  const loadFilters = async () => {
    try {
      const data = await fetchReportFilters();
      setFilters(data);
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (selectedSupplier && selectedSupplier !== 'all') params.supplier_id = selectedSupplier;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await fetchStockInReport(params);
      if (res.success) {
        setReportData(res.data || []);
      }
    } catch (err) {
      console.error('Error loading stock in report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [fromDate, toDate, selectedSupplier, searchQuery]);

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSelectedSupplier('all');
    setSearchQuery('');
  };

  // View Modal Handler matching PHP view-stockin
  const handleViewDetails = async (id) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const details = await fetchStockInDetails(id);
      setSelectedStockIn(details);
    } catch (err) {
      console.error('Error loading stock in details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Pagination Calculations
  const totalRecords = reportData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reportData.slice(start, start + pageSize);
  }, [reportData, currentPage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Stock In Date', 'Supplier', 'Received By', 'Bill Number', 'Bill Date', 'Remarks'];
    const rows = reportData.map((item, idx) => [
      idx + 1,
      item.stock_in_date || '',
      `"${item.supplier_name || ''}"`,
      `"${item.receiver_name || ''}"`,
      `"${item.bill_number || ''}"`,
      item.bill_date || '',
      `"${(item.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `material-stock-in-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3 font-sans">
      {/* Header Banner matching PHP panel-primary / panel-heading */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Material Stock In Report</span>
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            title="Export CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <Link
            to="/material-stock/stock-in"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
          >
            <Plus size={14} />
            <span>Add Stock In</span>
          </Link>
        </div>
      </div>

      {/* Main Container with White Background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Filter Toolbar with Clean White Background */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none bg-white"
              >
                <option value="all">All Suppliers</option>
                {filters.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bill #, receiver, remark..."
                  className="w-full text-xs sm:text-sm border border-gray-300 rounded pl-8 pr-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
                <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Showing {paginatedData.length} of {totalRecords} transactions</span>
            {(fromDate || toDate || selectedSupplier !== 'all' || searchQuery) && (
              <button
                onClick={handleReset}
                className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Page size & search bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-600 font-medium">entries</span>
          </div>
        </div>

        {/* Report Table matching PHP material-stock-in-report.phtml */}
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-left text-xs sm:text-sm text-gray-700">
            <thead 
              className="text-white text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <tr>
                <th className="px-3 py-2.5 w-12 text-center">#</th>
                <th className="px-3 py-2.5">Stock In Date</th>
                <th className="px-3 py-2.5">Supplier</th>
                <th className="px-3 py-2.5">Received By</th>
                <th className="px-3 py-2.5">Bill Number</th>
                <th className="px-3 py-2.5">Bill Date</th>
                <th className="px-3 py-2.5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-r-transparent mr-2 align-middle" />
                    Loading Stock In transactions...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No Stock In records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={row.id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-3 py-2 text-center font-medium text-gray-500">{serialNo}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                        {row.stock_in_date || '-'}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {row.supplier_name}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {row.receiver_name}
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-800">
                        {row.bill_number || '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {row.bill_date || '-'}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(row.id)}
                            className="text-teal-600 hover:text-teal-800 p-1 transition-colors"
                            title="View Stock Details"
                          >
                            <Eye size={16} />
                          </button>
                          <Link
                            to={`/material-stock/stock-in?id=${row.id}`}
                            className="text-green-600 hover:text-green-800 p-1 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 pt-2">
          <span>
            Showing {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stock In Details Modal matching PHP view-stockin.phtml */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div 
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
            >
              <h3 className="text-sm font-bold text-white">Stock Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
              {modalLoading || !selectedStockIn ? (
                <div className="py-8 text-center text-gray-500 text-xs">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-r-transparent mr-2 align-middle" />
                  Loading details...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Stock In Date:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.stock_in_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Supplier:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.supplier_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bill Number:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.bill_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bill Date:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.bill_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Receiver:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.receiver_name || '-'}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-gray-500 block">Remarks:</span>
                      <span className="font-semibold text-gray-900">{selectedStockIn.remarks || 'None'}</span>
                    </div>
                  </div>

                  {/* Items Table matching view-stockin.phtml */}
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2">Product Type</th>
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2">Brand</th>
                          <th className="px-3 py-2 text-center">Unit</th>
                          <th className="px-3 py-2 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedStockIn.items && selectedStockIn.items.length > 0 ? (
                          selectedStockIn.items.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">{item.product_type}</td>
                              <td className="px-3 py-2 text-gray-900">{item.product_name}</td>
                              <td className="px-3 py-2 text-gray-600">{item.brand || '-'}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{item.unit || '-'}</td>
                              <td className="px-3 py-2 text-right font-bold text-gray-900">{item.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-400">No items recorded in this consignment.</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold text-gray-800 border-t border-gray-200">
                        <tr>
                          <td colSpan="4" className="px-3 py-2 text-right">Total Quantity:</td>
                          <td className="px-3 py-2 text-right text-teal-700 font-bold">{selectedStockIn.total_quantity}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded transition-colors"
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

export default StockInReport;
