import React, { useState, useContext, useMemo } from 'react';
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
import { AuthContext } from '../../context/AuthContext';

const MuiInventory = (props) => <InventoryIcon style={{ fontSize: props.size }} />;
const MuiAssessment = (props) => <AssessmentIcon style={{ fontSize: props.size }} />;

const navItems = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'management', 'project_manager', 'accountant', 'supervisor', 'hr']
  },
  { 
    name: 'Master Data', 
    icon: Settings, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'accountant'],
    subItems: [
      { name: 'State List', path: '/master-data/state-list', allowedRoles: ['admin', 'management'] },
      { name: 'Client Master Data', path: '/master-data/client-master-data', allowedRoles: ['admin', 'management'] },
      { name: 'Company Vendor', path: '/master-data/company-vendor', allowedRoles: ['admin', 'management'] },
      { name: 'Material Suppliers (Site)', path: '/master-data/material-suppliers', allowedRoles: ['admin', 'management'] },
      { name: 'Transporters', path: '/master-data/transporters', allowedRoles: ['admin', 'management'] },
      { name: 'State For', path: '/master-data/state-for', allowedRoles: ['admin', 'management'] },
      { name: 'Bank Name List', path: '/master-data/bank-name-list', allowedRoles: ['admin', 'management', 'accountant'] },
      { name: 'Site Documents', path: '/master-data/site-documents', allowedRoles: ['admin', 'management'] },
      { name: 'Add Geo Location', path: '/master-data/geo-location', allowedRoles: ['admin', 'management'] },
      { name: 'Payment Modes', path: '/master-data/payment-modes', allowedRoles: ['admin', 'management', 'accountant'] },
      { name: 'Bank Accounts', path: '/master-data/bank-accounts', allowedRoles: ['admin', 'management', 'accountant'] },
      { 
        name: 'Work Master Data', 
        icon: Settings, 
        hasSubmenu: true,
        allowedRoles: ['admin', 'management'],
        subItems: [
          { name: 'Work For Site Of', path: '/master-data/work-master-data/work-for-site-of' },
          { name: 'Nature Of Work', path: '/master-data/work-master-data/nature-of-work' },
          { name: 'Site Type', path: '/master-data/work-master-data/site-type' },
          { name: 'Work', path: '/master-data/work-master-data/work' },
          { name: 'Work Description', path: '/master-data/work-master-data/work-description' }
        ]
      },
      { 
        name: 'Expense Master Data', 
        icon: IndianRupee, 
        hasSubmenu: true, 
        allowedRoles: ['admin', 'management', 'accountant'],
        subItems: [
          { name: 'Expense Type', path: '/master-data/expense-master-data/expense-type' },
          { name: 'Expense In', path: '/master-data/expense-master-data/expense-in' },
          { name: 'Expense For', path: '/master-data/expense-master-data/expense-for' }
        ] 
      },
      { 
        name: 'Debit Accounts', 
        icon: IndianRupee, 
        hasSubmenu: true, 
        allowedRoles: ['admin', 'management', 'accountant'],
        subItems: [
          { name: 'Debit Account Details', path: '/master-data/debit-accounts/debit-account-details' }
        ] 
      },
      { 
        name: 'Product Master Data', 
        icon: Settings, 
        hasSubmenu: true, 
        allowedRoles: ['admin', 'management'],
        subItems: [
          { name: 'Product Suppliers', path: '/master-data/product-master-data/product-suppliers' },
          { name: 'Product (s)', path: '/master-data/product-master-data/product-list' },
          { name: 'Product Type', path: '/master-data/product-master-data/product-type' },
          { name: 'Product Unit', path: '/master-data/product-master-data/product-unit' },
          { name: 'Product Brand', path: '/master-data/product-master-data/product-brand' }
        ] 
      },
      { 
        name: 'Vendor Master Data', 
        icon: Settings, 
        hasSubmenu: true, 
        allowedRoles: ['admin', 'management'],
        subItems: [
          { name: 'Vendor Experience', path: '/master-data/vendor-master-data/vendor-experience' },
          { name: 'Organization Type', path: '/master-data/vendor-master-data/organization-type' },
          { name: 'Association Years', path: '/master-data/vendor-master-data/association-years' },
          { name: 'Geographical Presense', path: '/master-data/vendor-master-data/geographical-presence' },
          { name: 'Major Clients', path: '/master-data/vendor-master-data/major-clients' },
          { name: 'Team Strength', path: '/master-data/vendor-master-data/team-strength' },
          { name: 'Annual Turnover', path: '/master-data/vendor-master-data/annual-turnover' },
          { name: 'Work Handle Amount', path: '/master-data/vendor-master-data/work-handle-amount' }
        ] 
      },
      { 
        name: 'Employee Roles', 
        icon: Users, 
        hasSubmenu: true, 
        allowedRoles: ['admin', 'management'],
        subItems: [
          { name: 'Roles', path: '/master-data/employee-roles/roles' },
          { name: 'Role Types', path: '/master-data/employee-roles/role-types' }
        ] 
      }
    ]
  },
  { 
    name: 'Expense Dashboard', 
    path: '/expense-dashboard', 
    icon: LineChart,
    allowedRoles: ['admin', 'management', 'accountant']
  },
  { 
    name: 'Expense Module', 
    icon: IndianRupee, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'accountant', 'supervisor'],
    subItems: [
      { name: 'Create New Expense', path: '/expense-module/create-new-expense', allowedRoles: ['admin', 'management', 'accountant', 'supervisor'] },
      { name: 'Site Expense Report', path: '/expense-module/site-expense-report', allowedRoles: ['admin', 'management', 'accountant'] },
      { name: "Invoice's Report", path: '/expense-module/invoice-report', allowedRoles: ['admin', 'management', 'accountant'] },
      { name: 'Office Expense Report', path: '/expense-module/office-expense-report', allowedRoles: ['admin', 'management', 'accountant'] },
      { name: 'B2B Fund Transfer Report', path: '/expense-module/b2b-fund-transfer-report', allowedRoles: ['admin', 'management', 'accountant'] }
    ]
  },
  { 
    name: 'Company', 
    icon: Laptop, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management'],
    subItems: [
      { name: 'Company details', path: '/company/company-details' }
    ]
  },
  { 
    name: 'Invoice Module', 
    icon: FileText, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'accountant'],
    subItems: [
      { name: 'Punched Invoices', path: '/invoice-module/punched-invoices' },
      { name: 'Punch Invoice', path: '/invoice-module/punch-invoice' },
      { name: 'Monthly Invoice Report', path: '/invoice-module/monthly-invoice-report' },
      { name: 'Generate Invoice', path: '/invoice-module/generate-invoice' },
      { name: 'Services / Products', path: '/invoice-module/services-products' }
    ]
  },
  { 
    name: 'PO & Sites', 
    icon: Book, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'],
    subItems: [
      {
        name: 'PO',
        hasSubmenu: true,
        allowedRoles: ['admin', 'management', 'project_manager'],
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
        allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'],
        subItems: [
          { name: 'Import Site Data', path: '/po-sites/sites/import-site-data', allowedRoles: ['admin', 'management', 'project_manager'] },
          { name: 'Allocate Site', path: '/po-sites/sites/allocate-site', allowedRoles: ['admin', 'management', 'project_manager'] },
          { name: 'Allocated Site List', path: '/po-sites/sites/allocated-site-list', allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'] },
          { name: 'Allocated Site Status', path: '/po-sites/sites/allocated-site-status', allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'] }
        ]
      },
      {
        name: 'Incidents Reporting',
        hasSubmenu: true,
        allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'],
        subItems: [
          { name: 'Incidents Report', path: '/po-sites/incidents-reporting/incidents-report' },
          { name: 'Report New Incident', path: '/po-sites/incidents-reporting/report-new-incident' }
        ]
      }
    ]
  },
  { 
    name: 'Asset Management', 
    icon: MonitorSmartphone, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management'],
    subItems: [
      { name: 'Asset Type', path: '/asset-management/asset-type' },
      { name: 'Assets', path: '/asset-management/assets' },
      { name: 'Asset assignments', path: '/asset-management/asset-assignments' }
    ]
  },
  { 
    name: 'Manage Users', 
    icon: Users, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'hr'],
    subItems: [
      { name: 'Add New User', path: '/manage-users/add-new-user' },
      { name: 'Active Users', path: '/manage-users/active-users' },
      { name: 'Deactive Users', path: '/manage-users/deactive-users' }
    ]
  },
  { 
    name: 'Manage Vendors', 
    icon: Settings, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'project_manager', 'accountant'],
    subItems: [
      { name: 'Add New Vendor', path: '/manage-vendors/add-new-vendor' },
      { name: 'Active Vendors', path: '/manage-vendors/active-vendors' },
      { name: 'Deactive Vendors', path: '/manage-vendors/deactive-vendors' }
    ]
  },
  { 
    name: 'Material Stock', 
    icon: MuiInventory, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'project_manager', 'supervisor', 'accountant'],
    subItems: [
      { name: 'Material Stock Report', path: '/material-stock/material-stock-report', allowedRoles: ['admin', 'management', 'project_manager', 'accountant'] },
      { name: 'Stock In', path: '/material-stock/stock-in', allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'] },
      { name: 'Stock Out', path: '/material-stock/stock-out', allowedRoles: ['admin', 'management', 'project_manager', 'supervisor'] }
    ]
  },
  { 
    name: 'Reports', 
    icon: MuiAssessment, 
    hasSubmenu: true,
    allowedRoles: ['admin', 'management', 'project_manager', 'accountant'],
    subItems: [
      { name: 'Stock In Report', path: '/reports/stock-in-report' },
      { name: 'Stock Out Report', path: '/reports/stock-out-report' },
      { name: 'Summary Report', path: '/reports/summary-report' }
    ]
  }
];

