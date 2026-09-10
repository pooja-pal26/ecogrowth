import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  getSiteExpensesChart,
  getOfficeExpensesChart,
  getMaterialStockChart,
  getInvoiceDataChart,
  getPoAmountsChart,
  getRecentActivity
} from '../services/dashboardService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const DailyUpdateDashboard = () => {
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  const [materialStock, setMaterialStock] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [poAmounts, setPoAmounts] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ pos: [], sites: [], stockIn: [], stockOut: [] });
  
  const [activeTabLeft, setActiveTabLeft] = useState('po');
  const [activeTabRight, setActiveTabRight] = useState('officeExp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          siteExp, officeExp, 
          matStock, invData, poData, recentAct
        ] = await Promise.all([
          getSiteExpensesChart(),
          getOfficeExpensesChart(),
          getMaterialStockChart(),
          getInvoiceDataChart(),
          getPoAmountsChart(),
          getRecentActivity()
        ]);
        
        setSiteExpenses(siteExp);
        setOfficeExpenses(officeExp);
        setMaterialStock(matStock);
        setInvoiceData(invData);
        setPoAmounts(poData);
        setRecentActivity(recentAct);
      } catch (error) {
        console.error('Error fetching dashboard details:', error);
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
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Expenses Section */}
        <div className="bg-[#a4e117] rounded-md px-4 py-3 flex justify-between items-center mb-8 shadow-sm">
            <h2 className="text-xl font-medium text-gray-800">Expenses</h2>
            <div className="flex items-center space-x-2">
                <input type="text" className="px-3 py-1.5 rounded bg-gray-100 border-none outline-none text-gray-700 text-sm w-32 text-center" defaultValue="10/09/2026" />
                <button className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Show</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Site Expense Chart */}
          <div className="bg-white">
            <div className="flex items-center justify-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Site Expense</h3>
            </div>
            <div className="h-48 border-b-2 border-gray-100 pb-4 relative">
               <span className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 font-bold text-sm">Amount</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} dy={10} angle={-90} textAnchor="end" />
                  <YAxis hide={true} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" name="Expense Amount" fill="#5298b8" radius={[0, 0, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
               <span className="absolute left-6 bottom-4 text-xs font-medium">0</span>
            </div>
          </div>

          {/* Office Expense Chart */}
          <div className="bg-white">
            <div className="flex items-center justify-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Office Expense</h3>
            </div>
            <div className="h-48 border-b-2 border-gray-100 pb-4 relative">
               <span className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 font-bold text-sm">Amount</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officeExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} dy={10} angle={-90} textAnchor="end" />
                  <YAxis hide={true} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" name="Expense Amount" fill="#5298b8" radius={[0, 0, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
               <span className="absolute left-6 bottom-4 text-xs font-medium">0</span>
            </div>
          </div>
        </div>

        {/* Recents Section */}
        <div className="bg-[#a4e117] rounded-md px-4 py-3 flex items-center mb-6 shadow-sm">
            <h2 className="text-xl font-medium text-gray-800">Recents</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <nav className="flex bg-[#9366d6] text-white overflow-x-auto" aria-label="Tabs Left">
                  {['po', 'sites', 'stockIn', 'stockOut'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTabLeft(tab)}
                      className={`py-3 px-6 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                        activeTabLeft === tab
                          ? 'bg-white text-gray-800'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      {tab === 'po' ? 'PO' : tab === 'sites' ? 'PO Sites' : tab === 'stockIn' ? 'Stock In' : 'Stock Out'}
                    </button>
                  ))}
                </nav>
                <div className="p-4 h-32 flex items-start bg-white border-t border-gray-100">
                    <div className="mr-4 text-gray-700 mt-2">
                        <Activity className="w-10 h-10" />
                    </div>
                    <div className="mt-2">
                        <button className="bg-[#5bc0de] hover:bg-[#46b8da] text-white px-4 py-2 text-sm font-medium rounded transition-colors flex items-center shadow-sm">
                            See All PO Details <span className="ml-2 font-bold">&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <nav className="flex bg-[#9366d6] text-white overflow-x-auto" aria-label="Tabs Right">
                  {['officeExp', 'siteExp', 'invoices', 'funds'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTabRight(tab)}
                      className={`py-3 px-6 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                        activeTabRight === tab
                          ? 'bg-white text-gray-800'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      {tab === 'officeExp' ? 'Office Expense' : tab === 'siteExp' ? 'Site Expense' : tab === 'invoices' ? 'Invoices' : 'Funds'}
                    </button>
                  ))}
                </nav>
                <div className="p-4 h-32 flex items-start bg-white border-t border-gray-100">
                    <div className="mr-4 text-gray-700 mt-2">
                        <Activity className="w-10 h-10" />
                    </div>
                    <div className="mt-2">
                        <button className="bg-[#5bc0de] hover:bg-[#46b8da] text-white px-4 py-2 text-sm font-medium rounded transition-colors flex items-center shadow-sm">
                            See All Office Expense <span className="ml-2 font-bold">&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Keeping original missing dashboards at the bottom just in case */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-1 mt-12 border-t pt-8">Additional Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
      </div>
    </div>
  );
};

export default DailyUpdateDashboard;
