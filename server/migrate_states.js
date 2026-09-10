const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const config = require('./config');
const State = require('./models/masterData/State');

// Fallback extracted from authoritative SQL dump (C:\Users\Pooja Pal\Downloads\sjslayjy_ecogrowth.sql)
const DEFAULT_PHP_STATES = [
  { id: 1, state_name: 'U P East', state_code: 9, is_active: 1, created_by: 1, created_at: '2019-02-11 18:36:43' },
  { id: 2, state_name: 'Madhya Pradesh', state_code: 23, is_active: 1, created_by: 1, created_at: '2019-02-14 14:33:55' },
  { id: 3, state_name: 'Chhattisgarh', state_code: 22, is_active: 1, created_by: 1, created_at: '2019-02-14 14:38:49' },
  { id: 4, state_name: 'Uttar Pradesh Reliance', state_code: null, is_active: 0, created_by: 1, created_at: '2019-02-28 17:47:54' },
  { id: 5, state_name: 'Karnataka', state_code: 29, is_active: 1, created_by: 37, created_at: '2019-04-17 16:45:36' },
  { id: 6, state_name: 'New Delhi', state_code: 7, is_active: 1, created_by: 1, created_at: '2019-06-11 16:50:21' },
  { id: 7, state_name: 'Uttar Pradesh West', state_code: 33, is_active: 0, created_by: 7, created_at: '2019-11-19 18:30:32' },
  { id: 8, state_name: 'Up West', state_code: 9, is_active: 1, created_by: 42, created_at: '2019-11-20 16:44:39' },
  { id: 9, state_name: 'Haryana', state_code: 6, is_active: 1, created_by: 31, created_at: '2019-12-18 16:00:04' },
  { id: 10, state_name: 'Rajasthan', state_code: 8, is_active: 1, created_by: 31, created_at: '2019-12-18 16:09:12' },
  { id: 11, state_name: 'Bihar', state_code: 10, is_active: 1, created_by: 37, created_at: '2019-12-23 12:56:09' },
  { id: 12, state_name: 'Indus Towers Limited', state_code: 9, is_active: 0, created_by: 7, created_at: '2021-07-30 07:54:54' },
  { id: 13, state_name: 'Mizoram', state_code: 50, is_active: 1, created_by: 7, created_at: '2022-10-03 17:09:32' },
  { id: 14, state_name: 'Punjab', state_code: 3, is_active: 1, created_by: 37, created_at: '2023-04-07 12:16:18' },
  { id: 15, state_name: 'Gujarat', state_code: 24, is_active: 1, created_by: 37, created_at: '2023-04-20 14:07:15' },
  { id: 16, state_name: 'Uttarakhand', state_code: 5, is_active: 1, created_by: 37, created_at: '2023-04-27 16:17:32' },
  { id: 17, state_name: 'Uttar Prasesh', state_code: 95, is_active: 1, created_by: 7, created_at: '2026-01-24 14:35:00' },
  { id: 18, state_name: 'Hgfh', state_code: 90, is_active: 0, created_by: 7, created_at: '2026-01-24 14:59:20' }
];

// Helper to parse leading-zero string state code
const formatStateCode = (code) => {
  if (code === null || code === undefined || code === '') return '';
  const num = parseInt(code, 10);
  if (Number.isNaN(num)) return String(code).trim();
  return String(num).padStart(2, '0');
};

