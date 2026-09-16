const jsonDb = require('../services/jsonDb');

// Helper to parse date to string YYYY-MM-DD
const parseDateString = (dateVal) => {
  if (!dateVal) return '';
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split('T')[0];
  }
  const s = String(dateVal).trim();
  if (s.includes('T')) return s.split('T')[0];
  if (s.includes(' ')) return s.split(' ')[0];
  return s;
};

// Helper to parse numeric amounts safely
const parseAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

/**
 * GET /api/expense-dashboard/overview
 * Replicates PHP ExpenseController::expenseDashboardAction
 */
exports.getOverview = async (req, res) => {
  try {
    const allSiteExpenses = jsonDb.getTable('tbl_site_expense');
    const allOfficeExpenses = jsonDb.getTable('tbl_office_expense');
    const allInvoices = jsonDb.getTable('tbl_punched_invoice_details');

    // Detect available years from JSON data
    const yearSet = new Set();
    [...allSiteExpenses, ...allOfficeExpenses].forEach(d => {
      const dt = parseDateString(d.transfer_date);
      if (dt && dt.length >= 4) {
        const y = dt.substring(0, 4);
        if (/^\d{4}$/.test(y)) yearSet.add(y);
      }
    });
    allInvoices.forEach(d => {
      const dt = parseDateString(d.invoice_date);
      if (dt && dt.length >= 4) {
        const y = dt.substring(0, 4);
        if (/^\d{4}$/.test(y)) yearSet.add(y);
      }
    });

    const availableYears = Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
    if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

    // Selected year (defaults to requested year, or 2025/2026/latest available)
    const currentYear = req.query.year || (availableYears.includes('2025') ? '2025' : availableYears[0]);
    const selectedZone = req.query.zone || '';

    // Filter site expenses by zone if specified
    let filteredSiteExpenses = allSiteExpenses;
    if (selectedZone) {
      filteredSiteExpenses = allSiteExpenses.filter(d => 
        String(d.state_for || '').toLowerCase().includes(selectedZone.toLowerCase())
      );
    }

    // Filter active office expenses
    const activeOfficeExpenses = allOfficeExpenses.filter(d => d.is_deleted !== 1 && d.is_deleted !== '1');

    // Filter active punched invoices
    const activeInvoices = allInvoices.filter(d => d.status !== 0 && d.status !== '0');

    // Months definition matching PHP
    const months = [
      { key: '01', name: 'JAN' },
      { key: '02', name: 'FEB' },
      { key: '03', name: 'MAR' },
      { key: '04', name: 'APR' },
      { key: '05', name: 'MAY' },
      { key: '06', name: 'JUN' },
      { key: '07', name: 'JUL' },
      { key: '08', name: 'AUG' },
      { key: '09', name: 'SEP' },
      { key: '10', name: 'OCT' },
      { key: '11', name: 'NOV' },
      { key: '12', name: 'DEC' }
    ];

    let totalSiteExpenseYear = 0;
    let totalOfficeExpenseYear = 0;
    let totalInvoiceAmountYear = 0;

    const monthlyData = months.map(m => {
      const prefix = `${currentYear}-${m.key}`;

      // Sum site expense
      const siteSum = filteredSiteExpenses
        .filter(d => parseDateString(d.transfer_date).startsWith(prefix))
        .reduce((sum, d) => sum + parseAmount(d.amount), 0);

      // Sum office expense
      const officeSum = activeOfficeExpenses
        .filter(d => parseDateString(d.transfer_date).startsWith(prefix))
        .reduce((sum, d) => sum + parseAmount(d.amount), 0);

      // Sum invoices
      const invoiceSum = activeInvoices
        .filter(d => parseDateString(d.invoice_date).startsWith(prefix))
        .reduce((sum, d) => sum + parseAmount(d.invoice_value), 0);

      const totalExp = Math.round((siteSum + officeSum) * 100) / 100;
      const roundedSite = Math.round(siteSum * 100) / 100;
      const roundedOffice = Math.round(officeSum * 100) / 100;
      const roundedInvoice = Math.round(invoiceSum * 100) / 100;
      const variance = Math.round((roundedInvoice - totalExp) * 100) / 100;

      totalSiteExpenseYear += roundedSite;
      totalOfficeExpenseYear += roundedOffice;
      totalInvoiceAmountYear += roundedInvoice;

      return {
        monthKey: m.key,
        monthName: m.name,
        monthYear: `${m.name}-${currentYear}`,
        siteExpense: roundedSite,
        officeExpense: roundedOffice,
        totalExpense: totalExp,
        invoiceAmount: roundedInvoice,
        profitOrLoss: variance
      };
    });

    totalSiteExpenseYear = Math.round(totalSiteExpenseYear * 100) / 100;
    totalOfficeExpenseYear = Math.round(totalOfficeExpenseYear * 100) / 100;
    totalInvoiceAmountYear = Math.round(totalInvoiceAmountYear * 100) / 100;
    const totalExpensesYear = Math.round((totalSiteExpenseYear + totalOfficeExpenseYear) * 100) / 100;
    const netBalanceYear = Math.round((totalInvoiceAmountYear - totalExpensesYear) * 100) / 100;

    // Fetch state zones for filter
    const stateList = jsonDb.getTable('tbl_state_for');
    const zones = stateList
      .filter(s => s.is_active !== false && s.status !== 0 && s.status !== '0')
      .map(s => s.state_for)
      .filter(Boolean);

    res.json({
      success: true,
      selectedYear: currentYear,
      availableYears,
      zones,
      kpi: {
        totalSiteExpense: totalSiteExpenseYear,
        totalOfficeExpense: totalOfficeExpenseYear,
        totalExpenses: totalExpensesYear,
        totalInvoiced: totalInvoiceAmountYear,
        netBalance: netBalanceYear,
        averageMonthlyExpense: Math.round((totalExpensesYear / 12) * 100) / 100
      },
      monthlyData
    });
  } catch (error) {
    console.error('Error in getExpenseDashboardOverview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/expense-dashboard/breakdown
 * Provides drill-down lists for Site and Office expenses with filters
 */
exports.getBreakdown = async (req, res) => {
  try {
    const { type = 'site', year, month, limit = 50 } = req.query;

    if (type === 'office') {
      let docs = jsonDb.getTable('tbl_office_expense')
        .filter(d => d.is_deleted !== 1 && d.is_deleted !== '1');

      if (year) {
        let prefix = String(year);
        if (month) prefix = `${year}-${String(month).padStart(2, '0')}`;
        docs = docs.filter(d => parseDateString(d.transfer_date).startsWith(prefix));
      }

      docs.sort((a, b) => (parseDateString(b.transfer_date) < parseDateString(a.transfer_date) ? -1 : 1));
      return res.json({ success: true, count: docs.length, data: docs.slice(0, Number(limit)) });
    }

    // Default site expenses
    let docs = jsonDb.getTable('tbl_site_expense');

    if (year) {
      let prefix = String(year);
      if (month) prefix = `${year}-${String(month).padStart(2, '0')}`;
      docs = docs.filter(d => parseDateString(d.transfer_date).startsWith(prefix));
    }

    docs.sort((a, b) => (parseDateString(b.transfer_date) < parseDateString(a.transfer_date) ? -1 : 1));
    res.json({ success: true, count: docs.length, data: docs.slice(0, Number(limit)) });
  } catch (error) {
    console.error('Error in getExpenseBreakdown:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
