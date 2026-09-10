import os

filepath = 'client/src/pages/Dashboard.jsx'
content = """import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  Briefcase, 
  CheckCircle, 
  BarChart3, 
  Users, 
  FileText, 
  Package, 
  ShoppingCart, 
  Truck,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { 
  getTotalSites, 
  getPendingSites, 
  getAllocatedSites, 
  getCompletedSites,
  getSiteExpensesChart,
  getOfficeExpensesChart,
  getTotalAssets,
  getTotalInvoices,
  getTotalMaterials,
  getTotalUsers,
  getTotalVendors,
  getMaterialStockChart,
  getInvoiceDataChart,
  getPoAmountsChart,
  getRecentActivity
} from '../services/dashboardService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSites: null,
    pendingSites: null,
    allocatedSites: null,
    completedSites: null,
    totalUsers: null,
    totalInvoices: null,
    totalAssets: null,
    totalMaterials: null,
    totalVendors: null,
  });
  
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  const [materialStock, setMaterialStock] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [poAmounts, setPoAmounts] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ pos: [], sites: [], stockIn: [], stockOut: [] });
  
  const [activeTab, setActiveTab] = useState('po');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          total, pending, allocated, completed, 
          siteExp, officeExp, 
          users, invoices, assets, materials, vendors,
          matStock, invData, poData, recentAct
        ] = await Promise.all([
          getTotalSites(),
          getPendingSites(),
          getAllocatedSites(),
          getCompletedSites(),
          getSiteExpensesChart(),
          getOfficeExpensesChart(),
          getTotalUsers(),
          getTotalInvoices(),
          getTotalAssets(),
          getTotalMaterials(),
          getTotalVendors(),
          getMaterialStockChart(),
          getInvoiceDataChart(),
          getPoAmountsChart(),
          getRecentActivity()
        ]);
        
        setStats({
          totalSites: total,
          pendingSites: pending,
          allocatedSites: allocated,
          completedSites: completed,
          totalUsers: users,
          totalInvoices: invoices,
          totalAssets: assets,
          totalMaterials: materials,
          totalVendors: vendors
        });
        
        setSiteExpenses(siteExp);
        setOfficeExpenses(officeExp);
        setMaterialStock(matStock);
        setInvoiceData(invData);
        setPoAmounts(poData);
        setRecentActivity(recentAct);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Infrastructure Overview</h1>
          <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">Welcome back, EcoGrowth Admin</p>
        </div>

        {/* Global Summary Stats */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-1">Global Summaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <DashboardCard title="Total Users" value={stats.totalUsers} icon={Users} colorClass="bg-blue-500"/>
          <DashboardCard title="Total Invoices" value={stats.totalInvoices} icon={FileText} colorClass="bg-blue-500"/>
          <DashboardCard title="Total Assets" value={stats.totalAssets} icon={Package} colorClass="bg-blue-500"/>
          <DashboardCard title="Materials Stock" value={stats.totalMaterials} icon={ShoppingCart} colorClass="bg-blue-500"/>
          <DashboardCard title="Registered Vendors" value={stats.totalVendors} icon={Truck} colorClass="bg-blue-500"/>
        </div>

        {/* Project Operations */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-1">Project Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <DashboardCard title="Total Sites" value={stats.totalSites} icon={Building2} colorClass="bg-blue-600"/>
          <DashboardCard title="Allocated Sites" value={stats.allocatedSites} icon={Briefcase} colorClass="bg-blue-600"/>
          <DashboardCard title="Pending Sites" value={stats.pendingSites} icon={AlertCircle} colorClass="bg-amber-500"/>
          <DashboardCard title="Completed Sites" value={stats.completedSites} icon={CheckCircle} colorClass="bg-emerald-500"/>
        </div>

        {/* Expense Charts */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-1">Financial Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Site Expense Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center mb-6">
              <BarChart3 className="text-blue-500 mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Site Expense (Monthly Spend)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="total" name="Expense Amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Office Expense Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center mb-6">
              <BarChart3 className="text-blue-600 mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Office Expense (Last 6 Months)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officeExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="total" name="Expense Amount" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Missing Dashboards from PHP */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-1">Additional Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Invoice Data */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center mb-6">
              <FileText className="text-blue-500 mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Invoice Data</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="total" name="Invoice Amount" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PO Amounts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center mb-6">
              <FileText className="text-blue-600 mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">PO Amounts</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poAmounts} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="total" name="PO Amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Material Stock */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center mb-6">
              <PieChartIcon className="text-blue-500 mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Material Stock</h3>
            </div>
            <div className="h-96">
              {materialStock.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialStock}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="quantity"
                      nameKey="product_name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {materialStock.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No material data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex items-center p-6 border-b border-gray-100">
            <Activity className="text-blue-500 mr-2 w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['po', 'sites', 'stockIn', 'stockOut'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'po' ? 'PO' : tab === 'sites' ? 'PO Sites' : tab === 'stockIn' ? 'Stock In' : 'Stock Out'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity[activeTab]?.length > 0 ? (
                    recentActivity[activeTab].map((item, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeTab === 'po' && <span>PO No: <span className="font-semibold">{item.po_no}</span> - Amount: {item.po_amount}</span>}
                          {activeTab === 'sites' && <span>Site: <span className="font-semibold">{item.site_id}</span> - Status: {item.status === 1 ? 'Active' : 'Inactive'}</span>}
                          {activeTab === 'stockIn' && <span>Product: <span className="font-semibold">{item.product_name}</span> - Qty: {item.quantity}</span>}
                          {activeTab === 'stockOut' && <span>Product: <span className="font-semibold">{item.product_name}</span> - Qty: {item.quantity}</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No recent activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
"""
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard component rewritten successfully.")
