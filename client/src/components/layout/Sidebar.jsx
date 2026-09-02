import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LineChart, 
  IndianRupee, 
  Laptop, 
  FileText, 
  Book, 
  MonitorSmartphone, 
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Master Data', path: '/master-data', icon: Settings, hasSubmenu: true },
  { name: 'Expense Dashboard', path: '/expense-dashboard', icon: LineChart },
  { name: 'Expense Module', path: '/expense-module', icon: IndianRupee, hasSubmenu: true },
  { name: 'Company', path: '/company', icon: Laptop, hasSubmenu: true },
  { name: 'Invoice Module', path: '/invoice-module', icon: FileText, hasSubmenu: true },
  { name: 'PO & Sites', path: '/po-sites', icon: Book, hasSubmenu: true },
  { name: 'Asset Management', path: '/asset-management', icon: MonitorSmartphone, hasSubmenu: true },
  { name: 'Manage Users', path: '/manage-users', icon: Users, hasSubmenu: true },
  { name: 'Manage Vendors', path: '/manage-vendors', icon: Settings, hasSubmenu: true },
];

const Sidebar = ({ isOpen }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside 
      className={`bg-[#2a2c32] text-gray-300 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      } lg:w-64 fixed lg:static h-screen z-40`}
    >
      <div className="h-16 flex items-center px-4 bg-white border-b border-r border-gray-200">
        <div className="flex items-center space-x-2 text-black">
           {/* Logo placeholder matching GenstreeAi */}
           <div className="flex items-center">
             <div className="font-bold text-2xl tracking-tighter">
               <span className="text-black">Genstree</span>
               <span className="text-blue-600">Ai</span>
             </div>
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.hasSubmenu ? (
                <div>
                  <button 
                    onClick={() => toggleMenu(item.name)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#3d3f45] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={18} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {openMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {/* Empty Submenu for now */}
                  {openMenus[item.name] && (
                    <ul className="bg-[#1f2125] py-2">
                      <li className="px-10 py-2 text-sm hover:text-white cursor-pointer">
                        Sub Item 1
                      </li>
                      <li className="px-10 py-2 text-sm hover:text-white cursor-pointer">
                        Sub Item 2
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-4 py-3 transition-colors ${
                      isActive ? 'bg-[#3d3f45] text-white border-l-4 border-blue-500' : 'hover:bg-[#3d3f45]'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
