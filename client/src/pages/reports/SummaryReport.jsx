import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, RefreshCw, Printer, Download, Search, 
  Calendar, Layers, TrendingUp, TrendingDown, Package, 
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, 
  FileText, IndianRupee, MapPin
} from 'lucide-react';
import { fetchStockSummary, fetchSiteFinancialSummary, fetchReportFilters } from '../../services/reportApi';

const SummaryReport = () => {
  const [activeTab, setActiveTab] = useState('stock-summary'); // 'stock-summary' | 'financial-summary'

  // --- Stock Summary States ---
  const [stockSummaryData, setStockSummaryData] = useState([]);
  const [stockMetrics, setStockMetrics] = useState({
    totalSKUs: 0,
    totalOpeningStock: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    totalClosingStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);

  // --- Site Financial Summary States ---
  const [siteSummaryData, setSiteSummaryData] = useState([]);
  const [siteMetrics, setSiteMetrics] = useState({ totalRecords: 0, totalExpenses: 0, totalInvoiceAmount: 0, totalReceivedAmount: 0 });
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteFromDate, setSiteFromDate] = useState('');
  const [siteToDate, setSiteToDate] = useState('');
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [siteCurrentPage, setSiteCurrentPage] = useState(1);
  const [sitePageSize, setSitePageSize] = useState(10);

  // Master Filters
  const [masterFilters, setMasterFilters] = useState({ productTypes: [], suppliers: [], brands: [] });

  const loadMasterFilters = async () => {
    try {
      const data = await fetchReportFilters();
      setMasterFilters(data);
    } catch (err) {
      console.error('Error loading master filters:', err);
    }
  };

  const loadStockSummary = async () => {
    try {
      setStockLoading(true);
      const params = {};
      if (stockCategoryFilter && stockCategoryFilter !== 'all') params.category_id = stockCategoryFilter;
      if (stockSearchQuery.trim()) params.search = stockSearchQuery.trim();

      const res = await fetchStockSummary(params);
      if (res.success) {
        setStockSummaryData(res.data || []);
        setStockMetrics(res.summary || {
          totalSKUs: 0,
          totalOpeningStock: 0,
          totalStockIn: 0,
          totalStockOut: 0,
          totalClosingStock: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        });
        setCategoryStats(res.categoryStats || []);
      }
    } catch (err) {
      console.error('Error loading stock summary:', err);
    } finally {
      setStockLoading(false);
    }
  };

  const loadSiteFinancialSummary = async () => {
    try {
      setSiteLoading(true);
      const params = {};
      if (siteFromDate) params.from_date = siteFromDate;
      if (siteToDate) params.to_date = siteToDate;

      const res = await fetchSiteFinancialSummary(params);
      if (res.success) {
        setSiteSummaryData(res.data || []);
        setSiteMetrics(res.summary || { totalRecords: 0, totalExpenses: 0, totalInvoiceAmount: 0, totalReceivedAmount: 0 });
      }
    } catch (err) {
      console.error('Error loading site financial summary:', err);
    } finally {
      setSiteLoading(false);
    }
  };

  useEffect(() => {
    loadMasterFilters();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock-summary') {
      loadStockSummary();
      setStockCurrentPage(1);
    } else {
      loadSiteFinancialSummary();
      setSiteCurrentPage(1);
    }
  }, [activeTab, stockCategoryFilter, stockSearchQuery]);

  // --- Stock Summary Filtered & Paginated ---
  const filteredStockData = useMemo(() => {
    return stockSummaryData.filter(item => {
      if (stockStatusFilter === 'in_stock' && item.closing_stock <= 0) return false;
      if (stockStatusFilter === 'low_stock' && item.status !== 'Low Stock') return false;
      if (stockStatusFilter === 'out_of_stock' && item.status !== 'Out of Stock') return false;
      return true;
    });
  }, [stockSummaryData, stockStatusFilter]);

  const stockTotalPages = Math.max(1, Math.ceil(filteredStockData.length / stockPageSize));
  const paginatedStockData = useMemo(() => {
    const start = (stockCurrentPage - 1) * stockPageSize;
    return filteredStockData.slice(start, start + stockPageSize);
  }, [filteredStockData, stockCurrentPage, stockPageSize]);

  // Stock Summary Table Totals based on filtered dataset
  const filteredStockTotals = useMemo(() => {
    return filteredStockData.reduce((acc, row) => {
      acc.opening += row.opening_stock || 0;
      acc.in += row.total_in || 0;
      acc.out += row.total_out || 0;
      acc.closing += row.closing_stock || 0;
      return acc;
    }, { opening: 0, in: 0, out: 0, closing: 0 });
  }, [filteredStockData]);

  // --- Site Summary Filtered & Paginated ---
  const filteredSiteData = useMemo(() => {
    if (!siteSearchQuery.trim()) return siteSummaryData;
    const q = siteSearchQuery.toLowerCase().trim();
    return siteSummaryData.filter(s =>
      s.site_id.toLowerCase().includes(q) ||
      s.site_name.toLowerCase().includes(q) ||
      s.po_no.toLowerCase().includes(q) ||
      s.month.toLowerCase().includes(q)
    );
  }, [siteSummaryData, siteSearchQuery]);

  const siteTotalPages = Math.max(1, Math.ceil(filteredSiteData.length / sitePageSize));
  const paginatedSiteData = useMemo(() => {
    const start = (siteCurrentPage - 1) * sitePageSize;
    return filteredSiteData.slice(start, start + sitePageSize);
  }, [filteredSiteData, siteCurrentPage, sitePageSize]);

  // Export CSV for Stock Summary
  const handleExportStockCSV = () => {
    const headers = ['#', 'Category', 'Product Name', 'Brand', 'Unit', 'Opening Stock', 'Total Stock In', 'Total Stock Out', 'Current / Closing Stock', 'Status'];
    const rows = filteredStockData.map((item, idx) => [
      idx + 1,
      `"${item.category || ''}"`,
      `"${item.product_name || ''}"`,
      `"${item.brand || ''}"`,
      `"${item.unit || ''}"`,
      item.opening_stock || 0,
      item.total_in || 0,
      item.total_out || 0,
      item.closing_stock || 0,
      item.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `overall-stock-summary-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Site Financial Summary (matching PHP)
  const handleExportSiteCSV = () => {
    const headers = ['#', 'Month', 'Site ID', 'Site Name', 'Expenses', 'Site Start Date', 'Invoice Amount', 'Amount Received'];
    const rows = filteredSiteData.map((item, idx) => [
      idx + 1,
      `"${item.month || ''}"`,
      `"${item.site_id || ''}"`,
      `"${item.site_name || ''}"`,
      item.expenses || 0,
      item.order_date || '',
      item.invoice_amount || 0,
      item.received_amount || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `site-financial-summary-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={26} />
            Summary Report
          </h1>
          <nav className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
            <Link to="/" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Reports</span>
            <span>/</span>
            <span className="text-gray-700 font-medium">Summary Report</span>
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
            onClick={activeTab === 'stock-summary' ? handleExportStockCSV : handleExportSiteCSV}
            className="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            title="Export to Excel / CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-gray-200 my-6">
        <button
          onClick={() => setActiveTab('stock-summary')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock-summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Layers size={17} />
          Overall Stock Summary (Inventory Flow)
        </button>
        <button
          onClick={() => setActiveTab('financial-summary')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'financial-summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <IndianRupee size={17} />
          Site Financial Summary (PHP Parity)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERALL STOCK SUMMARY                                               */}
      {/* ========================================================================= */}
      {activeTab === 'stock-summary' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opening Stock</span>
                <Package className="text-gray-400" size={18} />
              </div>
              <div className="text-2xl font-black text-gray-800 mt-2">
                {stockMetrics.totalOpeningStock.toLocaleString()}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Initial base balance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Stock In</span>
                <TrendingUp className="text-emerald-500" size={18} />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                +{stockMetrics.totalStockIn.toLocaleString()}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Received materials</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Stock Out</span>
                <TrendingDown className="text-rose-500" size={18} />
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">
                -{stockMetrics.totalStockOut.toLocaleString()}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Issued to sites</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Current Stock</span>
                <Layers className="text-blue-600" size={18} />
              </div>
              <div className="text-2xl font-black text-blue-700 mt-2">
                {stockMetrics.totalClosingStock.toLocaleString()}
              </div>
              <span className="text-xs text-blue-500 mt-1 block">Available in inventory</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total SKUs</span>
                <CheckCircle2 className="text-blue-500" size={18} />
              </div>
              <div className="text-2xl font-black text-gray-800 mt-2">{stockMetrics.totalSKUs}</div>
              <span className="text-xs text-amber-600 font-medium mt-1 block">
                {stockMetrics.lowStockCount} Low / {stockMetrics.outOfStockCount} Out
              </span>
            </div>
          </div>

          {/* Interactive Category Breakdown Visualization */}
          {categoryStats.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Top Categories Stock Flow</h2>
                  <p className="text-xs text-gray-500">Current Stock distribution by material type</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {categoryStats.length} Categories Displayed
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                {categoryStats.map((c, i) => {
                  const maxVal = Math.max(...categoryStats.map(s => s.currentStock), 1);
                  const pct = Math.min(100, Math.max(8, (c.currentStock / maxVal) * 100));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        <span className="font-semibold text-gray-800">{c.category} ({c.count} items)</span>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600">In: {c.totalIn}</span>
                          <span className="text-rose-600">Out: {c.totalOut}</span>
                          <span className="font-bold text-blue-700">Stock: {c.currentStock.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Product Category</label>
                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {masterFilters.productTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Status</label>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (&lt; 10)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Search Products</label>
                <div className="relative">
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Product name, brand, category..."
                    className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>Showing {paginatedStockData.length} of {filteredStockData.length} products</span>
              {(stockCategoryFilter !== 'all' || stockStatusFilter !== 'all' || stockSearchQuery) && (
                <button
                  onClick={() => {
                    setStockCategoryFilter('all');
                    setStockStatusFilter('all');
                    setStockSearchQuery('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <RefreshCw size={13} />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Material-Wise Summary Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#1e293b] text-white text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Product Name</th>
                    <th className="px-4 py-3.5">Brand</th>
                    <th className="px-4 py-3.5 text-center">Unit</th>
                    <th className="px-4 py-3.5 text-right">Opening Stock</th>
                    <th className="px-4 py-3.5 text-right">Total In</th>
                    <th className="px-4 py-3.5 text-right">Total Out</th>
                    <th className="px-4 py-3.5 text-right">Closing Stock</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockLoading ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-gray-500">
                        <RefreshCw className="animate-spin inline-block mr-2 text-blue-600" size={20} />
                        Loading stock summary...
                      </td>
                    </tr>
                  ) : paginatedStockData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-gray-400">
                        No materials found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedStockData.map((row, idx) => {
                      const serialNo = (stockCurrentPage - 1) * stockPageSize + idx + 1;
                      return (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-gray-400">{serialNo}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{row.category}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{row.product_name}</td>
                          <td className="px-4 py-3 text-gray-600">{row.brand}</td>
                          <td className="px-4 py-3 text-center text-gray-600 font-mono text-xs">{row.unit}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">{row.opening_stock}</td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            {row.total_in > 0 ? `+${row.total_in}` : '0'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-rose-600">
                            {row.total_out > 0 ? `-${row.total_out}` : '0'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-blue-700">{row.closing_stock}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.status === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-700'
                                : row.status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Table Footer with Summary Totals */}
                <tfoot className="bg-gray-100 font-bold text-gray-800 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-right uppercase text-xs tracking-wider">Filtered Totals:</td>
                    <td className="px-4 py-3 text-right">{filteredStockTotals.opening.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">+{filteredStockTotals.in.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-600">-{filteredStockTotals.out.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-blue-700">{filteredStockTotals.closing.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={stockPageSize}
                  onChange={(e) => {
                    setStockPageSize(Number(e.target.value));
                    setStockCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Page {stockCurrentPage} of {stockTotalPages}</span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setStockCurrentPage(p => Math.max(1, p - 1))}
                    disabled={stockCurrentPage === 1}
                    className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setStockCurrentPage(p => Math.min(stockTotalPages, p + 1))}
                    disabled={stockCurrentPage === stockTotalPages}
                    className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SITE FINANCIAL SUMMARY (PHP PARITY WITH summary-report.phtml)       */}
      {/* ========================================================================= */}
      {activeTab === 'financial-summary' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Site Expenses</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">
                ₹{siteMetrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Approved site expenses</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Invoice Value</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                ₹{siteMetrics.totalInvoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Billed client amount</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Amount Received</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                ₹{siteMetrics.totalReceivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Settled payments</span>
            </div>
          </div>

          {/* PHP Form Filter Toolbar matching summary-report.phtml */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadSiteFinancialSummary();
                setSiteCurrentPage(1);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={siteFromDate}
                  onChange={(e) => setSiteFromDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={siteToDate}
                  onChange={(e) => setSiteToDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Search Site / PO</label>
                <div className="relative">
                  <input
                    type="text"
                    value={siteSearchQuery}
                    onChange={(e) => setSiteSearchQuery(e.target.value)}
                    placeholder="Site ID, name, PO #..."
                    className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSiteFromDate('');
                    setSiteToDate('');
                    setSiteSearchQuery('');
                    loadSiteFinancialSummary();
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* PHP Data Table matching summary-report.phtml */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#1e293b] text-white text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th className="px-4 py-3.5">Month</th>
                    <th className="px-4 py-3.5">Site ID</th>
                    <th className="px-4 py-3.5">Site Name</th>
                    <th className="px-4 py-3.5 text-right">Expenses (₹)</th>
                    <th className="px-4 py-3.5">Site Start Date</th>
                    <th className="px-4 py-3.5 text-right">Invoice Amount (₹)</th>
                    <th className="px-4 py-3.5 text-right">Amount Received (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {siteLoading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        <RefreshCw className="animate-spin inline-block mr-2 text-blue-600" size={20} />
                        Loading site financial summary...
                      </td>
                    </tr>
                  ) : paginatedSiteData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        No financial records found for the selected dates.
                      </td>
                    </tr>
                  ) : (
                    paginatedSiteData.map((row, idx) => {
                      const serialNo = (siteCurrentPage - 1) * sitePageSize + idx + 1;
                      return (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3.5 text-center font-medium text-gray-400">{serialNo}</td>
                          <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">{row.month}</td>
                          <td className="px-4 py-3.5 font-mono text-gray-800 whitespace-nowrap font-medium">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {row.site_id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-gray-800">{row.site_name}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-rose-600 whitespace-nowrap">
                            ₹{row.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{row.order_date || '-'}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-blue-700 whitespace-nowrap">
                            ₹{row.invoice_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                            ₹{row.received_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Table Footer Totals */}
                <tfoot className="bg-gray-100 font-bold text-gray-800 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="4" className="px-4 py-3.5 text-right uppercase text-xs tracking-wider">Totals:</td>
                    <td className="px-4 py-3.5 text-right text-rose-600">
                      ₹{siteMetrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td className="px-4 py-3.5 text-right text-blue-700">
                      ₹{siteMetrics.totalInvoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right text-emerald-600">
                      ₹{siteMetrics.totalReceivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={sitePageSize}
                  onChange={(e) => {
                    setSitePageSize(Number(e.target.value));
                    setSiteCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Page {siteCurrentPage} of {siteTotalPages}</span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setSiteCurrentPage(p => Math.max(1, p - 1))}
                    disabled={siteCurrentPage === 1}
                    className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSiteCurrentPage(p => Math.min(siteTotalPages, p + 1))}
                    disabled={siteCurrentPage === siteTotalPages}
                    className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryReport;
