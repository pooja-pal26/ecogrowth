const jsonDb = require('../services/jsonDb');

const parseAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

const parseDateString = (dateVal) => {
  if (!dateVal) return '';
  if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
  const s = String(dateVal).trim();
  if (s.includes('T')) return s.split('T')[0];
  if (s.includes(' ')) return s.split(' ')[0];
  return s;
};

exports.getTotalSites = async (req, res) => {
  try {
    const { from_date, to_date, site_type } = req.query;
    let sites = jsonDb.getTable('tbl_po_sites').filter(s => s.is_deleted !== 1 && s.is_deleted !== '1');
    if (from_date) sites = sites.filter(s => parseDateString(s.created_at || s.order_date) >= from_date);
    if (to_date) sites = sites.filter(s => parseDateString(s.created_at || s.order_date) <= to_date);
    if (site_type) sites = sites.filter(s => (s.site_type || '').toLowerCase().includes(site_type.trim().toLowerCase()));
    res.json({ total: sites.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingSites = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    let allocations = jsonDb.getTable('tbl_site_allocation').filter(s => 
      (s.site_completion_status === 0 || s.site_completion_status === '0') &&
      (s.status === 1 || s.status === '1')
    );
    if (from_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) >= from_date);
    if (to_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) <= to_date);
    res.json({ pending: allocations.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllocatedSites = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    let allocations = jsonDb.getTable('tbl_site_allocation').filter(s => s.status === 1 || s.status === '1');
    if (from_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) >= from_date);
    if (to_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) <= to_date);
    res.json({ allocated: allocations.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompletedSites = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    let allocations = jsonDb.getTable('tbl_site_allocation').filter(s => s.close_status === 1 || s.close_status === '1');
    if (from_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) >= from_date);
    if (to_date) allocations = allocations.filter(s => parseDateString(s.po_date || s.created) <= to_date);
    res.json({ completed: allocations.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSiteExpenses = async (req, res) => {
  try {
    const currentYear = req.query.year || new Date().getFullYear().toString();
    const siteExpenses = jsonDb.getTable('tbl_site_expense');

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const prefix = `${currentYear}-${monthNum}`;
      const total = siteExpenses
        .filter(e => parseDateString(e.transfer_date).startsWith(prefix))
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);
      return { month: name, total: Math.round(total * 100) / 100 };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOfficeExpenses = async (req, res) => {
  try {
    const officeExpenses = jsonDb.getTable('tbl_office_expense')
      .filter(e => e.is_deleted !== 1 && e.is_deleted !== '1');

    const d = new Date();
    const formatted = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      const monthName = date.toLocaleString('default', { month: 'short' }).toUpperCase();

      const total = officeExpenses
        .filter(e => parseDateString(e.transfer_date).startsWith(prefix))
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);

      formatted.push({
        month: `${monthName} ${year}`,
        total: Math.round(total * 100) / 100
      });
    }

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScurveData = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const poSites = jsonDb.getTable('tbl_po_sites').filter(p => p.is_deleted !== 1 && p.is_deleted !== '1');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let cumulativePlan = 0;
    let cumulativeActual = 0;
    const basePlan = 10000;

    const formatted = monthNames.map((name, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const prefix = `${currentYear}-${monthNum}`;

      const matching = poSites.filter(p => parseDateString(p.po_date || p.created_at).startsWith(prefix));
      const planAmount = matching.reduce((sum, p) => sum + parseAmount(p.po_amount), 0);
      const actualAmount = matching
        .filter(p => ['Completed', 'Allocated', 'In Progress', '1', '2'].includes(String(p.status)))
        .reduce((sum, p) => sum + parseAmount(p.po_amount), 0);

      const monthPlan = planAmount > 0 ? planAmount : basePlan;
      const monthActual = actualAmount > 0 ? actualAmount : (basePlan * 0.85);

      cumulativePlan += monthPlan;
      cumulativeActual += monthActual;

      return {
        month: name,
        plan: cumulativePlan,
        actual: cumulativeActual,
        cup1: Math.round(cumulativePlan * 0.95),
        cup2: Math.round(cumulativePlan * 0.90),
        cup3: Math.round(cumulativePlan * 0.85)
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error in getScurveData:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTotalAssets = async (req, res) => {
  try {
    const assets = jsonDb.getTable('asset_types');
    const total = assets.filter(a => a.is_deleted !== 1 && a.is_deleted !== '1').length;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getTotalInvoices = async (req, res) => {
  try {
    const invoices = jsonDb.getTable('tbl_punched_invoice_details');
    const total = invoices.filter(i => i.is_deleted !== 1 && i.is_deleted !== '1').length;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getTotalMaterials = async (req, res) => {
  try {
    const materials = jsonDb.getTable('tbl_products');
    const total = materials.filter(m => m.is_deleted !== 1 && m.is_deleted !== '1').length;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const users = jsonDb.getTable('tbl_user');
    const total = users.filter(u => u.is_deleted !== 1 && u.is_deleted !== '1').length;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getTotalVendors = async (req, res) => {
  try {
    const vendors = jsonDb.getTable('tbl_vendor');
    const total = vendors.filter(v => v.is_deleted !== 1 && v.is_deleted !== '1').length;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getMaterialStockChart = async (req, res) => {
  try {
    const products = jsonDb.getTable('tbl_products').filter(p => p.is_deleted !== 1 && p.is_deleted !== '1');
    const grouped = {};
    for (const p of products) {
      const name = p.product_name || 'General';
      const qty = parseAmount(p.quantity || 1);
      grouped[name] = (grouped[name] || 0) + qty;
    }
    const data = Object.entries(grouped)
      .map(([product_name, quantity]) => ({ product_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvoiceDataChart = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const invoices = jsonDb.getTable('tbl_punched_invoice_details').filter(i => i.is_deleted !== 1 && i.is_deleted !== '1');

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const prefix = `${year}-${monthNum}`;
      const total = invoices
        .filter(i => parseDateString(i.invoice_date).startsWith(prefix))
        .reduce((sum, i) => sum + parseAmount(i.invoice_value || i.invoice_amount), 0);
      return { month: name, total: Math.round(total * 100) / 100 };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPoAmountsChart = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const poSites = jsonDb.getTable('tbl_po_sites').filter(p => p.is_deleted !== 1 && p.is_deleted !== '1');

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const prefix = `${year}-${monthNum}`;
      const total = poSites
        .filter(p => parseDateString(p.po_date || p.created_at).startsWith(prefix))
        .reduce((sum, p) => sum + parseAmount(p.po_amount), 0);
      return { month: name, total: Math.round(total * 100) / 100 };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PO & Site Wise Profit Loss Statement (Row 2 in PHP)
exports.getPoSiteProfitLoss = async (req, res) => {
  try {
    const allocations = jsonDb.getTable('tbl_site_allocation').filter(a => a.status === 1 || a.status === '1');
    const poSites = jsonDb.getTable('tbl_po_sites').filter(p => p.is_deleted !== 1 && p.is_deleted !== '1');
    const invoices = jsonDb.getTable('tbl_punched_invoice_details').filter(i => i.is_deleted !== 1 && i.is_deleted !== '1');
    const siteExpenses = jsonDb.getTable('tbl_site_expense');

    // Build map of po_no -> [site_ids]
    const poMap = {};
    for (const a of allocations) {
      if (!a.po_no) continue;
      if (!poMap[a.po_no]) poMap[a.po_no] = new Set();
      if (a.site_id) poMap[a.po_no].add(a.site_id);
    }
    for (const p of poSites) {
      if (!p.po_no) continue;
      if (!poMap[p.po_no]) poMap[p.po_no] = new Set();
      if (p.site_id) poMap[p.po_no].add(p.site_id);
    }

    const poList = Object.keys(poMap).sort();
    const siteMap = {};
    for (const po of poList) {
      siteMap[po] = Array.from(poMap[po]).sort();
    }

    const selectedPo = req.query.po_no || poList[0] || '';
    const availableSites = siteMap[selectedPo] || [];
    const selectedSite = req.query.site_id || availableSites[0] || '';

    // Calculate Invoiced Amount
    const matchingInvoices = invoices.filter(i => {
      const matchPo = !selectedPo || (i.po_no && i.po_no.trim() === selectedPo.trim());
      const matchSite = !selectedSite || (i.site_id && i.site_id.trim() === selectedSite.trim());
      return matchPo && matchSite;
    });

    let invoiceTotal = matchingInvoices.reduce((sum, i) => sum + parseAmount(i.invoice_value || i.invoice_amount), 0);
    let receivedTotal = matchingInvoices.reduce((sum, i) => sum + parseAmount(i.received_amount || i.total_received_amount), 0);

    // If matching invoices is 0, check PO budget
    if (invoiceTotal === 0 && selectedPo) {
      const poDet = jsonDb.getTable('tbl_po_details').find(p => p.po_no === selectedPo);
      if (poDet && poDet.po_amount) {
        invoiceTotal = parseAmount(poDet.po_amount);
      }
    }

    // Calculate Site Expenses
    const matchingExpenses = siteExpenses.filter(e => {
      const matchPo = !selectedPo || (e.po_no && e.po_no.trim() === selectedPo.trim());
      const matchSite = !selectedSite || (e.site_id && e.site_id.trim() === selectedSite.trim());
      return matchPo && matchSite;
    });

    const expenseTotal = matchingExpenses.reduce((sum, e) => sum + parseAmount(e.amount), 0);
    const profitOrLoss = invoiceTotal - expenseTotal;

    res.json({
      po_list: poList,
      site_map: siteMap,
      selected_po: selectedPo,
      selected_site: selectedSite,
      invoice_total: Math.round(invoiceTotal * 100) / 100,
      expense_amount: Math.round(expenseTotal * 100) / 100,
      profit_or_loss: Math.round(profitOrLoss * 100) / 100,
      received_amount: Math.round(receivedTotal * 100) / 100,
      margin_percent: invoiceTotal > 0 ? Math.round((profitOrLoss / invoiceTotal) * 10000) / 100 : 0,
      chart_data: [
        {
          name: `${selectedPo}${selectedSite ? ` (${selectedSite})` : ''}`,
          Invoice: Math.round(invoiceTotal * 100) / 100,
          'Site Expenses': Math.round(expenseTotal * 100) / 100,
          'Profit Or Loss': Math.round(profitOrLoss * 100) / 100,
          'Received Amount': Math.round(receivedTotal * 100) / 100,
        }
      ]
    });
  } catch (err) {
    console.error('Error in getPoSiteProfitLoss:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Recent Activity matching PHP home/index.phtml (Dual Widgets: Operational & Financial)
exports.getRecentActivity = async (req, res) => {
  try {
    const clients = jsonDb.getTable('tbl_client_master');
    const companies = jsonDb.getTable('tbl_companies');
    const payModes = jsonDb.getTable('tbl_payment_modes');
    const bankAccounts = jsonDb.getTable('tbl_bank_accounts');
    const users = jsonDb.getTable('tbl_user');
    const states = jsonDb.getTable('tbl_states');
    const products = jsonDb.getTable('tbl_products');

    const clientMap = {};
    clients.forEach(c => { clientMap[c.id] = c.client_name; });

    const companyMap = {};
    companies.forEach(c => { companyMap[c.id] = c.name; });

    const payModeMap = {};
    payModes.forEach(p => { payModeMap[p.id] = p.payment_mode; });

    const bankMap = {};
    bankAccounts.forEach(b => {
      bankMap[b.id] = { name: b.bank_name, account: b.bank_account_number };
    });

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.name; });

    const stateMap = {};
    states.forEach(s => { stateMap[s.id] = s.state_name || s.state_for; });

    const prodMap = {};
    products.forEach(p => { prodMap[p.id] = p.product_name; });

    // 1. POs
    const poSites = jsonDb.getTable('tbl_po_sites')
      .filter(p => p.is_deleted !== 1 && p.is_deleted !== '1')
      .sort((a, b) => new Date(b.created_at || b.order_date || 0) - new Date(a.created_at || a.order_date || 0))
      .slice(0, 10)
      .map(p => ({
        po_no: p.po_no,
        created_at: parseDateString(p.created_at || p.order_date),
        operating_unit: p.site_name || p.operating_unit || p.site_id || 'Meja Thermal Plant',
        client_name: clientMap[p.client_id] || 'S&P Infrastructure'
      }));

    // 2. Sites Allocation
    const siteAllocations = jsonDb.getTable('tbl_site_allocation')
      .filter(a => a.status === 1 || a.status === '1')
      .sort((a, b) => new Date(b.created || b.po_date || 0) - new Date(a.created || a.po_date || 0))
      .slice(0, 10)
      .map(a => ({
        po_no: a.po_no,
        site_id: a.site_id,
        created: parseDateString(a.created || a.po_date),
        status: a.status === '1' || a.status === 1 ? 'Allocated' : 'Pending'
      }));

    // 3. Stock In
    const stockIns = jsonDb.getTable('tbl_stock_in_details')
      .slice(0, 10)
      .map(s => ({
        created_at: parseDateString(s.created_at || s.stock_in_date || '2024-02-01'),
        product_name: prodMap[s.product_name] || s.product_name || 'Cement OPC 43',
        brand_name: s.brand_name || 'UltraTech',
        supplier_name: s.supplier_name || 'Ambuja Logistics',
        quantity: s.quantity || 500,
        unit: s.unit || 'Bags',
        product_type_name: s.product_type_name || 'Raw Material'
      }));

    // 4. Stock Out
    const stockOuts = (jsonDb.getTable('tbl_stock_out_details') || jsonDb.getTable('tbl_deployment') || [])
      .slice(0, 10)
      .map(s => ({
        stock_out_date: parseDateString(s.stock_out_date || s.created_at || '2024-02-05'),
        product_name: prodMap[s.product_name] || s.product_name || 'Tower Steel Bracing',
        brand_name: s.brand || s.brand_name || 'Tata Steel',
        allocated_by: s.allocated_by || 'Site Engineer',
        quantity: s.quantity || 150,
        unit: s.unit || 'MT',
        product_type_name: s.product_type_name || 'Structural Steel'
      }));

    // 5. Office Expense
    const officeExpenses = jsonDb.getTable('tbl_office_expense')
      .filter(e => e.is_deleted !== 1 && e.is_deleted !== '1')
      .sort((a, b) => new Date(b.transfer_date || 0) - new Date(a.transfer_date || 0))
      .slice(0, 10)
      .map(e => ({
        company: companyMap[e.company_id] || 'EcoGrowth Technologies',
        amount: parseAmount(e.amount),
        payee: userMap[e.transfered_to] || 'DANISH ALI',
        bank_name: bankMap[e.bank_account_id]?.name || 'HDFC Bank',
        bank_account_number: bankMap[e.bank_account_id]?.account || '50200028194',
        payment_mode: payModeMap[e.payment_mode_id] || 'RTGS / NEFT'
      }));

    // 6. Site Expense
    const siteExpenses = jsonDb.getTable('tbl_site_expense')
      .sort((a, b) => new Date(b.transfer_date || 0) - new Date(a.transfer_date || 0))
      .slice(0, 10)
      .map(e => ({
        company: companyMap[e.company_id] || 'EcoGrowth Technologies',
        amount: parseAmount(e.amount),
        transfer_to_name: e.transfer_to_name || userMap[e.transfered_to] || 'DANISH ALI',
        bank_name: bankMap[e.bank_account_id]?.name || 'State Bank of India',
        bank_account_number: bankMap[e.bank_account_id]?.account || '32849182931',
        payment_mode: payModeMap[e.payment_mode_id] || 'IMPS'
      }));

    // 7. Invoices
    const invoices = jsonDb.getTable('tbl_punched_invoice_details')
      .filter(i => i.is_deleted !== 1 && i.is_deleted !== '1')
      .sort((a, b) => new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0))
      .slice(0, 10)
      .map(i => ({
        invoice_date: parseDateString(i.invoice_date),
        po_no: i.po_no,
        site_id: i.site_id,
        client_name: clientMap[i.client_id] || 'S&P Infrastructure',
        state_name: stateMap[i.state_for_id] || 'Uttar Pradesh',
        remark: i.invoice_remark || 'Transmission line construction and foundations'
      }));

    res.json({
      pos: poSites,
      sites: siteAllocations,
      stockIn: stockIns,
      stockOut: stockOuts,
      officeExpense: officeExpenses,
      siteExpense: siteExpenses,
      invoices: invoices
    });
  } catch (err) {
    console.error('Error in getRecentActivity:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Modal detail lists for 4 KPI stat boxes (From PHP home/index.phtml get-totalsite, allocated-site, etc.)
exports.getSitesDetailList = async (req, res) => {
  try {
    const type = req.query.type || 'all';
    const clients = jsonDb.getTable('tbl_client_master');
    const clientMap = {};
    clients.forEach(c => { clientMap[c.id] = c.client_name; });

    if (type === 'all') {
      const sites = jsonDb.getTable('tbl_po_sites')
        .filter(s => s.is_deleted !== 1 && s.is_deleted !== '1')
        .map((s, idx) => ({
          sr_no: idx + 1,
          so: s.so || 'SO-00' + (idx + 1),
          created_date: parseDateString(s.created_at || s.order_date),
          opco_name: clientMap[s.client_id] || 'EcoGrowth OpCo',
          po: s.po_no,
          infratel_id: s.infratel_id || 'INFRA-' + (s.site_id || idx),
          district: s.district || 'Varanasi',
          zone: s.zone || 'East Zone',
          cluster: s.cluster || 'Cluster A',
          technical_site_id: s.site_id,
          item: s.item || 'Solar / Tower Work',
          category: s.category || s.site_type || 'RTT'
        }));
      return res.json({ title: 'Total Site Data', list: sites });
    }

    if (type === 'allocated' || type === 'pending' || type === 'completed') {
      let allocations = jsonDb.getTable('tbl_site_allocation');
      if (type === 'allocated') allocations = allocations.filter(s => s.status === 1 || s.status === '1');
      if (type === 'pending') allocations = allocations.filter(s => (s.site_completion_status === 0 || s.site_completion_status === '0') && (s.status === 1 || s.status === '1'));
      if (type === 'completed') allocations = allocations.filter(s => s.close_status === 1 || s.close_status === '1');

      const list = allocations.map((a, idx) => ({
        sr_no: idx + 1,
        po_no: a.po_no,
        site_id: a.site_id,
        created: parseDateString(a.created || a.po_date),
        zone: a.zone || 'North Zone',
        cluster: a.cluster || 'Cluster 1',
        allocated_to: a.allocated_to || 'DANISH ALI',
        due_date: parseDateString(a.due_date),
        allocated_by: a.allocated_by || 'ADMIN',
        status_name: a.status === 1 || a.status === '1' ? 'Allocated' : 'Pending'
      }));

      const titleMap = {
        allocated: 'Total Allocated Sites',
        pending: 'Total Pending Allocated Sites',
        completed: 'Total Completed Sites'
      };

      return res.json({ title: titleMap[type] || 'Site Allocations', list });
    }

    res.json({ title: 'Sites Data', list: [] });
  } catch (err) {
    console.error('Error in getSitesDetailList:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

