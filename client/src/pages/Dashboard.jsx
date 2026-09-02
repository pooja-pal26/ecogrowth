import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">EcoGrowth Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.name || user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Welcome back!</h2>
          <p className="text-gray-600">
            You are successfully authenticated via JWT stored in an HTTP-only cookie.
            This represents the MERN replacement for the legacy PHP /home dashboard.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
