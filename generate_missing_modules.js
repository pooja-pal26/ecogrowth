const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server');

// Ensure directories exist
['models', 'controllers', 'routes'].forEach(dir => {
    if (!fs.existsSync(path.join(serverPath, dir))) {
        fs.mkdirSync(path.join(serverPath, dir));
    }
});

// 1. PO & Sites Module
const poSiteModel = `const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  poNumber: String, poDate: Date, status: { type: String, default: 'Pending' }, siteId: String,
  state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientMaster' }
}, { timestamps: true });
module.exports = mongoose.models.PoSite || mongoose.model('PoSite', schema);`;

const siteAllocModel = `const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  poNumber: String, siteId: String, status: { type: String, default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.models.SiteAllocation || mongoose.model('SiteAllocation', schema);`;

const poSitesController = `const PoSite = require('../models/PoSite');
const SiteAllocation = require('../models/SiteAllocation');

exports.getPoStatus = async (req, res) => {
  try {
    const data = await PoSite.find();
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllocatedSites = async (req, res) => {
  try {
    const data = await SiteAllocation.find();
    res.json({ success: true, data });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getIncidents = async (req, res) => {
  try { res.json({ success: true, data: [] }); } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};`;

const poSitesRoutes = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/poSitesController');

router.get('/po-status', controller.getPoStatus);
router.get('/allocated-sites', controller.getAllocatedSites);
router.get('/allocated-site-status', controller.getAllocatedSites);
router.get('/incidents', controller.getIncidents);

module.exports = router;`;

fs.writeFileSync(path.join(serverPath, 'models', 'PoSite.js'), poSiteModel);
fs.writeFileSync(path.join(serverPath, 'models', 'SiteAllocation.js'), siteAllocModel);
fs.writeFileSync(path.join(serverPath, 'controllers', 'poSitesController.js'), poSitesController);
fs.writeFileSync(path.join(serverPath, 'routes', 'poSitesRoutes.js'), poSitesRoutes);

// 2. Users Module
const userController = `const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};`;

const userRoutes = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/', controller.getAllUsers);
module.exports = router;`;

fs.writeFileSync(path.join(serverPath, 'controllers', 'userController.js'), userController);
fs.writeFileSync(path.join(serverPath, 'routes', 'userRoutes.js'), userRoutes);

// 3. Reports Module
const reportController = `
exports.getReports = async (req, res) => {
  try { res.json({ success: true, data: [] }); } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};`;

const reportRoutes = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

router.get('/', controller.getReports);
module.exports = router;`;

fs.writeFileSync(path.join(serverPath, 'controllers', 'reportController.js'), reportController);
fs.writeFileSync(path.join(serverPath, 'routes', 'reportRoutes.js'), reportRoutes);

// Update index.js
let indexJsContent = fs.readFileSync(path.join(serverPath, 'index.js'), 'utf8');

if(!indexJsContent.includes('poSitesRoutes')) {
  indexJsContent = indexJsContent.replace("const invoiceRoutes", "const poSitesRoutes = require('./routes/poSitesRoutes');\nconst userRoutes = require('./routes/userRoutes');\nconst reportRoutes = require('./routes/reportRoutes');\nconst invoiceRoutes");
  indexJsContent = indexJsContent.replace("app.use('/api/invoices'", "app.use('/api/po-sites', poSitesRoutes);\napp.use('/api/users', userRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/invoices'");
  fs.writeFileSync(path.join(serverPath, 'index.js'), indexJsContent);
}

console.log('Missing Backend Modules Patched.');
