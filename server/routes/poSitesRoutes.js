const express = require('express');
const router = express.Router();
const controller = require('../controllers/poSitesController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/import-sites', upload.single('file'), controller.importSites);
router.get('/po-status', controller.getPoStatus);
router.get('/allocated-sites', controller.getAllocatedSites);
router.get('/allocated-site-status', controller.getAllocatedSites);
router.get('/incidents', controller.getIncidents);

module.exports = router;