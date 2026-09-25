import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ExternalLink,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import {
  getInvoicesReport,
  changeViewStatusAndUpdateInvoice,
  attachPaymentAdviceToInvoice
} from '../../services/invoiceService';

const PunchedInvoices = () => {
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
  const [updateFormData, setUpdateFormData] = useState({
    received_amount: '',
    received_date: ''
  });

  // Attach Payment Advice Modal State
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [adviceFormData, setAdviceFormData] = useState({
    payment_advice_file: null,
    payment_advice_path: ''
  });

  // Load Invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoicesReport();
      if (res && res.success) {
        setInvoices(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setFeedback({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not fetch invoices from server.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Format INR Currency
  const formatINR = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(num)) return '-';
    return '₹ ' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format Date to DD/MM/YYYY
  const formatDate = (d) => {
    if (!d || d === '0000-00-00') return '-';
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return String(d);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(d);
    }
  };

  // Filter and search invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (item.invoice_no && item.invoice_no.toLowerCase().includes(term)) ||
        (item.client_name && item.client_name.toLowerCase().includes(term)) ||
        (item.po_no && item.po_no.toLowerCase().includes(term)) ||
        (item.site_id && item.site_id.toLowerCase().includes(term)) ||
        (item.state_name && item.state_name.toLowerCase().includes(term)) ||
        (item.vendor_company_name && item.vendor_company_name.toLowerCase().includes(term)) ||
        (item.company_vendor_invoice_number && item.company_vendor_invoice_number.toLowerCase().includes(term));

      const matchClient =
        !clientFilter || item.client_name === clientFilter;

      const matchReview =
        !reviewFilter ||
        (reviewFilter === 'marked' && String(item.marked_for_review) === '1') ||
        (reviewFilter === 'unmarked' && String(item.marked_for_review) === '0');

      return matchSearch && matchClient && matchReview;
    });
  }, [invoices, searchTerm, clientFilter, reviewFilter]);

  // Unique clients for dropdown filter
  const clientOptions = useMemo(() => {
    const set = new Set();
    invoices.forEach((inv) => {
      if (inv.client_name && inv.client_name !== '-') {
        set.add(inv.client_name);
      }
    });
    return Array.from(set).sort();
  }, [invoices]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Handle Review Status Toggle (Mark / Unmark)
  const handleToggleReview = async (invoice, currentStatus) => {
    const newAction = currentStatus === '1' ? 'mark' : 'unmark';
    const confirmMsg =
      newAction === 'unmark'
        ? 'Are you sure you want to Mark for Review?'
        : 'Are you sure you want to Mark as Viewed?';

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const res = await changeViewStatusAndUpdateInvoice({
        invoice_id: invoice._id || invoice.id,
        type: newAction
      });

      if (res.flag) {
        setFeedback({
          type: 'success',
          title: res.title || 'Status Changed',
          message: res.message || 'Invoice status updated successfully.'
        });
        fetchInvoices();
      } else {
        setFeedback({
          type: 'error',
          title: res.title || 'Action Failed',
          message: res.message || 'Could not update review status.'
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while toggling review status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Invoice
  const handleDeleteInvoice = async (invoice) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Invoice No: ${invoice.invoice_no || 'this record'}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await changeViewStatusAndUpdateInvoice({
        invoice_id: invoice._id || invoice.id,
        type: 'delete'
      });

      if (res.flag) {
        setFeedback({
          type: 'success',
          title: res.title || 'Deleted Successfully',
          message: res.message || 'Invoice record deleted successfully.'
        });
        fetchInvoices();
      } else {
        setFeedback({
          type: 'error',
          title: res.title || 'Delete Failed',
          message: res.message || 'Unable to delete invoice record.'
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while deleting invoice.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Update Modal
  const openUpdateModal = (invoice) => {
    setActiveInvoice(invoice);
    setUpdateFormData({
      received_amount: invoice.received_amount || '',
      received_date: invoice.amount_received_date
        ? invoice.amount_received_date.split('T')[0]
        : ''
    });
    setIsUpdateModalOpen(true);
  };

  // Submit Update Details
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    try {
      setActionLoading(true);
      const res = await changeViewStatusAndUpdateInvoice({
        invoice_id: activeInvoice._id || activeInvoice.id,
        type: 'update',
        invoice_num: activeInvoice.invoice_no,
        received_amount: updateFormData.received_amount,
        received_date: updateFormData.received_date
      });

      if (res.flag) {
        setIsUpdateModalOpen(false);
        setFeedback({
          type: 'success',
          title: res.title || 'Invoice Updated',
          message: res.message || 'Invoice details updated successfully.'
        });
        fetchInvoices();
      } else {
        setFeedback({
          type: 'error',
          title: res.title || 'Update Failed',
          message: res.message || 'Unable to update invoice details.'
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while saving updates.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Attach Advice Modal
  const openAdviceModal = (invoice) => {
    setActiveInvoice(invoice);
    setAdviceFormData({
      payment_advice_file: null,
      payment_advice_path: invoice.payment_advice_path || ''
    });
    setIsAdviceModalOpen(true);
  };

  // Submit Attach Payment Advice
  const handleAdviceSubmit = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    try {
      setActionLoading(true);
      const res = await attachPaymentAdviceToInvoice({
        invoice_id: activeInvoice._id || activeInvoice.id,
        payment_advice_path:
          adviceFormData.payment_advice_path ||
          `/uploads/invoice/payment_advice/${Date.now()}_advice.pdf`
      });

      if (res.flag) {
        setIsAdviceModalOpen(false);
        setFeedback({
          type: 'success',
          title: res.title || 'Attached Successfully',
          message: res.message || 'Payment advice attached successfully.'
        });
        fetchInvoices();
      } else {
        setFeedback({
          type: 'error',
          title: res.title || 'Attachment Failed',
          message: res.message || 'Unable to attach payment advice.'
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred while attaching payment advice.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Excel / CSV Export matching PHP exportInvoiceReportAction
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoice records to export!');
      return;
    }

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
      `"${inv.client_name || ''}"`,
      `"${inv.po_no || ''}"`,
      `"${inv.site_id || ''}"`,
      `"${inv.state_name || ''}"`,
      `"${inv.invoice_no || ''}"`,
      formatDate(inv.invoice_date),
      inv.invoice_value || '0',
      `"${(inv.invoice_remark || '').replace(/"/g, '""')}"`,
      `"${inv.vendor_company_name || ''}"`,
      formatDate(inv.company_vendor_invoice_date),
      `"${inv.company_vendor_invoice_number || ''}"`,
      inv.company_vendor_invoice_amount || '0',
      formatDate(inv.amount_received_date),
      inv.received_amount || '0',
      inv.margin || '0'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvoiceReport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`p-3 rounded-lg flex items-start justify-between shadow-sm border text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
            ) : (
              <AlertTriangle className="text-rose-600 flex-shrink-0 mt-0.5" size={16} />
            )}
            <div>
              <p className="font-bold">{feedback.title}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setFeedback({ type: '', title: '', message: '' })}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Table Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <Receipt className="text-teal-200" size={18} />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Invoice(s) Details</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Punch Invoice Green Button */}
            <Link
              to="/invoice-module/punch-invoice"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg shadow-sm transition-all backdrop-blur-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              Punch Invoice
            </Link>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              title="Export to Excel / CSV"
              className="p-1.5 bg-white text-emerald-700 hover:bg-gray-100 rounded-md shadow-sm transition-colors cursor-pointer border border-gray-300"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              onClick={fetchInvoices}
              title="Refresh Data"
              className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-2.5 sm:p-3 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search PO, Site, Invoice, Vendor..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clientOptions.map((client, idx) => (
                <option key={idx} value={client}>
                  {client}
                </option>
              ))}
            </select>

            {/* Review Status Filter */}
            <select
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="marked">Marked for Review</option>
              <option value="unmarked">Unmarked / Viewed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* 17 Columns Table (PHP Parity) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-100/90 text-gray-800 uppercase text-[11px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">#</th>
                <th className="py-3 px-3 whitespace-nowrap">Client Name</th>
                <th className="py-3 px-3 whitespace-nowrap">PO Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Site ID</th>
                <th className="py-3 px-3 whitespace-nowrap">State Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Invoice Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Invoice Date</th>
                <th className="py-3 px-3 whitespace-nowrap">Invoice Amount</th>
                <th className="py-3 px-3 whitespace-nowrap">Invoice Remark</th>
                <th className="py-3 px-3 whitespace-nowrap">Vendor Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Vendor Invoice Date</th>
                <th className="py-3 px-3 whitespace-nowrap">Vendor Invoice Number</th>
                <th className="py-3 px-3 whitespace-nowrap">Vendor Invoice Amount</th>
                <th className="py-3 px-3 whitespace-nowrap">Received Date</th>
                <th className="py-3 px-3 whitespace-nowrap">Received Amount</th>
                <th className="py-3 px-3 whitespace-nowrap">Margin</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline mr-2 text-blue-600" size={20} />
                    Loading invoices...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-gray-400 font-medium">
                    No invoice records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => {
                  const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                  const isMarked = String(inv.marked_for_review) === '1';

                  return (
                    <tr
                      key={inv._id || inv.id || idx}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isMarked ? 'bg-amber-50/25' : ''
                      }`}
                    >
                      {/* 1. Sr. No */}
                      <td className="py-2.5 px-3 font-semibold text-gray-600 whitespace-nowrap">
                        {serialNumber}
                      </td>

                      {/* 2. Client Name */}
                      <td className="py-2.5 px-3 font-medium text-gray-900 whitespace-nowrap">
                        {inv.client_name || '-'}
                      </td>

                      {/* 3. PO Number */}
                      <td className="py-2.5 px-3 font-mono text-blue-700 whitespace-nowrap font-medium">
                        {inv.po_no || '-'}
                      </td>

                      {/* 4. Site ID */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {inv.site_id || '-'}
                        </span>
                      </td>

                      {/* 5. State Name */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {inv.state_name || '-'}
                      </td>

                      {/* 6. Invoice Number */}
                      <td className="py-2.5 px-3 font-mono text-gray-900 font-semibold whitespace-nowrap">
                        {inv.invoice_no || '-'}
                      </td>

                      {/* 7. Invoice Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {formatDate(inv.invoice_date)}
                      </td>

                      {/* 8. Invoice Amount */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-gray-900">
                        {formatINR(inv.invoice_value)}
                      </td>

                      {/* 9. Invoice Remark */}
                      <td className="py-2.5 px-3 whitespace-nowrap max-w-[200px] truncate" title={inv.invoice_remark}>
                        {inv.invoice_remark || '-'}
                      </td>

                      {/* 10. Vendor Name */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                        {inv.vendor_company_name || '-'}
                      </td>

                      {/* 11. Vendor Invoice Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {formatDate(inv.company_vendor_invoice_date)}
                      </td>

                      {/* 12. Vendor Invoice Number */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap text-gray-700">
                        {inv.company_vendor_invoice_number || '-'}
                      </td>

                      {/* 13. Vendor Invoice Amount */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                        {formatINR(inv.company_vendor_invoice_amount)}
                      </td>

                      {/* 14. Received Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {formatDate(inv.amount_received_date)}
                      </td>

                      {/* 15. Received Amount */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-emerald-700">
                        {formatINR(inv.received_amount)}
                      </td>

                      {/* 16. Margin */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold">
                        {parseFloat(inv.margin) > 0 ? (
                          <span className="text-purple-700">{formatINR(inv.margin)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* 17. Review Action Icons (Exact PHP Parity) */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Payment Advice PDF link */}
                          {inv.payment_advice_path && (
                            <a
                              href={inv.payment_advice_path}
                              target="_blank"
                              rel="noreferrer"
                              title="View Payment Advice"
                              className="text-rose-600 hover:text-rose-800 transition-colors p-1 hover:bg-rose-50 rounded"
                            >
                              <FileText size={15} />
                            </a>
                          )}

                          {/* Attach Payment Advice */}
                          <button
                            onClick={() => openAdviceModal(inv)}
                            title="Attach Payment Advice"
                            className="text-gray-600 hover:text-blue-600 transition-colors p-1 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <Paperclip size={15} />
                          </button>

                          {/* Toggle Review State */}
                          {!isMarked ? (
                            <button
                              onClick={() => handleToggleReview(inv, '0')}
                              title="Mark For Review"
                              className="p-1 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                              style={{ color: '#10B22D' }}
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleReview(inv, '1')}
                              title="Mark As Viewed"
                              className="p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              style={{ color: '#AD0000' }}
                            >
                              <EyeOff size={16} />
                            </button>
                          )}

                          {/* Update Invoice */}
                          <button
                            onClick={() => openUpdateModal(inv)}
                            title="Update Invoice"
                            className="p-1 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            style={{ color: '#10B22D' }}
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete Invoice (Only if not marked for review, matching PHP) */}
                          {!isMarked && (
                            <button
                              onClick={() => handleDeleteInvoice(inv)}
                              title="Delete Invoice"
                              className="p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              style={{ color: '#E61919' }}
                            >
                              <Trash2 size={15} />
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
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            Showing {(currentPage - 1) * pageSize + (filteredInvoices.length > 0 ? 1 : 0)} to{' '}
            {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Update Invoice Details Modal (PHP #updateInvoiceDetailsModal) */}
      {isUpdateModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div 
              className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base">Update Invoice Details</h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={activeInvoice.invoice_no || ''}
                  disabled
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Received Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={updateFormData.received_amount}
                    onChange={(e) =>
                      setUpdateFormData((p) => ({ ...p, received_amount: e.target.value }))
                    }
                    placeholder="Enter received amount"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Received Date</label>
                <input
                  type="date"
                  value={updateFormData.received_date}
                  onChange={(e) =>
                    setUpdateFormData((p) => ({ ...p, received_date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Payment Advice Modal (PHP #paymentAdviceAttacmentModal) */}
      {isAdviceModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div 
              className="text-white px-6 py-4 flex items-center justify-between shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base">Attach Payment Advice</h3>
              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdviceSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={activeInvoice.invoice_no || ''}
                  disabled
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Payment Advice Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAdviceFormData({
                        payment_advice_file: file,
                        payment_advice_path: `/uploads/invoice/payment_advice/${Date.now()}_${file.name}`
                      });
                    }
                  }}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">Accepted formats: PDF, JPG, PNG</p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdviceModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Attaching...' : 'Attach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchedInvoices;
