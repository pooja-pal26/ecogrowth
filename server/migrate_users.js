const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');

async function migrateUsers() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const dumpPath = path.resolve('C:/Users/Pooja Pal/Downloads/sjslayjy_ecogrowth.sql');

  const stats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    total: 0
  };

  try {
    console.log(`[USER MIGRATION] Connecting to MongoDB: ${config.db.uri}`);
    await mongoose.connect(config.db.uri);
    console.log('[USER MIGRATION] Connected to MongoDB.');

    if (!fs.existsSync(dumpPath)) {
      console.error(`[USER MIGRATION ERROR] Database dump not found at ${dumpPath}`);
      return stats;
    }

    const fileStream = fs.createReadStream(dumpPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let lineNum = 0;
    const userRecords = [];

    // Parse tbl_user rows between lines 18960 and 19060
    for await (const line of rl) {
      lineNum++;
      if (lineNum >= 18960 && lineNum <= 19060) {
        const trimmed = line.trim();
        if (trimmed.startsWith('(')) {
          // Parse SQL values tuple
          const parts = trimmed.split(/,\s*(?=(?:[^\']*\'[^\']*\')*[^\']*$)/);
          if (parts.length >= 21) {
            const cleanStr = (val) => (val || '').trim().replace(/^\(|\)$|^'|'$/g, '').replace(/\\'/g, "'");
            const cleanNum = (val, defaultVal = 0) => {
              const n = parseInt(cleanStr(val), 10);
              return Number.isNaN(n) ? defaultVal : n;
            };

            const id = cleanNum(parts[0]);
            const name = cleanStr(parts[1]);
            const firstName = cleanStr(parts[2]);
            const lastName = cleanStr(parts[3]);
            const emailId = cleanStr(parts[4]).toLowerCase();
            const password = cleanStr(parts[5]);
            const plainPassword = cleanStr(parts[6]);
            const contactNo = cleanStr(parts[7]);
            const department = cleanStr(parts[8]);
            const roleType = cleanStr(parts[9]);
            const role = cleanStr(parts[10]);
            const location = cleanStr(parts[11]);
            const status = cleanNum(parts[19], 1);
            const isDeleted = cleanNum(parts[20], 0);

            if (emailId && emailId.includes('@')) {
              userRecords.push({
                id,
                name: name || `${firstName} ${lastName}`.trim() || 'User',
                first_name: firstName,
                last_name: lastName,
                email_id: emailId,
                password,
                plain_password: plainPassword,
                contact_no: contactNo,
                department,
                role_type: roleType,
                role: role || 'user',
                location,
                status,
                is_deleted: isDeleted
              });
            }
          }
        }
      }
      if (lineNum > 19060) break;
    }

    stats.total = userRecords.length;
    console.log(`[USER MIGRATION] Parsed ${userRecords.length} users from SQL dump. Syncing with MongoDB...`);

    for (const rec of userRecords) {
      try {
        // Protect the setup admin account from being overwritten
        if (adminEmail && rec.email_id === adminEmail) {
          console.log(`[PRESERVED] Admin setup account preserved for: ${rec.email_id}`);
          stats.skipped++;
          continue;
        }

        const existing = await User.findOne({ email_id: rec.email_id });

        if (!existing) {
          const newUser = new User({
            name: rec.name,
            first_name: rec.first_name,
            last_name: rec.last_name,
            email_id: rec.email_id,
            password: rec.password,
            contact_no: rec.contact_no,
            department: rec.department,
            role_type: rec.role_type,
            role: rec.role,
            location: rec.location,
            status: rec.status,
            is_deleted: rec.is_deleted,
            legacy_id: rec.id
          });
          await newUser.save();
          stats.imported++;
        } else {
          // Update profile fields while preserving upgraded bcrypt password
          existing.name = rec.name;
          existing.first_name = rec.first_name;
          existing.last_name = rec.last_name;
          existing.contact_no = rec.contact_no;
          existing.department = rec.department;
          existing.role_type = rec.role_type;
          existing.role = rec.role;
          existing.location = rec.location;
          existing.status = rec.status;
          existing.is_deleted = rec.is_deleted;
          existing.legacy_id = rec.id;

          // Only update password if existing is not already a bcrypt hash
          if (!existing.password.startsWith('$2') && !existing.password.startsWith('`$2')) {
            existing.password = rec.password;
          }

          await existing.save();
          stats.updated++;
        }
      } catch (err) {
        console.error(`[USER MIGRATION FAILED] ${rec.email_id}:`, err.message);
        stats.failed++;
      }
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 1, is_deleted: 0 });

    console.log('\n================ USER MIGRATION REPORT ================');
    console.log(`Total Parsed Users from PHP : ${stats.total}`);
    console.log(`Imported                    : ${stats.imported}`);
    console.log(`Updated                     : ${stats.updated}`);
    console.log(`Skipped                     : ${stats.skipped}`);
    console.log(`Failed                      : ${stats.failed}`);
    console.log(`Total Users in MongoDB      : ${totalUsers}`);
    console.log(`Active Users in MongoDB     : ${activeUsers}`);
    console.log('=======================================================\n');

    return stats;
  } catch (error) {
    console.error('[USER MIGRATION FATAL ERROR]', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('[USER MIGRATION] Database connection closed.');
  }
}

if (require.main === module) {
  migrateUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrateUsers;
