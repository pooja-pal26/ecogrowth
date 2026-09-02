import React from 'react';
import { Menu, Mail, Bell, MessageSquare, User, ChevronDown } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded bg-amber-500 text-white hover:bg-amber-600 focus:outline-none transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center space-x-3">
          <button className="p-2 rounded-full bg-slate-500 text-white relative hover:bg-slate-600 transition-colors">
            <Mail size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">4</span>
          </button>
          
          <button className="p-2 rounded-full bg-teal-500 text-white relative hover:bg-teal-600 transition-colors">
            <Bell size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">4</span>
          </button>
          
          <button className="p-2 rounded-full bg-cyan-600 text-white relative hover:bg-cyan-700 transition-colors">
            <MessageSquare size={18} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">8</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white">
            <User size={18} />
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <span className="text-sm font-bold text-amber-500">ADMIN</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
