const mongoose = require('mongoose');
require('dotenv').config();

const PoSite = require('./models/PoSite');
const SiteAllocation = require('./models/SiteAllocation');
const SiteExpense = require('./models/SiteExpense');
const OfficeExpense = require('./models/OfficeExpense');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecogrowth')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // Clear existing
    await PoSite.deleteMany({});
    await SiteAllocation.deleteMany({});
    await SiteExpense.deleteMany({});
    await OfficeExpense.deleteMany({});

    // Seed PoSites
    await PoSite.insertMany([
      { po_no: 'PO001', site_id: 'S001', is_deleted: 0 },
      { po_no: 'PO002', site_id: 'S002', is_deleted: 0 },
      { po_no: 'PO003', site_id: 'S003', is_deleted: 1 },
      { po_no: 'PO004', site_id: 'S004', is_deleted: 0 },
      { po_no: 'PO005', site_id: 'S005', is_deleted: 0 },
    ]);

    // Seed SiteAllocations (status=1 means active)
    await SiteAllocation.insertMany([
      { po_no: 'PO001', site_id: 'S001', site_completion_status: 0, close_status: 0, status: 1 }, // pending & in progress
      { po_no: 'PO002', site_id: 'S002', site_completion_status: 1, close_status: 1, status: 1 }, // completed
      { po_no: 'PO004', site_id: 'S004', site_completion_status: 0, close_status: 0, status: 1 }, // pending
      { po_no: 'PO005', site_id: 'S005', site_completion_status: 0, close_status: 0, status: 0 }, // inactive allocation
    ]);

    // Seed SiteExpenses (spread across months of current year)
    const currentYear = new Date().getFullYear();
    const siteExpenses = [];
    for(let i=1; i<=12; i++) {
      siteExpenses.push({
        po_no: `PO00${i%2+1}`,
        site_id: `S00${i%2+1}`,
        amount: Math.floor(Math.random() * 5000) + 1000,
        transfer_date: new Date(`${currentYear}-${i.toString().padStart(2, '0')}-15`)
      });
    }
    await SiteExpense.insertMany(siteExpenses);

    // Seed OfficeExpenses (spread across last 6 months)
    const officeExpenses = [];
    for(let i=0; i<6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      officeExpenses.push({
        amount: Math.floor(Math.random() * 3000) + 500,
        transfer_date: d,
        is_deleted: 0
      });
    }
    await OfficeExpense.insertMany(officeExpenses);

    console.log('Dummy data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
