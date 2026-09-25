import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Trash2, Printer, Eye, ArrowLeft, CheckCircle2, Building2, MapPin, Calendar, Percent
} from 'lucide-react';
import { 
  getGenerateInvoiceInitData, 
  saveGeneratedInvoice 
} from '../../services/invoiceService';

const GenerateInvoice = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [clients, setClients] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [poList, setPoList] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    state_id: '',
    client_id: '',
    po_number: '',
    site_id: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    reverseChargeTax: 'No',
    isIgstApplicable: 'No',
    work_completion_date: new Date().toISOString().slice(0, 10),
    remarks: ''
  });

  // Line items state
  const [lineItems, setLineItems] = useState([
    { service_product_id: '', name_of_service: '', hsn_sac_code: '', unit_of_measurement: '', rate: '', quantity: '', taxable_value: '', igst_percentage: '18', cgst_percentage: '9', sgst_percentage: '9' }
  ]);

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        setLoading(true);
        const res = await getGenerateInvoiceInitData();
        if (res.success) {
          setStates(res.states || []);
          setClients(res.clients || []);
          setServicesList(res.services || []);
          setPoList(res.poNumbers || []);
        }
      } catch (err) {
        console.error('Error loading generate invoice init data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInit();
  }, []);

  // Filter clients by state
  const filteredClients = useMemo(() => {
    if (!formData.state_id) return clients;
    return clients.filter(c => String(c.state_id) === String(formData.state_id));
  }, [clients, formData.state_id]);

  // Selected client object
  const selectedClient = useMemo(() => {
    return clients.find(c => String(c.id) === String(formData.client_id)) || null;
  }, [clients, formData.client_id]);

  // Selected state object
  const selectedState = useMemo(() => {
    return states.find(s => String(s.id) === String(formData.state_id)) || null;
  }, [states, formData.state_id]);

  // Available sites for selected PO
  const availableSites = useMemo(() => {
    if (!formData.po_number) return [];
    const poObj = poList.find(p => p.po_no === formData.po_number);
    return poObj ? poObj.sites : [];
  }, [poList, formData.po_number]);

  // Handle top input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state_id' ? { client_id: '' } : {}),
      ...(name === 'po_number' ? { site_id: '' } : {})
    }));
  };

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    setLineItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'service_product_id') {
        const selectedSrv = servicesList.find(s => String(s.id) === String(value));
        if (selectedSrv) {
          item.name_of_service = selectedSrv.name_of_service;
          item.hsn_sac_code = selectedSrv.hsn_sac_code || '';
          item.unit_of_measurement = selectedSrv.unit_of_measurement || '';
          item.rate = selectedSrv.service_rate || '0';
          item.igst_percentage = selectedSrv.igst_percentage || '18';
          item.cgst_percentage = selectedSrv.cgst_percentage || '9';
          item.sgst_percentage = selectedSrv.sgst_percentage || '9';
        }
      }

      // Compute taxable value = rate * quantity
      const rateNum = parseFloat(item.rate) || 0;
      const qtyNum = parseFloat(item.quantity) || 0;
      item.taxable_value = qtyNum > 0 ? (rateNum * qtyNum).toFixed(2) : '0.00';

      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { service_product_id: '', name_of_service: '', hsn_sac_code: '', unit_of_measurement: '', rate: '', quantity: '', taxable_value: '', igst_percentage: '18', cgst_percentage: '9', sgst_percentage: '9' }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Financial Calculations
  const totals = useMemo(() => {
    let taxable = 0;
    let igst = 0;
    let cgst = 0;
    let sgst = 0;

    const isIgst = formData.isIgstApplicable === 'Yes';

    lineItems.forEach(item => {
      const taxVal = parseFloat(item.taxable_value) || 0;
      taxable += taxVal;

      if (isIgst) {
        const igstRate = parseFloat(item.igst_percentage) || 18;
        igst += (taxVal * igstRate) / 100;
      } else {
        const cgstRate = parseFloat(item.cgst_percentage) || 9;
        const sgstRate = parseFloat(item.sgst_percentage) || 9;
        cgst += (taxVal * cgstRate) / 100;
        sgst += (taxVal * sgstRate) / 100;
      }
    });

    const taxAmount = isIgst ? igst : (cgst + sgst);
    const grandTotal = taxable + taxAmount;

    return {
      taxableValue: taxable.toFixed(2),
      igstValue: igst.toFixed(2),
      cgstValue: cgst.toFixed(2),
      sgstValue: sgst.toFixed(2),
      totalTax: taxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  }, [lineItems, formData.isIgstApplicable]);

  // Submit / Save and Preview
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state_id) return alert('Please select State For.');
    if (!formData.client_id) return alert('Please select Client Name.');
    if (!formData.po_number) return alert('Please select PO Number.');
    if (!formData.site_id) return alert('Please select Site ID.');

    const hasValidItem = lineItems.some(item => parseFloat(item.taxable_value) > 0);
    if (!hasValidItem) {
      return alert('Please add at least one line item with valid rate and quantity.');
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        client_name: selectedClient?.client_name || '',
        state_name: selectedState?.state_name || '',
        taxable_value: totals.taxableValue,
        total_invoice_amount: totals.grandTotal,
        line_items: lineItems,
        tax_details: totals
      };

      const res = await saveGeneratedInvoice(payload);
      if (res.success) {
        setGeneratedInvoiceData({
          ...res.data,
          client: selectedClient,
          state: selectedState,
          lineItems,
          totals
        });
        setPreviewOpen(true);
      }
    } catch (err) {
      alert('Failed to generate invoice: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Container */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Step 1: Base Parameters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="text-white px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
            }}
          >
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Invoice Generation Form</h2>
            <p className="text-[11px] text-white/80 mt-0.5"><span className="text-rose-300 font-bold">*</span> Fields are mandatory</p>
          </div>

          <div className="p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                State For <span className="text-red-500">*</span>
              </label>
              <select
                name="state_id"
                value={formData.state_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.state_name}</option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Client</option>
                {filteredClients.map(c => (
                  <option key={c.id} value={c.id}>{c.client_name}</option>
                ))}
              </select>
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                PO Number <span className="text-red-500">*</span>
              </label>
              <select
                name="po_number"
                value={formData.po_number}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select PO Number</option>
                {poList.map((p, idx) => (
                  <option key={idx} value={p.po_no}>{p.po_no}</option>
                ))}
              </select>
            </div>

            {/* Site ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Site ID <span className="text-red-500">*</span>
              </label>
              <select
                name="site_id"
                value={formData.site_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Site ID</option>
                {availableSites.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tax reverse charge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tax Payable Under Reverse Charge
              </label>
              <select
                name="reverseChargeTax"
                value={formData.reverseChargeTax}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* IGST Applicable */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Is IGST Applicable <span className="text-red-500">*</span>
              </label>
              <select
                name="isIgstApplicable"
                value={formData.isIgstApplicable}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="No">No (CGST + SGST)</option>
                <option value="Yes">Yes (IGST)</option>
              </select>
            </div>

            {/* Work Completion Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Work Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="work_completion_date"
                value={formData.work_completion_date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Billing & Shipping Party Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5 sm:p-5">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-center border-b pb-2 mb-3">
            Billing And Shipping Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Bill To Party */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold border-b pb-2">
                <Building2 size={18} />
                <span>Bill To Party</span>
              </div>
              <div className="text-sm space-y-1.5 pt-1">
                <p><strong className="text-gray-700">Client:</strong> {selectedClient?.client_name || <span className="text-gray-400 italic">Select Client above</span>}</p>
                <p><strong className="text-gray-700">Address:</strong> {selectedClient?.client_address || <span className="text-gray-400 italic">No address on file</span>}</p>
                <p><strong className="text-gray-700">GSTIN:</strong> {selectedClient?.gst_no || '-'}</p>
                <p><strong className="text-gray-700">State:</strong> {selectedState?.state_name || '-'} {selectedState?.state_code ? `(Code: ${selectedState.state_code})` : ''}</p>
              </div>
            </div>

            {/* Ship To Party */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-2">
                <MapPin size={18} />
                <span>Ship To Party</span>
              </div>
              <div className="text-sm space-y-1.5 pt-1">
                <p><strong className="text-gray-700">Client:</strong> {selectedClient?.client_name || <span className="text-gray-400 italic">Select Client above</span>}</p>
                <p><strong className="text-gray-700">Address:</strong> {selectedClient?.client_address || <span className="text-gray-400 italic">No address on file</span>}</p>
                <p><strong className="text-gray-700">GSTIN:</strong> {selectedClient?.gst_no || '-'}</p>
                <p><strong className="text-gray-700">State:</strong> {selectedState?.state_name || '-'} {selectedState?.state_code ? `(Code: ${selectedState.state_code})` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Products / Services Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2.5 sm:px-5 sm:py-3 flex justify-between items-center">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider">Products & Services Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Product/Service
            </button>
          </div>

          <div className="overflow-x-auto p-2.5 sm:p-3">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b">
                  <th className="py-2.5 px-3 min-w-[240px]">Name of Product/Service</th>
                  <th className="py-2.5 px-3 text-center w-28">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-center w-28">UOM</th>
                  <th className="py-2.5 px-3 text-right w-32">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-center w-28">Quantity</th>
                  <th className="py-2.5 px-3 text-right w-36">Taxable Value (₹)</th>
                  <th className="py-2.5 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20">
                    <td className="py-2 px-3">
                      <select
                        value={item.service_product_id}
                        onChange={(e) => handleItemChange(idx, 'service_product_id', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Service / Product</option>
                        {servicesList.map(s => (
                          <option key={s.id} value={s.id}>{s.name_of_service}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.hsn_sac_code}
                        onChange={(e) => handleItemChange(idx, 'hsn_sac_code', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-center"
                        placeholder="HSN"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.unit_of_measurement}
                        onChange={(e) => handleItemChange(idx, 'unit_of_measurement', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-center"
                        placeholder="UOM"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-right font-medium"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-center font-bold text-blue-700"
                        placeholder="Qty"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-800">
                      ₹ {parseFloat(item.taxable_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={addLineItem}
              className="border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add Another Service/Product
            </button>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase block font-semibold">Total Taxable Value</span>
                <span className="font-bold text-gray-800">₹ {parseFloat(totals.taxableValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {formData.isIgstApplicable === 'Yes' ? (
                <div className="text-right">
                  <span className="text-xs text-gray-500 uppercase block font-semibold">IGST (18%)</span>
                  <span className="font-bold text-blue-700">₹ {parseFloat(totals.igstValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase block font-semibold">CGST (9%)</span>
                    <span className="font-bold text-blue-700">₹ {parseFloat(totals.cgstValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase block font-semibold">SGST (9%)</span>
                    <span className="font-bold text-blue-700">₹ {parseFloat(totals.sgstValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}

              <div className="text-right pl-4 border-l border-gray-300">
                <span className="text-xs text-gray-500 uppercase block font-bold">Total Invoice Amount</span>
                <span className="text-lg font-extrabold text-emerald-700">₹ {parseFloat(totals.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            {submitting ? 'Generating Invoice...' : 'Generate & Preview Invoice'}
          </button>
        </div>
      </form>

      {/* Generated Tax Invoice Print Preview Modal (Exact PHP Parity generated-invoice-view.phtml) */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Actions Header */}
            <div 
              className="text-white px-6 py-3 flex justify-between items-center print:hidden shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Printer size={18} /> Tax Invoice Preview & Print
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={14} /> Print Invoice
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Content */}
            <div className="p-6 sm:p-8 overflow-y-auto font-sans text-xs text-gray-900 border" id="printable-invoice">
              <div className="border border-black">
                {/* Vendor Header */}
                <div className="border-b border-black p-2 text-xs">
                  <strong>Vendor Name and Address :</strong> LOGIMETRIX TECHSOLUTIONS PVT. LTD., 3/204, II Floor, Vikas Khand, Gomti Nagar, Lucknow(UP) - 226010
                </div>
                <div className="border-b border-black p-2 text-xs flex justify-between">
                  <span><strong>GST NO. :</strong> 09AACCL3704H1ZO</span>
                  <span className="italic">Original for Recipient</span>
                </div>
                <div className="border-b border-black p-2 text-xs">
                  <strong>PAN NO. :</strong> AACCL3704H
                </div>

                {/* Tax Invoice Heading */}
                <div className="border-b border-black p-2 text-center text-sm font-bold uppercase bg-gray-50">
                  Tax Invoice
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 border-b border-black divide-x divide-black text-xs">
                  <div className="p-2 space-y-1">
                    <p><strong>Invoice No :</strong> {generatedInvoiceData?.invoice_no || 'LTS/Draft'}</p>
                    <p><strong>Invoice Date :</strong> {formData.invoice_date}</p>
                    <p><strong>Tax is payable under reverse charge :</strong> {formData.reverseChargeTax}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <p><strong>PO No :</strong> {formData.po_number}</p>
                    <p><strong>Site ID :</strong> {formData.site_id}</p>
                    <p><strong>Work Completion Date :</strong> {formData.work_completion_date}</p>
                  </div>
                </div>

                {/* Bill To and Ship To Table */}
                <div className="grid grid-cols-2 border-b border-black divide-x divide-black text-xs">
                  <div className="p-2">
                    <strong className="block border-b border-gray-400 pb-1 mb-1 uppercase font-bold">Bill To Party</strong>
                    <p><strong>Name:</strong> {selectedClient?.client_name || '-'}</p>
                    <p><strong>Address:</strong> {selectedClient?.client_address || '-'}</p>
                    <p><strong>GSTIN:</strong> {selectedClient?.gst_no || '-'}</p>
                    <p><strong>State:</strong> {selectedState?.state_name} (Code: {selectedState?.state_code})</p>
                  </div>
                  <div className="p-2">
                    <strong className="block border-b border-gray-400 pb-1 mb-1 uppercase font-bold">Ship To Party</strong>
                    <p><strong>Name:</strong> {selectedClient?.client_name || '-'}</p>
                    <p><strong>Address:</strong> {selectedClient?.client_address || '-'}</p>
                    <p><strong>GSTIN:</strong> {selectedClient?.gst_no || '-'}</p>
                    <p><strong>State:</strong> {selectedState?.state_name} (Code: {selectedState?.state_code})</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold">
                      <th className="border-r border-black p-2 text-center w-8">#</th>
                      <th className="border-r border-black p-2">Description of Goods / Services</th>
                      <th className="border-r border-black p-2 text-center w-16">HSN/SAC</th>
                      <th className="border-r border-black p-2 text-center w-14">Qty</th>
                      <th className="border-r border-black p-2 text-center w-14">UOM</th>
                      <th className="border-r border-black p-2 text-right w-20">Rate</th>
                      <th className="p-2 text-right w-24">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border-r border-black p-2 text-center">{idx + 1}</td>
                        <td className="border-r border-black p-2 font-medium">{item.name_of_service}</td>
                        <td className="border-r border-black p-2 text-center">{item.hsn_sac_code || '-'}</td>
                        <td className="border-r border-black p-2 text-center">{item.quantity}</td>
                        <td className="border-r border-black p-2 text-center">{item.unit_of_measurement || '-'}</td>
                        <td className="border-r border-black p-2 text-right">{parseFloat(item.rate || 0).toFixed(2)}</td>
                        <td className="p-2 text-right font-semibold">{parseFloat(item.taxable_value || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-black font-bold">
                      <td colSpan={6} className="border-r border-black p-2 text-right uppercase">Total Taxable Value:</td>
                      <td className="p-2 text-right">₹ {totals.taxableValue}</td>
                    </tr>
                    {formData.isIgstApplicable === 'Yes' ? (
                      <tr className="border-t border-gray-300">
                        <td colSpan={6} className="border-r border-black p-2 text-right font-medium">IGST (18%):</td>
                        <td className="p-2 text-right">₹ {totals.igstValue}</td>
                      </tr>
                    ) : (
                      <>
                        <tr className="border-t border-gray-300">
                          <td colSpan={6} className="border-r border-black p-2 text-right font-medium">CGST (9%):</td>
                          <td className="p-2 text-right">₹ {totals.cgstValue}</td>
                        </tr>
                        <tr className="border-t border-gray-300">
                          <td colSpan={6} className="border-r border-black p-2 text-right font-medium">SGST (9%):</td>
                          <td className="p-2 text-right">₹ {totals.sgstValue}</td>
                        </tr>
                      </>
                    )}
                    <tr className="border-t-2 border-black font-bold text-sm bg-gray-50">
                      <td colSpan={6} className="border-r border-black p-2 text-right uppercase">Invoice Total (INR):</td>
                      <td className="p-2 text-right font-extrabold text-emerald-800">₹ {totals.grandTotal}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Bank Details & Signature Footer */}
                <div className="grid grid-cols-2 border-t border-black divide-x divide-black p-3 text-xs">
                  <div>
                    <strong className="block uppercase font-bold mb-1">Bank Details:</strong>
                    <p><strong>Bank:</strong> HDFC BANK</p>
                    <p><strong>Account Name:</strong> LOGIMETRIX TECHSOLUTIONS PVT. LTD.</p>
                    <p><strong>A/C No:</strong> 50200021303847</p>
                    <p><strong>IFSC Code:</strong> HDFC0001556</p>
                    <p><strong>Branch:</strong> Gomti Nagar, Lucknow</p>
                  </div>
                  <div className="flex flex-col justify-between text-right p-2">
                    <p className="font-bold">For LOGIMETRIX TECHSOLUTIONS PVT. LTD.</p>
                    <p className="mt-12 font-medium">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateInvoice;
