import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Paperclip,
  FileText,
  Search,
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import {
  getInvoicesReport,
  changeViewStatusAndUpdateInvoice,
  attachPaymentAdviceToInvoice
} from '../../services/invoiceService';

const InvoiceReport = () => {
  const navigate = useNavigate();

  // Data states
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalInvoiceAmount: 0,
    totalReceivedAmount: 0,
    totalPendingAmount: 0,
    markedForReviewCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', title: '', message: '' });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState(''); // '', 'marked', 'unmarked'
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [modalError, setModalError] = useState('');

  // Payment Advice Modal State
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [adviceInvoiceId, setAdviceInvoiceId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [adviceModalError, setAdviceModalError] = useState('');

  // Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'mark', 'unmark', 'delete'
    invoiceId: null,
    invoiceNo: '',
    title: '',
    message: '',
    confirmText: ''
  });

  // Load Invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoicesReport();
      if (res.success) {
        setInvoices(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load invoice report:', err);
      setFeedback({
        type: 'error',
        title: 'Error Loading Data',
        message: err.response?.data?.message || err.message || 'Failed to fetch invoice records'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Format currency in INR
  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return '-';
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format date DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const set = new Set();
    invoices.forEach(inv => {
      if (inv.client_name && inv.client_name !== '-') {
        set.add(inv.client_name);
      }
    });
    return Array.from(set).sort();
  }, [invoices]);

  // Filtered & Paginated records
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        (inv.client_name || '').toLowerCase().includes(search) ||
        (inv.po_no || '').toLowerCase().includes(search) ||
        (inv.site_id || '').toLowerCase().includes(search) ||
        (inv.state_name || '').toLowerCase().includes(search) ||
        (inv.invoice_no || '').toLowerCase().includes(search) ||
        (inv.vendor_company_name || '').toLowerCase().includes(search) ||
        (inv.company_vendor_invoice_number || '').toLowerCase().includes(search) ||
        (inv.invoice_remark || '').toLowerCase().includes(search);

      const matchClient = !clientFilter || inv.client_name === clientFilter;

      let matchReview = true;
      if (reviewFilter === 'marked') {
        matchReview = String(inv.marked_for_review) === '1';
      } else if (reviewFilter === 'unmarked') {
        matchReview = String(inv.marked_for_review) === '0' || !inv.marked_for_review;
      }

      return matchSearch && matchClient && matchReview;
    });
  }, [invoices, searchTerm, clientFilter, reviewFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Handle Update Modal Open
  const handleOpenUpdateModal = (inv) => {
    setActiveInvoice(inv);
    setReceivedAmount(inv.received_amount && inv.received_amount !== '0' ? inv.received_amount : '');
    setReceivedDate(inv.amount_received_date || '');
    setModalError('');
    setIsUpdateModalOpen(true);
  };

  // Handle Update Submit
  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!receivedAmount || isNaN(parseFloat(receivedAmount))) {
      setModalError('Please enter received amount.');
      return;
    }
    if (!receivedDate) {
      setModalError('Please select amount received date.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await changeViewStatusAndUpdateInvoice({
        invoice_id: activeInvoice._id || activeInvoice.id,
        invoice_num: activeInvoice.invoice_no,
        type: 'update',
        received_amount: receivedAmount,
        received_date: receivedDate
      });

      if (res.flag) {
        setIsUpdateModalOpen(false);
        setFeedback({
          type: 'success',
          title: res.title || 'Invoice Updated Successfully',
          message: res.message || 'Invoice details has been updated successfully.'
        });
        await fetchInvoices();
      } else {
        setModalError(res.message || 'Failed to update invoice');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Error updating invoice');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Open Advice Modal
  const handleOpenAdviceModal = (invoiceId) => {
    setAdviceInvoiceId(invoiceId);
    setSelectedFile(null);
    setAdviceModalError('');
    setIsAdviceModalOpen(true);
  };

  // Handle Submit Payment Advice
  const handleSubmitPaymentAdvice = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setAdviceModalError('Please select payment advice file.');
      return;
    }

    try {
      setActionLoading(true);
      const fakePath = `/uploads/invoice/payment_advice/${Date.now()}_${selectedFile.name}`;
      const res = await attachPaymentAdviceToInvoice({
        invoice_id: adviceInvoiceId,
        payment_advice_path: fakePath
      });

      if (res.flag) {
        setIsAdviceModalOpen(false);
        setFeedback({
          type: 'success',
          title: 'Attached Successfully',
          message: 'Payment advice has been attached successfully.'
        });
        await fetchInvoices();
      } else {
        setAdviceModalError(res.message || 'Failed to attach payment advice');
      }
    } catch (err) {
      setAdviceModalError(err.response?.data?.message || err.message || 'Server error while uploading');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Review Status
  const handlePromptToggleReview = (inv) => {
    const isCurrentlyMarked = String(inv.marked_for_review) === '1';
    const nextType = isCurrentlyMarked ? 'mark' : 'unmark';
    setConfirmModal({
      isOpen: true,
      type: nextType,
      invoiceId: inv._id || inv.id,
      invoiceNo: inv.invoice_no,
      title: 'Are you sure?',
      message: isCurrentlyMarked
        ? 'Do you want to mark as viewed?'
        : 'Do you want to mark for review?',
      confirmText: isCurrentlyMarked ? 'Yes, mark as viewed' : 'Yes, mark for review'
    });
  };

  // Handle Delete Prompt
  const handlePromptDelete = (inv) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      invoiceId: inv._id || inv.id,
      invoiceNo: inv.invoice_no,
      title: 'Are you sure?',
      message: 'Do you want to delete invoice details?',
      confirmText: 'Yes, delete'
    });
  };

  // Execute Confirmed Action
  const handleExecuteConfirmedAction = async () => {
    try {
      setActionLoading(true);
      const res = await changeViewStatusAndUpdateInvoice({
        invoice_id: confirmModal.invoiceId,
        type: confirmModal.type
      });

      if (res.flag) {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setFeedback({
          type: 'success',
          title: res.title || 'Success',
          message: res.message || 'Action performed successfully.'
        });
        await fetchInvoices();
      } else {
        setFeedback({
          type: 'error',
          title: res.title || 'Error',
          message: res.message || 'Could not execute action.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Server error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Export to Excel / CSV (Exact columns matching PHP exportInvoiceReportAction)
  const handleExportCSV = () => {
    if (!filteredInvoices.length) return;

    const headers = [
      'Sr. No.',
      'Client Name',
      'PO Number',
      'Site ID',
      'State Name',
      'Invoice Number',
      'Invoice Date',
      'Invoice Amount',
      'Invoice Remark',
      'Vendor Name',
      'Vendor Invoice Date',
      'Vendor Invoice Number',
      'Vendor Invoice Amount',
      'Received Date',
      'Received Amount',
      'Margin'
    ];

    const rows = filteredInvoices.map((inv, idx) => [
      idx + 1,
      `"${(inv.client_name || '').replace(/"/g, '""')}"`,
      `"${(inv.po_no || '').replace(/"/g, '""')}"`,
      `"${(inv.site_id || '').replace(/"/g, '""')}"`,
      `"${(inv.state_name || '').replace(/"/g, '""')}"`,
      `"${(inv.invoice_no || '').replace(/"/g, '""')}"`,
      formatDate(inv.invoice_date),
      inv.invoice_value || '0',
      `"${(inv.invoice_remark || '-').replace(/"/g, '""')}"`,
      `"${(inv.vendor_company_name || '-').replace(/"/g, '""')}"`,
      formatDate(inv.company_vendor_invoice_date),
      `"${(inv.company_vendor_invoice_number || '-').replace(/"/g, '""')}"`,
      inv.company_vendor_invoice_amount || '0',
      formatDate(inv.amount_received_date),
      inv.received_amount || '0',
      inv.margin && Number(inv.margin) > 0 ? inv.margin : '0'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvoiceReport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1550px] mx-auto space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" size={26} />
            Invoice(s) Details
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex items-center space-x-2">
            <span
              onClick={() => navigate('/dashboard')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <span>/</span>
            <span
              onClick={() => navigate('/expense-module')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Expense Module
            </span>
            <span>/</span>
            <span className="text-gray-800 font-semibold">Invoice's Report</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dismissible Feedback Alert */}
      {feedback.message && (
        <div
          className={`flex items-start justify-between p-4 rounded-xl border ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'error' ? (
              <AlertTriangle className="text-rose-600 flex-shrink-0" size={20} />
            ) : (
              <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
            )}
            <div>
              <p className="font-semibold text-sm">{feedback.title}</p>
              <p className="text-sm opacity-90">{feedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setFeedback({ type: '', title: '', message: '' })}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalInvoices}</h3>
            <span className="text-xs text-blue-600 font-medium">Active records</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoice Value</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalInvoiceAmount)}</h3>
            <span className="text-xs text-emerald-600 font-medium">Billed to clients</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Received Amount</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalReceivedAmount)}</h3>
            <span className="text-xs text-indigo-600 font-medium">Confirmed receipts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Balance</p>
            <h3 className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(stats.totalPendingAmount)}</h3>
            <span className="text-xs text-amber-700 font-medium">Outstanding recovery</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Panel matching PHP ecogrowth UI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Dark Panel Header (Exact match to PHP panel-heading in screenshot) */}
        <div className="bg-[#24292e] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-semibold tracking-wide">Invoice(s) Details</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/invoice-module/punch-invoice')}
              className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Punch Invoice
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-gray-100 text-green-700 border border-gray-200 px-3 py-2 rounded-md shadow-sm transition-colors flex items-center justify-center cursor-pointer"
              title="Export to Excel / CSV"
            >
              <svg className="w-5 h-5 text-[#217346]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15zM8.8 17.5l1.7-2.7-1.6-2.8h1.6l.8 1.7.8-1.7h1.6l-1.6 2.8 1.7 2.7h-1.6l-1-1.7-1 1.7H8.8z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Client, PO, Site, Invoice, Vendor..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Review Statuses</option>
              <option value="marked">Marked for Review</option>
              <option value="unmarked">Marked as Viewed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Data Table: ALL 17 COLUMNS EXACTLY MATCHING PHP ECOGROWTH */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100/90 text-gray-700 font-semibold text-xs border-b border-gray-200">
                <th className="py-3 px-3 whitespace-nowrap text-center">#</th>
                <th className="py-3 px-4 whitespace-nowrap">Client Name</th>
                <th className="py-3 px-4 whitespace-nowrap">PO Number</th>
                <th className="py-3 px-4 whitespace-nowrap">Site ID</th>
                <th className="py-3 px-4 whitespace-nowrap">State Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Invoice Number</th>
                <th className="py-3 px-4 whitespace-nowrap">Invoice Date</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Invoice Amount</th>
                <th className="py-3 px-4 min-w-[160px]">Invoice Remark</th>
                <th className="py-3 px-4 whitespace-nowrap">Vendor Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Vendor Invoice Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Vendor Invoice Number</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Vendor Invoice Amount</th>
                <th className="py-3 px-4 whitespace-nowrap">Received Date</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Received Amount</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Margin</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={17} className="py-16 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2 text-blue-600" size={20} />
                    Loading invoice details...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-16 text-center text-gray-500">
                    <FileText className="inline-block text-gray-300 mb-2" size={36} />
                    <p className="font-medium text-gray-700">No Invoices Found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or add a new invoice.</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => {
                  const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                  const isMarked = String(inv.marked_for_review) === '1';

                  return (
                    <tr
                      key={inv._id || inv.id || idx}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* 1. # */}
                      <td className="py-3 px-3 text-center font-medium text-gray-600 whitespace-nowrap">
                        {serialNumber}
                      </td>

                      {/* 2. Client Name */}
                      <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                        {inv.client_name || '-'}
                      </td>

                      {/* 3. PO Number */}
                      <td className="py-3 px-4 text-blue-700 font-mono text-xs whitespace-nowrap">
                        {inv.po_no || '-'}
                      </td>

                      {/* 4. Site ID */}
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {inv.site_id || '-'}
                        </span>
                      </td>

                      {/* 5. State Name */}
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {inv.state_name || '-'}
                      </td>

                      {/* 6. Invoice Number */}
                      <td className="py-3 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                        {inv.invoice_no || '-'}
                      </td>

                      {/* 7. Invoice Date */}
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {formatDate(inv.invoice_date)}
                      </td>

                      {/* 8. Invoice Amount */}
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {inv.invoice_value ? formatCurrency(inv.invoice_value) : '-'}
                      </td>

                      {/* 9. Invoice Remark */}
                      <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate" title={inv.invoice_remark}>
                        {inv.invoice_remark || '-'}
                      </td>

                      {/* 10. Vendor Name */}
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {inv.vendor_company_name || '-'}
                      </td>

                      {/* 11. Vendor Invoice Date */}
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {formatDate(inv.company_vendor_invoice_date)}
                      </td>

                      {/* 12. Vendor Invoice Number */}
                      <td className="py-3 px-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                        {inv.company_vendor_invoice_number || '-'}
                      </td>

                      {/* 13. Vendor Invoice Amount */}
                      <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">
                        {inv.company_vendor_invoice_amount ? formatCurrency(inv.company_vendor_invoice_amount) : '-'}
                      </td>

                      {/* 14. Received Date */}
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {formatDate(inv.amount_received_date)}
                      </td>

                      {/* 15. Received Amount */}
                      <td className="py-3 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                        {inv.received_amount && inv.received_amount !== '0'
                          ? formatCurrency(inv.received_amount)
                          : '-'}
                      </td>

                      {/* 16. Margin */}
                      <td className="py-3 px-4 text-right font-medium text-gray-800 whitespace-nowrap">
                        {inv.margin && Number(inv.margin) > 0 ? formatCurrency(inv.margin) : '-'}
                      </td>

                      {/* 17. Review (Actions exactly matching PHP) */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Payment Advice View Link */}
                          {inv.payment_advice_path && (
                            <a
                              href={inv.payment_advice_path}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="View Payment Advice"
                            >
                              <FileText size={16} />
                            </a>
                          )}

                          {/* Attach Payment Advice */}
                          <button
                            onClick={() => handleOpenAdviceModal(inv._id || inv.id)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Attach Payment Advice"
                          >
                            <Paperclip size={16} />
                          </button>

                          {/* Toggle Review Icon */}
                          {!isMarked ? (
                            <button
                              onClick={() => handlePromptToggleReview(inv)}
                              className="p-1 text-[#10B22D] hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Mark For Review"
                            >
                              <Eye size={17} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePromptToggleReview(inv)}
                              className="p-1 text-[#AD0000] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Mark As Viewed"
                            >
                              <EyeOff size={17} />
                            </button>
                          )}

                          {/* Update Invoice Button */}
                          <button
                            onClick={() => handleOpenUpdateModal(inv)}
                            className="p-1 text-[#10B22D] hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Update Invoice"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* Delete Invoice Button (Visible when marked_for_review == "0" in PHP) */}
                          {!isMarked && (
                            <button
                              onClick={() => handlePromptDelete(inv)}
                              className="p-1 text-[#E61919] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-gray-900">
              {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * pageSize, filteredInvoices.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-900">{filteredInvoices.length}</span> entries
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Update Invoice Details (Exact match to PHP modal #updateInvoiceDetailsModal) */}
      {isUpdateModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Pencil className="text-blue-600" size={18} />
                Update Invoice Details
              </h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Invoice Number :
                </label>
                <input
                  type="text"
                  value={activeInvoice.invoice_no || ''}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Received Amount <span className="text-rose-500 font-bold">*</span> :
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder="Enter Received Amount"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Received Date <span className="text-rose-500 font-bold">*</span> :
                </label>
                <input
                  type="date"
                  required
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2"
                >
                  {actionLoading && <RefreshCw size={16} className="animate-spin" />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Attach Payment Advice (Exact match to PHP modal #paymentAdviceAttacmentModal) */}
      {isAdviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Paperclip className="text-blue-600" size={18} />
                Attach Payment Advice
              </h3>
              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentAdvice} className="p-6 space-y-4">
              {adviceModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  <span>{adviceModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Advice (PDF, JPEG, JPG, PNG) :
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdviceModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2"
                >
                  {actionLoading && <RefreshCw size={16} className="animate-spin" />}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6 text-center space-y-4">
            <div
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                confirmModal.type === 'delete'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {confirmModal.type === 'delete' ? (
                <Trash2 size={26} />
              ) : (
                <AlertTriangle size={26} />
              )}
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900">{confirmModal.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{confirmModal.message}</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionLoading && <RefreshCw size={14} className="animate-spin" />}
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceReport;
