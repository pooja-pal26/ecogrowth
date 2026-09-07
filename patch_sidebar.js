const fs = require('fs');
const path = require('path');

const sidebarJsxPath = path.join(__dirname, 'client/src/components/layout/Sidebar.jsx');
let content = fs.readFileSync(sidebarJsxPath, 'utf8');

const invoiceReplacement = `{ 
    name: 'Invoice Module', 
    icon: FileText, 
    hasSubmenu: true,
    subItems: [
      { name: 'Punched Invoices', path: '/invoice-module/punched-invoices' },
      { name: 'Punch Invoice', path: '/invoice-module/punch-invoice' },
      { name: 'Monthly Invoice Report', path: '/invoice-module/monthly-invoice-report' },
      { name: 'Generate Invoice', path: '/invoice-module/generate-invoice' },
      { name: 'Services / Products', path: '/invoice-module/services-products' }
    ]
  }`;

const assetManagementReplacement = `{ 
    name: 'Asset Management', 
    icon: MonitorSmartphone, 
    hasSubmenu: true,
    subItems: [
      { name: 'Asset Type', path: '/asset-management/asset-type' },
      { name: 'Assets', path: '/asset-management/assets' },
      { name: 'Asset assignments', path: '/asset-management/asset-assignments' }
    ]
  }`;

const manageUsersReplacement = `{ 
    name: 'Manage Users', 
    icon: Users, 
    hasSubmenu: true,
    subItems: [
      { name: 'Add New User', path: '/manage-users/add-new-user' },
      { name: 'Active Users', path: '/manage-users/active-users' },
      { name: 'Deactive Users', path: '/manage-users/deactive-users' }
    ]
  }`;

const manageVendorsReplacement = `{ 
    name: 'Manage Vendors', 
    icon: Settings, 
    hasSubmenu: true,
    subItems: [
      { name: 'Add New Vendor', path: '/manage-vendors/add-new-vendor' },
      { name: 'Active Vendors', path: '/manage-vendors/active-vendors' },
      { name: 'Deactive Vendors', path: '/manage-vendors/deactive-vendors' }
    ]
  }`;

const materialStockReplacement = `{ 
    name: 'Material Stock', 
    icon: MuiInventory, 
    hasSubmenu: true,
    subItems: [
      { name: 'Material Stock Report', path: '/material-stock/material-stock-report' },
      { name: 'Stock In', path: '/material-stock/stock-in' },
      { name: 'Stock Out', path: '/material-stock/stock-out' }
    ]
  }`;

const reportsReplacement = `{ 
    name: 'Reports', 
    icon: MuiAssessment, 
    hasSubmenu: true,
    subItems: [
      { name: 'Stock In Report', path: '/reports/stock-in-report' },
      { name: 'Stock Out Report', path: '/reports/stock-out-report' },
      { name: 'Summary Report', path: '/reports/summary-report' }
    ]
  }`;

content = content.replace("{ name: 'Invoice Module', path: '/invoice-module', icon: FileText, hasSubmenu: true }", invoiceReplacement);
content = content.replace("{ name: 'Asset Management', path: '/asset-management', icon: MonitorSmartphone, hasSubmenu: true }", assetManagementReplacement);
content = content.replace("{ name: 'Manage Users', path: '/manage-users', icon: Users, hasSubmenu: true }", manageUsersReplacement);
content = content.replace("{ name: 'Manage Vendors', path: '/manage-vendors', icon: Settings, hasSubmenu: true }", manageVendorsReplacement);
content = content.replace("{ name: 'Material Stock', path: '/material-stock', icon: MuiInventory, hasSubmenu: true }", materialStockReplacement);
content = content.replace("{ name: 'Reports', path: '/reports', icon: MuiAssessment, hasSubmenu: true }", reportsReplacement);

fs.writeFileSync(sidebarJsxPath, content);
console.log('Sidebar.jsx patched successfully');
