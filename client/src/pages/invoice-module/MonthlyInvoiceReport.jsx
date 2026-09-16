import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Plus, Eye, Trash2, X, Filter, RefreshCw, Layers, DollarSign, Building, AlertCircle
} from 'lucide-react';
import { 
  getMonthlyInvoices, 
  addMonthlyInvoice, 
  deleteMonthlyInvoiceRecord,
  getGenerateInvoiceInitData
} from '../../services/invoiceService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyInvoiceReport = () => {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ po_amount: '0.00', invoice_amount: '0.00', lts_invoice_amount: '0.00' });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Auxiliary data
  const [states, setStates] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewVendorsModalOpen, setViewVendorsModalOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState({ list: [], clientName: '', monthYear: '' });
  const [submitting, setSubmitting] = useState(false);

  // Add Form State
  const initialForm = {
    state_id: '',
    client_id: '',
    po_value: '',
    invoice_amount: '',
    lts_invoice_percent: '',
    profit: '',
    lts_invoice_amount: '',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    vendor_details: [
      { vendor_name: '', vendor_amount: '', vendor_id: '1' }
    ]
  };
  const [formData, setFormData] = useState(initialForm);

  // Load Report Data
  const loadReport = async (m = filterMonth, y = filterYear) => {
    try {
      setLoading(true);
      const res = await getMonthlyInvoices(m, y);
      if (res.success) {
        setData(res.data || []);
        if (res.totals) setTotals(res.totals);
      }
    } catch (err) {
      console.error('Error fetching monthly invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown lists on mount
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const initRes = await getGenerateInvoiceInitData();
        if (initRes.success) {
          setStates(initRes.states || []);
          setClients(initRes.clients || []);
        }
      } catch (err) {
        console.error('Error fetching init data:', err);
      }
    };
    fetchInit();
    loadReport();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadReport(filterMonth, filterYear);
  };

  const handleFilterReset = () => {
    setFilterMonth('');
    setFilterYear('');
    loadReport('', '');
  };

  // Vendors Modal View
  const handleOpenVendors = (item) => {
    const list = Array.isArray(item.vendor_details) ? item.vendor_details : [];
    const monthNum = parseInt(item.month, 10);
    const monthName = monthNum >= 1 && monthNum <= 12 ? MONTH_NAMES[monthNum - 1] : item.month;
    setSelectedVendors({
      list,
      clientName: item.client_name || '-',
      monthYear: `${monthName} ${item.year}`
    });
    setViewVendorsModalOpen(true);
  };

  // Delete invoice
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this monthly invoice record?')) {
      try {
        await deleteMonthlyInvoiceRecord(id);
        await loadReport(filterMonth, filterYear);
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  // Add Form Handlers
  const handleAddVendorRow = () => {
    setFormData(prev => ({
      ...prev,
      vendor_details: [...prev.vendor_details, { vendor_name: '', vendor_amount: '', vendor_id: '1' }]
    }));
  };

  const handleRemoveVendorRow = (index) => {
    if (formData.vendor_details.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      vendor_details: prev.vendor_details.filter((_, idx) => idx !== index)
    }));
  };

  const handleVendorChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.vendor_details];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, vendor_details: updated };
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state_id) return alert('Please select State For.');
    if (!formData.client_id) return alert('Please select Client Name.');
    if (!formData.invoice_amount) return alert('Please enter Actual Invoice amount.');

    try {
      setSubmitting(true);
      await addMonthlyInvoice(formData);
      setIsAddModalOpen(false);
      setFormData(initialForm);
      await loadReport(filterMonth, filterYear);
    } catch (err) {
      alert('Failed to add monthly invoice: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFormClients = useMemo(() => {
    if (!formData.state_id) return clients;
    return clients.filter(c => String(c.state_id) === String(formData.state_id));
  }, [clients, formData.state_id]);

  // Year options list
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - i);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-600" size={26} />
            Monthly Invoice Report
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Invoice Module</span>
            <span>/</span>
            <span className="text-gray-700">Monthly Invoice Report</span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div className="bg-[#24292e] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Monthly Invoice Report</h2>
            <p className="text-xs text-gray-300 mt-0.5">Track monthly client billings, LTS margins, and vendor payouts</p>
          </div>
          <button
            onClick={() => {
              setFormData(initialForm);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Add Monthly Invoice
          </button>
        </div>

        {/* Filter Bar (Matching PHP month & year controls) */}
        <form onSubmit={handleFilterSubmit} className="p-4 border-b border-gray-200 bg-gray-50/70 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Month:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="">All Months</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Year:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Filter size={15} /> Show
          </button>

          {(filterMonth || filterYear) && (
            <button
              type="button"
              onClick={handleFilterReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Reset
            </button>
          )}

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => loadReport(filterMonth, filterYear)}
              title="Refresh Report"
              className="text-gray-500 hover:text-gray-800 p-1.5 rounded hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </form>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 whitespace-nowrap">State</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">Client</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">PO Value</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Month</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Year</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Invoice Amount</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">LTS Inv Amount</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">LTS %</th>
                <th className="py-3 px-3 min-w-[200px]">Vendor Data</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Profit</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Total Expense</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-blue-600" />
                      <span>Loading Monthly Invoice Records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-gray-400">
                    No monthly invoice records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const monthNum = parseInt(row.month, 10);
                  const monthName = monthNum >= 1 && monthNum <= 12 ? MONTH_NAMES[monthNum - 1] : row.month;
                  const vendorList = Array.isArray(row.vendor_details) ? row.vendor_details : [];

                  return (
                    <tr key={row._id || row.id || idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-3 text-center font-medium text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">{row.state_name}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-gray-800 font-semibold">{row.client_name}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-700 whitespace-nowrap">
                        ₹ {parseFloat(row.po_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-700 whitespace-nowrap">{monthName}</td>
                      <td className="py-3 px-3 text-center text-gray-600 whitespace-nowrap">{row.year}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900 whitespace-nowrap">
                        ₹ {parseFloat(row.invoice_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-indigo-700 whitespace-nowrap">
                        ₹ {parseFloat(row.lts_invoice_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-600 font-medium whitespace-nowrap">
                        {row.lts_invoice_percent ? `${row.lts_invoice_percent}%` : '-'}
                      </td>
                      <td className="py-2 px-3 text-xs">
                        {vendorList.length > 0 ? (
                          <div className="space-y-1">
                            {vendorList.slice(0, 2).map((v, vIdx) => (
                              <div key={vIdx} className="bg-gray-100 rounded px-2 py-0.5 flex justify-between gap-2">
                                <span className="font-medium text-gray-800 truncate max-w-[130px]">{v.vendor_name || 'Vendor'}</span>
                                <span className="text-emerald-700 font-bold whitespace-nowrap">₹ {parseFloat(v.vendor_amount || 0).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                            {vendorList.length > 2 && (
                              <button 
                                onClick={() => handleOpenVendors(row)}
                                className="text-blue-600 hover:underline text-[11px] font-medium"
                              >
                                + {vendorList.length - 2} more...
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        ₹ {parseFloat(row.profit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-amber-700 whitespace-nowrap">
                        ₹ {parseFloat(row.total || row.total_expense || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenVendors(row)}
                            title="View Vendors"
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id || row.id)}
                            title="Delete Monthly Invoice"
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Summary Footer (Matching PHP tfoot) */}
            <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold text-gray-800">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right uppercase text-xs">Total:</td>
                <td className="py-3 px-3 text-right text-indigo-800 whitespace-nowrap">
                  ₹ {parseFloat(totals.po_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2}></td>
                <td className="py-3 px-3 text-right text-gray-900 whitespace-nowrap">
                  ₹ {parseFloat(totals.invoice_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-indigo-800 whitespace-nowrap">
                  ₹ {parseFloat(totals.lts_invoice_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* View Vendors Details Modal (view-monthly-invoice.phtml) */}
      {viewVendorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#24292e] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-base">Vendors Details</h3>
                <p className="text-xs text-gray-300">{selectedVendors.clientName} ({selectedVendors.monthYear})</p>
              </div>
              <button
                onClick={() => setViewVendorsModalOpen(false)}
                className="text-gray-300 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <table className="w-full text-left text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b">
                    <th className="py-2.5 px-3">Vendor Name</th>
                    <th className="py-2.5 px-3 text-right">Vendor Invoice Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedVendors.list.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-gray-400 italic">No vendor records found</td>
                    </tr>
                  ) : (
                    selectedVendors.list.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium text-gray-800">{v.vendor_name || 'Vendor ' + (i + 1)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          ₹ {parseFloat(v.vendor_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                    <td className="py-2.5 px-3 uppercase text-xs">Total:</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800">
                      ₹ {selectedVendors.list.reduce((acc, v) => acc + (parseFloat(v.vendor_amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewVendorsModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Monthly Invoice Modal (add-monthly-invoice.phtml) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
            <div className="bg-[#24292e] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar size={20} className="text-emerald-400" />
                Add Monthly Invoice
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State For */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State For <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, state_id: e.target.value, client_id: '' }))}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.state_name}</option>
                    ))}
                  </select>
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Client</option>
                    {filteredFormClients.map(c => (
                      <option key={c.id} value={c.id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendors Dynamic Rows */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-gray-700">Vendor Invoice Allocation</span>
                  <button
                    type="button"
                    onClick={handleAddVendorRow}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} /> Add Vendor
                  </button>
                </div>

                {formData.vendor_details.map((v, vIdx) => (
                  <div key={vIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        placeholder="Vendor Company Name"
                        value={v.vendor_name}
                        onChange={(e) => handleVendorChange(vIdx, 'vendor_name', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vendor Amount (₹)"
                        value={v.vendor_amount}
                        onChange={(e) => handleVendorChange(vIdx, 'vendor_amount', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveVendorRow(vIdx)}
                        disabled={formData.vendor_details.length <= 1}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    PO Value (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.po_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, po_value: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Actual Invoice Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formData.invoice_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    LTS Invoice %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10"
                    value={formData.lts_invoice_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, lts_invoice_percent: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    LTS Invoice Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.lts_invoice_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, lts_invoice_amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Profit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.profit}
                    onChange={(e) => setFormData(prev => ({ ...prev, profit: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Submit Monthly Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyInvoiceReport;
