const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

exports.getAll = async (req, res) => {
  try {
    const data = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // GST Calculation: assuming 18% standard
    let amount = parseFloat(req.body.amount || 0);
    let gst = amount * 0.18;
    let total = amount + gst;

    const newData = new Invoice({
      ...req.body,
      amount: total
    });
    await newData.save();
    res.status(201).json({ success: true, data: newData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function numberToWords(number) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (number === 0) return 'zero';
    if (number < 20) return ones[number];
    if (number < 100) return tens[Math.floor(number / 10)] + (number % 10 !== 0 ? ' ' + ones[number % 10] : '');
    if (number < 1000) return ones[Math.floor(number / 100)] + ' hundred' + (number % 100 !== 0 ? ' and ' + numberToWords(number % 100) : '');
    if (number < 100000) return numberToWords(Math.floor(number / 1000)) + ' thousand' + (number % 1000 !== 0 ? ' ' + numberToWords(number % 1000) : '');
    if (number < 1000000) return numberToWords(Math.floor(number / 100000)) + ' lakh' + (number % 100000 !== 0 ? ' ' + numberToWords(number % 100000) : '');
    return numberToWords(Math.floor(number / 10000000)) + ' crore' + (number % 10000000 !== 0 ? ' ' + numberToWords(number % 10000000) : '');
}

exports.downloadPdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument();
    let filename = encodeURIComponent('Invoice-' + invoice.invoiceNumber) + '.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(25).text('EcoGrowth Invoice', 100, 100);
    doc.fontSize(15).text('Invoice Number: ' + invoice.invoiceNumber, 100, 150);
    doc.text('Status: ' + invoice.status, 100, 180);
    doc.text('Total Amount (incl. 18% GST): Rs. ' + invoice.amount, 100, 210);

    const amountInWords = numberToWords(Math.floor(invoice.amount));
    doc.text('Amount in words: ' + amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1) + ' Rupees Only', 100, 240);

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};