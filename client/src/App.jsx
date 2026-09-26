import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DailyUpdateDashboard from './pages/DailyUpdateDashboard';
import MaterialStock from './pages/MaterialStock';
import Reports from './pages/Reports';

// PO Sites imports
import AddNewPO from './pages/po-sites/po/AddNewPO';
import AddNewPOSites from './pages/po-sites/po/AddNewPOSites';
import PODetails from './pages/po-sites/po/PODetails';
import POStatus from './pages/po-sites/po/POStatus';

import ImportSiteData from './pages/po-sites/sites/ImportSiteData';
import AllocateSite from './pages/po-sites/sites/AllocateSite';
import AllocatedSiteList from './pages/po-sites/sites/AllocatedSiteList';
import AllocatedSiteStatus from './pages/po-sites/sites/AllocatedSiteStatus';

import IncidentsReport from './pages/po-sites/incidents-reporting/IncidentsReport';
import ReportNewIncident from './pages/po-sites/incidents-reporting/ReportNewIncident';

// Master Data imports
import StateList from './pages/master-data/StateList';
import ClientList from './pages/master-data/ClientList';
import CompanyVendor from './pages/master-data/CompanyVendor';
import MaterialSuppliers from './pages/master-data/MaterialSuppliers';
import Transporters from './pages/master-data/Transporters';
import StateFor from './pages/master-data/StateFor';
import BankNameList from './pages/master-data/BankNameList';
import SiteDocuments from './pages/master-data/SiteDocuments';
import AddGeoLocation from './pages/master-data/AddGeoLocation';
import PaymentModes from './pages/master-data/PaymentModes';
import BankAccounts from './pages/master-data/BankAccounts';
import DebitAccountDetails from './pages/master-data/debit-accounts/DebitAccountDetails';
import Roles from './pages/master-data/employee-roles/Roles';
import RoleTypes from './pages/master-data/employee-roles/RoleTypes';

// Expense Master Data imports
import ExpenseType from './pages/master-data/expense-master-data/ExpenseType';
import ExpenseIn from './pages/master-data/expense-master-data/ExpenseIn';
import ExpenseFor from './pages/master-data/expense-master-data/ExpenseFor';

// Work Master Data imports
import WorkForSiteOf from './pages/master-data/work-master-data/WorkForSiteOf';
import NatureOfWork from './pages/master-data/work-master-data/NatureOfWork';
import SiteType from './pages/master-data/work-master-data/SiteType';
import Work from './pages/master-data/work-master-data/Work';
import WorkDescription from './pages/master-data/work-master-data/WorkDescription';

// Vendor Master Data imports
import VendorExperience from './pages/master-data/vendor-master-data/VendorExperience';
import OrganizationType from './pages/master-data/vendor-master-data/OrganizationType';
import AssociationYears from './pages/master-data/vendor-master-data/AssociationYears';
import GeographicalPresence from './pages/master-data/vendor-master-data/GeographicalPresence';
import MajorClients from './pages/master-data/vendor-master-data/MajorClients';
import TeamStrength from './pages/master-data/vendor-master-data/TeamStrength';
import AnnualTurnover from './pages/master-data/vendor-master-data/AnnualTurnover';
import WorkHandleAmount from './pages/master-data/vendor-master-data/WorkHandleAmount';

// Product Master Data imports
import ProductSuppliers from './pages/master-data/product-master-data/ProductSuppliers';
import ProductList from './pages/master-data/product-master-data/ProductList';
import ProductType from './pages/master-data/product-master-data/ProductType';
import ProductUnit from './pages/master-data/product-master-data/ProductUnit';
import ProductBrand from './pages/master-data/product-master-data/ProductBrand';

// Expense Module imports
import ExpenseDashboard from './pages/expense-module/ExpenseDashboard';
import CreateNewExpense from './pages/expense-module/CreateNewExpense';
import SiteExpenseReport from './pages/expense-module/SiteExpenseReport';
import InvoiceReport from './pages/expense-module/InvoiceReport';
import OfficeExpenseReport from './pages/expense-module/OfficeExpenseReport';
import B2BFundTransferReport from './pages/expense-module/B2BFundTransferReport';


