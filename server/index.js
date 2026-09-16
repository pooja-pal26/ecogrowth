const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const jsonDb = require('./services/jsonDb');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const poSitesRoutes = require('./routes/poSitesRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const assetRoutes = require('./routes/assetRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const materialRoutes = require('./routes/materialRoutes');

// Initialize JSON database from json_data/ folder
try {
  jsonDb.init();
} catch (err) {
  console.error('[ERROR] Failed to initialize JSON Database:', err.message);
}

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'JSON API is running' });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'JSON API is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master-data', require('./routes/masterDataRoutes'));
app.use('/api/po-sites', poSitesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/expense-dashboard', require('./routes/expenseDashboardRoutes'));

// Global error handler preserving displayExceptions behavior
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  const response = {
    message: err.message || 'Internal Server Error',
  };
  if (config.app.displayExceptions) {
    response.stack = err.stack;
    response.details = err;
  }
  res.status(err.status || 500).json(response);
});

const PORT = process.env.PORT || config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use by another process!`);
    console.error(`Please stop the process using port ${PORT} before starting a new server.\n`);
  } else {
    console.error('\n[ERROR] Server listen error:', err.message);
  }
});