async function extractStatesFromDump() {
  const dumpPath = path.resolve('C:/Users/Pooja Pal/Downloads/sjslayjy_ecogrowth.sql');
  if (!fs.existsSync(dumpPath)) {
    console.log('[MIGRATION] Dump file not found, using confirmed table snapshot.');
    return DEFAULT_PHP_STATES;
  }

  try {
    const fileStream = fs.createReadStream(dumpPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let inStatesInsert = false;
    let records = [];

    for await (const line of rl) {
      if (line.includes("INSERT INTO `tbl_states`")) {
        inStatesInsert = true;
        continue;
      }

      if (inStatesInsert) {
        // e.g. (1, 'U P East', 9, 1, 1, '2019-02-11 18:36:43'),
        const matches = line.match(/\((\d+),\s*'([^']+)',\s*([^,]+),\s*(\d+),\s*(\d+),\s*'([^']+)'\)/);
        if (matches) {
          records.push({
            id: parseInt(matches[1], 10),
            state_name: matches[2],
            state_code: matches[3].trim().toUpperCase() === 'NULL' ? null : parseInt(matches[3], 10),
            is_active: parseInt(matches[4], 10),
            created_by: parseInt(matches[5], 10),
            created_at: matches[6]
          });
        }
        if (line.endsWith(';')) {
          inStatesInsert = false;
          break;
        }
      }
    }

    if (records.length > 0) {
      console.log(`[MIGRATION] Successfully extracted ${records.length} states from SQL dump.`);
      return records;
    }
  } catch (err) {
    console.warn('[MIGRATION WARNING] Failed parsing SQL dump directly, using verified snapshot:', err.message);
  }

  return DEFAULT_PHP_STATES;
}

async function runMigration() {
  const stats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    total: 0
  };

  try {
    console.log(`[MIGRATION] Connecting to MongoDB: ${config.db.uri}`);
    await mongoose.connect(config.db.uri);
    console.log('[MIGRATION] Connected to MongoDB.');

    const phpStates = await extractStatesFromDump();
    stats.total = phpStates.length;

    console.log(`[MIGRATION] Starting idempotent import for ${phpStates.length} records...`);

    for (const item of phpStates) {
      try {
        const formattedCode = formatStateCode(item.state_code);
        const isActive = item.is_active === 1;
        const isDeleted = item.is_active === 0;
        const createdAt = item.created_at ? new Date(item.created_at) : new Date();

        // Idempotent search: match by legacy_id OR exact state_name
        const existing = await State.findOne({
          $or: [
            { legacy_id: item.id },
            { state_name: item.state_name }
          ]
        });

        if (!existing) {
          // Create new record
          const newState = new State({
            legacy_id: item.id,
            state_name: item.state_name,
            state_code: formattedCode,
            is_active: isActive,
            is_deleted: isDeleted,
            createdAt: createdAt
          });

          await newState.save();
          console.log(`[IMPORTED] ID: ${item.id} -> ${item.state_name} (Code: "${formattedCode}", Active: ${isActive})`);
          stats.imported++;
        } else {
          // Check if any field differs
          const needsUpdate =
            existing.state_name !== item.state_name ||
            existing.state_code !== formattedCode ||
            existing.is_active !== isActive ||
            existing.is_deleted !== isDeleted ||
            existing.legacy_id !== item.id;

          if (needsUpdate) {
            existing.state_name = item.state_name;
            existing.state_code = formattedCode;
            existing.is_active = isActive;
            existing.is_deleted = isDeleted;
            existing.legacy_id = item.id;
            await existing.save();

            console.log(`[UPDATED] ID: ${item.id} -> ${item.state_name}`);
            stats.updated++;
          } else {
            console.log(`[SKIPPED] ID: ${item.id} -> ${item.state_name} (already synchronized)`);
            stats.skipped++;
          }
        }
      } catch (err) {
        console.error(`[FAILED] Error processing record ID ${item.id}:`, err.message);
        stats.failed++;
      }
    }

    const finalCount = await State.countDocuments();
    const activeCount = await State.countDocuments({ is_deleted: { $ne: true } });

    console.log('\n================ MIGRATION REPORT ================');
    console.log(`Total PHP Source Records : ${stats.total}`);
    console.log(`Imported                 : ${stats.imported}`);
    console.log(`Updated                  : ${stats.updated}`);
    console.log(`Skipped                  : ${stats.skipped}`);
    console.log(`Failed                   : ${stats.failed}`);
    console.log(`MongoDB Total States     : ${finalCount}`);
    console.log(`MongoDB Active States    : ${activeCount}`);
    console.log('==================================================\n');

    return stats;
  } catch (error) {
    console.error('[MIGRATION FATAL ERROR]', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('[MIGRATION] Database connection closed.');
  }
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigration;
