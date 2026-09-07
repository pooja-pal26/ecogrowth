import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
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

// Work Master Data imports
import WorkForSiteOf from './pages/master-data/work-master-data/WorkForSiteOf';
import NatureOfWork from './pages/master-data/work-master-data/NatureOfWork';
import SiteType from './pages/master-data/work-master-data/SiteType';
import Work from './pages/master-data/work-master-data/Work';
import WorkDescription from './pages/master-data/work-master-data/WorkDescription';

// Expense Module imports
import CreateNewExpense from './pages/expense-module/CreateNewExpense';
import SiteExpenseReport from './pages/expense-module/SiteExpenseReport';
import InvoiceReport from './pages/expense-module/InvoiceReport';
import OfficeExpenseReport from './pages/expense-module/OfficeExpenseReport';
import B2BFundTransferReport from './pages/expense-module/B2BFundTransferReport';


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
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/material-stock"
            element={
              <ProtectedRoute>
                <Layout>
                  <MaterialStock />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* PO & Sites routes */}
          <Route path="/po-sites/po/add-new-po" element={<ProtectedRoute><Layout><AddNewPO /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/add-new-po-sites" element={<ProtectedRoute><Layout><AddNewPOSites /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/po-details" element={<ProtectedRoute><Layout><PODetails /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/po/po-status" element={<ProtectedRoute><Layout><POStatus /></Layout></ProtectedRoute>} />

          <Route path="/po-sites/sites/import-site-data" element={<ProtectedRoute><Layout><ImportSiteData /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocate-site" element={<ProtectedRoute><Layout><AllocateSite /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocated-site-list" element={<ProtectedRoute><Layout><AllocatedSiteList /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/sites/allocated-site-status" element={<ProtectedRoute><Layout><AllocatedSiteStatus /></Layout></ProtectedRoute>} />

          <Route path="/po-sites/incidents-reporting/incidents-report" element={<ProtectedRoute><Layout><IncidentsReport /></Layout></ProtectedRoute>} />
          <Route path="/po-sites/incidents-reporting/report-new-incident" element={<ProtectedRoute><Layout><ReportNewIncident /></Layout></ProtectedRoute>} />

          {/* Master Data routes */}
          <Route path="/master-data/state-list" element={<ProtectedRoute><Layout><StateList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/client-master-data" element={<ProtectedRoute><Layout><ClientList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/company-vendor" element={<ProtectedRoute><Layout><CompanyVendor /></Layout></ProtectedRoute>} />
          <Route path="/master-data/material-suppliers" element={<ProtectedRoute><Layout><MaterialSuppliers /></Layout></ProtectedRoute>} />
          <Route path="/master-data/transporters" element={<ProtectedRoute><Layout><Transporters /></Layout></ProtectedRoute>} />
          <Route path="/master-data/state-for" element={<ProtectedRoute><Layout><StateFor /></Layout></ProtectedRoute>} />
          <Route path="/master-data/bank-name-list" element={<ProtectedRoute><Layout><BankNameList /></Layout></ProtectedRoute>} />
          <Route path="/master-data/site-documents" element={<ProtectedRoute><Layout><SiteDocuments /></Layout></ProtectedRoute>} />
          <Route path="/master-data/geo-location" element={<ProtectedRoute><Layout><AddGeoLocation /></Layout></ProtectedRoute>} />
          <Route path="/master-data/payment-modes" element={<ProtectedRoute><Layout><PaymentModes /></Layout></ProtectedRoute>} />
          <Route path="/master-data/bank-accounts" element={<ProtectedRoute><Layout><BankAccounts /></Layout></ProtectedRoute>} />

          {/* Work Master Data routes */}
          <Route path="/master-data/work-master-data/work-for-site-of" element={<ProtectedRoute><Layout><WorkForSiteOf /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/nature-of-work" element={<ProtectedRoute><Layout><NatureOfWork /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/site-type" element={<ProtectedRoute><Layout><SiteType /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/work" element={<ProtectedRoute><Layout><Work /></Layout></ProtectedRoute>} />
          <Route path="/master-data/work-master-data/work-description" element={<ProtectedRoute><Layout><WorkDescription /></Layout></ProtectedRoute>} />

          {/* Expense Module routes */}
          <Route path="/expense-module/create-new-expense" element={<ProtectedRoute><Layout><CreateNewExpense /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/site-expense-report" element={<ProtectedRoute><Layout><SiteExpenseReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/invoice-report" element={<ProtectedRoute><Layout><InvoiceReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/office-expense-report" element={<ProtectedRoute><Layout><OfficeExpenseReport /></Layout></ProtectedRoute>} />
          <Route path="/expense-module/b2b-fund-transfer-report" element={<ProtectedRoute><Layout><B2BFundTransferReport /></Layout></ProtectedRoute>} />

          
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

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
