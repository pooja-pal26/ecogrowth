const Invoice = require('../models/Invoice');
const jsonDb = require('../services/jsonDb');
const PDFDocument = require('pdfkit');

exports.getAll = async (req, res) => {
  try {
    const clients = jsonDb.getTable('tbl_client_master');
    const states = jsonDb.getTable('tbl_state_for');
    const legacyStates = jsonDb.getTable('tbl_states');
    const vendors = jsonDb.getTable('tbl_company_vendor_master');

    const clientMap = new Map(clients.map(c => [String(c.id || c._id), c.client_name]));
    const stateMap = new Map([
      ...legacyStates.map(s => [String(s.id || s._id), s.state_name]),
      ...states.map(s => [String(s.id || s._id), s.state_for || s.state_name])
    ]);
    const vendorMap = new Map(vendors.map(v => [String(v.id || v._id), v.vendor_company_name]));

    const rawInvoices = jsonDb.getTable('tbl_punched_invoice_details');

    // Filter active invoices (status != '0')
    const activeInvoices = rawInvoices.filter(inv => inv.status !== '0' && inv.status !== 0);

    let totalInvoiceAmount = 0;
    let totalReceivedAmount = 0;
    let markedForReviewCount = 0;

    const enriched = activeInvoices.map(inv => {
      const clientName = inv.client_name || clientMap.get(String(inv.client_id)) || '-';
      const stateName = inv.state_name || stateMap.get(String(inv.state_for_id)) || '-';
      const vendorName = inv.vendor_company_name || vendorMap.get(String(inv.company_vendor_id)) || '-';

      const invVal = parseFloat(inv.invoice_value) || 0;
      const recVal = parseFloat(inv.received_amount) || 0;

      totalInvoiceAmount += invVal;
      totalReceivedAmount += recVal;

      if (inv.marked_for_review === '1') {
        markedForReviewCount++;
      }

      return {
        ...inv,
        client_name: clientName,
        state_name: stateName,
        vendor_company_name: vendorName
      };
    });

    // Sort by invoice_date DESC
    enriched.sort((a, b) => new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0));

    res.status(200).json({
      success: true,
      data: enriched,
      stats: {
        totalInvoices: enriched.length,
        totalInvoiceAmount,
        totalReceivedAmount,
        totalPendingAmount: Math.max(0, totalInvoiceAmount - totalReceivedAmount),
        markedForReviewCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changeViewStatusAndUpdate = async (req, res) => {
  try {
    const { invoice_id, type, received_amount, received_date, invoice_num } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ flag: false, title: 'Invoice ID Missing!', message: 'Please try again after refreshing the page.' });
    }
    if (!type) {
      return res.status(400).json({ flag: false, title: 'Status Type Missing!', message: 'Please try again after refreshing the page.' });
    }

    const table = jsonDb.getTable('tbl_punched_invoice_details');
    const invoice = table.find(r => String(r._id) === String(invoice_id) || String(r.id) === String(invoice_id));

    if (!invoice) {
      return res.status(404).json({ flag: false, title: 'Invoice Not Found!', message: 'Invoice details could not be found.' });
    }

    if (type === 'mark') {
      invoice.marked_for_review = '0';
    } else if (type === 'unmark') {
      invoice.marked_for_review = '1';
    } else if (type === 'delete') {
      invoice.status = '0';
    } else if (type === 'update') {
      invoice.received_amount = String(received_amount || 0).trim();
      invoice.amount_received_date = received_date ? String(received_date).trim() : null;
    }

    invoice.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    jsonDb.saveTable('tbl_punched_invoice_details');

    let title = 'Status Changed Successfully';
    let message = 'Invoice view status has been changed successfully.';

    if (type === 'update') {
      title = 'Invoice Updated Successfully';
      message = 'Invoice details has been updated successfully.';
    } else if (type === 'delete') {
      title = 'Invoice Deleted Successfully';
      message = 'Invoice details has been deleted successfully.';
    }

    res.status(200).json({
      flag: true,
      title,
      message,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ flag: false, title: 'Internal Server Error', message: error.message });
  }
};

exports.attachPaymentAdvice = async (req, res) => {
  try {
    const { invoice_id, payment_advice_path } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ flag: false, title: 'Invoice ID Missing!', message: 'Please try again after refreshing the page.' });
    }

    const table = jsonDb.getTable('tbl_punched_invoice_details');
    const invoice = table.find(r => String(r._id) === String(invoice_id) || String(r.id) === String(invoice_id));

    if (!invoice) {
      return res.status(404).json({ flag: false, title: 'Invoice Not Found!', message: 'Invoice details could not be found.' });
    }

    invoice.payment_advice_path = payment_advice_path || `/uploads/invoice/payment_advice/${Date.now()}_advice.pdf`;
    invoice.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    jsonDb.saveTable('tbl_punched_invoice_details');

    res.status(200).json({
      flag: true,
      title: 'Attached Successfully',
      message: 'Payment advice has been attached successfully.',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ flag: false, title: 'Internal Server Error', message: error.message });
  }
};

