const jsonDb = require('../services/jsonDb');
const crypto = require('crypto');

/**
 * Helper to generate session string like 24-25 or 26-27
 */
const getSessionString = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${String(currentYear).slice(-2)}-${String(nextYear).slice(-2)}`;
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    // dd/mm/yyyy or mm/dd/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
      }
    }
  }
  return dateStr;
};

/**
 * Get form initialization data (Expense Types, Companies, Banks, Debit, Payment Modes, Transfer To, PO Numbers, Site Documents)
 */
exports.getExpenseFormData = async (req, res) => {
  try {
    // Expense Types (status 1)
    const rawExpenseTypes = jsonDb.find('tbl_expense_type_master', { status: '1' });
    const expenseTypes = rawExpenseTypes.map(t => ({
      id: String(t.id),
      expense_type: t.expense_type
    }));

    // Companies (is_active 1)
    const rawCompanies = jsonDb.find('tbl_companies', { is_active: '1' });
    const companies = rawCompanies.map(c => ({
      id: String(c.id),
      name: c.name,
      company_alias: c.company_alias || c.alias || 'LTS'
    }));

    // Bank Accounts (is_active 1)
    const rawBankAccounts = jsonDb.find('tbl_bank_accounts', { is_active: '1' });
    const bankAccounts = rawBankAccounts.map(b => ({
      id: String(b.id),
      bank_name: b.bank_name,
      bank_account_number: b.bank_account_number,
      label: `${b.bank_name} (${b.bank_account_number || ''})`
    }));

    // Payment Modes (is_active 1)
    const rawPaymentModes = jsonDb.find('tbl_payment_modes', { is_active: '1' });
    const paymentModes = rawPaymentModes.map(p => ({
      id: String(p.id),
      payment_mode: p.payment_mode
    }));

    // Debit Accounts (is_active 1)
    const rawDebitAccounts = jsonDb.find('tbl_debit_account', { is_active: '1' });
    const debitAccounts = rawDebitAccounts.map(d => ({
      id: String(d.id),
      debit_account: d.debit_account
    }));

    // PO Numbers (is_deleted 0)
    const rawPos = jsonDb.find('tbl_po_details', { is_deleted: '0' });
    const poNumbersMap = new Map();
    rawPos.forEach(p => {
      if (p.po_no && !poNumbersMap.has(p.po_no)) {
        poNumbersMap.set(p.po_no, {
          id: String(p.id),
          po_no: p.po_no,
          operating_unit: p.operating_unit || ''
        });
      }
    });
    const poNumbers = Array.from(poNumbersMap.values()).sort((a, b) => a.po_no.localeCompare(b.po_no));

    // Site Documents (status 1)
    const rawSiteDocs = jsonDb.find('tbl_site_document', { status: '1' });
    const siteDocuments = rawSiteDocs.map(d => ({
      id: String(d.id),
      document_name: d.document_name,
      is_required: d.is_required || '0',
      value: `${d.id}-${d.is_required || '0'}`
    }));

    // Transfer To: Users (status 1)
    const rawUsers = jsonDb.find('tbl_user', { status: 1 });
    const users = rawUsers.map(u => ({
      id: String(u.id),
      name: u.name,
      type: 'user',
      label: u.name,
      value: `${u.name}-user-${u.id}`
    }));

    // Transfer To: Vendors (status 1)
    const rawVendors = jsonDb.find('tbl_vendor', { status: '1' });
    const vendors = rawVendors.map(v => ({
      id: String(v.id),
      name: v.vendor_name,
      type: 'vendor',
      label: `${v.vendor_name}${v.contact_person ? ` (${v.contact_person})` : ''}`,
      value: `${v.vendor_name}-vendor-${v.id}`
    }));

    // Transfer To: Transporters (is_active 1)
    const rawTransporters = jsonDb.find('tbl_transporter_master', { is_active: '1' });
    const transporters = rawTransporters.map(t => ({
      id: String(t.id),
      name: t.transporter_name,
      type: 'transporter',
      label: t.transporter_name,
      value: `${t.transporter_name}-transporter-${t.id}`
    }));

    // Transfer To: Material Suppliers (status 1)
    const rawMaterialSuppliers = jsonDb.find('tbl_material_supplier', { status: '1' });
    const materialSuppliers = rawMaterialSuppliers.map(m => ({
      id: String(m.id),
      name: m.supplier_name,
      type: 'supplier',
      label: m.supplier_name,
      value: `${m.supplier_name}-supplier-${m.id}`
    }));

    // Transfer To: Product Suppliers (is_active 1)
    const rawProductSuppliers = jsonDb.find('tbl_suppliers', { is_active: '1' });
    const productSuppliers = rawProductSuppliers.map(ps => ({
      id: String(ps.id),
      name: ps.name,
      type: 'product_supplier',
      label: ps.name,
      value: `${ps.name}-user-${ps.id}`
    }));

    return res.status(200).json({
      success: true,
      data: {
        expenseTypes,
        companies,
        bankAccounts,
        paymentModes,
        debitAccounts,
        poNumbers,
        siteDocuments,
        transferTo: {
          users,
          vendors,
          transporters,
          materialSuppliers,
          productSuppliers
        }
      }
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getExpenseFormData:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get allocated sites by PO Number
 */
exports.getSitesByPoNumber = async (req, res) => {
  try {
    const { poNo } = req.params;
    if (!poNo) {
      return res.status(400).json({ success: false, message: 'PO Number missing' });
    }

    // Check tbl_site_allocation first
    const allocations = jsonDb.find('tbl_site_allocation', { po_no: poNo, status: '1' });
    const siteIds = new Set();
    allocations.forEach(a => {
      if (a.site_id) siteIds.add(String(a.site_id));
    });

    // Check tbl_po_sites as well
    const poSites = jsonDb.find('tbl_po_sites', { po_no: poNo });
    poSites.forEach(p => {
      if (p.site_id) siteIds.add(String(p.site_id));
    });

    const sites = Array.from(siteIds).sort();

    return res.status(200).json({
      success: true,
      flag: sites.length > 0,
      sites,
      message: sites.length === 0 ? 'No sites allocated for this PO' : undefined
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getSitesByPoNumber:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Expense In options by Expense Type ID
 */
exports.getExpenseInList = async (req, res) => {
  try {
    const { expenseTypeId } = req.params;
    if (!expenseTypeId) {
      return res.status(400).json({ success: false, message: 'Expense Type ID missing' });
    }

    const items = jsonDb.find('tbl_expense_in_type_master', {
      expense_type_id: String(expenseTypeId),
      status: '1'
    });

    const list = items.map(i => ({
      id: String(i.id),
      expense_in_type: i.expense_in_type
    }));

    return res.status(200).json({
      success: true,
      flag: list.length > 0,
      expenseInList: list
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getExpenseInList:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Expense For options by Expense In ID
 */
exports.getExpenseForList = async (req, res) => {
  try {
    const { expenseInId } = req.params;
    if (!expenseInId) {
      return res.status(400).json({ success: false, message: 'Expense In ID missing' });
    }

    const items = jsonDb.find('tbl_expense_transfer_for_master', {
      expense_in_id: String(expenseInId)
    });

    const list = items.map(i => ({
      id: String(i.id),
      expense_transfer_for: i.expense_transfer_for
    }));

    return res.status(200).json({
      success: true,
      flag: list.length > 0,
      expenseForList: list
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getExpenseForList:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create New Expense (Site Expense or Office Expense)
 */
exports.createExpense = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || [];
    const userId = req.user ? String(req.user.id || req.user._id || 1) : '1';

    const expenseTypeName = body.expenseTypeName || (body.expenseType === '2' ? 'Site Expense' : 'Office Expense');
    const isSiteExpense = expenseTypeName.toLowerCase().includes('site');

    // 1. Validation matching PHP
    if (isSiteExpense) {
      if (!body.company_id) return res.status(400).json({ success: false, message: 'Company is missing. Please select company.' });
      if (!body.siteExpenseDateOfTransfer) return res.status(400).json({ success: false, message: 'Transfer Date missing. Please select transfer date.' });
      if (!body.poNumber) return res.status(400).json({ success: false, message: 'PO number missing. Please select PO number.' });
      if (!body.siteId) return res.status(400).json({ success: false, message: 'Site ID missing. Please select site ID.' });
      if (!body.siteExpenseTransferAmount) return res.status(400).json({ success: false, message: 'Transfer amount missing. Please enter transfer amount.' });
      if (!body.amountTransferTo) return res.status(400).json({ success: false, message: 'Transfer to missing. Please select transfer to.' });
      if (!body.bank_account_id) return res.status(400).json({ success: false, message: 'Bank Account missing. Please select bank account.' });
      if (!body.payment_mode_id) return res.status(400).json({ success: false, message: 'Payment Mode missing. Please select Payment Mode.' });
      if (!body.debit_account_id) return res.status(400).json({ success: false, message: 'Debit Account missing. Please select Debit Account.' });
    } else {
      if (!body.company_id) return res.status(400).json({ success: false, message: 'Company is missing. Please select company.' });
      if (!body.officeExpenseDateOfTransfer) return res.status(400).json({ success: false, message: 'Transfer Date missing. Please select transfer date.' });
      if (!body.officeExpenseTransferTo) return res.status(400).json({ success: false, message: 'Transfer to missing. Please select transfer to.' });
      if (!body.officeExpenseTransferAmount) return res.status(400).json({ success: false, message: 'Transfer amount missing. Please enter transfer amount.' });
      if (!body.officeExpenseBillNumber) return res.status(400).json({ success: false, message: 'Bill/Attachment Number missing. Please enter bill/attachment number.' });
      if (!body.bank_account_id) return res.status(400).json({ success: false, message: 'Bank Account missing. Please select bank account.' });
      if (!body.payment_mode_id) return res.status(400).json({ success: false, message: 'Payment Mode missing. Please select Payment Mode.' });
      if (!body.debit_account_id) return res.status(400).json({ success: false, message: 'Debit Account missing. Please select Debit Account.' });
    }

    // Resolve company alias
    const company = jsonDb.findOne('tbl_companies', { id: String(body.company_id) }) || {};
    const companyAlias = company.company_alias || company.alias || 'LTS';

    // Parse expense items/details rows
    let detailsRows = [];
    if (body.details) {
      try {
        detailsRows = typeof body.details === 'string' ? JSON.parse(body.details) : body.details;
      } catch (e) {
        detailsRows = [];
      }
    } else if (Array.isArray(body['expense_in_id[]']) || Array.isArray(body.expense_in_id)) {
      const inIds = Array.isArray(body.expense_in_id) ? body.expense_in_id : body['expense_in_id[]'];
      const forIds = Array.isArray(body.expense_for_id) ? body.expense_for_id : (body['expense_for_id[]'] || []);
      const amounts = Array.isArray(body.spentAmount) ? body.spentAmount : (body['spentAmount[]'] || []);
      const remarks = Array.isArray(body.spentRemark) ? body.spentRemark : (body['spentRemark[]'] || []);
      const docRemarks = Array.isArray(body.expense_remark) ? body.expense_remark : (body['expense_remark[]'] || []);
      const dates = Array.isArray(body.date) ? body.date : (body['date[]'] || []);

      detailsRows = inIds.map((val, idx) => ({
        expense_in_id: val,
        expense_for_id: forIds[idx] || '',
        spent_amount: amounts[idx] || '0',
        spent_remark: remarks[idx] || '',
        expense_remark: docRemarks[idx] || '',
        date: dates[idx] || formatDate()
      }));
    }

    // Process file attachments if any
    const fileMap = {};
    if (Array.isArray(files)) {
      files.forEach(f => {
        fileMap[f.fieldname] = `/uploads/expense/${f.filename}`;
      });
    }

    // 2. Process Site Expense
    if (isSiteExpense) {
      // Generate Voucher Number
      const existingVouchers = jsonDb.find('tbl_site_expense', { company_id: String(body.company_id) });
      let nextVoucherNumber;
      if (existingVouchers.length === 0) {
        nextVoucherNumber = `${companyAlias}/1`;
      } else {
        const sorted = existingVouchers.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const lastVoucher = sorted[0]?.voucher_number || '';
        const parts = lastVoucher.split('/');
        const lastNum = parseInt(parts[parts.length - 1], 10) || existingVouchers.length;
        nextVoucherNumber = `${companyAlias}/${getSessionString()}/${lastNum + 1}`;
      }

      // Parse transfer_to
      const transferParts = String(body.amountTransferTo).split('-');
      const transferToName = transferParts[0] || '';
      const allocationType = transferParts[1] || 'user';
      const transferredToId = transferParts[2] || transferParts[0];

      // Operating unit / state_for from PO details
      const poRecord = jsonDb.findOne('tbl_po_details', { po_no: body.poNumber }) || {};

      const siteExpenseRecord = {
        _id: crypto.randomBytes(12).toString('hex'),
        id: String(jsonDb.getTable('tbl_site_expense').length + 1),
        company_id: String(body.company_id),
        po_no: body.poNumber,
        site_id: body.siteId,
        state_for: poRecord.operating_unit || '',
        amount: String(body.siteExpenseTransferAmount),
        transfer_date: formatDate(body.siteExpenseDateOfTransfer),
        voucher_number: nextVoucherNumber,
        allocation_type: allocationType,
        transfered_to: String(transferredToId),
        transfer_to_name: transferToName,
        bill_no: body.siteExpenseBillNumber || '',
        remark: body.siteExpenseTransferRemark || '',
        payment_mode_id: String(body.payment_mode_id),
        bank_account_id: String(body.bank_account_id),
        debit_account_id: String(body.debit_account_id),
        status: '0',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        created_by: userId
      };

      jsonDb.insert('tbl_site_expense', siteExpenseRecord);

      // Save Details Rows
      if (Array.isArray(detailsRows)) {
        detailsRows.forEach((row, idx) => {
          const expIn = jsonDb.findOne('tbl_expense_in_type_master', { id: String(row.expense_in_id) });
          const expFor = jsonDb.findOne('tbl_expense_transfer_for_master', { id: String(row.expense_for_id) });

          const detailRecord = {
            _id: crypto.randomBytes(12).toString('hex'),
            id: String(jsonDb.getTable('tbl_site_expense_details').length + 1),
            site_expense_id: siteExpenseRecord.id,
            expense_type_id: String(body.expenseType || '2'),
            expense_type: 'Site Expense',
            expense_in_id: String(row.expense_in_id || ''),
            expense_in: expIn?.expense_in_type || '',
            expense_for_id: String(row.expense_for_id || ''),
            expense_for: expFor?.expense_transfer_for || '',
            spent_amount: String(row.spent_amount || '0'),
            spent_remark: row.spent_remark || '',
            required_doc_type: row.expense_remark ? String(row.expense_remark).split('-')[0] : '',
            attachment_path: fileMap[`bill_attachment[${idx}]`] || fileMap[`bill_attachment_${idx}`] || row.attachment_path || '',
            expense_date: formatDate(row.date),
            created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            created_by: userId
          };
          jsonDb.insert('tbl_site_expense_details', detailRecord);
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Site Expense has been saved successfully.',
        voucher_number: nextVoucherNumber,
        id: siteExpenseRecord.id
      });
    }

    // 3. Process Office Expense
    const existingOfficeVouchers = jsonDb.find('tbl_office_expense', { company_id: String(body.company_id) });
    let nextOfficeVoucherNumber;
    if (existingOfficeVouchers.length === 0) {
      nextOfficeVoucherNumber = `${companyAlias}/1`;
    } else {
      const sorted = existingOfficeVouchers.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const lastVoucher = sorted[0]?.voucher_number || '';
      const parts = lastVoucher.split('/');
      const lastNum = parseInt(parts[parts.length - 1], 10) || existingOfficeVouchers.length;
      nextOfficeVoucherNumber = `${companyAlias}/${getSessionString()}/${lastNum + 1}`;
    }

    const officeExpenseRecord = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: String(jsonDb.getTable('tbl_office_expense').length + 1),
      company_id: String(body.company_id),
      expense_type_id: String(body.expenseType || '1'),
      amount: String(body.officeExpenseTransferAmount),
      transfer_date: formatDate(body.officeExpenseDateOfTransfer),
      transfered_to: String(body.officeExpenseTransferTo),
      remark: body.officeExpenseTansferRemark || body.remark || '',
      payment_mode_id: String(body.payment_mode_id),
      bank_account_id: String(body.bank_account_id),
      debit_account_id: String(body.debit_account_id),
      voucher_number: nextOfficeVoucherNumber,
      bill_number: body.officeExpenseBillNumber || '',
      attachment: fileMap['officeExpenseAttachment'] || body.attachment || '',
      status: '1',
      is_deleted: '0',
      approved: '0',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      created_by: userId
    };

    jsonDb.insert('tbl_office_expense', officeExpenseRecord);

    // Save Details Rows
    if (Array.isArray(detailsRows)) {
      detailsRows.forEach(row => {
        const detailRecord = {
          _id: crypto.randomBytes(12).toString('hex'),
          id: String(jsonDb.getTable('tbl_expense_details').length + 1),
          expense_type_id: String(body.expenseType || '1'),
          expense_id: officeExpenseRecord.id,
          expense_in_id: String(row.expense_in_id || ''),
          expense_for_id: String(row.expense_for_id || ''),
          spent_amount: String(row.spent_amount || '0'),
          spent_remark: row.spent_remark || '',
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
          created_by: userId
        };
        jsonDb.insert('tbl_expense_details', detailRecord);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Office Expense has been saved successfully.',
      voucher_number: nextOfficeVoucherNumber,
      id: officeExpenseRecord.id
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] createExpense:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Site Expense Report (Aggregated by Site & PO, matching PHP indexAction)
 */
exports.getSiteExpenseReport = async (req, res) => {
  try {
    const { from_date, to_date, quarter, session, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const allSiteExpenses = jsonDb.getTable('tbl_site_expense');
    const allDetails = jsonDb.getTable('tbl_site_expense_details');
    const allPoSites = jsonDb.getTable('tbl_po_sites');
    const allUsers = jsonDb.getTable('tbl_user');

    // Date range filter resolution
    let startDate = null;
    let endDate = null;
    if (from_date && to_date) {
      startDate = formatDate(from_date);
      endDate = formatDate(to_date);
    } else if (quarter) {
      const parts = String(quarter).split('-');
      const year = parseInt(parts[0], 10) || new Date().getFullYear();
      const qNum = parseInt(parts[1] || quarter, 10);
      if (qNum === 1) {
        startDate = `${year}-04-01`;
        endDate = `${year}-06-30`;
      } else if (qNum === 2) {
        startDate = `${year}-07-01`;
        endDate = `${year}-09-30`;
      } else if (qNum === 3) {
        startDate = `${year}-10-01`;
        endDate = `${year}-12-31`;
      } else {
        startDate = `${year + 1}-01-01`;
        endDate = `${year + 1}-03-31`;
      }
    }

    // Filter site expenses by date
    const filteredExpenses = allSiteExpenses.filter(e => {
      if (startDate && endDate) {
        const transferDate = (e.transfer_date || '').split('T')[0];
        if (!transferDate) return false;
        return transferDate >= startDate && transferDate <= endDate;
      }
      return true;
    });

    // Total expense amount across all filtered records
    const total_amount = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Group expenses by PO No and Site ID
    const groupedMap = new Map();
    filteredExpenses.forEach(e => {
      const key = `${e.po_no || ''}_${e.site_id || ''}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          po_no: e.po_no || '',
          site_id: e.site_id || '',
          transferred_amount: 0,
          expense_ids: [],
          last_fund_transfer_date: '',
          last_created_at: '',
          last_created_by: ''
        });
      }
      const g = groupedMap.get(key);
      g.transferred_amount += (parseFloat(e.amount) || 0);
      g.expense_ids.push(String(e.id));
      if (!g.last_fund_transfer_date || e.transfer_date > g.last_fund_transfer_date) {
        g.last_fund_transfer_date = e.transfer_date;
      }
      if (!g.last_created_at || (e.created_at || '') > g.last_created_at) {
        g.last_created_at = e.created_at || '';
        g.last_created_by = e.created_by || '';
      }
    });

    // PO Sites Map for site_name and order_date
    const poSitesMap = new Map();
    allPoSites.forEach(p => {
      const key = `${p.po_no || ''}_${p.site_id || ''}`;
      if (!poSitesMap.has(key)) {
        poSitesMap.set(key, p);
      }
    });

    // Users map for creator name
    const usersMap = new Map();
    allUsers.forEach(u => {
      usersMap.set(String(u.id), u.name || '');
      usersMap.set(String(u._id), u.name || '');
    });

    // Calculate Reported Amount (balance_amount from details)
    const detailsByExpenseId = new Map();
    allDetails.forEach(d => {
      const expId = String(d.site_expense_id);
      detailsByExpenseId.set(expId, (detailsByExpenseId.get(expId) || 0) + (parseFloat(d.spent_amount) || 0));
    });

    // Build final row items
    let reportRows = Array.from(groupedMap.values()).map(g => {
      const poSite = poSitesMap.get(`${g.po_no}_${g.site_id}`) || {};
      let reportedAmount = 0;
      g.expense_ids.forEach(id => {
        reportedAmount += (detailsByExpenseId.get(id) || 0);
      });
      const notReportedAmount = Math.max(0, g.transferred_amount - reportedAmount);

      return {
        po_no: g.po_no || '-',
        po_date: poSite.order_date ? formatDate(poSite.order_date.split(' ')[0]) : '-',
        site_id: g.site_id || '-',
        site_name: poSite.site_name || 'N/A',
        transferred_amount: g.transferred_amount.toFixed(2),
        reported_amount: reportedAmount.toFixed(2),
        not_reported_amount: notReportedAmount.toFixed(2),
        last_fund_transfer_date: g.last_fund_transfer_date ? formatDate(g.last_fund_transfer_date) : '-',
        last_expense_added_by: usersMap.get(String(g.last_created_by)) || 'Administrator'
      };
    });

    // Search filter
    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      reportRows = reportRows.filter(r =>
        r.po_no.toLowerCase().includes(s) ||
        r.site_id.toLowerCase().includes(s) ||
        r.site_name.toLowerCase().includes(s) ||
        r.last_expense_added_by.toLowerCase().includes(s)
      );
    }

    // Sort by transferred_amount descending
    reportRows.sort((a, b) => parseFloat(b.transferred_amount) - parseFloat(a.transferred_amount));

    const totalEntries = reportRows.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = reportRows.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      data: paginatedData,
      total_amount: total_amount.toFixed(2),
      pagination: {
        total: totalEntries,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getSiteExpenseReport:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Office Expense Report (matching PHP officeExpensesAction)
 */
exports.getOfficeExpenseReport = async (req, res) => {
  try {
    const { from_date, to_date, company_id, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const allOfficeExpenses = jsonDb.getTable('tbl_office_expense');
    const allCompanies = jsonDb.getTable('tbl_companies');
    const allUsers = jsonDb.getTable('tbl_user');
    const allBanks = jsonDb.getTable('tbl_bank_accounts');
    const allPaymentModes = jsonDb.getTable('tbl_payment_modes');

    const companiesMap = new Map();
    allCompanies.forEach(c => companiesMap.set(String(c.id), c.name));

    const usersMap = new Map();
    allUsers.forEach(u => {
      usersMap.set(String(u.id), u.name || '');
      usersMap.set(String(u._id), u.name || '');
    });

    const banksMap = new Map();
    allBanks.forEach(b => {
      banksMap.set(String(b.id), `${b.bank_name || ''} (${b.bank_account_number || ''})`);
    });

    const paymentsMap = new Map();
    allPaymentModes.forEach(p => paymentsMap.set(String(p.id), p.payment_mode || ''));

    // Filter office expenses
    let filtered = allOfficeExpenses.filter(e => String(e.is_deleted) !== '1');

    if (company_id && company_id.trim() !== '') {
      filtered = filtered.filter(e => String(e.company_id) === String(company_id));
    }

    if (from_date && to_date) {
      const sDate = formatDate(from_date);
      const eDate = formatDate(to_date);
      filtered = filtered.filter(e => {
        const transferDate = (e.transfer_date || '').split('T')[0];
        if (!transferDate) return false;
        return transferDate >= sDate && transferDate <= eDate;
      });
    }

    const total_amount = filtered.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    let rows = filtered.map((e, idx) => ({
      id: e.id,
      company: companiesMap.get(String(e.company_id)) || 'Logimetrix Techsolutions Pvt. Ltd.',
      transfer_date: e.transfer_date ? formatDate(e.transfer_date) : '-',
      transferred_to: usersMap.get(String(e.transfered_to)) || 'User',
      amount: parseFloat(e.amount || 0).toFixed(2),
      remark: e.remark || '-',
      bill_number: e.bill_number || '',
      voucher_number: e.voucher_number || '',
      bank_account: banksMap.get(String(e.bank_account_id)) || 'Primary Bank',
      payment_mode: paymentsMap.get(String(e.payment_mode_id)) || 'Online'
    }));

    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      rows = rows.filter(r =>
        r.company.toLowerCase().includes(s) ||
        r.transferred_to.toLowerCase().includes(s) ||
        r.remark.toLowerCase().includes(s) ||
        r.bill_number.toLowerCase().includes(s) ||
        r.bank_account.toLowerCase().includes(s)
      );
    }

    rows.sort((a, b) => new Date(b.transfer_date) - new Date(a.transfer_date));

    const totalEntries = rows.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = rows.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      data: paginatedData,
      total_amount: total_amount.toFixed(2),
      companies: allCompanies.filter(c => String(c.is_active) === '1').map(c => ({ id: String(c.id), name: c.name })),
      pagination: {
        total: totalEntries,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getOfficeExpenseReport:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * B2B Fund Transfer Report (matching PHP fundTransferReportsAction)
 */
exports.getB2BFundTransferReport = async (req, res) => {
  try {
    const { from_date, to_date, company_id, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const fundTransfers = jsonDb.getTable('tbl_fund_transfers') || [];
    const siteExpenses = jsonDb.getTable('tbl_site_expense') || [];
    const allTransfers = fundTransfers.length > 0 ? [...fundTransfers, ...siteExpenses] : siteExpenses;
    const allCompanies = jsonDb.getTable('tbl_companies');
    const allUsers = jsonDb.getTable('tbl_user');
    const allBanks = jsonDb.getTable('tbl_bank_accounts');
    const allPaymentModes = jsonDb.getTable('tbl_payment_modes');

    const companiesMap = new Map();
    allCompanies.forEach(c => companiesMap.set(String(c.id), c.name));

    const usersMap = new Map();
    allUsers.forEach(u => usersMap.set(String(u.id), u.name));

    const banksMap = new Map();
    allBanks.forEach(b => banksMap.set(String(b.id), `${b.bank_name || ''} (${b.bank_account_number || ''})`));

    const paymentsMap = new Map();
    allPaymentModes.forEach(p => paymentsMap.set(String(p.id), p.payment_mode || ''));

    let filtered = allTransfers.slice();

    if (company_id && company_id.trim() !== '') {
      filtered = filtered.filter(f => String(f.company_id) === String(company_id));
    }

    if (from_date && to_date) {
      const sDate = formatDate(from_date);
      const eDate = formatDate(to_date);
      filtered = filtered.filter(f => {
        const transferDate = (f.transfer_date || '').split('T')[0];
        return transferDate >= sDate && transferDate <= eDate;
      });
    }

    const total_amount = filtered.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

    let rows = filtered.map(f => ({
      id: f.id,
      company: companiesMap.get(String(f.company_id)) || '-',
      transfer_date: f.transfer_date ? formatDate(f.transfer_date) : '-',
      transferred_to: f.transfer_to_name || usersMap.get(String(f.transfer_to)) || usersMap.get(String(f.transfered_to)) || '-',
      amount: parseFloat(f.amount || 0).toFixed(2),
      remark: f.remark || '-',
      po_no: f.po_no || '-',
      site_id: f.site_id || '-',
      bank_account: banksMap.get(String(f.bank_account_id)) || '-',
      payment_mode: paymentsMap.get(String(f.payment_mode_id)) || '-'
    }));

    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      rows = rows.filter(r =>
        r.company.toLowerCase().includes(s) ||
        r.transferred_to.toLowerCase().includes(s) ||
        r.remark.toLowerCase().includes(s) ||
        r.po_no.toLowerCase().includes(s) ||
        r.site_id.toLowerCase().includes(s)
      );
    }

    const totalEntries = rows.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = rows.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      data: paginatedData,
      total_amount: total_amount.toFixed(2),
      pagination: {
        total: totalEntries,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('[EXPENSE CONTROLLER ERROR] getB2BFundTransferReport:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

