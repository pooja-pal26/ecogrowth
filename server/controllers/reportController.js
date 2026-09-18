const jsonDb = require('../services/jsonDb');

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (val) => {
  if (!val) return '';
  if (val.includes('/')) {
    const parts = val.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return val.slice(0, 10);
};

/**
 * GET /api/reports/filters
 * Returns list of suppliers, product types, brands, po numbers, and sites for dropdown filters
 */
exports.getFilterOptions = async (req, res) => {
  try {
    const productTypes = (jsonDb.getTable('tbl_product_type') || [])
      .map(t => ({
        id: String(t.id),
        name: t.product_type_name || t.name
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const suppliers = (jsonDb.getTable('tbl_suppliers') || [])
      .map(s => ({
        id: String(s.id),
        name: s.name || s.supplier_name
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const brands = (jsonDb.getTable('tbl_material_brand') || [])
      .filter(b => String(b.is_active || '1') === '1')
      .map(b => ({
        id: String(b.id),
        name: b.brand_name
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const poSites = jsonDb.getTable('tbl_po_sites') || [];
    const poNumbers = [...new Set(poSites.map(p => p.po_no).filter(Boolean))].sort();
    const sites = poSites
      .map(s => ({
        id: String(s.id),
        site_id: s.site_id,
        site_name: s.site_name || s.site_id,
        po_no: s.po_no
      }))
      .sort((a, b) => (a.site_id || '').localeCompare(b.site_id || ''));

    res.status(200).json({
      success: true,
      data: {
        productTypes,
        suppliers,
        brands,
        poNumbers,
        sites
      }
    });
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/stock-in
 * Query params: from_date, to_date, supplier_id, search
 */
exports.getStockInReport = async (req, res) => {
  try {
    const { from_date, to_date, supplier_id, search } = req.query;

    const stockIns = jsonDb.getTable('tbl_stock_in') || [];
    const stockInDetails = jsonDb.getTable('tbl_stock_in_details') || [];
    const suppliers = jsonDb.getTable('tbl_suppliers') || [];
    const users = jsonDb.getTable('tbl_user') || [];

    const supMap = new Map(suppliers.map(s => [String(s.id), s.name || s.supplier_name]));
    const userMap = new Map(users.map(u => [String(u.id), u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()]));

    // Group details by stock_in_id
    const detailsMap = new Map();
    for (const d of stockInDetails) {
      const sid = String(d.stock_in_id);
      if (!detailsMap.has(sid)) {
        detailsMap.set(sid, { count: 0, totalQty: 0 });
      }
      const entry = detailsMap.get(sid);
      entry.count += 1;
      entry.totalQty += parseFloat(d.quantity) || 0;
    }

    let records = stockIns.map((s) => {
      const sId = String(s.id);
      const supplierName = supMap.get(String(s.supplier_id)) || (s.supplier_id ? `Supplier #${s.supplier_id}` : 'N/A');
      const receiverName = userMap.get(String(s.recieved_by)) || (s.recieved_by ? `User #${s.recieved_by}` : 'N/A');
      const summary = detailsMap.get(sId) || { count: 0, totalQty: 0 };

      return {
        id: sId,
        stock_in_date: formatDate(s.stock_in_date),
        supplier_id: String(s.supplier_id || ''),
        supplier_name: supplierName,
        receiver_name: receiverName,
        recieved_by: String(s.recieved_by || ''),
        bill_number: s.bill_number || '',
        bill_date: formatDate(s.bill_date),
        remarks: s.remarks || '',
        item_count: summary.count,
        total_quantity: summary.totalQty,
        created_at: s.created_at
      };
    });

    // Apply Filters
    if (from_date) {
      const from = formatDate(from_date);
      records = records.filter(r => r.stock_in_date >= from);
    }
    if (to_date) {
      const to = formatDate(to_date);
      records = records.filter(r => r.stock_in_date <= to);
    }
    if (supplier_id && supplier_id !== 'all') {
      records = records.filter(r => String(r.supplier_id) === String(supplier_id));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      records = records.filter(r =>
        r.bill_number.toLowerCase().includes(q) ||
        r.supplier_name.toLowerCase().includes(q) ||
        r.receiver_name.toLowerCase().includes(q) ||
        (r.remarks && r.remarks.toLowerCase().includes(q))
      );
    }

    // Sort by stock_in_date descending
    records.sort((a, b) => (b.stock_in_date || '').localeCompare(a.stock_in_date || '') || parseInt(b.id) - parseInt(a.id));

    // Summary calculations
    const totalTransactions = records.length;
    const totalItems = records.reduce((acc, r) => acc + r.item_count, 0);
    const totalQuantity = records.reduce((acc, r) => acc + r.total_quantity, 0);
    const uniqueSuppliers = new Set(records.map(r => r.supplier_id).filter(Boolean)).size;

    res.status(200).json({
      success: true,
      data: records,
      summary: {
        totalTransactions,
        totalItems,
        totalQuantity,
        uniqueSuppliers
      }
    });
  } catch (error) {
    console.error('Error in getStockInReport:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/stock-in/:id
 * Returns itemized stock in details matching ReportController::viewStockinAction
 */
exports.getStockInDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const stockIns = jsonDb.getTable('tbl_stock_in') || [];
    const stockInDetails = jsonDb.getTable('tbl_stock_in_details') || [];
    const suppliers = jsonDb.getTable('tbl_suppliers') || [];
    const users = jsonDb.getTable('tbl_user') || [];
    const productTypes = jsonDb.getTable('tbl_product_type') || [];
    const products = jsonDb.getTable('tbl_products') || [];
    const brands = jsonDb.getTable('tbl_material_brand') || [];

    const stockIn = stockIns.find(s => String(s.id) === String(id));
    if (!stockIn) {
      return res.status(404).json({ success: false, message: 'Stock In transaction not found' });
    }

    const supMap = new Map(suppliers.map(s => [String(s.id), s.name || s.supplier_name]));
    const userMap = new Map(users.map(u => [String(u.id), u.name]));
    const pTypeMap = new Map(productTypes.map(t => [String(t.id), t.product_type_name || t.name]));
    const prodMap = new Map(products.map(p => [String(p.id), p.product_name]));
    const brandMap = new Map(brands.map(b => [String(b.id), b.brand_name]));

    const items = stockInDetails
      .filter(d => String(d.stock_in_id) === String(id))
      .map(d => ({
        id: String(d.id),
        product_type: pTypeMap.get(String(d.product_type)) || 'N/A',
        product_name: prodMap.get(String(d.product_name)) || `Product #${d.product_name}`,
        brand: brandMap.get(String(d.brand_name)) || d.brand_name || 'N/A',
        unit: d.unit || '',
        quantity: parseFloat(d.quantity) || 0
      }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        id: String(stockIn.id),
        stock_in_date: formatDate(stockIn.stock_in_date),
        supplier_name: supMap.get(String(stockIn.supplier_id)) || 'N/A',
        receiver_name: userMap.get(String(stockIn.recieved_by)) || 'N/A',
        bill_number: stockIn.bill_number || '',
        bill_date: formatDate(stockIn.bill_date),
        remarks: stockIn.remarks || '',
        total_quantity: totalQuantity,
        items
      }
    });
  } catch (error) {
    console.error('Error in getStockInDetails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/stock-out
 * Query params: from_date, to_date, po_no, site_id, search
 */
exports.getStockOutReport = async (req, res) => {
  try {
    const { from_date, to_date, po_no, site_id, search } = req.query;

    const stockOuts = jsonDb.getTable('tbl_stock_out') || [];
    const stockOutDetails = jsonDb.getTable('tbl_stock_out_details') || [];

    // Group details by stock_out_id
    const detailsMap = new Map();
    for (const d of stockOutDetails) {
      const sid = String(d.stock_out_id);
      if (!detailsMap.has(sid)) {
        detailsMap.set(sid, { count: 0, totalQty: 0 });
      }
      const entry = detailsMap.get(sid);
      entry.count += 1;
      entry.totalQty += parseFloat(d.quantity) || 0;
    }

    let records = stockOuts.map(s => {
      const sId = String(s.id);
      const summary = detailsMap.get(sId) || { count: 0, totalQty: 0 };

      return {
        id: sId,
        stock_out_date: formatDate(s.stock_out_date),
        received_by: s.received_by || '',
        allocated_by: s.allocated_by || '',
        po_no: s.po_no || '',
        site_id: s.site_id || '',
        remarks: s.remarks || '',
        item_count: summary.count,
        total_quantity: summary.totalQty,
        created_at: s.created_at
      };
    });

    // Apply Filters
    if (from_date) {
      const from = formatDate(from_date);
      records = records.filter(r => r.stock_out_date >= from);
    }
    if (to_date) {
      const to = formatDate(to_date);
      records = records.filter(r => r.stock_out_date <= to);
    }
    if (po_no && po_no !== 'all') {
      records = records.filter(r => r.po_no.toLowerCase() === po_no.toLowerCase());
    }
    if (site_id && site_id !== 'all') {
      records = records.filter(r => r.site_id.toLowerCase() === site_id.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      records = records.filter(r =>
        r.po_no.toLowerCase().includes(q) ||
        r.site_id.toLowerCase().includes(q) ||
        r.received_by.toLowerCase().includes(q) ||
        r.allocated_by.toLowerCase().includes(q) ||
        (r.remarks && r.remarks.toLowerCase().includes(q))
      );
    }

    // Sort by stock_out_date descending
    records.sort((a, b) => (b.stock_out_date || '').localeCompare(a.stock_out_date || '') || parseInt(b.id) - parseInt(a.id));

    // Summary calculations
    const totalTransactions = records.length;
    const totalItems = records.reduce((acc, r) => acc + r.item_count, 0);
    const totalQuantity = records.reduce((acc, r) => acc + r.total_quantity, 0);
    const uniqueSites = new Set(records.map(r => r.site_id).filter(Boolean)).size;
    const uniquePOs = new Set(records.map(r => r.po_no).filter(Boolean)).size;

    res.status(200).json({
      success: true,
      data: records,
      summary: {
        totalTransactions,
        totalItems,
        totalQuantity,
        uniqueSites,
        uniquePOs
      }
    });
  } catch (error) {
    console.error('Error in getStockOutReport:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/stock-out/:id
 * Returns itemized stock out details matching ReportController::viewStockOutAction
 */
exports.getStockOutDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const stockOuts = jsonDb.getTable('tbl_stock_out') || [];
    const stockOutDetails = jsonDb.getTable('tbl_stock_out_details') || [];
    const productTypes = jsonDb.getTable('tbl_product_type') || [];
    const products = jsonDb.getTable('tbl_products') || [];
    const brands = jsonDb.getTable('tbl_material_brand') || [];

    const stockOut = stockOuts.find(s => String(s.id) === String(id));
    if (!stockOut) {
      return res.status(404).json({ success: false, message: 'Stock Out transaction not found' });
    }

    const pTypeMap = new Map(productTypes.map(t => [String(t.id), t.product_type_name || t.name]));
    const prodMap = new Map(products.map(p => [String(p.id), p.product_name]));
    const brandMap = new Map(brands.map(b => [String(b.id), b.brand_name]));

    const items = stockOutDetails
      .filter(d => String(d.stock_out_id) === String(id))
      .map(d => ({
        id: String(d.id),
        product_type: pTypeMap.get(String(d.product_type)) || 'N/A',
        product_name: prodMap.get(String(d.product_name)) || `Product #${d.product_name}`,
        brand: brandMap.get(String(d.brand)) || d.brand || 'N/A',
        unit: d.unit || '',
        quantity: parseFloat(d.quantity) || 0
      }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        id: String(stockOut.id),
        stock_out_date: formatDate(stockOut.stock_out_date),
        received_by: stockOut.received_by || '',
        allocated_by: stockOut.allocated_by || '',
        po_no: stockOut.po_no || '',
        site_id: stockOut.site_id || '',
        remarks: stockOut.remarks || '',
        total_quantity: totalQuantity,
        items
      }
    });
  } catch (error) {
    console.error('Error in getStockOutDetails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/stock-summary
 * Query params: category_id, search
 * Aggregates by product: Opening Stock, Stock In, Stock Out, Closing/Current Stock
 */
exports.getStockSummary = async (req, res) => {
  try {
    const { category_id, search } = req.query;

    const inventory = jsonDb.getTable('tbl_inventory') || [];
    const stockInDetails = jsonDb.getTable('tbl_stock_in_details') || [];
    const stockOutDetails = jsonDb.getTable('tbl_stock_out_details') || [];
    const productTypes = jsonDb.getTable('tbl_product_type') || [];
    const products = jsonDb.getTable('tbl_products') || [];
    const brands = jsonDb.getTable('tbl_material_brand') || [];

    const pTypeMap = new Map(productTypes.map(t => [String(t.id), t.product_type_name || t.name]));
    const prodMap = new Map(products.map(p => [String(p.id), { name: p.product_name, unit: p.unit, typeId: p.product_type_id }]));
    const brandMap = new Map(brands.map(b => [String(b.id), b.brand_name]));

    // Aggregate Stock In quantities per product_id
    const inMap = new Map();
    for (const d of stockInDetails) {
      const pid = String(d.product_name);
      const qty = parseFloat(d.quantity) || 0;
      inMap.set(pid, (inMap.get(pid) || 0) + qty);
    }

    // Aggregate Stock Out quantities per product_id
    const outMap = new Map();
    for (const d of stockOutDetails) {
      const pid = String(d.product_name);
      const qty = parseFloat(d.quantity) || 0;
      outMap.set(pid, (outMap.get(pid) || 0) + qty);
    }

    let summaryItems = inventory.map(item => {
      const pId = String(item.product_id);
      const prodInfo = prodMap.get(pId) || {};
      const categoryName = pTypeMap.get(String(item.product_type_id)) || 'N/A';
      const productName = prodInfo.name || `Product #${pId}`;
      const brandName = brandMap.get(String(item.brand_name)) || item.brand_name || '-';
      const unit = item.unit || prodInfo.unit || '-';
      const closingStock = parseFloat(item.quantity) || 0;
      const totalIn = inMap.get(pId) || 0;
      const totalOut = outMap.get(pId) || 0;
      // Opening Stock = Closing Stock + Stock Out - Stock In
      const openingStock = Math.max(0, Math.round((closingStock + totalOut - totalIn) * 100) / 100);

      let status = 'In Stock';
      if (closingStock <= 0) status = 'Out of Stock';
      else if (closingStock < 10) status = 'Low Stock';

      return {
        id: String(item.id),
        product_id: pId,
        product_type_id: String(item.product_type_id),
        category: categoryName,
        product_name: productName,
        brand: brandName,
        unit,
        opening_stock: openingStock,
        total_in: totalIn,
        total_out: totalOut,
        closing_stock: closingStock,
        status
      };
    });

    // Apply Filters
    if (category_id && category_id !== 'all') {
      summaryItems = summaryItems.filter(i => String(i.product_type_id) === String(category_id));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      summaryItems = summaryItems.filter(i =>
        i.product_name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q)
      );
    }

    // Sort by closing_stock descending
    summaryItems.sort((a, b) => b.closing_stock - a.closing_stock);

    // Compute Overall Totals
    const totalOpeningStock = summaryItems.reduce((acc, i) => acc + i.opening_stock, 0);
    const totalStockIn = summaryItems.reduce((acc, i) => acc + i.total_in, 0);
    const totalStockOut = summaryItems.reduce((acc, i) => acc + i.total_out, 0);
    const totalClosingStock = summaryItems.reduce((acc, i) => acc + i.closing_stock, 0);
    const totalSKUs = summaryItems.length;
    const lowStockCount = summaryItems.filter(i => i.status === 'Low Stock').length;
    const outOfStockCount = summaryItems.filter(i => i.status === 'Out of Stock').length;

    // Category breakdown for charts
    const categoryStats = {};
    for (const item of summaryItems) {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { category: item.category, totalIn: 0, totalOut: 0, currentStock: 0, count: 0 };
      }
      categoryStats[item.category].totalIn += item.total_in;
      categoryStats[item.category].totalOut += item.total_out;
      categoryStats[item.category].currentStock += item.closing_stock;
      categoryStats[item.category].count += 1;
    }

    res.status(200).json({
      success: true,
      data: summaryItems,
      summary: {
        totalSKUs,
        totalOpeningStock: Math.round(totalOpeningStock * 10) / 10,
        totalStockIn: Math.round(totalStockIn * 10) / 10,
        totalStockOut: Math.round(totalStockOut * 10) / 10,
        totalClosingStock: Math.round(totalClosingStock * 10) / 10,
        lowStockCount,
        outOfStockCount
      },
      categoryStats: Object.values(categoryStats).sort((a, b) => b.currentStock - a.currentStock).slice(0, 8)
    });
  } catch (error) {
    console.error('Error in getStockSummary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/site-financial-summary
 * Query params: from_date, to_date
 * Replicates PHP ReportController::summaryReportAction
 */
exports.getSiteFinancialSummary = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const poDetails = jsonDb.getTable('tbl_po_details') || [];
    const poSites = jsonDb.getTable('tbl_po_sites') || [];
    const siteExpenses = jsonDb.getTable('tbl_site_expense') || [];
    const punchedInvoices = jsonDb.getTable('tbl_punched_invoice_details') || [];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Filter PO details by order_date
    let filteredPOs = poDetails;
    if (from_date) {
      const from = formatDate(from_date);
      filteredPOs = filteredPOs.filter(p => formatDate(p.order_date) >= from);
    }
    if (to_date) {
      const to = formatDate(to_date);
      filteredPOs = filteredPOs.filter(p => formatDate(p.order_date) <= to);
    }

    const rows = [];
    let counter = 1;

    for (const po of filteredPOs) {
      if (!po.po_no) continue;

      const sitesForPo = poSites.filter(s => s.po_no && s.po_no.trim() === po.po_no.trim());

      for (const s of sitesForPo) {
        if (!s.site_id) continue;

        // Sum expenses for this po_no and site_id with status=1
        const expenses = siteExpenses
          .filter(e => e.po_no === po.po_no && e.site_id === s.site_id && String(e.status) === '1')
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        // Sum invoices
        const invoices = punchedInvoices.filter(i => i.po_no === po.po_no && i.site_id === s.site_id);
        const invoiceAmount = invoices.reduce((sum, i) => sum + (parseFloat(i.invoice_value) || 0), 0);
        const receivedAmount = invoices.reduce((sum, i) => sum + (parseFloat(i.received_amount) || 0), 0);

        let monthFormatted = '-';
        if (po.order_date) {
          const d = new Date(po.order_date);
          if (!isNaN(d.getTime())) {
            monthFormatted = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          }
        }

        rows.push({
          id: String(counter++),
          po_no: po.po_no,
          month: monthFormatted,
          site_id: s.site_id,
          site_name: s.site_name || s.site_id,
          expenses: Math.round(expenses * 100) / 100,
          order_date: formatDate(po.order_date),
          invoice_amount: Math.round(invoiceAmount * 100) / 100,
          received_amount: Math.round(receivedAmount * 100) / 100
        });
      }
    }

    // Totals
    const totalExpenses = rows.reduce((acc, r) => acc + r.expenses, 0);
    const totalInvoiceAmount = rows.reduce((acc, r) => acc + r.invoice_amount, 0);
    const totalReceivedAmount = rows.reduce((acc, r) => acc + r.received_amount, 0);

    res.status(200).json({
      success: true,
      data: rows,
      summary: {
        totalRecords: rows.length,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalInvoiceAmount: Math.round(totalInvoiceAmount * 100) / 100,
        totalReceivedAmount: Math.round(totalReceivedAmount * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error in getSiteFinancialSummary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};