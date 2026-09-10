const express = require('express');
const router = express.Router();
const controller = require('../controllers/poSitesController');
const multer = require('multer');
const config = require('../config');
const upload = multer({ dest: config.app.uploadPath });

router.post('/import-sites', upload.single('file'), controller.importSites);
router.get('/po-status', controller.getPoStatus);
router.get('/allocated-sites', controller.getAllocatedSites);
router.get('/allocated-site-status', controller.getAllocatedSites);
router.get('/incidents', controller.getIncidents);

module.exports = router;