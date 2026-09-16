const { createJsonModel } = require('./JsonModel');

const Invoice = createJsonModel('tbl_punched_invoice_details');

module.exports = Invoice;