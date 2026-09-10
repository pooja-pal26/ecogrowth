const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const config = require('./config');
const User = require('./models/User');

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('[ADMIN SEED ERROR] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in server/.env');
    process.exit(1);
  }

  try {
    console.log('[ADMIN SEED] Connecting to database...');
    await mongoose.connect(config.db.uri);
    console.log('[ADMIN SEED] Connected to MongoDB.');

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Idempotently create or update admin user
    let user = await User.findOne({ email_id: adminEmail });

    if (!user) {
      user = new User({
        name: 'EcoGrowth Administrator',
        email_id: adminEmail,
        password: hashedPassword,
        role: 'admin',
        role_type: '1',
        status: 1,
        is_deleted: 0
      });
      await user.save();
      console.log(`[ADMIN SEED SUCCESS] Admin account created successfully for: ${adminEmail}`);
    } else {
      user.name = user.name || 'EcoGrowth Administrator';
      user.password = hashedPassword;
      user.role = 'admin';
      user.role_type = '1';
      user.status = 1;
      user.is_deleted = 0;
      await user.save();
      console.log(`[ADMIN SEED SUCCESS] Existing admin account updated successfully for: ${adminEmail}`);
    }
  } catch (error) {
    console.error('[ADMIN SEED FATAL ERROR]', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[ADMIN SEED] Database connection closed.');
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedAdmin;