// Company
import CompanyDetails from './pages/company/CompanyDetails';

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
import StockInReport from './pages/reports/stock-report/StockInReport';
import StockOutReport from './pages/reports/stock-report/StockOutReport';
import SummaryReport from './pages/reports/summary-report/SummaryReport';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant', 'supervisor', 'hr']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/home/daily-update-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant', 'supervisor', 'hr']}>
                <Layout>
                  <DailyUpdateDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/material-stock"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor', 'accountant']}>
                <Layout>
                  <MaterialStock />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* PO & Sites routes */}
          <Route path="/po-sites/po/add-new-po" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><AddNewPO /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/add-new-po-sites" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><AddNewPOSites /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/po-details" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><PODetails /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/po-status" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><POStatus /></Layout></ProtectedRoute>} />

          <Route path="/po-sites/sites/import-site-data" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><ImportSiteData /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocate-site" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager']}><Layout><AllocateSite /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocated-site-list" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><AllocatedSiteList /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocated-site-status" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><AllocatedSiteStatus /></Layout></ProtectedRoute>} />

          <Route path="/po-sites/incidents-reporting/incidents-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><IncidentsReport /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/incidents-reporting/report-new-incident" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><ReportNewIncident /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po-details" element={<Navigate to="/po-sites/po/po-details" replace />} />
          <Route path="/po-sites/po-status" element={<Navigate to="/po-sites/po/po-status" replace />} />
          <Route path="/po-sites/allocated-sites" element={<Navigate to="/po-sites/sites/allocated-site-list" replace />} />

          {/* Master Data routes */}
          <Route path="/master-data/state-list" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><StateList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/client-master-data" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ClientList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/company-vendor" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><CompanyVendor /></Layout></ProtectedRoute>} />
          <Route path="/master-data/material-suppliers" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><MaterialSuppliers /></Layout></ProtectedRoute>} />
          <Route path="/master-data/transporters" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><Transporters /></Layout></ProtectedRoute>} />
          <Route path="/master-data/state-for" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><StateFor /></Layout></ProtectedRoute>} />
          <Route path="/master-data/bank-name-list" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><BankNameList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/site-documents" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><SiteDocuments /></Layout></ProtectedRoute>} />
          <Route path="/master-data/geo-location" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><AddGeoLocation /></Layout></ProtectedRoute>} />
          <Route path="/master-data/payment-modes" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><PaymentModes /></Layout></ProtectedRoute>} />
          <Route path="/master-data/bank-accounts" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><BankAccounts /></Layout></ProtectedRoute>} />
          <Route path="/master-data/debit-accounts" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><DebitAccountDetails /></Layout></ProtectedRoute>} />
          <Route path="/master-data/debit-accounts/debit-account-details" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><DebitAccountDetails /></Layout></ProtectedRoute>} />
          <Route path="/master-data/employee-roles/roles" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><Roles /></Layout></ProtectedRoute>} />
          <Route path="/master-data/employee-roles/role-types" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><RoleTypes /></Layout></ProtectedRoute>} />

          {/* Expense Master Data routes */}
          <Route path="/master-data/expense-master-data/expense-type" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/expense-type" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/expense-master-data/expense-in" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseIn /></Layout></ProtectedRoute>} />
          <Route path="/master-data/expense-in" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseIn /></Layout></ProtectedRoute>} />
          <Route path="/master-data/expense-master-data/expense-for" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseFor /></Layout></ProtectedRoute>} />
          <Route path="/master-data/expense-for" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseFor /></Layout></ProtectedRoute>} />

          {/* Work Master Data routes */}
          <Route path="/master-data/work-master-data/work-for-site-of" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><WorkForSiteOf /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/nature-of-work" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><NatureOfWork /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/site-type" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><SiteType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/work" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><Work /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/work-description" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><WorkDescription /></Layout></ProtectedRoute>} />

          {/* Vendor Master Data routes */}
          <Route path="/master-data/vendor-master-data/vendor-experience" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><VendorExperience /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/organization-type" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><OrganizationType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/association-years" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><AssociationYears /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/geographical-presence" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><GeographicalPresence /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/major-clients" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><MajorClients /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/team-strength" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><TeamStrength /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/annual-turnover" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><AnnualTurnover /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/work-handle-amount" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><WorkHandleAmount /></Layout></ProtectedRoute>} />
          <Route path="/master-data/vendor-master-data/work-handling-amount" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><WorkHandleAmount /></Layout></ProtectedRoute>} />

          {/* Product Master Data routes */}
          <Route path="/master-data/product-master-data/product-suppliers" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ProductSuppliers /></Layout></ProtectedRoute>} />
          <Route path="/master-data/product-master-data/product-list" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ProductList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/product-master-data/product-type" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ProductType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/product-master-data/product-unit" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ProductUnit /></Layout></ProtectedRoute>} />
          <Route path="/master-data/product-master-data/product-brand" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><ProductBrand /></Layout></ProtectedRoute>} />

          {/* Expense Module routes */}
          <Route path="/expense-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ExpenseDashboard /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/create-new-expense" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant', 'supervisor']}><Layout><CreateNewExpense /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/site-expense-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><SiteExpenseReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/invoice-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><InvoiceReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/office-expense-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><OfficeExpenseReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/b2b-fund-transfer-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><B2BFundTransferReport /></Layout></ProtectedRoute>} />

          {/* Company routes */}
          <Route path="/company/company-details" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><CompanyDetails /></Layout></ProtectedRoute>} />

          {/* Invoice Module routes */}
          <Route path="/invoice-module/punched-invoices" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><PunchedInvoices /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/punch-invoice" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><PunchInvoice /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/monthly-invoice-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><MonthlyInvoiceReport /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/generate-invoice" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><GenerateInvoice /></Layout></ProtectedRoute>} />
          <Route path="/invoice-module/services-products" element={<ProtectedRoute allowedRoles={['admin', 'management', 'accountant']}><Layout><ServicesProducts /></Layout></ProtectedRoute>} />

          {/* Asset Management routes */}
          <Route path="/asset-management/asset-type" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><AssetType /></Layout></ProtectedRoute>} />
          <Route path="/asset-management/assets" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><Assets /></Layout></ProtectedRoute>} />
          <Route path="/asset-management/asset-assignments" element={<ProtectedRoute allowedRoles={['admin', 'management']}><Layout><AssetAssignments /></Layout></ProtectedRoute>} />

          {/* Manage Users routes */}
          <Route path="/manage-users/add-new-user" element={<ProtectedRoute allowedRoles={['admin', 'management', 'hr']}><Layout><AddNewUser /></Layout></ProtectedRoute>} />
          <Route path="/manage-users/active-users" element={<ProtectedRoute allowedRoles={['admin', 'management', 'hr']}><Layout><ActiveUsers /></Layout></ProtectedRoute>} />
          <Route path="/manage-users/deactive-users" element={<ProtectedRoute allowedRoles={['admin', 'management', 'hr']}><Layout><DeactiveUsers /></Layout></ProtectedRoute>} />

          {/* Manage Vendors routes */}
          <Route path="/manage-vendors/add-new-vendor" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><AddNewVendor /></Layout></ProtectedRoute>} />
          <Route path="/manage-vendors/edit-vendor/:id" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><AddNewVendor /></Layout></ProtectedRoute>} />
          <Route path="/manage-vendors/active-vendors" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><ActiveVendors /></Layout></ProtectedRoute>} />
          <Route path="/manage-vendors/deactive-vendors" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><DeactiveVendors /></Layout></ProtectedRoute>} />

          {/* Material Stock routes */}
          <Route path="/material-stock/material-stock-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><MaterialStockReport /></Layout></ProtectedRoute>} />
          <Route path="/material-stock/stock-in" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><StockIn /></Layout></ProtectedRoute>} />
          <Route path="/material-stock/stock-out" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'supervisor']}><Layout><StockOut /></Layout></ProtectedRoute>} />

          {/* Reports routes */}
          <Route path="/reports/stock-in-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><StockInReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/stock-report/stock-in" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><StockInReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/stock-out-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><StockOutReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/stock-report/stock-out" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><StockOutReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/summary-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><SummaryReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/summary-report/summary-report" element={<ProtectedRoute allowedRoles={['admin', 'management', 'project_manager', 'accountant']}><Layout><SummaryReport /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