const filterMenuItems = (items, roleKey, roleId, isAdmin) => {
  if (isAdmin) return items;

  return items.reduce((acc, item) => {
    // Check if this item has allowedRoles defined
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      const allowed = item.allowedRoles.some(r => {
        const target = String(r).toLowerCase();
        return target === roleKey || target === roleId;
      });
      if (!allowed) return acc;
    }

    // If item has subItems, filter them recursively
    if (item.subItems) {
      const filteredSubs = filterMenuItems(item.subItems, roleKey, roleId, isAdmin);
      if (filteredSubs.length > 0) {
        acc.push({ ...item, subItems: filteredSubs });
      }
    } else {
      acc.push(item);
    }

    return acc;
  }, []);
};

const MenuItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const paddingLeft = `${1 + depth * 1.25}rem`;

  if (item.hasSubmenu) {
    return (
      <div>
        <button 
          onClick={toggleMenu}
          className="w-full flex items-center justify-between pr-4 py-3 text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200"
          style={{ paddingLeft }}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <item.icon size={18} className="text-white/90" />}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          {isOpen ? <ChevronDown size={16} className="text-white/80" /> : <ChevronRight size={16} className="text-white/80" />}
        </button>
        {isOpen && (
          <ul className="bg-black/20 backdrop-blur-md border-l border-white/10">
            {item.subItems ? item.subItems.map((subItem) => (
              <li key={subItem.name}>
                <MenuItem item={subItem} depth={depth + 1} />
              </li>
            )) : (
              <li 
                className="py-2 text-sm text-white/60 pr-4 italic"
                style={{ paddingLeft: `${1 + (depth + 1) * 1.25}rem` }}
              >
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
        `flex items-center space-x-3 pr-4 py-3 transition-all duration-200 ${
          isActive 
            ? 'bg-white/25 text-white font-semibold shadow-sm backdrop-blur-md border-l-4 border-white' 
            : 'text-white/85 hover:bg-white/15 hover:text-white'
        }`
      }
      style={{ paddingLeft: depth === 0 ? paddingLeft : `calc(${paddingLeft} - 4px)` }}
    >
      {item.icon && <item.icon size={18} className="text-white/90" />}
      <span className="text-sm font-medium">{item.name}</span>
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  const { user } = useContext(AuthContext);

  const roleKey = (user?.role_key || '').toLowerCase();
  const roleId = String(user?.role || '');
  const isAdmin = roleKey === 'admin' || roleId === '1' || roleId === '17' || !user;

  const accessibleNavItems = useMemo(() => {
    return filterMenuItems(navItems, roleKey, roleId, isAdmin);
  }, [roleKey, roleId, isAdmin]);

  return (
    <aside 
      className={`text-white transition-all duration-300 flex flex-col shrink-0 h-screen shadow-2xl ${
        isOpen 
          ? 'w-64 fixed inset-y-0 left-0 lg:static z-40' 
          : 'w-0 overflow-hidden fixed inset-y-0 left-0 lg:static z-40'
      }`}
      style={{
        background: 'linear-gradient(175deg, #10b981 0%, #0d9488 15%, #0284c7 45%, #6366f1 75%, #a855f7 100%)'
      }}
    >
      <div className="h-16 flex items-center justify-center px-4 bg-white border-b border-r border-gray-200 shrink-0">
        <NavLink to="/" className="flex items-center justify-center">
          <img 
            src="/assets/echo_growth.png" 
            alt="GenstreeAi" 
            className="h-10 w-auto max-w-[200px] object-contain" 
          />
        </NavLink>
      </div>
      
      <div className="flex-1 overflow-y-auto py-3 custom-sidebar-scroll">
        <ul className="space-y-0.5">
          {accessibleNavItems.map((item) => (
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
