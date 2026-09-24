import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Building2, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  RefreshCw,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { getExpenseOverview, getExpenseBreakdown } from '../../services/expenseDashboardService';

// Format currency in Indian format
const formatINR = (val) => {
  if (val === null || val === undefined) return '₹0';
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

// Compact Indian format for axis ticks & card subtext
const formatCompactINR = (val) => {
  if (val === null || val === undefined) return '₹0';
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs sm:text-sm">
        <p className="font-bold text-slate-200 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between items-center gap-4 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-mono font-semibold">{formatINR(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ExpenseDashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedZone, setSelectedZone] = useState('');
  const [availableYears, setAvailableYears] = useState(['2026', '2025', '2024']);
  const [zones, setZones] = useState([]);
  const [kpi, setKpi] = useState({
    totalSiteExpense: 0,
    totalOfficeExpense: 0,
    totalExpenses: 0,
    totalInvoiced: 0,
    netBalance: 0,
    averageMonthlyExpense: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Breakdown tables
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'site_details' | 'office_details'
  const [breakdownData, setBreakdownData] = useState([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getExpenseOverview({ year: selectedYear, zone: selectedZone });
      if (res.success) {
        setKpi(res.kpi);
        setMonthlyData(res.monthlyData);
        if (res.availableYears?.length > 0) setAvailableYears(res.availableYears);
        if (res.zones?.length > 0) setZones(res.zones);
        if (!selectedYear && res.selectedYear) setSelectedYear(res.selectedYear);
      }
    } catch (err) {
      console.error('Failed to load expense dashboard overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBreakdownList = async (tabType) => {
    if (tabType === 'summary') return;
    setBreakdownLoading(true);
    try {
      const res = await getExpenseBreakdown({
        type: tabType === 'office_details' ? 'office' : 'site',
        year: selectedYear,
        limit: 25
      });
      if (res.success) {
        setBreakdownData(res.data);
      }
    } catch (err) {
      console.error('Failed to load breakdown list:', err);
    } finally {
      setBreakdownLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedZone]);

  useEffect(() => {
    loadBreakdownList(activeTab);
  }, [activeTab, selectedYear]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Filters */}
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100"> */}
        {/* <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Expense Dashboard
            </h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Financial Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Site Expenses, Office Expenses, and Invoice vs Expense comparison
          </p>
        </div> */}

        {/* Filter Controls */}
        {/* <div className="flex flex-wrap items-center gap-3"> */}
          {/* Year Filter */}
          {/* <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar size={16} className="text-gray-500 mr-2" />
            <span className="text-xs font-semibold text-gray-500 mr-2 uppercase">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div> */}

          {/* Zone Filter */}
          {/* <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter size={16} className="text-gray-500 mr-2" />
            <span className="text-xs font-semibold text-gray-500 mr-2 uppercase">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Zones</option>
              {zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div> */}

          {/* Refresh Button */}
          {/* <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button> */}
        {/* </div> */}
      {/* </div> */}

      {/* KPI Cards Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"> */}
        {/* Card 1: Site Expenses */}
        {/* <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-3 -bottom-3 opacity-15 pointer-events-none">
            <Building2 size={80} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Site Expenses
              </span>
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Building2 size={16} />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold mt-2.5 tracking-tight text-white truncate" title={formatINR(kpi.totalSiteExpense)}>
              {formatINR(kpi.totalSiteExpense)}
            </h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span>FY {selectedYear}</span>
            <span>On-site spends</span>
          </div>
        </div> */}

        {/* Card 2: Office Expenses */}
        {/* <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-3 -bottom-3 opacity-15 pointer-events-none">
            <Wallet size={80} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
                Office Expenses
              </span>
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Wallet size={16} />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold mt-2.5 tracking-tight text-white truncate" title={formatINR(kpi.totalOfficeExpense)}>
              {formatINR(kpi.totalOfficeExpense)}
            </h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-cyan-100 font-medium">
            <span>FY {selectedYear}</span>
            <span>Operational</span>
          </div>
        </div> */}

        {/* Card 3: Total Invoiced Value */}
        {/* <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-3 -bottom-3 opacity-15 pointer-events-none">
            <Receipt size={80} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
                Total Invoiced
              </span>
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Receipt size={16} />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold mt-2.5 tracking-tight text-white truncate" title={formatINR(kpi.totalInvoiced)}>
              {formatINR(kpi.totalInvoiced)}
            </h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-rose-100 font-medium">
            <span>Punched</span>
            <span>Approved Value</span>
          </div>
        </div> */}

        {/* Card 4: Net Variance / Profit-Loss */}
        {/* <div className={`p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between text-white ${
          kpi.netBalance >= 0 
            ? 'bg-gradient-to-br from-indigo-600 to-violet-800' 
            : 'bg-gradient-to-br from-amber-600 to-orange-700'
        }`}>
          <div className="absolute right-3 -bottom-3 opacity-15 pointer-events-none">
            {kpi.netBalance >= 0 ? <TrendingUp size={80} /> : <TrendingDown size={80} />}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100" title="Invoice vs Expense">
                Net Variance (P&L)
              </span>
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                {kpi.netBalance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold mt-2.5 tracking-tight text-white truncate" title={formatINR(kpi.netBalance)}>
              {formatINR(kpi.netBalance)}
            </h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-indigo-100 font-medium">
            <span>{kpi.netBalance >= 0 ? 'Surplus' : 'Deficit'}</span>
            <span>Avg: {formatCompactINR(kpi.averageMonthlyExpense)}/mo</span>
          </div>
        </div>
      </div> */}

      {/* 3 Core Charts (Replicating PHP Ecogrowth) */}
      <div className="space-y-6">
        {/* Chart 1: Monthly Site Expense */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-teal-200" />
              <h2 className="font-bold text-base sm:text-lg">Site Expense ({selectedYear})</h2>
            </div>
            <span className="text-xs text-white/90 font-mono bg-white/15 px-3 py-1 rounded-full border border-white/20">
              Total: {formatINR(kpi.totalSiteExpense)}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthName" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickFormatter={formatCompactINR} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="siteExpense" 
                    name="Site Expense" 
                    fill="#10B981" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Office Expense */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-cyan-200" />
              <h2 className="font-bold text-base sm:text-lg">Office Expense ({selectedYear})</h2>
            </div>
            <span className="text-xs text-white/90 font-mono bg-white/15 px-3 py-1 rounded-full border border-white/20">
              Total: {formatINR(kpi.totalOfficeExpense)}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthName" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickFormatter={formatCompactINR} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="officeExpense" 
                    name="Office Expense" 
                    fill="#06B6D4" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Invoice vs Expense Comparison (Crimson vs Green, matching PHP) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-rose-200" />
              <h2 className="font-bold text-base sm:text-lg">Invoice Vs Expense ({selectedYear})</h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#DC143C]"></span>
                Invoice
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#10B981]"></span>
                Expense (Site + Office)
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthName" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickFormatter={formatCompactINR} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '12px' }}
                  />
                  <Bar 
                    dataKey="invoiceAmount" 
                    name="Invoice Amount" 
                    fill="#DC143C" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="totalExpense" 
                    name="Total Expense" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Data Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 px-6 pt-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly Summary ({selectedYear})
            </button>
            <button
              onClick={() => setActiveTab('site_details')}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'site_details'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Site Expenses
            </button>
            <button
              onClick={() => setActiveTab('office_details')}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'office_details'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Office Expenses
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'summary' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3 text-right">Site Expense</th>
                    <th className="px-4 py-3 text-right">Office Expense</th>
                    <th className="px-4 py-3 text-right">Total Expense</th>
                    <th className="px-4 py-3 text-right">Invoiced Amount</th>
                    <th className="px-4 py-3 text-right">Net Profit / Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">{m.monthYear}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">
                        {formatINR(m.siteExpense)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-cyan-600">
                        {formatINR(m.officeExpense)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                        {formatINR(m.totalExpense)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-rose-600">
                        {formatINR(m.invoiceAmount)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        m.profitOrLoss >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {m.profitOrLoss >= 0 ? '+' : ''}{formatINR(m.profitOrLoss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td className="px-4 py-3.5 text-slate-800 uppercase">Annual Total</td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-700">
                      {formatINR(kpi.totalSiteExpense)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-cyan-700">
                      {formatINR(kpi.totalOfficeExpense)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-900">
                      {formatINR(kpi.totalExpenses)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-700">
                      {formatINR(kpi.totalInvoiced)}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-mono text-base ${
                      kpi.netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {kpi.netBalance >= 0 ? '+' : ''}{formatINR(kpi.netBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === 'site_details' && (
            <div className="overflow-x-auto">
              {breakdownLoading ? (
                <div className="p-8 text-center text-gray-500">Loading site expenses...</div>
              ) : breakdownData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No site expense records found for {selectedYear}.</div>
              ) : (
                <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">PO No</th>
                      <th className="px-4 py-3">Site ID</th>
                      <th className="px-4 py-3">Transfer Date</th>
                      <th className="px-4 py-3">Payee / Transferred To</th>
                      <th className="px-4 py-3">Voucher #</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {breakdownData.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{row.po_no || '-'}</td>
                        <td className="px-4 py-2.5">{row.site_id || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{row.transfer_date ? String(row.transfer_date).substring(0, 10) : '-'}</td>
                        <td className="px-4 py-2.5">{row.transfer_to_name || row.transfered_to || '-'}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{row.voucher_number || '-'}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-700">
                          {formatINR(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'office_details' && (
            <div className="overflow-x-auto">
              {breakdownLoading ? (
                <div className="p-8 text-center text-gray-500">Loading office expenses...</div>
              ) : breakdownData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No office expense records found for {selectedYear}.</div>
              ) : (
                <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Transfer Date</th>
                      <th className="px-4 py-3">Remark</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {breakdownData.map((row, idx) => (
                      <tr key={row._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-gray-700">{row.transfer_date ? String(row.transfer_date).substring(0, 10) : '-'}</td>
                        <td className="px-4 py-2.5">{row.remark || 'Office Expense'}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-cyan-700">
                          {formatINR(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
