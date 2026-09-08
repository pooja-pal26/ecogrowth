const express = require('express');
const router = express.Router();
const controller = require('../controllers/poSitesController');

router.get('/po-status', controller.getPoStatus);
router.get('/allocated-sites', controller.getAllocatedSites);
router.get('/allocated-site-status', controller.getAllocatedSites);
router.get('/incidents', controller.getIncidents);

module.exports = router;