import React, { useEffect, useState } from 'react';
import { Building2, AlertCircle, Briefcase, CheckCircle, BarChart3, TrendingUp, LineChart as LineChartIcon, Server } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { 
  getTotalSites, 
  getPendingSites, 
  getAllocatedSites, 
  getCompletedSites,
  getSiteExpensesChart,
  getOfficeExpensesChart,
  getScurveData
} from '../services/dashboardService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSites: null,
    pendingSites: null,
    allocatedSites: null,
    completedSites: null,
  });
  
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  const [sCurveData, setSCurveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [total, pending, allocated, completed, siteExp, officeExp, scurve] = await Promise.all([
          getTotalSites(),
          getPendingSites(),
          getAllocatedSites(),
          getCompletedSites(),
          getSiteExpensesChart(),
          getOfficeExpensesChart(),
          getScurveData()
        ]);
        
        setStats({
          totalSites: total,
          pendingSites: pending,
          allocatedSites: allocated,
          completedSites: completed
        });
        
        setSiteExpenses(siteExp);
        setOfficeExpenses(officeExp);
        setSCurveData(scurve);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, EcoGrowth Admin</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-end gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-1">From date</label>
                <input type="date" className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-500 outline-none w-40" />
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-1">To date</label>
                <input type="date" className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-500 outline-none w-40" />
            </div>
            <div className="flex flex-col flex-grow max-w-xs">
                <label className="text-sm font-semibold text-gray-800 mb-1">Site Type</label>
                <select className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 outline-none w-full">
                    <option>Select Site Type</option>
                </select>
            </div>
            <div className="flex gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors">Submit</button>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded font-medium transition-colors">Reset</button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <DashboardCard 
            title="Total Sites" 
            value={stats.totalSites} 
            icon={Building2} 
            colorClass="bg-[#6b52e6] shadow-[#6b52e6]/50 shadow-lg"
          />
          <DashboardCard 
            title="Pending Sites" 
            value={stats.pendingSites} 
            icon={AlertCircle} 
            colorClass="bg-red-600 shadow-red-600/50 shadow-lg"
          />
          <DashboardCard 
            title="Allocated Sites" 
            value={stats.allocatedSites} 
            icon={Briefcase} 
            colorClass="bg-blue-500 shadow-blue-500/50 shadow-lg"
          />
          <DashboardCard 
            title="In Progress" 
            value={stats.pendingSites} // Assuming we mock this or use pending for now
            icon={TrendingUp} 
            colorClass="bg-[#f0ad4e] shadow-[#f0ad4e]/50 shadow-lg"
          />
          <DashboardCard 
            title="Completed Sites" 
            value={stats.completedSites} 
            icon={CheckCircle} 
            colorClass="bg-emerald-500 shadow-emerald-500/50 shadow-lg"
          />
        </div>

        {/* S-Curve Chart (From PHP Dashboard) */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <LineChartIcon className="text-emerald-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">S-Curve [Cumulative]</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">Project: All</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">Line: All</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">Activity: Overall</span>
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="plan" name="Plan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="cup1" name="CUP-1" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="cup2" name="CUP-2" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="cup3" name="CUP-3" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Site Expense Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <BarChart3 className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Site Expense</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    dataKey="total" 
                    name="Expense Amount" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Office Expense Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <BarChart3 className="text-indigo-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Office Expense (Last 6 Months)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officeExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    dataKey="total" 
                    name="Expense Amount" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Floating Action Button for Daily Update Dashboard */}
        <div className="fixed bottom-10 right-10">
          <Link to="/home/daily-update-dashboard" className="bg-[#6b52e6] hover:bg-[#5842c2] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            <Server className="w-8 h-8" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
