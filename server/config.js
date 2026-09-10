const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const parseNumber = (val, defaultVal) => {
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? defaultVal : parsed;
};

const parseBoolean = (val, defaultVal) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  return val === 'true' || val === '1' || val === true;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

const tokenExpireTimeHours = parseNumber(process.env.TOKEN_EXPIRE_TIME, 24);

const config = {
  env: nodeEnv,
  isProduction,
  isDevelopment,
  port: parseNumber(process.env.PORT, 5000),
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecogrowth',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey_change_me_in_production',
    tokenExpireTimeHours,
    tokenExpiresIn: `${tokenExpireTimeHours}h`,
    cookieMaxAgeMs: tokenExpireTimeHours * 60 * 60 * 1000,
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  api: {
    searchUserSecret: process.env.API_SEARCHUSER_SECRET || '',
    siteUrl: process.env.API_SITE_URL || 'http://cairn.cropnet.co.in/api/',
    emailUrl: process.env.API_EMAIL_URL || 'http://cairn.cropnet.co.in/',
    siteImageUrl: process.env.SITE_IMAGE_URL || 'http://cairn.cropnet.co.in/images/',
  },
  app: {
    pendingDaysDuration: parseNumber(process.env.PENDING_DAYS_DURATION, 7),
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
    displayExceptions: parseBoolean(process.env.DISPLAY_EXCEPTIONS, !isProduction),
  },
};

// Validation checks
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'supersecretkey_change_me_in_production') {
    console.warn('[CONFIG WARNING] JWT_SECRET is using the default placeholder in production mode!');
  }
  if (!process.env.MONGO_URI) {
    console.warn('[CONFIG WARNING] MONGO_URI is not explicitly defined in production mode!');
  }
}

module.exports = Object.freeze(config);
