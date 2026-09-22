import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Building2, 
  Calendar, 
  FileText, 
  CreditCard, 
  UserCheck, 
  DollarSign,
  Upload
} from 'lucide-react';
import { 
  getExpenseFormData, 
  getSitesByPoNumber, 
  getExpenseInList, 
  getExpenseForList, 
  createExpense 
} from '../../services/expenseService';

const CreateNewExpense = () => {
  const navigate = useNavigate();

  // Form initialization state
  const [initLoading, setInitLoading] = useState(true);
  const [initData, setInitData] = useState({
    expenseTypes: [],
    companies: [],
    bankAccounts: [],
    paymentModes: [],
    debitAccounts: [],
    poNumbers: [],
    siteDocuments: [],
    transferTo: {
      users: [],
      vendors: [],
      transporters: [],
      materialSuppliers: [],
      productSuppliers: []
    }
  });

  // Selected Expense Type
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] = useState('');
  const [selectedExpenseTypeName, setSelectedExpenseTypeName] = useState('');

  // PO & Sites
  const [sitesList, setSitesList] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  // Common & Master Form Fields
  const [formData, setFormData] = useState({
    company_id: '',
    date_of_transfer: new Date().toISOString().split('T')[0],
    po_number: '',
    site_id: '',
    transfer_amount: '',
    bill_number: '',
    transfer_to: '',
    remark: '',
    bank_account_id: '',
    payment_mode_id: '',
    debit_account_id: '',
    office_attachment: null
  });

  // Dynamic Table Rows for Expense In / Expense For
  const [expenseInOptions, setExpenseInOptions] = useState([]);
  const [rows, setRows] = useState([
    {
      id: 1,
      expense_in_id: '',
      expense_for_id: '',
      spent_amount: '',
      spent_remark: '',
      expense_remark: '', // site document id-required
      bill_attachment: null,
      date: new Date().toISOString().split('T')[0],
      forOptions: [],
      loadingFor: false
    }
  ]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Fetch initial master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setInitLoading(true);
        const res = await getExpenseFormData();
        if (res && res.success && res.data) {
          setInitData(res.data);
        }
      } catch (err) {
        console.error('Failed to load expense form master data:', err);
        setErrorMsg('Failed to load form master data. Please check server connection.');
      } finally {
        setInitLoading(false);
      }
    };
    loadMasterData();
  }, []);

  // When Expense Type changes
  const handleExpenseTypeChange = async (typeId) => {
    setSelectedExpenseTypeId(typeId);
    setErrorMsg('');
    setSuccessInfo(null);

    const typeObj = initData.expenseTypes.find(t => String(t.id) === String(typeId));
    const typeName = typeObj ? typeObj.expense_type : '';
    setSelectedExpenseTypeName(typeName);

    // Reset rows and fetch expense in options for this expense type
    setRows([
      {
        id: 1,
        expense_in_id: '',
        expense_for_id: '',
        spent_amount: '',
        spent_remark: '',
        expense_remark: '',
        bill_attachment: null,
        date: new Date().toISOString().split('T')[0],
        forOptions: [],
        loadingFor: false
      }
    ]);

    if (typeId) {
      try {
        const res = await getExpenseInList(typeId);
        if (res && res.success && res.expenseInList) {
          setExpenseInOptions(res.expenseInList);
        } else {
          setExpenseInOptions([]);
        }
      } catch (err) {
        console.error('Error fetching Expense In list:', err);
        setExpenseInOptions([]);
      }
    } else {
      setExpenseInOptions([]);
    }
  };

  // When PO Number changes, dynamically fetch sites
  const handlePoNumberChange = async (poNo) => {
    setFormData(prev => ({ ...prev, po_number: poNo, site_id: '' }));
    if (!poNo) {
      setSitesList([]);
      return;
    }

    try {
      setLoadingSites(true);
      const res = await getSitesByPoNumber(poNo);
      if (res && res.success && res.sites) {
        setSitesList(res.sites);
      } else {
        setSitesList([]);
      }
    } catch (err) {
      console.error('Error fetching sites for PO:', err);
      setSitesList([]);
    } finally {
      setLoadingSites(false);
    }
  };

  // Row operations
  const handleAddRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows(prev => [
      ...prev,
      {
        id: newId,
        expense_in_id: '',
        expense_for_id: '',
        spent_amount: '',
        spent_remark: '',
        expense_remark: '',
        bill_attachment: null,
        date: new Date().toISOString().split('T')[0],
        forOptions: [],
        loadingFor: false
      }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (rows.length === 1) {
      setErrorMsg('At least one expense detail row is required.');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = async (id, field, value) => {
    setErrorMsg('');
    if (field === 'expense_in_id') {
      // Fetch corresponding Expense For options
      setRows(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            expense_in_id: value,
            expense_for_id: '',
            forOptions: [],
            loadingFor: true
          };
        }
        return r;
      }));

      if (value) {
        try {
          const res = await getExpenseForList(value);
          setRows(prev => prev.map(r => {
            if (r.id === id) {
              return {
                ...r,
                forOptions: res && res.success ? res.expenseForList : [],
                loadingFor: false
              };
            }
            return r;
          }));
        } catch (err) {
          console.error('Failed to load Expense For options:', err);
          setRows(prev => prev.map(r => r.id === id ? { ...r, loadingFor: false } : r));
        }
      } else {
        setRows(prev => prev.map(r => r.id === id ? { ...r, loadingFor: false } : r));
      }
    } else {
      setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    }
  };

  // Calculate totals
  const totalSpentAmount = rows.reduce((sum, r) => sum + (parseFloat(r.spent_amount) || 0), 0);

  // Validate form submission matching PHP EcoGrowth
  const validateForm = (isSite) => {
    if (!formData.company_id) return 'Please select Company.';
    if (!formData.date_of_transfer) return 'Please select Date of Transfer.';
    if (!formData.transfer_amount || parseFloat(formData.transfer_amount) <= 0) return 'Please enter a valid Transfer Amount.';
    if (!formData.bank_account_id) return 'Please select Bank Account.';
    if (!formData.payment_mode_id) return 'Please select Payment Mode.';
    if (!formData.debit_account_id) return 'Please select Debit Account.';

    if (isSite) {
      if (!formData.po_number) return 'Please select PO Number.';
      if (!formData.site_id) return 'Please select Site ID.';
      if (!formData.transfer_to) return 'Please select Transfer To.';
    } else {
      if (!formData.transfer_to) return 'Please select Transfer To.';
      if (!formData.bill_number) return 'Please enter Attachment / Bill Number.';
      if (!formData.remark) return 'Please enter Remarks.';
    }

    // Validate details rows
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.expense_in_id) return `Row ${i + 1}: Please select Expense In.`;
      if (!r.spent_amount || parseFloat(r.spent_amount) <= 0) return `Row ${i + 1}: Please enter Spent Amount.`;
    }

    return null;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo(null);

    const isSite = selectedExpenseTypeName.toLowerCase().includes('site');
    const validationError = validateForm(isSite);
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      const postData = new FormData();

      postData.append('expenseType', selectedExpenseTypeId);
      postData.append('expenseTypeName', isSite ? 'Site Expense' : 'Office Expense');
      postData.append('company_id', formData.company_id);
      postData.append('bank_account_id', formData.bank_account_id);
      postData.append('payment_mode_id', formData.payment_mode_id);
      postData.append('debit_account_id', formData.debit_account_id);

      if (isSite) {
        postData.append('siteExpenseDateOfTransfer', formData.date_of_transfer);
        postData.append('poNumber', formData.po_number);
        postData.append('siteId', formData.site_id);
        postData.append('siteExpenseTransferAmount', formData.transfer_amount);
        postData.append('siteExpenseBillNumber', formData.bill_number || '');
        postData.append('amountTransferTo', formData.transfer_to);
        postData.append('siteExpenseTransferRemark', formData.remark || '');
      } else {
        postData.append('officeExpenseDateOfTransfer', formData.date_of_transfer);
        postData.append('officeExpenseTransferTo', formData.transfer_to);
        postData.append('officeExpenseTransferAmount', formData.transfer_amount);
        postData.append('officeExpenseBillNumber', formData.bill_number);
        postData.append('officeExpenseTansferRemark', formData.remark || '');
        if (formData.office_attachment) {
          postData.append('officeExpenseAttachment', formData.office_attachment);
        }
      }

      // Serialize row arrays matching PHP parameters
      rows.forEach((r, idx) => {
        postData.append('expense_in_id[]', r.expense_in_id);
        postData.append('expense_for_id[]', r.expense_for_id || '');
        postData.append('spentAmount[]', r.spent_amount);
        postData.append('spentRemark[]', r.spent_remark || '');
        postData.append('expense_remark[]', r.expense_remark || '');
        postData.append('date[]', r.date || formData.date_of_transfer);
        if (r.bill_attachment) {
          postData.append(`bill_attachment[${idx}]`, r.bill_attachment);
        }
      });

      const res = await createExpense(postData);
      if (res && res.success) {
        setSuccessInfo({
          message: res.message || 'Expense has been saved successfully.',
          voucher: res.voucher_number
        });
        // Reset form
        setFormData({
          company_id: '',
          date_of_transfer: new Date().toISOString().split('T')[0],
          po_number: '',
          site_id: '',
          transfer_amount: '',
          bill_number: '',
          transfer_to: '',
          remark: '',
          bank_account_id: '',
          payment_mode_id: '',
          debit_account_id: '',
          office_attachment: null
        });
        setRows([
          {
            id: 1,
            expense_in_id: '',
            expense_for_id: '',
            spent_amount: '',
            spent_remark: '',
            expense_remark: '',
            bill_attachment: null,
            date: new Date().toISOString().split('T')[0],
            forOptions: [],
            loadingFor: false
          }
        ]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Failed to save expense. Please try again.');
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Server error occurred while saving expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSiteExpense = selectedExpenseTypeName.toLowerCase().includes('site');
  const isOfficeExpense = selectedExpenseTypeName.toLowerCase().includes('office');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-indigo-800 to-slate-900 bg-clip-text text-transparent">
            Create New Expense
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the expense details according to EcoGrowth financial records.
          </p>
        </div>
        <button
          onClick={() => navigate('/expense-dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      {/* Success Alert */}
      {successInfo && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={22} />
          <div>
            <h4 className="font-bold text-emerald-900 text-base">Expense Saved Successfully!</h4>
            <p className="text-emerald-700 text-sm mt-0.5">{successInfo.message}</p>
            {successInfo.voucher && (
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mt-2 inline-block px-3 py-1 bg-emerald-100/70 rounded-md border border-emerald-200">
                Generated Voucher: {successInfo.voucher}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-gradient-to-b from-sky-50/70 to-blue-50/30 rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-red-600 tracking-wide uppercase flex items-center gap-1">
            * Fields are mandatory
          </span>
          {initLoading && (
            <span className="text-xs text-sky-600 flex items-center gap-1.5 font-medium">
              <Loader2 className="animate-spin" size={14} /> Loading Master Data...
            </span>
          )}
        </div>

        {/* Expense Type Selector */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm mb-6">
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Select Expense Type <span className="text-red-500">*</span>
          </label>
          <div className="max-w-md">
            <select
              value={selectedExpenseTypeId}
              onChange={(e) => handleExpenseTypeChange(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all cursor-pointer"
            >
              <option value="">-- Please Select Expense Type --</option>
              {initData.expenseTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.expense_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SITE EXPENSE FORM */}
        {selectedExpenseTypeId && isSiteExpense && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-sky-200 shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight underline decoration-teal-500 decoration-2 underline-offset-8 inline-block">
                Site Expense Form
              </h2>
            </div>

            {/* Top Grid: Company, Date, PO, Site, Amount, Bill No, Transfer To, Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Please Select Company</option>
                  {initData.companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Date of Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Transfer <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_of_transfer}
                  onChange={(e) => setFormData({ ...formData, date_of_transfer: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PO Number <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.po_number}
                  onChange={(e) => handlePoNumberChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Select PO Number</option>
                  {initData.poNumbers.map(p => (
                    <option key={p.id} value={p.po_no}>{p.po_no}</option>
                  ))}
                </select>
              </div>

              {/* Site ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Site ID <span className="text-red-500">*</span></span>
                  {loadingSites && <Loader2 className="animate-spin text-teal-600" size={14} />}
                </label>
                <select
                  required
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  disabled={!formData.po_number || loadingSites}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select Site ID</option>
                  {sitesList.map((site, i) => (
                    <option key={i} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              {/* Transfer Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.transfer_amount}
                  onChange={(e) => setFormData({ ...formData, transfer_amount: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold text-teal-700"
                />
              </div>

              {/* Attachment/Bill Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attachment / Bill Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. BILL-9921"
                  value={formData.bill_number}
                  onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              {/* Transfer To */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer To <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.transfer_to}
                  onChange={(e) => setFormData({ ...formData, transfer_to: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Please Select</option>
                  <optgroup label="Users">
                    {initData.transferTo.users.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Vendors">
                    {initData.transferTo.vendors.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </optgroup>
                  {initData.transferTo.transporters.length > 0 && (
                    <optgroup label="Transporters">
                      {initData.transferTo.transporters.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Material Suppliers">
                    {initData.transferTo.materialSuppliers.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Product Supplier">
                    {initData.transferTo.productSuppliers.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarks (if any)
                </label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Financial Details: Bank Account, Payment Mode, Debit Account */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-8">
              {/* Bank Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Select Bank Account</option>
                  {initData.bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.payment_mode_id}
                  onChange={(e) => setFormData({ ...formData, payment_mode_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Select Payment Mode</option>
                  {initData.paymentModes.map(p => (
                    <option key={p.id} value={p.id}>{p.payment_mode}</option>
                  ))}
                </select>
              </div>

              {/* Debit Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Debit Account <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.debit_account_id}
                  onChange={(e) => setFormData({ ...formData, debit_account_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="">Select Debit Account</option>
                  {initData.debitAccounts.map(d => (
                    <option key={d.id} value={d.id}>{d.debit_account}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* EXPENSE DETAILS TABLE */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800">
                  Expense Details Breakdown
                </h3>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Total Breakdown: <span className="text-teal-700">₹{totalSpentAmount.toFixed(2)}</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 w-[18%]">Expense In *</th>
                      <th className="p-3 w-[18%]">Expense For</th>
                      <th className="p-3 w-[13%]">Spent Amount *</th>
                      <th className="p-3 w-[15%]">Expense Remark</th>
                      <th className="p-3 w-[15%]">Required Documents</th>
                      <th className="p-3 w-[13%]">Bill Attachment</th>
                      <th className="p-3 w-[12%]">Date</th>
                      <th className="p-3 w-[6%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {rows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Expense In */}
                        <td className="p-2.5">
                          <select
                            required
                            value={row.expense_in_id}
                            onChange={(e) => handleRowChange(row.id, 'expense_in_id', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                          >
                            <option value="">Please Select</option>
                            {expenseInOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.expense_in_type}</option>
                            ))}
                          </select>
                        </td>

                        {/* Expense For */}
                        <td className="p-2.5">
                          <select
                            value={row.expense_for_id}
                            onChange={(e) => handleRowChange(row.id, 'expense_for_id', e.target.value)}
                            disabled={row.loadingFor || !row.expense_in_id}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100 disabled:opacity-60"
                          >
                            <option value="">{row.loadingFor ? 'Loading...' : 'Please Select'}</option>
                            {row.forOptions.map(f => (
                              <option key={f.id} value={f.id}>{f.expense_transfer_for}</option>
                            ))}
                          </select>
                        </td>

                        {/* Spent Amount */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={row.spent_amount}
                            onChange={(e) => handleRowChange(row.id, 'spent_amount', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none font-semibold text-slate-800"
                          />
                        </td>

                        {/* Spent Remark */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Remark"
                            value={row.spent_remark}
                            onChange={(e) => handleRowChange(row.id, 'spent_remark', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </td>

                        {/* Required Documents */}
                        <td className="p-2.5">
                          <select
                            value={row.expense_remark}
                            onChange={(e) => handleRowChange(row.id, 'expense_remark', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                          >
                            <option value="">Select Document</option>
                            {initData.siteDocuments.map(d => (
                              <option key={d.id} value={d.value}>{d.document_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Bill Attachment */}
                        <td className="p-2.5">
                          <input
                            type="file"
                            onChange={(e) => handleRowChange(row.id, 'bill_attachment', e.target.files[0] || null)}
                            className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                          />
                        </td>

                        {/* Date */}
                        <td className="p-2.5">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </td>

                        {/* Action */}
                        <td className="p-2.5 text-center">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Row Button */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Add More Row
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-200 pt-6 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-teal-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                {submitting ? 'Saving Site Expense...' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}

        {/* OFFICE EXPENSE FORM */}
        {selectedExpenseTypeId && isOfficeExpense && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-sky-200 shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight underline decoration-indigo-500 decoration-2 underline-offset-8 inline-block">
                Office Expense Form
              </h2>
            </div>

            {/* Top Grid: Company, Date, Transfer To, Transfer Amount, Bill No, Attachment, Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Please Select Company</option>
                  {initData.companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Date of Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Transfer <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_of_transfer}
                  onChange={(e) => setFormData({ ...formData, date_of_transfer: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Transfer To (Users) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer To (User) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.transfer_to}
                  onChange={(e) => setFormData({ ...formData, transfer_to: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Please Select User</option>
                  {initData.transferTo.users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Transfer Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.transfer_amount}
                  onChange={(e) => setFormData({ ...formData, transfer_amount: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-indigo-700"
                />
              </div>

              {/* Attachment/Bill Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attachment / Bill Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OFF-BILL-1002"
                  value={formData.bill_number}
                  onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Upload Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Attachment
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, office_attachment: e.target.files[0] || null })}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Reason / context for office expense"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-8">
              {/* Bank Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Bank Account</option>
                  {initData.bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.payment_mode_id}
                  onChange={(e) => setFormData({ ...formData, payment_mode_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Payment Mode</option>
                  {initData.paymentModes.map(p => (
                    <option key={p.id} value={p.id}>{p.payment_mode}</option>
                  ))}
                </select>
              </div>

              {/* Debit Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Debit Account <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.debit_account_id}
                  onChange={(e) => setFormData({ ...formData, debit_account_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Debit Account</option>
                  {initData.debitAccounts.map(d => (
                    <option key={d.id} value={d.id}>{d.debit_account}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Office Expense Details Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800">
                  Office Expense Details Breakdown
                </h3>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Total Breakdown: <span className="text-indigo-700">₹{totalSpentAmount.toFixed(2)}</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 w-[30%]">Expense In *</th>
                      <th className="p-3 w-[30%]">Expense For</th>
                      <th className="p-3 w-[20%]">Spent Amount *</th>
                      <th className="p-3 w-[25%]">Expense Remark</th>
                      <th className="p-3 w-[5%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Expense In */}
                        <td className="p-2.5">
                          <select
                            required
                            value={row.expense_in_id}
                            onChange={(e) => handleRowChange(row.id, 'expense_in_id', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="">Please Select</option>
                            {expenseInOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.expense_in_type}</option>
                            ))}
                          </select>
                        </td>

                        {/* Expense For */}
                        <td className="p-2.5">
                          <select
                            value={row.expense_for_id}
                            onChange={(e) => handleRowChange(row.id, 'expense_for_id', e.target.value)}
                            disabled={row.loadingFor || !row.expense_in_id}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:opacity-60"
                          >
                            <option value="">{row.loadingFor ? 'Loading...' : 'Please Select'}</option>
                            {row.forOptions.map(f => (
                              <option key={f.id} value={f.id}>{f.expense_transfer_for}</option>
                            ))}
                          </select>
                        </td>

                        {/* Spent Amount */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={row.spent_amount}
                            onChange={(e) => handleRowChange(row.id, 'spent_amount', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                          />
                        </td>

                        {/* Spent Remark */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Remark"
                            value={row.spent_remark}
                            onChange={(e) => handleRowChange(row.id, 'spent_remark', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </td>

                        {/* Action */}
                        <td className="p-2.5 text-center">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Row Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Add More Row
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-200 pt-6 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                {submitting ? 'Saving Office Expense...' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}

        {/* Fallback for other expense types */}
        {selectedExpenseTypeId && !isSiteExpense && !isOfficeExpense && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{selectedExpenseTypeName}</h3>
            <p className="text-sm text-slate-500 mb-4">
              This expense category uses the standard Office Expense workflow.
            </p>
            <button
              type="button"
              onClick={() => {
                const off = initData.expenseTypes.find(t => t.expense_type.toLowerCase().includes('office'));
                if (off) handleExpenseTypeChange(off.id);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
            >
              Switch to Office Expense Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewExpense;
