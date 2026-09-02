const PoSite = require('../models/PoSite');
const SiteAllocation = require('../models/SiteAllocation');
const SiteExpense = require('../models/SiteExpense');
const OfficeExpense = require('../models/OfficeExpense');

exports.getTotalSites = async (req, res) => {
  try {
    const total = await PoSite.countDocuments({ is_deleted: 0 });
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingSites = async (req, res) => {
  try {
    const pending = await SiteAllocation.countDocuments({ site_completion_status: 0, status: 1 });
    res.json({ pending });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllocatedSites = async (req, res) => {
  try {
    const allocated = await SiteAllocation.countDocuments({ status: 1 });
    res.json({ allocated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompletedSites = async (req, res) => {
  try {
    const completed = await SiteAllocation.countDocuments({ close_status: 1 });
    res.json({ completed });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSiteExpenses = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    // Aggregation to sum amounts per month for the current year
    const expenses = await SiteExpense.aggregate([
      {
        $match: {
          transfer_date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$transfer_date" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format to months array
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formatted = monthNames.map((name, index) => {
      const match = expenses.find(e => e._id === index + 1);
      return { month: name, total: match ? match.total : 0 };
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOfficeExpenses = async (req, res) => {
  try {
    // Last 6 months
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    
    const expenses = await OfficeExpense.aggregate([
      {
        $match: {
          is_deleted: 0,
          transfer_date: { $gte: d }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$transfer_date" }, 
            month: { $month: "$transfer_date" } 
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const formatted = expenses.map(e => {
      const date = new Date(e._id.year, e._id.month - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' }).toUpperCase();
      return {
        month: `${monthName} ${e._id.year}`,
        total: e.total
      };
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
