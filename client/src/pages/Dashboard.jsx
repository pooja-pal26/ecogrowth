import React, { useEffect, useState } from 'react';
import { Building2, AlertCircle, Briefcase, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { 
  getTotalSites, 
  getPendingSites, 
  getAllocatedSites, 
  getCompletedSites,
  getSiteExpensesChart,
  getOfficeExpensesChart
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [total, pending, allocated, completed, siteExp, officeExp] = await Promise.all([
          getTotalSites(),
          getPendingSites(),
          getAllocatedSites(),
          getCompletedSites(),
          getSiteExpensesChart(),
          getOfficeExpensesChart()
        ]);
        
        setStats({
          totalSites: total,
          pendingSites: pending,
          allocatedSites: allocated,
          completedSites: completed
        });
        
        setSiteExpenses(siteExp);
        setOfficeExpenses(officeExp);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
