const PoSite = require('../models/PoSite');
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
};