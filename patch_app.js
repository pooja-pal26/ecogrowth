const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'client/src/App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

const importsToAdd = `
// Invoice Module
import PunchedInvoices from './pages/invoice-module/PunchedInvoices';
import PunchInvoice from './pages/invoice-module/PunchInvoice';
import MonthlyInvoiceReport from './pages/invoice-module/MonthlyInvoiceReport';
import GenerateInvoice from './pages/invoice-module/GenerateInvoice';
import ServicesProducts from './pages/invoice-module/ServicesProducts';

// Asset Management
import AssetType from './pages/asset-management/AssetType';
import Assets from './pages/asset-management/Assets';
import AssetAssignments from './pages/asset-management/AssetAssignments';

// Manage Users
import AddNewUser from './pages/manage-users/AddNewUser';
import ActiveUsers from './pages/manage-users/ActiveUsers';
import DeactiveUsers from './pages/manage-users/DeactiveUsers';

// Manage Vendors
import AddNewVendor from './pages/manage-vendors/AddNewVendor';
import ActiveVendors from './pages/manage-vendors/ActiveVendors';
import DeactiveVendors from './pages/manage-vendors/DeactiveVendors';

// Material Stock
import MaterialStockReport from './pages/material-stock/MaterialStockReport';
import StockIn from './pages/material-stock/StockIn';
import StockOut from './pages/material-stock/StockOut';

// Reports
import StockInReport from './pages/reports/StockInReport';
import StockOutReport from './pages/reports/StockOutReport';
import SummaryReport from './pages/reports/SummaryReport';
`;

const routesToAdd = `
          {/* Invoice Module routes */}
          <Route path="/invoice-module/punched-invoices" element={<ProtectedRoute><Layout><PunchedInvoices /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/punch-invoice" element={<ProtectedRoute><Layout><PunchInvoice /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/monthly-invoice-report" element={<ProtectedRoute><Layout><MonthlyInvoiceReport /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/generate-invoice" element={<ProtectedRoute><Layout><GenerateInvoice /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/services-products" element={<ProtectedRoute><Layout><ServicesProducts /></Layout></ProtectedRoute>} />

          {/* Asset Management routes */}
          <Route path="/asset-management/asset-type" element={<ProtectedRoute><Layout><AssetType /></Layout></ProtectedRoute>} />
          <Route path="/asset-management/assets" element={<ProtectedRoute><Layout><Assets /></Layout></ProtectedRoute>} />
          <Route path="/asset-management/asset-assignments" element={<ProtectedRoute><Layout><AssetAssignments /></Layout></ProtectedRoute>} />

          {/* Manage Users routes */}
          <Route path="/manage-users/add-new-user" element={<ProtectedRoute><Layout><AddNewUser /></Layout></ProtectedRoute>} />
          <Route path="/manage-users/active-users" element={<ProtectedRoute><Layout><ActiveUsers /></Layout></ProtectedRoute>} />
          <Route path="/manage-users/deactive-users" element={<ProtectedRoute><Layout><DeactiveUsers /></Layout></ProtectedRoute>} />

          {/* Manage Vendors routes */}
          <Route path="/manage-vendors/add-new-vendor" element={<ProtectedRoute><Layout><AddNewVendor /></Layout></ProtectedRoute>} />
          <Route path="/manage-vendors/active-vendors" element={<ProtectedRoute><Layout><ActiveVendors /></Layout></ProtectedRoute>} />
          <Route path="/manage-vendors/deactive-vendors" element={<ProtectedRoute><Layout><DeactiveVendors /></Layout></ProtectedRoute>} />

          {/* Material Stock routes */}
          <Route path="/material-stock/material-stock-report" element={<ProtectedRoute><Layout><MaterialStockReport /></Layout></ProtectedRoute>} />
          <Route path="/material-stock/stock-in" element={<ProtectedRoute><Layout><StockIn /></Layout></ProtectedRoute>} />
          <Route path="/material-stock/stock-out" element={<ProtectedRoute><Layout><StockOut /></Layout></ProtectedRoute>} />

          {/* Reports routes */}
          <Route path="/reports/stock-in-report" element={<ProtectedRoute><Layout><StockInReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/stock-out-report" element={<ProtectedRoute><Layout><StockOutReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/summary-report" element={<ProtectedRoute><Layout><SummaryReport /></Layout></ProtectedRoute>} />
`;

// Insert imports before ProtectedRoute import
content = content.replace("import ProtectedRoute from './components/ProtectedRoute';", importsToAdd + "\nimport ProtectedRoute from './components/ProtectedRoute';");

// Insert routes before <Route path="*" element={<Navigate to="/" replace />} />
content = content.replace('<Route path="*" element={<Navigate to="/" replace />} />', routesToAdd + '\n          <Route path="*" element={<Navigate to="/" replace />} />');

fs.writeFileSync(appJsxPath, content);
console.log('App.jsx patched successfully');
