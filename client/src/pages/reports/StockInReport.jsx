import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Eye, Printer, Download, 
  Calendar, Building2, User, FileText, ChevronLeft, 
  ChevronRight, X, Layers, AlertCircle, PackageCheck
} from 'lucide-react';
import { fetchStockInReport, fetchStockInDetails, fetchReportFilters } from '../../services/reportApi';

const StockInReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({ totalTransactions: 0, totalItems: 0, totalQuantity: 0, uniqueSuppliers: 0 });
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
        setSummary(res.summary || { totalTransactions: 0, totalItems: 0, totalQuantity: 0, uniqueSuppliers: 0 });
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
    const headers = ['#', 'Stock In Date', 'Supplier', 'Received By', 'Bill Number', 'Bill Date', 'Line Items', 'Total Quantity', 'Remarks'];
    const rows = reportData.map((item, idx) => [
      idx + 1,
      item.stock_in_date || '',
      `"${item.supplier_name || ''}"`,
      `"${item.receiver_name || ''}"`,
      `"${item.bill_number || ''}"`,
      item.bill_date || '',
      item.item_count || 0,
      item.total_quantity || 0,
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

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <PackageCheck className="text-blue-600" size={26} />
            Material Stock In Report
          </h1>
          <nav className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
            <Link to="/" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Reports</span>
            <span>/</span>
            <span className="text-gray-700 font-medium">Stock In Report</span>
          </nav>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            title="Print Report"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            title="Export to Excel / CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link
            to="/material-stock/stock-in"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            Add Stock In
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <PackageCheck size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transactions</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalTransactions}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Line Items</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalItems}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units Received</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalQuantity.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Suppliers</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.uniqueSuppliers}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Suppliers</option>
              {filters.suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bill #, receiver, remark..."
                className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {paginatedData.length} of {totalRecords} transactions</span>
          {(fromDate || toDate || selectedSupplier !== 'all' || searchQuery) && (
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <RefreshCw size={13} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Report Table matching PHP material-stock-in-report.phtml */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#1e293b] text-white text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">#</th>
                <th className="px-4 py-3.5">Stock In Date</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Received By</th>
                <th className="px-4 py-3.5">Bill Number</th>
                <th className="px-4 py-3.5">Bill Date</th>
                <th className="px-4 py-3.5 text-center">Items / Units</th>
                <th className="px-4 py-3.5 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2 text-blue-600" size={20} />
                    Loading Stock In transactions...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <AlertCircle className="inline-block mr-2" size={20} />
                    No Stock In records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5 text-center font-medium text-gray-500">{serialNo}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {row.stock_in_date || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} className="text-gray-400" />
                          {row.supplier_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          {row.receiver_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-800 font-mono font-medium">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                          {row.bill_number || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{row.bill_date || '-'}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {row.item_count} items ({row.total_quantity} qty)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(row.id)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 rounded-md transition-colors mr-1"
                          title="View Stock Details"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock In Details Modal matching view-stockin.phtml */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200">
            {/* Modal Header matching PHP panel-heading */}
            <div className="bg-[#1e293b] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Stock Details</h3>
                <p className="text-xs text-blue-200 mt-0.5">Itemized products received in this consignment</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {modalLoading || !selectedStockIn ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw className="animate-spin inline-block mr-2 text-blue-600" size={22} />
                  Loading details...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500 block">Stock In Date:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.stock_in_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Supplier:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.supplier_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bill Number:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.bill_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bill Date:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.bill_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Receiver:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.receiver_name || '-'}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-gray-500 block">Remarks:</span>
                      <span className="font-semibold text-gray-800">{selectedStockIn.remarks || 'None'}</span>
                    </div>
                  </div>

                  {/* Items Table matching view-stockin.phtml */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3">Product Type</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Brand</th>
                          <th className="px-4 py-3 text-center">Unit</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStockIn.items && selectedStockIn.items.length > 0 ? (
                          selectedStockIn.items.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-medium text-gray-800">{item.product_type}</td>
                              <td className="px-4 py-2.5 text-gray-900 font-medium">{item.product_name}</td>
                              <td className="px-4 py-2.5 text-gray-600">{item.brand || '-'}</td>
                              <td className="px-4 py-2.5 text-center text-gray-600">{item.unit || '-'}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-gray-900">{item.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-400">No items recorded in this consignment.</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold text-gray-800 border-t border-gray-200">
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-right">Total Quantity:</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-bold">{selectedStockIn.total_quantity}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
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
