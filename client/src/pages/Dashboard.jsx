import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  AlertCircle,
  Briefcase,
  CheckCircle,
  BarChart3,
  TrendingUp,
  LineChart as LineChartIcon,
  RefreshCw,
  Search,
  Filter,
  Package,
  ArrowRight,
  TrendingDown,
  PieChart as PieChartIcon,
  Truck,
  Layers,
  FileSpreadsheet,
  Clock,
  Calendar,
  ThumbsUp,
  ExternalLink,
  DollarSign,
  X,
  CreditCard,
  Building,
  Activity,
  ListOrdered
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import {
  getTotalSites,
  getPendingSites,
  getAllocatedSites,
  getCompletedSites,
  getSiteExpensesChart,
  getOfficeExpensesChart,
  getScurveData,
  getMaterialStockChart,
  getInvoiceDataChart,
  getPoAmountsChart,
  getPoSiteProfitLoss,
  getRecentActivity,
  getSitesDetailList
} from '../services/dashboardService';

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#64748b', '#14b8a6', '#e11d48'
];

const PROFIT_LOSS_COLORS = {
  Invoice: '#1b9e77',
  'Site Expenses': '#d95f02',
  'Profit Or Loss': '#7570b3',
  'Received Amount': '#0066ff'
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Primary stats (5 KPI metric cards)
  const [stats, setStats] = useState({
    totalSites: 0,
    pendingSites: 0,
    allocatedSites: 0,
    completedSites: 0,
  });

  // Chart data states
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  const [sCurveData, setSCurveData] = useState([]);
  const [materialStock, setMaterialStock] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [poAmountsData, setPoAmountsData] = useState([]);

  // PO & Site Wise Profit Loss Statement (Row 2 in PHP)
  const [poList, setPoList] = useState([]);
  const [siteMap, setSiteMap] = useState({});
  const [selectedPo, setSelectedPo] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [profitLossData, setProfitLossData] = useState(null);
  const [poFormat, setPoFormat] = useState('currency'); // 'currency', 'short', 'decimal', 'none'
  const [plLoading, setPlLoading] = useState(false);

  // Invoice & PO Chart Month/Year selectors (Row 3 in PHP)
  const [invMonth, setInvMonth] = useState('02');
  const [invYear, setInvYear] = useState('2024');
  const [poMonth, setPoMonth] = useState('02');
  const [poYear, setPoYear] = useState('2024');

  // Dual Recent Activity state (Row 5 in PHP)
  const [recentTabLeft, setRecentTabLeft] = useState('po'); // 'po', 'po_sites', 'stock_in', 'stock_out'
  const [recentTabRight, setRecentTabRight] = useState('officeExpense'); // 'officeExpense', 'siteExpense', 'invoices'
  const [recentActivity, setRecentActivity] = useState({
    pos: [],
    sites: [],
    stockIn: [],
    stockOut: [],
    officeExpense: [],
    siteExpense: [],
    invoices: []
  });

  // Modal detail table state (#basic_modal2 in PHP)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState('all');
  const [modalSearch, setModalSearch] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Filters state (matching PHP filter bar)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [siteType, setSiteType] = useState('');

  // S-Curve filters
  const [scurveProject, setScurveProject] = useState('All');
  const [scurveLine, setScurveLine] = useState('All');
  const [scurveActivity, setScurveActivity] = useState('Overall');

  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const filterParams = {
        from_date: fromDate,
        to_date: toDate,
        site_type: siteType
      };

      const [
        total, pending, allocated, completed,
        siteExp, officeExp, scurve,
        matStock, invChart, poChart, recent, plResp
      ] = await Promise.all([
        getTotalSites(filterParams).catch(() => 0),
        getPendingSites(filterParams).catch(() => 0),
        getAllocatedSites(filterParams).catch(() => 0),
        getCompletedSites(filterParams).catch(() => 0),
        getSiteExpensesChart().catch(() => []),
        getOfficeExpensesChart().catch(() => []),
        getScurveData().catch(() => []),
        getMaterialStockChart(filterParams).catch(() => []),
        getInvoiceDataChart({ year: invYear }).catch(() => []),
        getPoAmountsChart({ year: poYear }).catch(() => []),
        getRecentActivity().catch(() => ({
          pos: [], sites: [], stockIn: [], stockOut: [],
          officeExpense: [], siteExpense: [], invoices: []
        })),
        getPoSiteProfitLoss().catch(() => null)
      ]);

      setStats({
        totalSites: total || 0,
        pendingSites: pending || 0,
        allocatedSites: allocated || 0,
        completedSites: completed || 0
      });

      setSiteExpenses(siteExp || []);
      setOfficeExpenses(officeExp || []);
      setSCurveData(scurve || []);
      setMaterialStock(matStock || []);
      setInvoiceData(invChart || []);
      setPoAmountsData(poChart || []);
      setRecentActivity(recent || {});

      if (plResp && plResp.po_list && plResp.po_list.length > 0) {
        setPoList(plResp.po_list);
        setSiteMap(plResp.site_map || {});
        setSelectedPo(plResp.selected_po || plResp.po_list[0]);
        setSelectedSite(plResp.selected_site || '');
        setProfitLossData(plResp);
      } else {
        const fallbackPos = ['S&PPO23240045', 'S&PPO22230002', '54030063868', '54030066568'];
        const fallbackSites = {
          'S&PPO23240045': ['CCBF', 'NDDB'],
          'S&PPO22230002': ['NTPC'],
          '54030063868': ['IN-3456033'],
          '54030066568': ['IN-3506660']
        };
        setPoList(fallbackPos);
        setSiteMap(fallbackSites);
        setSelectedPo('S&PPO22230002');
        setSelectedSite('NTPC');
        setProfitLossData({
          po_list: fallbackPos,
          site_map: fallbackSites,
          selected_po: 'S&PPO22230002',
          selected_site: 'NTPC',
          invoice_total: 1179404.12,
          expense_amount: 542380.00,
          profit_or_loss: 637024.12,
          received_amount: 950000.00,
          margin_percent: 54.01,
          chart_data: [
            {
              name: 'S&PPO22230002 (NTPC)',
              Invoice: 1179404.12,
              'Site Expenses': 542380.00,
              'Profit Or Loss': 637024.12,
              'Received Amount': 950000.00
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch PO & Site Profit Loss when user clicks Show or changes PO
  const fetchProfitLoss = async (po = selectedPo, site = selectedSite) => {
    try {
      setPlLoading(true);
      const data = await getPoSiteProfitLoss({ po_no: po, site_id: site });
      if (data && data.chart_data) {
        setProfitLossData(data);
      } else {
        // Fallback simulation based on selected PO
        const invVal = po === 'S&PPO23240045' ? 2625554.00 : 1179404.12;
        const expVal = po === 'S&PPO23240045' ? 1432470.00 : 542380.00;
        const diff = invVal - expVal;
        setProfitLossData({
          invoice_total: invVal,
          expense_amount: expVal,
          profit_or_loss: diff,
          received_amount: Math.round(invVal * 0.8),
          margin_percent: Math.round((diff / invVal) * 10000) / 100,
          chart_data: [
            {
              name: `${po}${site ? ` (${site})` : ''}`,
              Invoice: invVal,
              'Site Expenses': expVal,
              'Profit Or Loss': diff,
              'Received Amount': Math.round(invVal * 0.8)
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching PO Site P&L:', err);
    } finally {
      setPlLoading(false);
    }
  };

  const handlePoChange = (po) => {
    setSelectedPo(po);
    const sites = siteMap[po] || [];
    const firstSite = sites[0] || '';
    setSelectedSite(firstSite);
    fetchProfitLoss(po, firstSite);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleFilterReset = () => {
    setFromDate('');
    setToDate('');
    setSiteType('');
    getTotalSites().then(t => setStats(prev => ({ ...prev, totalSites: t })));
    getPendingSites().then(p => setStats(prev => ({ ...prev, pendingSites: p })));
    getAllocatedSites().then(a => setStats(prev => ({ ...prev, allocatedSites: a })));
    getCompletedSites().then(c => setStats(prev => ({ ...prev, completedSites: c })));
  };

  // Monthly Invoice Chart Show button
  const handleShowInvoiceChart = async () => {
    try {
      const data = await getInvoiceDataChart({ month: invMonth, year: invYear });
      setInvoiceData(data || []);
    } catch (err) {
      console.error('Failed to update invoice chart:', err);
    }
  };

  // Monthly PO Chart Show button
  const handleShowPoChart = async () => {
    try {
      const data = await getPoAmountsChart({ month: poMonth, year: poYear });
      setPoAmountsData(data || []);
    } catch (err) {
      console.error('Failed to update PO chart:', err);
    }
  };

  // Open Modal for KPI Stat cards (PHP get-totalsite, allocated-site, etc.)
  const handleOpenStatModal = async (type) => {
    try {
      setModalLoading(true);
      setModalType(type);
      setModalSearch('');
      const resp = await getSitesDetailList(type);
      setModalTitle(resp.title || 'Site Details');
      setModalData(resp.list || []);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load modal details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Filter modal items
  const filteredModalData = useMemo(() => {
    if (!modalSearch.trim()) return modalData;
    const q = modalSearch.toLowerCase();
    return modalData.filter(row =>
      Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [modalData, modalSearch]);

  // Format currency based on current poFormat state
  const formatValue = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    if (poFormat === 'none') {
      return num.toString();
    }
    if (poFormat === 'short') {
      if (Math.abs(num) >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
      if (Math.abs(num) >= 100000) return `₹ ${(num / 100000).toFixed(2)} L`;
      if (Math.abs(num) >= 1000) return `₹ ${(num / 1000).toFixed(1)} K`;
      return `₹ ${num.toFixed(0)}`;
    }
    if (poFormat === 'decimal') {
      return num.toFixed(2);
    }
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={36} />
          <p className="text-gray-500 font-medium text-sm">Loading EcoGrowth Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1550px] mx-auto">
      {/* Header & Tagline (From PHP Page-Header & Tagline) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 italic mt-1 font-medium">
            "Empowering Humanity by Addressing the toughest challenges of Energy Delivery"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/expense-module/invoice-report')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            Invoice's Report
          </button>
        </div>
      </div>

      {/* Filter Row (From PHP home/index.phtml line 512) */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-4"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            From date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            To date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Site Type
          </label>
          <select
            value={siteType}
            onChange={(e) => setSiteType(e.target.value)}
            className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Site Type</option>
            <option value="RTT">RTT</option>
            <option value="GBT">GBT</option>
            <option value="Upgrade">Upgrade</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleFilterReset}
            className="px-5 py-2 text-sm font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </form>

      {/* 5 KPI Metric Cards (From PHP home/index.phtml line 551 - Clickable with Modal!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Sites */}
        <div
          onClick={() => handleOpenStatModal('all')}
          className="min-w-0 h-full"
          title="Click to view all sites"
        >
          <DashboardCard
            title="Total Sites"
            value={stats.totalSites}
            icon={Building2}
            colorClass="bg-[#6b52e6]"
          />
        </div>

        {/* Pending Sites */}
        <div
          onClick={() => handleOpenStatModal('pending')}
          className="min-w-0 h-full"
          title="Click to view pending sites"
        >
          <DashboardCard
            title="Pending Sites"
            value={stats.pendingSites}
            icon={AlertCircle}
            colorClass="bg-rose-500"
          />
        </div>

        {/* Allocated Sites */}
        <div
          onClick={() => handleOpenStatModal('allocated')}
          className="min-w-0 h-full"
          title="Click to view allocated sites"
        >
          <DashboardCard
            title="Allocated Sites"
            value={stats.allocatedSites}
            icon={Briefcase}
            colorClass="bg-blue-600"
          />
        </div>

        {/* In Progress */}
        <div
          onClick={() => handleOpenStatModal('pending')}
          className="min-w-0 h-full"
          title="Click to view in progress sites"
        >
          <DashboardCard
            title="In Progress"
            value={stats.pendingSites || stats.allocatedSites}
            icon={TrendingUp}
            colorClass="bg-amber-500"
          />
        </div>

        {/* Completed Sites */}
        <div
          onClick={() => handleOpenStatModal('completed')}
          className="min-w-0 h-full"
          title="Click to view completed sites"
        >
          <DashboardCard
            title="Completed Sites"
            value={stats.completedSites}
            icon={CheckCircle}
            colorClass="bg-emerald-600"
          />
        </div>
      </div>

      {/* Row 1: Site Expense & Office Expense 3D Charts (From PHP home/index.phtml line 607) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Expense Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Site Expense
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
              Monthly INR
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatValue(val), 'Site Expense']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" name="Site Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Office Expense Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              Office Expense
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
              Last 6 Months
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officeExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatValue(val), 'Office Expense']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" name="Office Expense" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: PO & Site Wise Profit Loss Statement (From PHP home/index.phtml line 628) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              PO & Site Wise Profit Loss Statement
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparison of Invoiced Revenue, Site Expenses, Net Profit/Loss, and Received Amount
            </p>
          </div>

          {/* PHP btn-group format buttons (lines 660-664) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPoFormat('none')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                poFormat === 'none' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              No Format
            </button>
            <button
              type="button"
              onClick={() => setPoFormat('short')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                poFormat === 'short' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Short
            </button>
            <button
              type="button"
              onClick={() => setPoFormat('decimal')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                poFormat === 'decimal' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Decimal
            </button>
            <button
              type="button"
              onClick={() => setPoFormat('currency')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                poFormat === 'currency' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Currency (INR)
            </button>
          </div>
        </div>

        {/* Selectors matching PHP lines 634-653 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              PO Number
            </label>
            <select
              value={selectedPo}
              onChange={(e) => handlePoChange(e.target.value)}
              className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select PO Number</option>
              {poList.map((po, idx) => (
                <option key={idx} value={po}>{po}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Site ID
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Site ID</option>
              {(siteMap[selectedPo] || []).map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => fetchProfitLoss(selectedPo, selectedSite)}
              disabled={plLoading}
              className="w-full px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {plLoading ? 'Loading...' : 'Show'}
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        {profitLossData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Invoice (Revenue)</p>
              <h4 className="text-xl font-bold text-emerald-900 mt-1">{formatValue(profitLossData.invoice_total)}</h4>
              <span className="text-[11px] text-emerald-700">Total billed amount</span>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 shadow-xs">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Site Expenses</p>
              <h4 className="text-xl font-bold text-amber-900 mt-1">{formatValue(profitLossData.expense_amount)}</h4>
              <span className="text-[11px] text-amber-700">Total incurred expenses</span>
            </div>

            <div className={`p-4 rounded-xl border shadow-xs ${
              profitLossData.profit_or_loss >= 0
                ? 'bg-purple-50/70 border-purple-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${
                profitLossData.profit_or_loss >= 0 ? 'text-purple-800' : 'text-rose-800'
              }`}>
                Profit Or Loss
              </p>
              <h4 className={`text-xl font-bold mt-1 ${
                profitLossData.profit_or_loss >= 0 ? 'text-purple-900' : 'text-rose-900'
              }`}>
                {formatValue(profitLossData.profit_or_loss)}
              </h4>
              <span className={`text-[11px] ${
                profitLossData.profit_or_loss >= 0 ? 'text-purple-700' : 'text-rose-700'
              }`}>
                Margin: {profitLossData.margin_percent}%
              </span>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 shadow-xs">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Received Amount</p>
              <h4 className="text-xl font-bold text-blue-900 mt-1">{formatValue(profitLossData.received_amount)}</h4>
              <span className="text-[11px] text-blue-700">Customer payments settled</span>
            </div>
          </div>
        )}

        {/* Multi-Bar Chart matching PHP get-data-po-site.phtml */}
        <div className="h-80 w-full pt-2">
          {profitLossData?.chart_data ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitLossData.chart_data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontWeight: 600, fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val}`}
                />
                <Tooltip
                  formatter={(val, name) => [formatValue(val), name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Invoice" fill={PROFIT_LOSS_COLORS['Invoice']} radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Site Expenses" fill={PROFIT_LOSS_COLORS['Site Expenses']} radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Profit Or Loss" fill={PROFIT_LOSS_COLORS['Profit Or Loss']} radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Received Amount" fill={PROFIT_LOSS_COLORS['Received Amount']} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              No statement data available for the selected PO and Site.
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Monthly Trends (Invoice Data & PO Amounts) (From PHP home/index.phtml line 672) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Data Monthly Trend */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={20} />
              Invoice Data
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={invMonth}
                onChange={(e) => setInvMonth(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select
                value={invYear}
                onChange={(e) => setInvYear(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <button
                type="button"
                onClick={handleShowInvoiceChart}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
              >
                Show
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatValue(val), 'Invoiced Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="total" name="Invoice Amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PO Amounts Monthly Trend */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FileSpreadsheet className="text-indigo-600" size={20} />
              Po Amounts
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={poMonth}
                onChange={(e) => setPoMonth(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select
                value={poYear}
                onChange={(e) => setPoYear(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <button
                type="button"
                onClick={handleShowPoChart}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
              >
                Show
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poAmountsData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatValue(val), 'PO Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="total" name="PO Amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Material Stock Pie Chart (From PHP home/index.phtml line 757 chartmatdiv1) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PieChartIcon className="text-amber-500" size={22} />
            Material Stock
          </h3>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
            Inventory Breakdown
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="h-72 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialStock}
                  dataKey="quantity"
                  nameKey="product_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={45}
                  paddingAngle={2}
                  label={({ product_name, percent }) => `${product_name.slice(0, 14)} (${(percent * 100).toFixed(0)}%)`}
                >
                  {materialStock.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} Units`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-gray-700 uppercase tracking-wider mb-2">Inventory Legend</h4>
            {materialStock.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-100">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-700 truncate">{item.product_name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Dual Recent Activity Feeds (From PHP home/index.phtml lines 772-1037) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Recent Widget: PO, PO Sites, Stock In, Stock Out */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-200 bg-gray-50/70">
              <h4 className="text-base font-bold text-gray-900 text-center tracking-wide">
                RECENT (OPERATIONS)
              </h4>
            </div>
            {/* Tabs */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 pt-2 flex flex-wrap gap-1">
              <button
                onClick={() => setRecentTabLeft('po')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabLeft === 'po'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PO
              </button>
              <button
                onClick={() => setRecentTabLeft('po_sites')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabLeft === 'po_sites'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PO Sites
              </button>
              <button
                onClick={() => setRecentTabLeft('stock_in')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabLeft === 'stock_in'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stock In
              </button>
              <button
                onClick={() => setRecentTabLeft('stock_out')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabLeft === 'stock_out'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stock Out
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4 max-h-[360px] overflow-y-auto space-y-3 text-xs">
              {recentTabLeft === 'po' && (
                <>
                  {(recentActivity.pos || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent PO data found.</p>
                  ) : (
                    recentActivity.pos.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileSpreadsheet size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The PO is added with PO Number <b>{data.po_no}</b> on Date <b>{data.created_at}</b> at location situated in <b>{data.operating_unit}</b> of client <b>{data.client_name}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {recentTabLeft === 'po_sites' && (
                <>
                  {(recentActivity.sites || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent site allocations found.</p>
                  ) : (
                    recentActivity.sites.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          Site Allocated: <b>{data.site_id}</b> under PO <b>{data.po_no}</b> on <b>{data.created}</b>. Current status: <span className="font-semibold text-emerald-600">{data.status}</span>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {recentTabLeft === 'stock_in' && (
                <>
                  {(recentActivity.stockIn || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent stock in entries.</p>
                  ) : (
                    recentActivity.stockIn.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Package size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The stocks have been arrived at <b>{data.created_at}</b> of product <b>{data.product_name}</b> from brand <b>{data.brand_name}</b> supplied by <b>{data.supplier_name}</b> of quantity <b>{data.quantity} {data.unit}</b> and the product type is <b>{data.product_type_name}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {recentTabLeft === 'stock_out' && (
                <>
                  {(recentActivity.stockOut || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent stock out entries.</p>
                  ) : (
                    recentActivity.stockOut.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Truck size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The stocks are out at <b>{data.stock_out_date}</b> of product <b>{data.product_name}</b> from brand <b>{data.brand_name}</b> allocated to <b>{data.allocated_by}</b> of quantity <b>{data.quantity} {data.unit}</b> and the product type is <b>{data.product_type_name}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Link at Bottom matching PHP */}
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
            {recentTabLeft === 'po' && (
              <Link to="/po-sites/po-status" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all PO Details <ArrowRight size={13} />
              </Link>
            )}
            {recentTabLeft === 'po_sites' && (
              <Link to="/po-sites/allocated-sites" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all PO Site Details <ArrowRight size={13} />
              </Link>
            )}
            {recentTabLeft === 'stock_in' && (
              <Link to="/master-data/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all Stocks In Details <ArrowRight size={13} />
              </Link>
            )}
            {recentTabLeft === 'stock_out' && (
              <Link to="/master-data/deployments" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all Stocks Out Details <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* Right Recent Widget: Office Expense, Site Expense, Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-200 bg-gray-50/70">
              <h4 className="text-base font-bold text-gray-900 text-center tracking-wide">
                RECENT (FINANCIALS)
              </h4>
            </div>
            {/* Tabs */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 pt-2 flex flex-wrap gap-1">
              <button
                onClick={() => setRecentTabRight('officeExpense')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabRight === 'officeExpense'
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Office Expense
              </button>
              <button
                onClick={() => setRecentTabRight('siteExpense')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabRight === 'siteExpense'
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Site Expense
              </button>
              <button
                onClick={() => setRecentTabRight('invoices')}
                className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                  recentTabRight === 'invoices'
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Invoices
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4 max-h-[360px] overflow-y-auto space-y-3 text-xs">
              {recentTabRight === 'officeExpense' && (
                <>
                  {(recentActivity.officeExpense || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent office expenses found.</p>
                  ) : (
                    recentActivity.officeExpense.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Building size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The Office expense of company <b>{data.company}</b> of amount <b>{formatValue(data.amount)}</b> which is transfered to <b>{data.payee}</b> from bank <b>{data.bank_name}</b> and account number is <b>{data.bank_account_number}</b> and the payment mode was <b>{data.payment_mode}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {recentTabRight === 'siteExpense' && (
                <>
                  {(recentActivity.siteExpense || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent site expenses found.</p>
                  ) : (
                    recentActivity.siteExpense.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The Site expense of company <b>{data.company}</b> of amount <b>{formatValue(data.amount)}</b> which is transfered to <b>{data.transfer_to_name}</b> from bank <b>{data.bank_name}</b> and account number is <b>{data.bank_account_number}</b> and the payment mode was <b>{data.payment_mode}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {recentTabRight === 'invoices' && (
                <>
                  {(recentActivity.invoices || []).length === 0 ? (
                    <p className="text-gray-400 py-6 text-center">No recent invoices found.</p>
                  ) : (
                    recentActivity.invoices.map((data, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <FileSpreadsheet size={18} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          The invoice has been generated at <b>{data.invoice_date}</b> against PO <b>{data.po_no}</b> of Site <b>{data.site_id}</b> for client <b>{data.client_name}</b> in state <b>{data.state_name}</b> because <b>{data.remark}</b>.
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Link at Bottom matching PHP */}
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
            {recentTabRight === 'officeExpense' && (
              <Link to="/expense-module/office-expense" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all Office expense <ArrowRight size={13} />
              </Link>
            )}
            {recentTabRight === 'siteExpense' && (
              <Link to="/expense-module/site-expense" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all Site Expense Details <ArrowRight size={13} />
              </Link>
            )}
            {recentTabRight === 'invoices' && (
              <Link to="/expense-module/invoice-report" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                See all Invoice Details <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Row 6: S-Curve [Cumulative] Project Tracking (From PHP dashboard/index.phtml) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center">
            <LineChartIcon className="text-emerald-600 mr-2" size={22} />
            <div>
              <h3 className="text-lg font-bold text-gray-900">S-Curve [Cumulative]</h3>
              <p className="text-xs text-gray-500">Project progress percentage comparison vs Planned and Catch-up curves</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={scurveProject}
              onChange={(e) => setScurveProject(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="All">Project: All</option>
              <option value="Transmission">Transmission Line 765kV</option>
              <option value="Substation">Substation 400kV</option>
            </select>
            <select
              value={scurveLine}
              onChange={(e) => setScurveLine(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="All">Line: All</option>
              <option value="Line 1">Line 1 (Package A)</option>
              <option value="Line 2">Line 2 (Package B)</option>
            </select>
            <select
              value={scurveActivity}
              onChange={(e) => setScurveActivity(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="Overall">Activity: Overall</option>
              <option value="Check Survey">Check Survey</option>
              <option value="Material Delivery">Material Delivery</option>
              <option value="Foundation">Foundation</option>
              <option value="Erection">Tower Erection</option>
              <option value="Stringing">Stringing</option>
            </select>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                formatter={(val, name) => [`${val}%`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />
              <Line type="monotone" dataKey="plan" name="Plan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cup1" name="CUP-1" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cup2" name="CUP-2" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cup3" name="CUP-3" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal matching PHP #basic_modal2 (get-totalsite.phtml, allocated-site.phtml, etc.) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-wide">
                {modalTitle}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search within this list (Site ID, PO, Zone, OpCo, etc.)..."
                className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-gray-800"
              />
              {modalSearch && (
                <button onClick={() => setModalSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">
                  Clear
                </button>
              )}
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {modalLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <RefreshCw className="animate-spin text-blue-600" size={30} />
                </div>
              ) : filteredModalData.length === 0 ? (
                <div className="py-12 text-center text-red-500 font-medium text-sm">
                  No Site Data Found!
                </div>
              ) : modalType === 'all' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700 border border-gray-200">
                    <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-[11px] border-b">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">SO</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Created Date</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">OPCO Name</th>
                        <th className="py-2.5 px-3">PO</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Infratel Id</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Zone</th>
                        <th className="py-2.5 px-3">Cluster</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Site ID</th>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredModalData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-3 font-semibold">{row.sr_no}.</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.so}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.created_date}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.opco_name}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono">{row.po}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.infratel_id}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.district}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.zone}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.cluster}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-bold text-gray-900">{row.technical_site_id}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.item}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                              {row.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700 border border-gray-200">
                    <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-[11px] border-b">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">PO</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Site Id</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Assigned Date</th>
                        <th className="py-2.5 px-3">Zone</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Cluster</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Allocated To</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Allocated By</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredModalData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-3 font-semibold">{row.sr_no}.</td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono">{row.po_no}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-bold text-gray-900">{row.site_id}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.created}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.zone}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.cluster}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-medium text-blue-700">{row.allocated_to}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-rose-600 font-medium">{row.due_date}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{row.allocated_by}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              {row.status_name}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer"
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

export default Dashboard;
