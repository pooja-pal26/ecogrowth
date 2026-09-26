import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, Search, RefreshCw, ChevronLeft, ChevronRight, 
  Calendar, Layers, FileSpreadsheet
} from 'lucide-react';
import { fetchStockSummary, fetchSiteFinancialSummary } from '../../../services/reportApi';

const SummaryReport = () => {
  // Default to PHP Summary Report (Site Financial Summary)
  const [activeTab, setActiveTab] = useState('financial-summary'); // 'financial-summary' | 'stock-summary'

  // --- Site Financial Summary States (Matching PHP summary-report.phtml) ---
  const [siteSummaryData, setSiteSummaryData] = useState([]);
  const [siteMetrics, setSiteMetrics] = useState({ totalRecords: 0, totalExpenses: 0, totalInvoiceAmount: 0, totalReceivedAmount: 0 });
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteFromDate, setSiteFromDate] = useState('');
  const [siteToDate, setSiteToDate] = useState('');
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [siteCurrentPage, setSiteCurrentPage] = useState(1);
  const [sitePageSize, setSitePageSize] = useState(10);

  // --- Stock Inventory Summary States ---
  const [stockSummaryData, setStockSummaryData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);

  // Load Site Financial Summary
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

  // Load Stock Inventory Summary
  const loadStockSummary = async () => {
    try {
      setStockLoading(true);
      const params = {};
      if (stockSearchQuery.trim()) params.search = stockSearchQuery.trim();

      const res = await fetchStockSummary(params);
      if (res.success) {
        setStockSummaryData(res.data || []);
      }
    } catch (err) {
      console.error('Error loading stock summary:', err);
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'financial-summary') {
      loadSiteFinancialSummary();
      setSiteCurrentPage(1);
    } else {
      loadStockSummary();
      setStockCurrentPage(1);
    }
  }, [activeTab]);

  // Site Financial Filtered & Paginated
  const filteredSiteData = useMemo(() => {
    if (!siteSearchQuery.trim()) return siteSummaryData;
    const q = siteSearchQuery.toLowerCase().trim();
    return siteSummaryData.filter(s =>
      s.site_id.toLowerCase().includes(q) ||
      s.site_name.toLowerCase().includes(q) ||
      (s.po_no && s.po_no.toLowerCase().includes(q)) ||
      (s.month && s.month.toLowerCase().includes(q))
    );
  }, [siteSummaryData, siteSearchQuery]);

  const siteTotalPages = Math.max(1, Math.ceil(filteredSiteData.length / sitePageSize));
  const paginatedSiteData = useMemo(() => {
    const start = (siteCurrentPage - 1) * sitePageSize;
    return filteredSiteData.slice(start, start + sitePageSize);
  }, [filteredSiteData, siteCurrentPage, sitePageSize]);

  // Stock Filtered & Paginated
  const filteredStockData = useMemo(() => {
    if (!stockSearchQuery.trim()) return stockSummaryData;
    const q = stockSearchQuery.toLowerCase().trim();
    return stockSummaryData.filter(i =>
      i.product_name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.brand && i.brand.toLowerCase().includes(q))
    );
  }, [stockSummaryData, stockSearchQuery]);

  const stockTotalPages = Math.max(1, Math.ceil(filteredStockData.length / stockPageSize));
  const paginatedStockData = useMemo(() => {
    const start = (stockCurrentPage - 1) * stockPageSize;
    return filteredStockData.slice(start, start + stockPageSize);
  }, [filteredStockData, stockCurrentPage, stockPageSize]);

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
    link.setAttribute('download', `summary-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Stock Summary
  const handleExportStockCSV = () => {
    const headers = ['#', 'Category', 'Product Name', 'Brand', 'Unit', 'Opening Stock', 'Total In', 'Total Out', 'Closing Stock'];
    const rows = filteredStockData.map((item, idx) => [
      idx + 1,
      `"${item.category || ''}"`,
      `"${item.product_name || ''}"`,
      `"${item.brand || ''}"`,
      `"${item.unit || ''}"`,
      item.opening_stock || 0,
      item.total_in || 0,
      item.total_out || 0,
      item.closing_stock || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-summary-report-${new Date().toISOString().slice(0, 10)}.csv`);
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
          <span>Summary Report</span>
        </h1>
        <div className="flex items-center space-x-2">
          {activeTab === 'financial-summary' ? (
            <button
              onClick={handleExportSiteCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              title="Export Excel / CSV"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
          ) : (
            <button
              onClick={handleExportStockCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              title="Export CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container with White Background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Sub-Tabs Switcher */}
        <div className="flex items-center border-b border-gray-200">
          <button
            onClick={() => setActiveTab('financial-summary')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'financial-summary'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Site Financial Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('stock-summary')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'stock-summary'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers size={15} />
            <span>Inventory Stock Summary</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SITE FINANCIAL SUMMARY (EXACT PHP PARITY WITH summary-report.phtml) */}
        {/* ========================================================================= */}
        {activeTab === 'financial-summary' && (
          <div className="space-y-3">
            {/* Filter Toolbar with Clean White Background (Matching PHP Form) */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadSiteFinancialSummary();
                  setSiteCurrentPage(1);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">From date</label>
                  <input
                    type="date"
                    value={siteFromDate}
                    onChange={(e) => setSiteFromDate(e.target.value)}
                    placeholder="From Date"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">To date</label>
                  <input
                    type="date"
                    value={siteToDate}
                    onChange={(e) => setSiteToDate(e.target.value)}
                    placeholder="To Date"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Search Site</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={siteSearchQuery}
                      onChange={(e) => setSiteSearchQuery(e.target.value)}
                      placeholder="Site ID or Name..."
                      className="w-full text-xs sm:text-sm border border-gray-300 rounded pl-8 pr-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                    />
                    <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded shadow-xs transition-colors"
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
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded border border-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Page size & info bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Show</span>
                <select
                  value={sitePageSize}
                  onChange={(e) => {
                    setSitePageSize(Number(e.target.value));
                    setSiteCurrentPage(1);
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

            {/* PHP Data Table matching summary-report.phtml */}
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
                    <th className="px-3 py-2.5">Month</th>
                    <th className="px-3 py-2.5">Site ID</th>
                    <th className="px-3 py-2.5">Site Name</th>
                    <th className="px-3 py-2.5 text-right">Expenses</th>
                    <th className="px-3 py-2.5">Site Start Date</th>
                    <th className="px-3 py-2.5 text-right">Invoice Amount</th>
                    <th className="px-3 py-2.5 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {siteLoading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-r-transparent mr-2 align-middle" />
                        Loading summary records...
                      </td>
                    </tr>
                  ) : paginatedSiteData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-400">
                        No financial records found for the selected dates.
                      </td>
                    </tr>
                  ) : (
                    paginatedSiteData.map((row, idx) => {
                      const serialNo = (siteCurrentPage - 1) * sitePageSize + idx + 1;
                      return (
                        <tr key={row.id} className="hover:bg-teal-50/40 transition-colors">
                          <td className="px-3 py-2 text-center font-medium text-gray-500">{serialNo}</td>
                          <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{row.month}</td>
                          <td className="px-3 py-2 font-mono text-gray-800 whitespace-nowrap font-medium">
                            {row.site_id}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-800">{row.site_name}</td>
                          <td className="px-3 py-2 text-right font-semibold text-rose-600 whitespace-nowrap">
                            ₹{row.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.order_date || '-'}</td>
                          <td className="px-3 py-2 text-right font-semibold text-teal-700 whitespace-nowrap">
                            ₹{row.invoice_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-600 whitespace-nowrap">
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
                    <td colSpan="4" className="px-3 py-2.5 text-right uppercase text-xs tracking-wider">Totals:</td>
                    <td className="px-3 py-2.5 text-right text-rose-600">
                      ₹{siteMetrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td className="px-3 py-2.5 text-right text-teal-700">
                      ₹{siteMetrics.totalInvoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right text-green-600">
                      ₹{siteMetrics.totalReceivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 pt-2">
              <span>
                Showing {filteredSiteData.length > 0 ? (siteCurrentPage - 1) * sitePageSize + 1 : 0} to {Math.min(siteCurrentPage * sitePageSize, filteredSiteData.length)} of {filteredSiteData.length} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSiteCurrentPage(p => Math.max(1, p - 1))}
                  disabled={siteCurrentPage === 1}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 font-medium">Page {siteCurrentPage} of {siteTotalPages}</span>
                <button
                  onClick={() => setSiteCurrentPage(p => Math.min(siteTotalPages, p + 1))}
                  disabled={siteCurrentPage === siteTotalPages}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INVENTORY STOCK SUMMARY                                            */}
        {/* ========================================================================= */}
        {activeTab === 'stock-summary' && (
          <div className="space-y-3">
            {/* Filter Toolbar with Clean White Background */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => { setStockSearchQuery(e.target.value); setStockCurrentPage(1); }}
                    placeholder="Search product, category, brand..."
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded pl-8 pr-2.5 py-1.5 text-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                  <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadStockSummary}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
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
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Product Name</th>
                    <th className="px-3 py-2.5">Brand</th>
                    <th className="px-3 py-2.5 text-center">Unit</th>
                    <th className="px-3 py-2.5 text-right">Opening</th>
                    <th className="px-3 py-2.5 text-right">Stock In</th>
                    <th className="px-3 py-2.5 text-right">Stock Out</th>
                    <th className="px-3 py-2.5 text-right">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stockLoading ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-r-transparent mr-2 align-middle" />
                        Loading stock summary...
                      </td>
                    </tr>
                  ) : paginatedStockData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-400">
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedStockData.map((row, idx) => {
                      const serialNo = (stockCurrentPage - 1) * stockPageSize + idx + 1;
                      return (
                        <tr key={row.id} className="hover:bg-teal-50/40 transition-colors">
                          <td className="px-3 py-2 text-center font-medium text-gray-500">{serialNo}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">{row.category}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900">{row.product_name}</td>
                          <td className="px-3 py-2 text-gray-600">{row.brand || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{row.unit || '-'}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row.opening_stock}</td>
                          <td className="px-3 py-2 text-right text-green-600 font-medium">+{row.total_in}</td>
                          <td className="px-3 py-2 text-right text-rose-600 font-medium">-{row.total_out}</td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">{row.closing_stock}</td>
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
                Showing {filteredStockData.length > 0 ? (stockCurrentPage - 1) * stockPageSize + 1 : 0} to {Math.min(stockCurrentPage * stockPageSize, filteredStockData.length)} of {filteredStockData.length} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStockCurrentPage(p => Math.max(1, p - 1))}
                  disabled={stockCurrentPage === 1}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 font-medium">Page {stockCurrentPage} of {stockTotalPages}</span>
                <button
                  onClick={() => setStockCurrentPage(p => Math.min(stockTotalPages, p + 1))}
                  disabled={stockCurrentPage === stockTotalPages}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryReport;