exports.getPunchInitData = async (req, res) => {
  try {
    const states = jsonDb.getTable('tbl_states').filter(s => s.is_active !== 0 && s.is_active !== '0');
    const legacyStates = jsonDb.getTable('tbl_state_for');
    const clients = jsonDb.getTable('tbl_client_master').filter(c => c.is_active !== 0 && c.is_active !== '0');
    const poDetails = jsonDb.getTable('tbl_po_details');
    const poSites = jsonDb.getTable('tbl_po_sites');
    const siteAllocations = jsonDb.getTable('tbl_site_allocation');
    const companyVendors = jsonDb.getTable('tbl_company_vendor_master').filter(v => v.is_active !== 0 && v.is_active !== '0');

    // Combine states
    const stateMap = new Map();
    states.forEach(s => stateMap.set(String(s.id), { id: String(s.id), state_name: s.state_name || s.state_for }));
    legacyStates.forEach(s => {
      if (!stateMap.has(String(s.id))) {
        stateMap.set(String(s.id), { id: String(s.id), state_name: s.state_for || s.state_name });
      }
    });

    // Build PO -> Sites map
    const poMap = {};
    for (const p of poDetails) {
      if (p.po_no && !poMap[p.po_no]) poMap[p.po_no] = new Set();
    }
    for (const a of siteAllocations) {
      if (a.po_no) {
        if (!poMap[a.po_no]) poMap[a.po_no] = new Set();
        if (a.site_id) poMap[a.po_no].add(a.site_id);
      }
    }
    for (const s of poSites) {
      if (s.po_no) {
        if (!poMap[s.po_no]) poMap[s.po_no] = new Set();
        if (s.site_id) poMap[s.po_no].add(s.site_id);
      }
    }

    const poList = Object.keys(poMap).sort().map(po => ({
      po_no: po,
      sites: Array.from(poMap[po]).sort()
    }));

    res.json({
      success: true,
      states: Array.from(stateMap.values()),
      clients: clients.map(c => ({ id: String(c.id), client_name: c.client_name, state_id: String(c.state_id) })),
      poNumbers: poList,
      companyVendors: companyVendors.map(v => ({ id: String(v.id), vendor_company_name: v.vendor_company_name }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const table = jsonDb.getTable('tbl_punched_invoice_details');
    const maxId = table.reduce((max, item) => {
      const idNum = parseInt(item.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);

    const invoiceAmount = parseFloat(req.body.invoice_amount || req.body.invoice_value || 0);
    const vendorAmount = parseFloat(req.body.vendor_invoice_amount || req.body.company_vendor_invoice_amount || 0);
    const margin = vendorAmount > 0 ? (invoiceAmount - vendorAmount).toFixed(2) : null;

    const newInvoice = {
      _id: '6aa3' + Date.now().toString(16).padStart(20, '0'),
      id: String(maxId + 1),
      client_id: String(req.body.client_id || '').trim(),
      state_for_id: String(req.body.state_id || req.body.state_for_id || '').trim(),
      po_no: String(req.body.po_number || req.body.po_no || '').trim(),
      site_id: String(req.body.site_id || '').trim(),
      invoice_no: String(req.body.invoice_number || req.body.invoice_no || '').trim(),
      invoice_date: String(req.body.invoice_date || '').trim(),
      invoice_value: String(invoiceAmount).trim(),
      amount_received_date: req.body.received_amount_date || req.body.amount_received_date || null,
      received_amount: String(req.body.received_amount || 0).trim(),
      invoice_remark: String(req.body.remark || req.body.invoice_remark || '').trim(),
      invoice_doc_path: req.body.invoice_doc_path || null,
      company_vendor_id: req.body.company_vendor || req.body.company_vendor_id || null,
      company_vendor_invoice_date: req.body.vendor_invoice_date || req.body.company_vendor_invoice_date || null,
      company_vendor_invoice_number: req.body.vendor_invoice_number || req.body.company_vendor_invoice_number || null,
      company_vendor_invoice_amount: vendorAmount > 0 ? String(vendorAmount) : null,
      company_vendor_invoice_image_path: req.body.vendor_invoice_doc_path || null,
      payment_advice_path: null,
      margin: margin,
      marked_for_review: '0',
      status: '1',
      created_by: '1',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    table.unshift(newInvoice);
    jsonDb.saveTable('tbl_punched_invoice_details');

    res.status(201).json({
      success: true,
      flag: true,
      message: 'Invoice Details have been saved successfully.',
      data: newInvoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Invoice.findByIdAndUpdate(req.params.id, { status: '0' }, { new: true });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function numberToWords(number) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (number === 0) return 'zero';
    if (number < 20) return ones[number];
    if (number < 100) return tens[Math.floor(number / 10)] + (number % 10 !== 0 ? ' ' + ones[number % 10] : '');
    if (number < 1000) return ones[Math.floor(number / 100)] + ' hundred' + (number % 100 !== 0 ? ' and ' + numberToWords(number % 100) : '');
    if (number < 100000) return numberToWords(Math.floor(number / 1000)) + ' thousand' + (number % 1000 !== 0 ? ' ' + numberToWords(number % 1000) : '');
    if (number < 1000000) return numberToWords(Math.floor(number / 100000)) + ' lakh' + (number % 100000 !== 0 ? ' ' + numberToWords(number % 100000) : '');
    return numberToWords(Math.floor(number / 10000000)) + ' crore' + (number % 10000000 !== 0 ? ' ' + numberToWords(number % 10000000) : '');
}

exports.downloadPdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument();
    let filename = encodeURIComponent('Invoice-' + invoice.invoiceNumber) + '.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(25).text('EcoGrowth Invoice', 100, 100);
    doc.fontSize(15).text('Invoice Number: ' + invoice.invoiceNumber, 100, 150);
    doc.text('Status: ' + invoice.status, 100, 180);
    doc.text('Total Amount (incl. 18% GST): Rs. ' + invoice.amount, 100, 210);

    const amountInWords = numberToWords(Math.floor(invoice.amount));
    doc.text('Amount in words: ' + amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1) + ' Rupees Only', 100, 240);

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// SERVICES / PRODUCTS CONTROLLER
// ==========================================
exports.getServicesProducts = async (req, res) => {
  try {
    const table = jsonDb.getTable('tbl_invoice_services_master');
    const states = jsonDb.getTable('tbl_states');
    const clients = jsonDb.getTable('tbl_client_master');

    const stateMap = new Map(states.map(s => [String(s.id || s._id), s.state_name]));
    const clientMap = new Map(clients.map(c => [String(c.id || c._id), c.client_name]));

    const activeList = table
      .filter(item => item.is_deleted !== '1' && item.is_deleted !== 1)
      .map(item => ({
        ...item,
        state_name: stateMap.get(String(item.state_id)) || '-',
        client_name: clientMap.get(String(item.client_id)) || '-'
      }));

    activeList.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.status(200).json({ success: true, data: activeList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addServiceProduct = async (req, res) => {
  try {
    const table = jsonDb.getTable('tbl_invoice_services_master');
    const maxId = table.reduce((max, item) => {
      const idNum = parseInt(item.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);

    const newItem = {
      _id: '6aa3' + Date.now().toString(16).padStart(20, '0'),
      id: String(maxId + 1),
      state_id: String(req.body.state_id || '').trim(),
      client_id: String(req.body.client_id || '').trim(),
      name_of_service: String(req.body.service_name || req.body.name_of_service || '').trim(),
      hsn_sac_code: String(req.body.hsn_sac_code || req.body.hsn_code || '').trim(),
      unit_of_measurement: String(req.body.unit_of_measurement || '').trim(),
      gst_slab: String(req.body.gst_slab || '18').trim(),
      igst_percentage: String(req.body.igst_percentage || req.body.gst_slab || '18').trim(),
      cgst_percentage: String(req.body.cgst_percentage || '9').trim(),
      sgst_percentage: String(req.body.sgst_percentage || '9').trim(),
      service_rate: String(req.body.service_rate || req.body.service_price || '0').trim(),
      is_active: '1',
      is_deleted: '0',
      created_by: '1',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    table.unshift(newItem);
    jsonDb.saveTable('tbl_invoice_services_master');

    res.status(201).json({ success: true, message: 'Service/Product added successfully', data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServiceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const table = jsonDb.getTable('tbl_invoice_services_master');
    const item = table.find(r => String(r._id) === String(id) || String(r.id) === String(id));

    if (!item) {
      return res.status(404).json({ success: false, message: 'Service/Product not found' });
    }

    if (req.body.state_id !== undefined) item.state_id = String(req.body.state_id).trim();
    if (req.body.client_id !== undefined) item.client_id = String(req.body.client_id).trim();
    if (req.body.service_name !== undefined || req.body.name_of_service !== undefined) {
      item.name_of_service = String(req.body.service_name || req.body.name_of_service).trim();
    }
    if (req.body.hsn_sac_code !== undefined || req.body.hsn_code !== undefined) {
      item.hsn_sac_code = String(req.body.hsn_sac_code || req.body.hsn_code).trim();
    }
    if (req.body.unit_of_measurement !== undefined) item.unit_of_measurement = String(req.body.unit_of_measurement).trim();
    if (req.body.gst_slab !== undefined) item.gst_slab = String(req.body.gst_slab).trim();
    if (req.body.igst_percentage !== undefined) item.igst_percentage = String(req.body.igst_percentage).trim();
    if (req.body.cgst_percentage !== undefined) item.cgst_percentage = String(req.body.cgst_percentage).trim();
    if (req.body.sgst_percentage !== undefined) item.sgst_percentage = String(req.body.sgst_percentage).trim();
    if (req.body.service_rate !== undefined || req.body.service_price !== undefined) {
      item.service_rate = String(req.body.service_rate || req.body.service_price).trim();
    }

    item.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    jsonDb.saveTable('tbl_invoice_services_master');

    res.status(200).json({ success: true, message: 'Service/Product updated successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const table = jsonDb.getTable('tbl_invoice_services_master');
    const item = table.find(r => String(r._id) === String(id) || String(r.id) === String(id));

    if (!item) {
      return res.status(404).json({ success: false, message: 'Service/Product not found' });
    }

    if (action === 'activate') {
      item.is_active = '1';
    } else if (action === 'deactivate') {
      item.is_active = '0';
    } else if (action === 'delete') {
      item.is_deleted = '1';
    }

    item.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    jsonDb.saveTable('tbl_invoice_services_master');

    res.status(200).json({ success: true, message: `Action ${action} completed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// GENERATE INVOICE CONTROLLER
// ==========================================
exports.getGenerateInvoiceInitData = async (req, res) => {
  try {
    const states = jsonDb.getTable('tbl_states').filter(s => s.is_active !== 0 && s.is_active !== '0');
    const clients = jsonDb.getTable('tbl_client_master').filter(c => c.is_active !== 0 && c.is_active !== '0');
    const services = jsonDb.getTable('tbl_invoice_services_master').filter(s => s.is_deleted !== '1' && s.is_deleted !== 1 && s.is_active !== '0');
    const poDetails = jsonDb.getTable('tbl_po_details');
    const poSites = jsonDb.getTable('tbl_po_sites');
    const siteAllocations = jsonDb.getTable('tbl_site_allocation');

    // Build PO -> Sites map
    const poMap = {};
    for (const p of poDetails) {
      if (p.po_no && !poMap[p.po_no]) poMap[p.po_no] = new Set();
    }
    for (const a of siteAllocations) {
      if (a.po_no) {
        if (!poMap[a.po_no]) poMap[a.po_no] = new Set();
        if (a.site_id) poMap[a.po_no].add(a.site_id);
      }
    }
    for (const s of poSites) {
      if (s.po_no) {
        if (!poMap[s.po_no]) poMap[s.po_no] = new Set();
        if (s.site_id) poMap[s.po_no].add(s.site_id);
      }
    }

    const poList = Object.keys(poMap).sort().map(po => ({
      po_no: po,
      sites: Array.from(poMap[po]).sort()
    }));

    res.status(200).json({
      success: true,
      states: states.map(s => ({ id: String(s.id), state_name: s.state_name, state_code: s.state_code })),
      clients: clients.map(c => ({
        id: String(c.id),
        client_name: c.client_name,
        state_id: String(c.state_id),
        client_address: c.client_address || c.address || '',
        gst_no: c.gst_no || c.gstin || '',
        pan_no: c.pan_no || ''
      })),
      services: services.map(s => ({
        id: String(s.id),
        state_id: String(s.state_id),
        client_id: String(s.client_id),
        name_of_service: s.name_of_service,
        hsn_sac_code: s.hsn_sac_code,
        unit_of_measurement: s.unit_of_measurement,
        gst_slab: s.gst_slab,
        igst_percentage: s.igst_percentage,
        cgst_percentage: s.cgst_percentage,
        sgst_percentage: s.sgst_percentage,
        service_rate: s.service_rate
      })),
      poNumbers: poList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveGeneratedInvoice = async (req, res) => {
  try {
    const table = jsonDb.getTable('tbl_punched_invoice_details');
    const maxId = table.reduce((max, item) => {
      const idNum = parseInt(item.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);

    const year = new Date().getFullYear().toString().slice(-2);
    const month = new Date().getMonth() + 1;
    const fy = month > 3 ? `${year}${parseInt(year, 10) + 1}` : `${parseInt(year, 10) - 1}${year}`;
    const generatedInvoiceNumber = req.body.invoice_number || `LTS/${fy}/${String(maxId + 1).padStart(4, '0')}`;

    const newInvoice = {
      _id: '6aa3' + Date.now().toString(16).padStart(20, '0'),
      id: String(maxId + 1),
      client_id: String(req.body.client_id || '').trim(),
      state_for_id: String(req.body.state_id || '').trim(),
      po_no: String(req.body.po_number || '').trim(),
      site_id: String(req.body.site_id || '').trim(),
      invoice_no: generatedInvoiceNumber,
      invoice_date: req.body.invoice_date || new Date().toISOString().slice(0, 10),
      invoice_value: String(req.body.total_invoice_amount || req.body.taxable_value || '0').trim(),
      invoice_remark: req.body.remarks || `Generated GST Tax Invoice (${req.body.isIgstApplicable === 'Yes' ? 'IGST' : 'CGST+SGST'})`,
      reverse_charge: req.body.reverseChargeTax || 'No',
      is_igst: req.body.isIgstApplicable || 'No',
      work_completion_date: req.body.work_completion_date || '',
      line_items: req.body.line_items || [],
      tax_details: req.body.tax_details || {},
      status: '1',
      created_by: '1',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    table.unshift(newInvoice);
    jsonDb.saveTable('tbl_punched_invoice_details');

    res.status(201).json({
      success: true,
      message: 'Invoice Generated successfully',
      data: newInvoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MONTHLY INVOICE REPORT CONTROLLER
// ==========================================
exports.getMonthlyInvoices = async (req, res) => {
  try {
    const table = jsonDb.getTable('monthly_invoice_details');
    const states = jsonDb.getTable('tbl_states');
    const clients = jsonDb.getTable('tbl_client_master');

    const stateMap = new Map(states.map(s => [String(s.id || s._id), s.state_name]));
    const clientMap = new Map(clients.map(c => [String(c.id || c._id), c.client_name]));

    const { month, year } = req.query;

    let filtered = table.filter(item => item.is_deleted !== '1' && item.is_deleted !== 1);

    if (month) {
      filtered = filtered.filter(item => String(parseInt(item.month, 10)) === String(parseInt(month, 10)));
    }
    if (year) {
      filtered = filtered.filter(item => String(item.year) === String(year));
    }

    let totalPoAmount = 0;
    let totalInvoiceAmount = 0;
    let totalLtsInvoiceAmount = 0;

    const enriched = filtered.map(item => {
      let vendorDetails = [];
      try {
        if (typeof item.vendor_data === 'string') {
          vendorDetails = JSON.parse(item.vendor_data);
        } else if (Array.isArray(item.vendor_data)) {
          vendorDetails = item.vendor_data;
        }
      } catch (e) {
        vendorDetails = [];
      }

      const poVal = parseFloat(item.po_amount) || 0;
      const invVal = parseFloat(item.invoice_value) || 0;
      const ltsVal = parseFloat(item.lts_invoice_amount) || 0;

      totalPoAmount += poVal;
      totalInvoiceAmount += invVal;
      totalLtsInvoiceAmount += ltsVal;

      return {
        ...item,
        state_name: stateMap.get(String(item.state_id)) || item.state_name || '-',
        client_name: clientMap.get(String(item.client_id)) || item.client_name || '-',
        vendor_details: vendorDetails
      };
    });

    enriched.sort((a, b) => {
      const yearDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
      if (yearDiff !== 0) return yearDiff;
      return (parseInt(b.month, 10) || 0) - (parseInt(a.month, 10) || 0);
    });

    res.status(200).json({
      success: true,
      data: enriched,
      totals: {
        po_amount: totalPoAmount.toFixed(2),
        invoice_amount: totalInvoiceAmount.toFixed(2),
        lts_invoice_amount: totalLtsInvoiceAmount.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMonthlyInvoice = async (req, res) => {
  try {
    const table = jsonDb.getTable('monthly_invoice_details');
    const maxId = table.reduce((max, item) => {
      const idNum = parseInt(item.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);

    const vendorData = Array.isArray(req.body.vendor_details)
      ? JSON.stringify(req.body.vendor_details)
      : (req.body.vendor_data || '[]');

    const newRecord = {
      _id: '6aa3' + Date.now().toString(16).padStart(20, '0'),
      id: String(maxId + 1),
      month: String(req.body.month || new Date().getMonth() + 1),
      year: String(req.body.year || new Date().getFullYear()),
      invoice_value: String(req.body.invoice_amount || req.body.invoice_value || '0').trim(),
      lts_invoice_amount: String(req.body.lts_invoice_amount || '0').trim(),
      profit: String(req.body.profit || '0').trim(),
      lts_invoice_percent: String(req.body.lts_invoice_percent || '0').trim(),
      state_id: String(req.body.state_id || '').trim(),
      client_id: String(req.body.client_id || '').trim(),
      po_amount: String(req.body.po_value || req.body.po_amount || '0').trim(),
      vendor_data: vendorData,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      is_deleted: '0'
    };

    table.unshift(newRecord);
    jsonDb.saveTable('monthly_invoice_details');

    res.status(201).json({
      success: true,
      message: 'Monthly Invoice added successfully',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMonthlyInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const table = jsonDb.getTable('monthly_invoice_details');
    const record = table.find(r => String(r._id) === String(id) || String(r.id) === String(id));

    if (!record) {
      return res.status(404).json({ success: false, message: 'Monthly Invoice not found' });
    }

    record.is_deleted = '1';
    jsonDb.saveTable('monthly_invoice_details');

    res.status(200).json({ success: true, message: 'Monthly invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};