import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Eye, Printer, Download, 
  Calendar, MapPin, User, FileText, ChevronLeft, 
  ChevronRight, X, Layers, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { fetchStockOutReport, fetchStockOutDetails, fetchReportFilters } from '../../services/reportApi';

const StockOutReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({ totalTransactions: 0, totalItems: 0, totalQuantity: 0, uniqueSites: 0, uniquePOs: 0 });
  const [filters, setFilters] = useState({ productTypes: [], suppliers: [], brands: [], poNumbers: [], sites: [] });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPo, setSelectedPo] = useState('all');
  const [selectedSite, setSelectedSite] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedStockOut, setSelectedStockOut] = useState(null);
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
      if (selectedPo && selectedPo !== 'all') params.po_no = selectedPo;
      if (selectedSite && selectedSite !== 'all') params.site_id = selectedSite;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await fetchStockOutReport(params);
      if (res.success) {
        setReportData(res.data || []);
        setSummary(res.summary || { totalTransactions: 0, totalItems: 0, totalQuantity: 0, uniqueSites: 0, uniquePOs: 0 });
      }
    } catch (err) {
      console.error('Error loading stock out report:', err);
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
  }, [fromDate, toDate, selectedPo, selectedSite, searchQuery]);

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSelectedPo('all');
    setSelectedSite('all');
    setSearchQuery('');
  };

  // View Modal Handler matching PHP view-stock-out
  const handleViewDetails = async (id) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const details = await fetchStockOutDetails(id);
      setSelectedStockOut(details);
    } catch (err) {
      console.error('Error loading stock out details:', err);
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
    const headers = ['#', 'Stock Out Date', 'Allocated To', 'Allocated By', 'PO Number', 'Site ID', 'Line Items', 'Total Quantity', 'Remarks'];
    const rows = reportData.map((item, idx) => [
      idx + 1,
      item.stock_out_date || '',
      `"${item.received_by || ''}"`,
      `"${item.allocated_by || ''}"`,
      `"${item.po_no || ''}"`,
      `"${item.site_id || ''}"`,
      item.item_count || 0,
      item.total_quantity || 0,
      `"${(item.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `material-stock-out-report-${new Date().toISOString().slice(0, 10)}.csv`);
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
            <ArrowUpRight className="text-rose-600" size={26} />
            Material Stock Out Report
          </h1>
          <nav className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
            <Link to="/" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Reports</span>
            <span>/</span>
            <span className="text-gray-700 font-medium">Stock Out Report</span>
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
            to="/material-stock/stock-out"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            Issue Stock Out
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Dispatches</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalTransactions}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Line Items Issued</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalItems}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units Issued</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.totalQuantity.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sites Supplied</div>
            <div className="text-2xl font-extrabold text-gray-800 mt-0.5">{summary.uniqueSites}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PO Number</label>
            <select
              value={selectedPo}
              onChange={(e) => setSelectedPo(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">All POs</option>
              {filters.poNumbers.map((po, idx) => (
                <option key={idx} value={po}>{po}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Site ID</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">All Sites</option>
              {filters.sites.map((s) => (
                <option key={s.id} value={s.site_id}>{s.site_id} - {s.site_name}</option>
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
                placeholder="Receiver, PO, site, remark..."
                className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {paginatedData.length} of {totalRecords} transactions</span>
          {(fromDate || toDate || selectedPo !== 'all' || selectedSite !== 'all' || searchQuery) && (
            <button
              onClick={handleReset}
              className="text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <RefreshCw size={13} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Report Table matching PHP material-stock-out-report.phtml */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead 
              className="text-white text-xs uppercase font-semibold"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">#</th>
                <th className="px-4 py-3.5">Stock Out Date</th>
                <th className="px-4 py-3.5">Allocated To</th>
                <th className="px-4 py-3.5">Allocated By</th>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Site ID</th>
                <th className="px-4 py-3.5 text-center">Items / Units</th>
                <th className="px-4 py-3.5 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2 text-rose-600" size={20} />
                    Loading Stock Out transactions...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <AlertCircle className="inline-block mr-2" size={20} />
                    No Stock Out records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={row.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="px-4 py-3.5 text-center font-medium text-gray-500">{serialNo}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {row.stock_out_date || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          {row.received_by || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{row.allocated_by || '-'}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-mono font-medium">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                          {row.po_no || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {row.site_id || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-block bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {row.item_count} items ({row.total_quantity} qty)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(row.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-md transition-colors mr-1"
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

      {/* Stock Out Details Modal matching view-stock-out.phtml */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div 
              className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <div>
                <h3 className="text-lg font-bold">Stock Details</h3>
                <p className="text-xs text-white/80 mt-0.5">Itemized products issued in this consignment</p>
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
              {modalLoading || !selectedStockOut ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw className="animate-spin inline-block mr-2 text-rose-600" size={22} />
                  Loading details...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500 block">Stock Out Date:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.stock_out_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Allocated To:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.received_by || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Allocated By:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.allocated_by || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">PO Number:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.po_no || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Site ID:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.site_id || '-'}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-gray-500 block">Remarks:</span>
                      <span className="font-semibold text-gray-800">{selectedStockOut.remarks || 'None'}</span>
                    </div>
                  </div>

                  {/* Items Table matching view-stock-out.phtml */}
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
                        {selectedStockOut.items && selectedStockOut.items.length > 0 ? (
                          selectedStockOut.items.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-medium text-gray-800">{item.product_type}</td>
                              <td className="px-4 py-2.5 text-gray-900 font-medium">{item.product_name}</td>
                              <td className="px-4 py-2.5 text-gray-600">{item.brand || '-'}</td>
                              <td className="px-4 py-2.5 text-center text-gray-600">{item.unit || '-'}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-rose-600">{item.quantity}</td>
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
                          <td className="px-4 py-3 text-right text-rose-600 font-bold">{selectedStockOut.total_quantity}</td>
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

export default StockOutReport;
