import React, { useState, useContext } from 'react';
import { Menu, Mail, Bell, MessageSquare, User, ChevronDown, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-sm focus:outline-none transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex items-center space-x-3">
          <button className="p-2 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-600 text-white relative hover:opacity-90 shadow-sm transition-all">
            <Mail size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">4</span>
          </button>

          <button className="p-2 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white relative hover:opacity-90 shadow-sm transition-all">
            <Bell size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">4</span>
          </button>

          <button className="p-2 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white relative hover:opacity-90 shadow-sm transition-all">
            <MessageSquare size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">8</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 relative">
        <div
          className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm font-semibold">
            <User size={18} />
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-sm font-bold bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {user?.role_name || 'Department'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider mt-0.5">
              Hi, {user?.name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
          <ChevronDown size={16} className="text-gray-500 hidden md:block" />
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

