import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
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
import CompanyVendor from './pages/masterData/CompanyVendor';
import MaterialSuppliers from './pages/masterData/MaterialSuppliers';
import Transporters from './pages/masterData/Transporters';
import StateFor from './pages/masterData/StateFor';
import BankNameList from './pages/master-data/BankNameList';
import SiteDocuments from './pages/master-data/SiteDocuments';
import GeoLocation from './pages/master-data/GeoLocation';
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

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />

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
          <Route path="/master-data/geo-location" element={<ProtectedRoute><Layout><GeoLocation /></Layout></ProtectedRoute>} />
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

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;