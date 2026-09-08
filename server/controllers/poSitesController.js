const PoSite = require('../models/PoSite');
const SiteAllocation = require('../models/SiteAllocation');
const csv = require('csv-parser');
const fs = require('fs');

exports.importSites = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const results = [];
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Mock processing for CSV
        fs.unlinkSync(req.file.path); // Clean up uploaded file
        res.json({ success: true, message: `Successfully imported ${results.length} rows!` });
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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