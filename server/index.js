const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const poSitesRoutes = require('./routes/poSitesRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const assetRoutes = require('./routes/assetRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const materialRoutes = require('./routes/materialRoutes');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('EcoGrowth API is running');
});

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

mongoose.connect(config.db.uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(config.port, () => {
  console.log(`Server running in ${config.env} mode on port ${config.port}`);
});