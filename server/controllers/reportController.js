
exports.getReports = async (req, res) => {
  try { res.json({ success: true, data: [] }); } catch(e) { res.status(500).json({ success: false, message: e.message }); }
};