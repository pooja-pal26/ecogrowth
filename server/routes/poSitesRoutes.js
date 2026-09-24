const express = require('express');
const router = express.Router();
const controller = require('../controllers/poSitesController');
const multer = require('multer');
const config = require('../config');
const upload = multer({ dest: config.app.uploadPath });

router.post('/import-sites', upload.single('file'), controller.importSites);
router.get('/po-status', controller.getPoStatus);
router.put('/po-status/:id', controller.updatePoStatus);
router.post('/po-status/:id', controller.updatePoStatus);
router.get('/allocated-sites', controller.getAllocatedSites);
router.delete('/allocated-sites/:id', controller.deleteAllocatedSite);
router.get('/allocated-site-status', controller.getAllocatedSiteStatus);
router.put('/allocated-site-status/:id', controller.updateAllocatedSiteStatus);
router.get('/allocation-init', controller.getAllocationInitData);
router.get('/site-technical-details', controller.getSiteTechnicalDetails);
router.post('/allocate-site', controller.allocateSite);
router.get('/incidents-init', controller.getIncidentsInitData);
router.get('/incidents', controller.getIncidents);
router.post('/incidents', controller.createIncident);
router.put('/incidents/:id', controller.updateIncident);
router.delete('/incidents/:id', controller.deleteIncident);

// PO Management Routes
router.get('/po-details', controller.getPODetails);
router.delete('/po-details/:id', controller.deletePODetails);
router.post('/po-sites-list', controller.getSitesByPONumber);
router.get('/po-sites-list', controller.getSitesByPONumber);
router.get('/init-data', controller.getPOInitData);
router.post('/add-po-and-sites', controller.addPOAndSites);
router.post('/add-po-sites', controller.addPOSites);

module.exports = router;