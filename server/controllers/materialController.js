const jsonDb = require('../services/jsonDb');

/**
 * Helper to format date to YYYY-MM-DD
 */
const formatDate = (val) => {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (val.includes('/')) {
    const parts = val.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return val;
};

/**
 * GET /api/materials/master-data
 * Aggregates product types, suppliers, brands, users (receivers), and PO list
 */
exports.getMasterData = async (req, res) => {
  try {
    const productTypes = (jsonDb.getTable('tbl_product_type') || [])
      .map(t => ({
        id: String(t.id),
        product_type_name: t.product_type_name || t.name
      }))
      .sort((a, b) => (a.product_type_name || '').localeCompare(b.product_type_name || ''));

    const suppliers = (jsonDb.getTable('tbl_suppliers') || [])
      .map(s => ({
        id: String(s.id),
        name: s.name || s.supplier_name,
        contact_person: s.contact_person,
        contact_number: s.contact_number
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const brands = (jsonDb.getTable('tbl_material_brand') || [])
      .filter(b => String(b.is_active || '1') === '1')
      .map(b => ({
        id: String(b.id),
        brand_name: b.brand_name
      }))
      .sort((a, b) => (a.brand_name || '').localeCompare(b.brand_name || ''));

    const users = (jsonDb.getTable('tbl_user') || [])
      .filter(u => String(u.status || '1') === '1')
      .map(u => ({
        id: String(u.id),
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        role_type: String(u.role_type || '')
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const poSites = jsonDb.getTable('tbl_po_sites') || [];
    const poNumbers = [...new Set(poSites.map(p => p.po_no).filter(Boolean))].sort();

    res.status(200).json({
      success: true,
      data: {
        productTypes,
        suppliers,
        brands,
        users,
        poNumbers
      }
    });
  } catch (error) {
    console.error('Error fetching material master data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/materials/products-by-type/:typeId
 * Returns products matching category
 */
exports.getProductsByType = async (req, res) => {
  try {
    const { typeId } = req.params;
    const products = (jsonDb.getTable('tbl_products') || [])
      .filter(p => String(p.product_type_id) === String(typeId))
      .map(p => ({
        id: String(p.id),
        product_name: p.product_name,
        price: p.price || 0,
        unit: p.unit || ''
      }))
      .sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));

    res.status(200).json({
      success: true,
      flag: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

/**
 * GET /api/materials/product-stock/:typeId/:productId
 * Returns product unit and current total available inventory quantity
 */
exports.getProductStock = async (req, res) => {
  try {
    const { typeId, productId } = req.params;

    const product = (jsonDb.getTable('tbl_products') || [])
      .find(p => String(p.id) === String(productId));

    const inventory = (jsonDb.getTable('tbl_inventory') || [])
      .find(i => String(i.product_type_id) === String(typeId) && String(i.product_id) === String(productId));

    const unit = product ? product.unit : (inventory ? inventory.unit : '');
    const total_quantity = inventory ? Number(inventory.quantity || 0) : 0;

    res.status(200).json({
      success: true,
      flag: true,
      unit,
      total_quantity
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

/**
 * GET /api/materials/sites-by-po/:poNo
 * Returns sites for a given PO number matching PHP getSitesByPoNumber
 */
exports.getSitesByPo = async (req, res) => {
  try {
    const { poNo } = req.params;
    const poSites = jsonDb.getTable('tbl_po_sites') || [];
    const sites = poSites
      .filter(s => String(s.po_no || '').toLowerCase() === String(poNo || '').toLowerCase())
      .map(s => ({
        id: String(s.id),
        site_id: s.site_id,
        site_name: s.site_name || s.site_id
      }));

    res.status(200).json({
      success: true,
      flag: true,
      sites
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

/**
 * GET /api/materials/stock-report
 * Returns joined stock inventory matching ReportController::materialStockReportAction
 */
exports.getStockReport = async (req, res) => {
  try {
    const inventory = jsonDb.getTable('tbl_inventory') || [];
    const productTypes = jsonDb.getTable('tbl_product_type') || [];
    const products = jsonDb.getTable('tbl_products') || [];
    const brands = jsonDb.getTable('tbl_material_brand') || [];

    const pTypeMap = new Map(productTypes.map(t => [String(t.id), t.product_type_name || t.name]));
    const prodMap = new Map(products.map(p => [String(p.id), { name: p.product_name, unit: p.unit, price: p.price }]));
    const brandMap = new Map(brands.map(b => [String(b.id), b.brand_name]));

    const report = inventory.map(item => {
      const prodInfo = prodMap.get(String(item.product_id)) || {};
      const product_type = pTypeMap.get(String(item.product_type_id)) || 'N/A';
      const product_name = prodInfo.name || `Product #${item.product_id}`;
      const unit = item.unit || prodInfo.unit || '-';
      const brand_name = brandMap.get(String(item.brand_name)) || item.brand_name || '-';
      const quantity = Number(item.quantity || 0);

      return {
        id: String(item.id),
        product_type_id: String(item.product_type_id),
        product_type,
        product_id: String(item.product_id),
        product_name,
        brand_id: String(item.brand_name || ''),
        brand_name,
        unit,
        quantity,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    }).sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getStockReport:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/materials/stock-in
 * Implements material receiving matching MaterialStockController::materialStockInAction
 */
exports.stockIn = async (req, res) => {
  try {
    const {
      dateOfStockIn,
      supplier,
      recieved_by,
      bill_no,
      bill_date,
      remarks,
      items
    } = req.body;

    // Validation
    if (!dateOfStockIn) {
      return res.status(400).json({ success: false, message: 'Please select date of stock in.' });
    }
    if (!supplier) {
      return res.status(400).json({ success: false, message: 'Please select supplier.' });
    }
    if (!recieved_by) {
      return res.status(400).json({ success: false, message: 'Please enter receiver name.' });
    }
    if (!bill_no) {
      return res.status(400).json({ success: false, message: 'Please enter bill/challan number.' });
    }
    if (!bill_date) {
      return res.status(400).json({ success: false, message: 'Please select bill date.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one product item.' });
    }

    const stockInList = jsonDb.getTable('tbl_stock_in') || [];
    const stockInDetailsList = jsonDb.getTable('tbl_stock_in_details') || [];
    const inventoryList = jsonDb.getTable('tbl_inventory') || [];

    const newStockInId = String(stockInList.reduce((max, s) => Math.max(max, parseInt(s.id) || 0), 0) + 1);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const newStockInRecord = {
      id: newStockInId,
      stock_in_date: formatDate(dateOfStockIn),
      supplier_id: String(supplier),
      recieved_by: String(recieved_by),
      bill_number: String(bill_no).trim(),
      bill_date: formatDate(bill_date),
      remarks: remarks || '',
      created_by: req.user?.id ? String(req.user.id) : '1',
      created_at: now
    };
    stockInList.push(newStockInRecord);

    let nextDetailId = stockInDetailsList.reduce((max, d) => Math.max(max, parseInt(d.id) || 0), 0) + 1;
    let nextInvId = inventoryList.reduce((max, i) => Math.max(max, parseInt(i.id) || 0), 0) + 1;

    for (const item of items) {
      const productCategory = String(item.product_category || item.product_type_id || '');
      const productId = String(item.product_id || '');
      const brand = String(item.brand || item.brand_name || '');
      const unit = String(item.unit || '');
      const quantity = parseFloat(item.quantity) || 0;

      if (!productId || quantity <= 0) continue;

      // 1. Insert into tbl_stock_in_details
      const detailRecord = {
        id: String(nextDetailId++),
        stock_in_id: newStockInId,
        product_type: productCategory,
        product_name: productId,
        brand_name: brand,
        unit: unit,
        quantity: String(quantity),
        created_at: now
      };
      stockInDetailsList.push(detailRecord);

      // 2. Update tbl_inventory
      const existingInvIndex = inventoryList.findIndex(
        inv => String(inv.product_type_id) === productCategory && String(inv.product_id) === productId
      );

      if (existingInvIndex !== -1) {
        const currentQty = parseFloat(inventoryList[existingInvIndex].quantity) || 0;
        inventoryList[existingInvIndex].quantity = String(currentQty + quantity);
        inventoryList[existingInvIndex].updated_at = now;
        if (unit) inventoryList[existingInvIndex].unit = unit;
        if (brand) inventoryList[existingInvIndex].brand_name = brand;
      } else {
        const newInvRecord = {
          id: String(nextInvId++),
          product_type_id: productCategory,
          product_id: productId,
          brand_name: brand,
          unit: unit,
          quantity: String(quantity),
          created_at: now,
          updated_at: now
        };
        inventoryList.push(newInvRecord);
      }
    }

    jsonDb.saveTable('tbl_stock_in');
    jsonDb.saveTable('tbl_stock_in_details');
    jsonDb.saveTable('tbl_inventory');

    res.status(200).json({
      success: true,
      message: 'Stock details have been saved successfully.',
      stock_in_id: newStockInId
    });
  } catch (error) {
    console.error('Error in stockIn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/materials/stock-out
 * Implements material issue/consumption matching MaterialStockController::materialStockOutAction
 */
exports.stockOut = async (req, res) => {
  try {
    const {
      date_of_stock_out,
      po_number,
      site_id,
      stock_allocated_to,
      remarks,
      items
    } = req.body;

    // Validation
    if (!date_of_stock_out) {
      return res.status(400).json({ success: false, message: 'Please select date of stock out.' });
    }
    if (!po_number) {
      return res.status(400).json({ success: false, message: 'Please select PO number.' });
    }
    if (!site_id) {
      return res.status(400).json({ success: false, message: 'Please select Site ID.' });
    }
    if (!stock_allocated_to) {
      return res.status(400).json({ success: false, message: 'Please enter receiver / allocated name.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one product item.' });
    }

    const stockOutList = jsonDb.getTable('tbl_stock_out') || [];
    const stockOutDetailsList = jsonDb.getTable('tbl_stock_out_details') || [];
    const inventoryList = jsonDb.getTable('tbl_inventory') || [];
    const productsList = jsonDb.getTable('tbl_products') || [];

    // Check available quantities before executing transactions
    for (const item of items) {
      const productCategory = String(item.product_category || item.product_type_id || '');
      const productId = String(item.product_id || '');
      const reqQuantity = parseFloat(item.quantity) || 0;

      if (reqQuantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
      }

      const inv = inventoryList.find(
        i => String(i.product_type_id) === productCategory && String(i.product_id) === productId
      );

      const availableQty = inv ? parseFloat(inv.quantity) || 0 : 0;
      if (reqQuantity > availableQty) {
        const prod = productsList.find(p => String(p.id) === productId);
        const prodName = prod ? prod.product_name : `Product #${productId}`;
        return res.status(400).json({
          success: false,
          message: `Quantity can't be greater than total quantity for "${prodName}". Available: ${availableQty}, Requested: ${reqQuantity}`
        });
      }
    }

    const newStockOutId = String(stockOutList.reduce((max, s) => Math.max(max, parseInt(s.id) || 0), 0) + 1);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const newStockOutRecord = {
      id: newStockOutId,
      stock_out_date: formatDate(date_of_stock_out),
      received_by: String(stock_allocated_to).trim(),
      po_no: String(po_number).trim(),
      site_id: String(site_id).trim(),
      allocated_by: req.user?.name || 'Administrator',
      remarks: remarks || '',
      created_at: now
    };
    stockOutList.push(newStockOutRecord);

    let nextDetailId = stockOutDetailsList.reduce((max, d) => Math.max(max, parseInt(d.id) || 0), 0) + 1;

    for (const item of items) {
      const productCategory = String(item.product_category || item.product_type_id || '');
      const productId = String(item.product_id || '');
      const brand = String(item.brand || item.brand_name || '');
      const unit = String(item.unit || '');
      const quantity = parseFloat(item.quantity) || 0;

      // 1. Insert into tbl_stock_out_details
      const detailRecord = {
        id: String(nextDetailId++),
        stock_out_id: newStockOutId,
        product_type: productCategory,
        product_name: productId,
        brand: brand,
        unit: unit,
        quantity: String(quantity),
        created_at: now
      };
      stockOutDetailsList.push(detailRecord);

      // 2. Reduce inventory in tbl_inventory
      const invIndex = inventoryList.findIndex(
        i => String(i.product_type_id) === productCategory && String(i.product_id) === productId
      );

      if (invIndex !== -1) {
        const currentQty = parseFloat(inventoryList[invIndex].quantity) || 0;
        inventoryList[invIndex].quantity = String(Math.max(0, currentQty - quantity));
        inventoryList[invIndex].updated_at = now;
      }
    }

    jsonDb.saveTable('tbl_stock_out');
    jsonDb.saveTable('tbl_stock_out_details');
    jsonDb.saveTable('tbl_inventory');

    res.status(200).json({
      success: true,
      message: 'Stock out has been updated successfully.',
      stock_out_id: newStockOutId
    });
  } catch (error) {
    console.error('Error in stockOut:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/materials/stock-in-history
 */
exports.getStockInHistory = async (req, res) => {
  try {
    const stockIns = jsonDb.getTable('tbl_stock_in') || [];
    const suppliers = jsonDb.getTable('tbl_suppliers') || [];
    const users = jsonDb.getTable('tbl_user') || [];

    const supMap = new Map(suppliers.map(s => [String(s.id), s.name || s.supplier_name]));
    const userMap = new Map(users.map(u => [String(u.id), u.name]));

    const history = stockIns.map(s => ({
      ...s,
      supplier_name: supMap.get(String(s.supplier_id)) || `Supplier #${s.supplier_id}`,
      receiver_name: userMap.get(String(s.recieved_by)) || `User #${s.recieved_by}`
    })).sort((a, b) => (b.stock_in_date || '').localeCompare(a.stock_in_date || ''));

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/materials/stock-out-history
 */
exports.getStockOutHistory = async (req, res) => {
  try {
    const stockOuts = jsonDb.getTable('tbl_stock_out') || [];
    const history = [...stockOuts].sort((a, b) => (b.stock_out_date || '').localeCompare(a.stock_out_date || ''));
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};