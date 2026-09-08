import React, { useEffect, useState } from 'react';
import { Building2, AlertCircle, Briefcase, CheckCircle, BarChart3, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Sites" 
            value={stats.totalSites} 
            icon={Building2} 
            colorClass="bg-blue-500 shadow-blue-500/50 shadow-lg"
          />
          <DashboardCard 
            title="Pending Sites" 
            value={stats.pendingSites} 
            icon={AlertCircle} 
            colorClass="bg-amber-500 shadow-amber-500/50 shadow-lg"
          />
          <DashboardCard 
            title="Allocated Sites" 
            value={stats.allocatedSites} 
            icon={Briefcase} 
            colorClass="bg-indigo-500 shadow-indigo-500/50 shadow-lg"
          />
          <DashboardCard 
            title="Completed Sites" 
            value={stats.completedSites} 
            icon={CheckCircle} 
            colorClass="bg-emerald-500 shadow-emerald-500/50 shadow-lg"
          />
        </div>

        {/* In Progress Sites - as requested, uses pending sites count */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="In Progress" 
            value={stats.pendingSites} 
            icon={TrendingUp} 
            colorClass="bg-purple-500 shadow-purple-500/50 shadow-lg"
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
      </div>
    </div>
  );
};

export default Dashboard;
