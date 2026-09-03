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

import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';

const MuiInventory = (props) => <InventoryIcon style={{ fontSize: props.size }} />;
const MuiAssessment = (props) => <AssessmentIcon style={{ fontSize: props.size }} />;

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    name: 'Master Data', 
    icon: Settings, 
    hasSubmenu: true,
    subItems: [
      { name: 'State List', path: '/master-data/state-list' },
      { name: 'Client Master Data', path: '/master-data/client-master-data' },
      { name: 'Company Vendor', path: '/master-data/company-vendor' },
      { name: 'Material Suppliers (Site)', path: '/master-data/material-suppliers' },
      { name: 'Transporters', path: '/master-data/transporters' },
      { name: 'State For', path: '/master-data/state-for' },
      { name: 'Bank Name List', path: '/master-data/bank-name-list' },
      { name: 'Site Documents', path: '/master-data/site-documents' },
      { name: 'Add Geo Location', path: '/master-data/geo-location' },
      { name: 'Payment Modes', path: '/master-data/payment-modes' },
      { name: 'Bank Accounts', path: '/master-data/bank-accounts' },
      { 
        name: 'Work Master Data', 
        icon: Settings, 
        hasSubmenu: true,
        subItems: [
          { name: 'Work For Site Of', path: '/master-data/work-master-data/work-for-site-of' },
          { name: 'Nature Of Work', path: '/master-data/work-master-data/nature-of-work' },
          { name: 'Site Type', path: '/master-data/work-master-data/site-type' },
          { name: 'Work', path: '/master-data/work-master-data/work' },
          { name: 'Work Description', path: '/master-data/work-master-data/work-description' }
        ]
      },
      { name: 'Expense Master Data', icon: IndianRupee, hasSubmenu: true, subItems: [] },
      { name: 'Debit Accounts', icon: IndianRupee, hasSubmenu: true, subItems: [] },
      { name: 'Product Master Data', icon: Settings, hasSubmenu: true, subItems: [] },
      { name: 'Vendor Master Data', icon: Settings, hasSubmenu: true, subItems: [] },
      { name: 'Employee Roles', icon: Users, hasSubmenu: true, subItems: [] }
    ]
  },
  { name: 'Expense Dashboard', path: '/expense-dashboard', icon: LineChart },
  { name: 'Expense Module', path: '/expense-module', icon: IndianRupee, hasSubmenu: true },
  { name: 'Company', path: '/company', icon: Laptop, hasSubmenu: true },
  { name: 'Invoice Module', path: '/invoice-module', icon: FileText, hasSubmenu: true },
  { 
    name: 'PO & Sites', 
    icon: Book, 
    hasSubmenu: true,
    subItems: [
      {
        name: 'PO',
        hasSubmenu: true,
        subItems: [
          { name: 'Add New PO', path: '/po-sites/po/add-new-po' },
          { name: 'Add New PO Sites', path: '/po-sites/po/add-new-po-sites' },
          { name: 'PO Details', path: '/po-sites/po/po-details' },
          { name: 'PO Status', path: '/po-sites/po/po-status' }
        ]
      },
      {
        name: 'Sites',
        hasSubmenu: true,
        subItems: [
          { name: 'Import Site Data', path: '/po-sites/sites/import-site-data' },
          { name: 'Allocate Site', path: '/po-sites/sites/allocate-site' },
          { name: 'Allocated Site List', path: '/po-sites/sites/allocated-site-list' },
          { name: 'Allocated Site Status', path: '/po-sites/sites/allocated-site-status' }
        ]
      },
      {
        name: 'Incidents Reporting',
        hasSubmenu: true,
        subItems: [
          { name: 'Incidents Report', path: '/po-sites/incidents-reporting/incidents-report' },
          { name: 'Report New Incident', path: '/po-sites/incidents-reporting/report-new-incident' }
        ]
      }
    ]
  },
  { name: 'Asset Management', path: '/asset-management', icon: MonitorSmartphone, hasSubmenu: true },
  { name: 'Manage Users', path: '/manage-users', icon: Users, hasSubmenu: true },
  { name: 'Manage Vendors', path: '/manage-vendors', icon: Settings, hasSubmenu: true },
  { name: 'Material Stock', path: '/material-stock', icon: MuiInventory, hasSubmenu: true },
  { name: 'Reports', path: '/reports', icon: MuiAssessment, hasSubmenu: true }
];

const MenuItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const paddingLeft = depth === 0 ? 'px-4' : `pl-${4 + depth * 4} pr-4`;

  if (item.hasSubmenu) {
    return (
      <div>
        <button 
          onClick={toggleMenu}
          className={`w-full flex items-center justify-between ${paddingLeft} py-3 hover:bg-[#3d3f45] transition-colors`}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <item.icon size={18} />}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {isOpen && (
          <ul className="bg-[#1f2125]">
            {item.subItems ? item.subItems.map((subItem) => (
              <li key={subItem.name}>
                <MenuItem item={subItem} depth={depth + 1} />
              </li>
            )) : (
              <li className={`pl-${4 + (depth + 1) * 4} py-2 text-sm text-gray-500`}>
                Coming Soon
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }

  return (
    <NavLink 
      to={item.path}
      className={({ isActive }) => 
        `flex items-center space-x-3 ${paddingLeft} py-3 transition-colors ${
          isActive ? 'bg-[#3d3f45] text-white border-l-4 border-blue-500' : 'hover:bg-[#3d3f45] hover:text-white'
        }`
      }
    >
      {item.icon && <item.icon size={18} />}
      <span className="text-sm font-medium">{item.name}</span>
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  return (
    <aside 
      className={`bg-[#2a2c32] text-gray-300 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      } lg:w-64 fixed lg:static h-screen z-40`}
    >
      <div className="h-16 flex items-center px-4 bg-white border-b border-r border-gray-200 shrink-0">
        <div className="flex items-center space-x-2 text-black">
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
              <MenuItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
