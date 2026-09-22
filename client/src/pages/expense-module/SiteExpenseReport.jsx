import React, { useState, useEffect } from 'react';
import { Download, Loader2, Search, Calendar, RefreshCw, Plus, Building2, Layers, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSiteExpenseReport } from '../../services/expenseService';

const SiteExpenseReport = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [session, setSession] = useState('2023-2024');
  const [quarter, setQuarter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Fetch Report Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getSiteExpenseReport({
        from_date: fromDate,
        to_date: toDate,
        quarter: quarter,
        session: session,
        search: searchTerm,
        page: currentPage,
        limit: pageSize
      });

      if (res && res.success) {
        setData(res.data || []);
        setTotalAmount(res.total_amount || '0.00');
        if (res.pagination) {
          setPagination({
            total: res.pagination.total,
            totalPages: res.pagination.totalPages
          });
        }
      }
    } catch (err) {
      console.error('Failed to load site expense report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  // Handle Filter Submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  // Handle Filter Reset
  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSession('2023-2024');
    setQuarter('');
    setSearchTerm('');
    setCurrentPage(1);
    setTimeout(() => {
      fetchData();
    }, 0);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = [
      '#',
      'PO Number',
      'PO Date',
      'Site ID',
      'Site Name',
      'Transferred Amount',
      'Reported Amount',
      'Not Reported Amount',
      'Last Fund Transferred Date',
      'Last Expense Added By'
    ];

    const csvRows = [headers.join(',')];
    data.forEach((row, i) => {
      const values = [
        (currentPage - 1) * pageSize + i + 1,
        `"${row.po_no || ''}"`,
        `"${row.po_date || ''}"`,
        `"${row.site_id || ''}"`,
        `"${(row.site_name || '').replace(/"/g, '""')}"`,
        row.transferred_amount || 0,
        row.reported_amount || 0,
        row.not_reported_amount || 0,
        `"${row.last_fund_transfer_date || ''}"`,
        `"${(row.last_expense_added_by || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Site_Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatINR = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₹ 0.00';
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1550px] mx-auto space-y-6 font-sans">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-teal-600" size={26} />
            Site Expense Report
          </h1>
          <nav className="text-sm font-medium text-slate-500 mt-1 flex space-x-2">
            <span 
              onClick={() => navigate('/dashboard')}
              className="hover:text-teal-600 cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <span>/</span>
            <span 
              onClick={() => navigate('/expense-dashboard')}
              className="hover:text-teal-600 cursor-pointer transition-colors"
            >
              Expense Module
            </span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Site Expense Report</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/expense-module/create-new-expense')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-sm hover:from-emerald-700 hover:to-teal-700 transition-all text-sm cursor-pointer"
          >
            <Plus size={16} />
            Add Site Expense
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-teal-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Site Expenses</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{formatINR(totalAmount)}</h3>
            <span className="text-xs text-teal-600 font-semibold">Accumulated transfers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allocated Site Clusters</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pagination.total}</h3>
            <span className="text-xs text-blue-600 font-semibold">PO-Site groupings</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Session</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{session || 'All Years'}</h3>
            <span className="text-xs text-indigo-600 font-semibold">Financial period</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quarter Period</p>
            <h3 className="text-xl font-bold text-amber-600 mt-1">
              {quarter ? `Quarter ${quarter}` : 'All Quarters'}
            </h3>
            <span className="text-xs text-amber-700 font-semibold">Cycle filter</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Building2 size={24} />
          </div>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header matching theme */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-wide flex items-center">
              Site Expense Details
            </h2>
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
              Total: {formatINR(totalAmount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters Bar */}
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3.5 mb-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quarter</label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">All Quarters</option>
                <option value="1">Q1 (Apr - Jun)</option>
                <option value="2">Q2 (Jul - Sep)</option>
                <option value="3">Q3 (Oct - Dec)</option>
                <option value="4">Q4 (Jan - Mar)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition-colors text-xs font-bold shadow-sm cursor-pointer"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Controls: Show Entries & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 w-full">
            <div className="flex items-center text-xs font-semibold text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-2 border border-slate-300 rounded-lg p-1.5 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by PO, Site ID, Site Name..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 relative shadow-sm">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-teal-600" size={32} />
              </div>
            )}
            <table className="min-w-[900px] w-full border-collapse text-xs text-left text-slate-600">
              <thead className="text-[11px] text-slate-700 uppercase bg-slate-100/90 font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">PO Number</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">PO Date</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Site ID</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Site Name</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Transferred (₹)</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Reported (₹)</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Not Reported (₹)</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Last Transfer Date</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Last Expense Added By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      No site expense records available.
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-teal-50/40 transition-colors ${
                        index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{row.po_no}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{row.po_date || '-'}</td>
                      <td className="px-4 py-3 text-teal-700 font-bold whitespace-nowrap">
                        {row.site_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{row.site_name}</td>
                      <td className="px-4 py-3 text-emerald-700 font-black whitespace-nowrap">
                        {parseFloat(row.transferred_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-teal-700 font-bold whitespace-nowrap">
                        {parseFloat(row.reported_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-amber-700 font-bold whitespace-nowrap">
                        {parseFloat(row.not_reported_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{row.last_fund_transfer_date || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-semibold">{row.last_expense_added_by || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 text-xs font-semibold text-slate-500 w-full">
            <div>
              Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 py-1">...</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 border rounded-lg cursor-pointer ${
                        currentPage === p
                          ? 'border-teal-600 bg-teal-50 text-teal-700 font-black'
                          : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteExpenseReport;
