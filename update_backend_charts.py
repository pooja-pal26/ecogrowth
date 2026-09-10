import os

filepath = 'server/controllers/dashboardController.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_methods = """
exports.getMaterialStockChart = async (req, res) => {
  try {
    const materials = await Material.aggregate([
      { $match: { is_deleted: 0 } },
      { $group: { _id: "$product_name", quantity: { $sum: "$quantity" } } },
      { $sort: { quantity: -1 } }
    ]);
    const data = materials.map(m => ({ product_name: m._id || 'Unknown', quantity: m.quantity }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvoiceDataChart = async (req, res) => {
  try {
    // Current year
    const currentYear = new Date().getFullYear();
    const invoices = await Invoice.aggregate([
      { $match: { 
          is_deleted: 0,
          invoice_date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        } 
      },
      { $group: { _id: { $month: "$invoice_date" }, total: { $sum: "$invoice_amount" } } },
      { $sort: { _id: 1 } }
    ]);
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const match = invoices.find(i => i._id === index + 1);
      return { month: name, total: match ? match.total : 0 };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPoAmountsChart = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const poSites = await PoSite.aggregate([
      { $match: { 
          is_deleted: 0,
          po_date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        } 
      },
      { $group: { _id: { $month: "$po_date" }, total: { $sum: "$po_amount" } } },
      { $sort: { _id: 1 } }
    ]);
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const match = poSites.find(i => i._id === index + 1);
      return { month: name, total: match ? match.total : 0 };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const mongoose = require('mongoose');

const getDynamicModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  const schema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: collectionName });
  return mongoose.model(collectionName, schema);
};

exports.getRecentActivity = async (req, res) => {
  try {
    const recentPOs = await PoSite.find({ is_deleted: 0 }).sort({ createdAt: -1 }).limit(5).lean();
    const recentSites = await SiteAllocation.find().sort({ createdAt: -1 }).limit(5).lean();
    
    const StockInModel = getDynamicModel('stockins');
    const recentStockIn = await StockInModel.find().sort({ createdAt: -1 }).limit(5).lean();
    
    const StockOutModel = getDynamicModel('stockouts');
    const recentStockOut = await StockOutModel.find().sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      pos: recentPOs,
      sites: recentSites,
      stockIn: recentStockIn,
      stockOut: recentStockOut
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
"""

content += new_methods

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Update Routes
routes_path = 'server/routes/dashboardRoutes.js'
with open(routes_path, 'r', encoding='utf-8') as f:
    routes = f.read()

new_routes = """
router.get('/charts/material-stock', dashboardController.getMaterialStockChart);
router.get('/charts/invoices', dashboardController.getInvoiceDataChart);
router.get('/charts/po-amounts', dashboardController.getPoAmountsChart);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
"""

routes = routes.replace('module.exports = router;', new_routes)

with open(routes_path, 'w', encoding='utf-8') as f:
    f.write(routes)

print("Backend charts and recent activity added.")
