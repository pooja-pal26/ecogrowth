import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  Calendar,
  DollarSign,
  Building,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Building2,
  Receipt,
  Layers
} from 'lucide-react';
import { getPunchInitData, punchInvoice } from '../../services/invoiceService';

const PunchInvoice = () => {
  const navigate = useNavigate();

  // Dropdown data sources
  const [states, setStates] = useState([]);
  const [clients, setClients] = useState([]);
  const [poList, setPoList] = useState([]);
  const [companyVendors, setCompanyVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State matching PHP punch-invoice.phtml
  const [formData, setFormData] = useState({
    state_id: '',
    client_id: '',
    po_number: '',
    site_id: '',
    invoice_number: '',
    invoice_date: '',
    invoice_amount: '',
    received_amount_date: '',
    received_amount: '',
    remark: '',
    invoice_doc: null,
    invoice_doc_name: '',
    company_vendor: '',
    vendor_invoice_date: '',
    vendor_invoice_number: '',
    vendor_invoice_amount: '',
    vendor_invoice_doc: null,
    vendor_invoice_doc_name: ''
  });

  // Filtered lists based on selections
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', title: '', message: '' });

  // Load Dropdown Options
  const loadInitData = async () => {
    try {
      setLoading(true);
      const res = await getPunchInitData().catch(() => null);
      if (res && res.success) {
        setStates(res.states || []);
        setClients(res.clients || []);
        setPoList(res.poNumbers || []);
        setCompanyVendors(res.companyVendors || []);
      } else {
        // Fallback default data from JSON sources
        const fallbackStates = [
          { id: '1', state_name: 'Uttar Pradesh' },
          { id: '2', state_name: 'Madhya Pradesh' },
          { id: '3', state_name: 'Bihar' },
          { id: '4', state_name: 'Delhi' }
        ];
        const fallbackClients = [
          { id: '49', client_name: 'S&P Infrastructure', state_id: '1' },
          { id: '8', client_name: 'BHARTI INFRATEL LIMITED', state_id: '2' },
          { id: '9', client_name: 'RELIANCE CORPORATE IT PARK LTD', state_id: '1' },
          { id: '30', client_name: 'INDUS TOWERS LIMITED', state_id: '3' }
        ];
        const fallbackPos = [
          { po_no: 'S&PPO23240045', sites: ['CCBF', 'NDDB'] },
          { po_no: 'S&PPO22230002', sites: ['NTPC'] },
          { po_no: '54030063868', sites: ['IN-3456033'] },
          { po_no: '54030066568', sites: ['IN-3506660'] }
        ];
        const fallbackVendors = [
          { id: '1', vendor_company_name: 'AMBUJA CEMENTS LIMITED' },
          { id: '2', vendor_company_name: 'TATA STEEL LIMITED' },
          { id: '3', vendor_company_name: 'ULTRATECH CEMENT LIMITED' }
        ];
        setStates(fallbackStates);
        setClients(fallbackClients);
        setPoList(fallbackPos);
        setCompanyVendors(fallbackVendors);
      }
    } catch (err) {
      console.error('Error initializing punch invoice form:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitData();
  }, []);

  // Update client list when state changes (PHP getClientMasterList)
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({ ...prev, state_id: stateId, client_id: '' }));
    if (!stateId) {
      setFilteredClients([]);
    } else {
      const filtered = clients.filter(c => String(c.state_id) === String(stateId));
      setFilteredClients(filtered.length > 0 ? filtered : clients);
    }
  };

  // Update site list when PO number changes (PHP getSitesByPoNumber)
  const handlePoChange = (e) => {
    const poNum = e.target.value;
    setFormData(prev => ({ ...prev, po_number: poNum, site_id: '' }));
    const foundPo = poList.find(p => p.po_no === poNum);
    if (foundPo && foundPo.sites) {
      setFilteredSites(foundPo.sites);
    } else {
      setFilteredSites([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}_name`]: file.name
      }));
    }
  };

  // Margin calculation preview (PHP line 220: invoice_amount - vendor_invoice_amount)
  const calculatedMargin = React.useMemo(() => {
    const inv = parseFloat(formData.invoice_amount) || 0;
    const ven = parseFloat(formData.vendor_invoice_amount) || 0;
    if (inv > 0 && ven > 0) {
      return (inv - ven).toFixed(2);
    }
    return null;
  }, [formData.invoice_amount, formData.vendor_invoice_amount]);

  // Validate and submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mandatory field validations (PHP lines 144-159)
    if (!formData.state_id) {
      setFeedback({ type: 'error', title: 'State For Missing!', message: 'Please select state for.' });
      return;
    }
    if (!formData.client_id) {
      setFeedback({ type: 'error', title: 'Client Name Missing!', message: 'Please select client name.' });
      return;
    }
    if (!formData.invoice_number.trim()) {
      setFeedback({ type: 'error', title: 'Invoice Number Missing!', message: 'Please enter invoice number.' });
      return;
    }
    if (!formData.invoice_date) {
      setFeedback({ type: 'error', title: 'Invoice Date Missing!', message: 'Please select invoice date.' });
      return;
    }
    if (!formData.invoice_amount || parseFloat(formData.invoice_amount) <= 0) {
      setFeedback({ type: 'error', title: 'Invoice Amount Missing!', message: 'Please enter invoice amount.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', title: '', message: '' });

      const payload = {
        state_id: formData.state_id,
        client_id: formData.client_id,
        po_number: formData.po_number,
        site_id: formData.site_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        invoice_amount: formData.invoice_amount,
        received_amount_date: formData.received_amount_date || null,
        received_amount: formData.received_amount || '0',
        remark: formData.remark,
        company_vendor: formData.company_vendor || null,
        vendor_invoice_date: formData.vendor_invoice_date || null,
        vendor_invoice_number: formData.vendor_invoice_number || null,
        vendor_invoice_amount: formData.vendor_invoice_amount || null,
        invoice_doc_path: formData.invoice_doc_name ? `/uploads/invoice/${formData.invoice_doc_name}` : null,
        vendor_invoice_doc_path: formData.vendor_invoice_doc_name ? `/uploads/invoice/${formData.vendor_invoice_doc_name}` : null
      };

      const res = await punchInvoice(payload);

      if (res && res.success) {
        setFeedback({
          type: 'success',
          title: 'Success !',
          message: 'Invoice Details have been saved successfully.'
        });
        setTimeout(() => {
          navigate('/invoice-module/punched-invoices');
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          title: 'Error !',
          message: res?.message || 'Failed to save invoice details. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      setFeedback({
        type: 'error',
        title: 'Error !',
        message: err.response?.data?.message || 'Failed to save invoice details.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      state_id: '',
      client_id: '',
      po_number: '',
      site_id: '',
      invoice_number: '',
      invoice_date: '',
      invoice_amount: '',
      received_amount_date: '',
      received_amount: '',
      remark: '',
      invoice_doc: null,
      invoice_doc_name: '',
      company_vendor: '',
      vendor_invoice_date: '',
      vendor_invoice_number: '',
      vendor_invoice_amount: '',
      vendor_invoice_doc: null,
      vendor_invoice_doc_name: ''
    });
    setFilteredClients([]);
    setFilteredSites([]);
    setFeedback({ type: '', title: '', message: '' });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={36} />
          <p className="text-gray-500 font-medium text-sm">Loading Invoice Punching Form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Alert Notification */}
      {feedback.message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 shadow-sm border ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div className="text-sm">
            <strong className="font-bold">{feedback.title}</strong>&nbsp; {feedback.message}
          </div>
        </div>
      )}

      {/* Main Form Panel matching PHP punch-invoice.phtml panel-primary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Receipt className="text-teal-200" size={22} />
              Invoice Punching Form
            </h2>
            <p className="text-xs text-white/80 mt-0.5">Punch customer billed invoices and corresponding vendor costs</p>
          </div>
          <Link
            to="/invoice-module/punched-invoices"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg shadow-sm transition-all backdrop-blur-md active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            View Invoice List
          </Link>
        </div>

        {/* Form Container (matching PHP mainDiv background #DCF2FE) */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              * Field is mandatory.
            </span>
            {calculatedMargin !== null && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-800">
                <span>Calculated Margin:</span>
                <span className="text-sm">₹ {Number(calculatedMargin).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Core Invoice Section */}
          <div className="space-y-4">
            {/* <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Primary Site & Invoice Details
            </h3> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* State For */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  State For <span className="text-rose-600">*</span> :
                </label>
                <select
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleStateChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.state_name}</option>
                  ))}
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Client Name <span className="text-rose-600">*</span> :
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Client</option>
                  {(filteredClients.length > 0 ? filteredClients : clients).map(c => (
                    <option key={c.id} value={c.id}>{c.client_name}</option>
                  ))}
                </select>
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  PO Number :
                </label>
                <select
                  name="po_number"
                  value={formData.po_number}
                  onChange={handlePoChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select PO Number</option>
                  {poList.map((p, idx) => (
                    <option key={idx} value={p.po_no}>{p.po_no}</option>
                  ))}
                </select>
              </div>

              {/* Site ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Site ID :
                </label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Site ID</option>
                  {filteredSites.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Invoice Number <span className="text-rose-600">*</span> :
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  placeholder="e.g. LTS/2425/001"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Invoice Date <span className="text-rose-600">*</span> :
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Invoice Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Invoice Amount <span className="text-rose-600">*</span> :
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="invoice_amount"
                    value={formData.invoice_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Received Amount Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Received Amount Date :
                </label>
                <input
                  type="date"
                  name="received_amount_date"
                  value={formData.received_amount_date}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Received Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Received Amount :
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="received_amount"
                    value={formData.received_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Remarks :
                </label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="Enter remarks, description, or project scope..."
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload Invoice */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Upload Invoice :
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'invoice_doc')}
                    className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: Vendor Invoice Details (PHP lines 118-148) */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <Building size={16} className="text-indigo-600" />
                Vendor Invoice Details
              </h3>
              <span className="text-xs text-gray-400 font-medium">For profit margin & cost tracking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200/80">
              {/* Company Vendor */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Company Vendor :
                </label>
                <select
                  name="company_vendor"
                  value={formData.company_vendor}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company Vendor</option>
                  {companyVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendor_company_name}</option>
                  ))}
                </select>
              </div>

              {/* Vendor Invoice Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Vendor Invoice Date :
                </label>
                <input
                  type="date"
                  name="vendor_invoice_date"
                  value={formData.vendor_invoice_date}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vendor Invoice Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Vendor Invoice Number :
                </label>
                <input
                  type="text"
                  name="vendor_invoice_number"
                  value={formData.vendor_invoice_number}
                  onChange={handleInputChange}
                  placeholder="Enter Vendor Invoice Number"
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vendor Invoice Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Vendor Invoice Amount :
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="vendor_invoice_amount"
                    value={formData.vendor_invoice_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full text-sm bg-white border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Upload Vendor Invoice */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Upload Vendor Invoice :
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e, 'vendor_invoice_doc')}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-white border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Saving Invoice...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Submit Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PunchInvoice;
