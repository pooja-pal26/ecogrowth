/**
 * sql_table_to_json.js
 * 
 * Utility script to extract any MySQL table from the SQL dump
 * and convert its records into a JSON file.
 * 
 * Usage:
 *   node sql_table_to_json.js <tableName>
 * 
 * Examples:
 *   node sql_table_to_json.js tbl_company_vendor_master
 *   node sql_table_to_json.js tbl_office_expense
 */

const fs = require('fs');
const path = require('path');

const SQL_FILE = 'C:\\Users\\Pooja Pal\\Downloads\\sjslayjy_ecogrowth.sql';

// 1. Get table name from CLI args (default: tbl_company_vendor_master)
const tableName = process.argv[2] || 'tbl_company_vendor_master';

if (!fs.existsSync(SQL_FILE)) {
  console.error(`ERROR: SQL file not found at: ${SQL_FILE}`);
  process.exit(1);
}

console.log(`Reading SQL dump for table: \`${tableName}\`...`);
const content = fs.readFileSync(SQL_FILE, 'utf8');

// 2. Extract column names from CREATE TABLE or INSERT INTO
function extractColumns(content, table) {
  // Try INSERT INTO `table` (`col1`, `col2`, ...)
  const insertTag = 'INSERT INTO `' + table + '` (';
  const insertIdx = content.indexOf(insertTag);
  if (insertIdx !== -1) {
    const endParen = content.indexOf(')', insertIdx);
    const colsPart = content.substring(insertIdx + insertTag.length, endParen);
    return colsPart.split(',').map(c => c.replace(/[`'"]/g, '').trim());
  }

  // Try CREATE TABLE `table` (
  const createTag = 'CREATE TABLE `' + table + '` (';
  const createIdx = content.indexOf(createTag);
  if (createIdx !== -1) {
    const endTable = content.indexOf(') ENGINE=', createIdx);
    const block = content.substring(createIdx + createTag.length, endTable);
    const lines = block.split('\n');
    const cols = [];
    for (const l of lines) {
      const trimmed = l.trim();
      if (trimmed.startsWith('`')) {
        const colName = trimmed.substring(1, trimmed.indexOf('`', 1));
        cols.push(colName);
      }
    }
    return cols;
  }

  return [];
}

// 3. Extract INSERT block
function extractInsertBlock(content, table) {
  const tag = 'INSERT INTO `' + table + '`';
  const start = content.indexOf(tag);
  if (start === -1) return '';
  const end = content.indexOf(';\n', start);
  return content.substring(start, end !== -1 ? end + 1 : content.indexOf(';', start) + 1);
}

// 4. Parse SQL Tuples (...)
function parseSqlTuples(valuesPart) {
  const rows = [];
  let cur = '';
  let inStr = false;
  let esc = false;
  let depth = 0;

  for (let i = 0; i < valuesPart.length; i++) {
    const ch = valuesPart[i];
    if (esc) { cur += ch; esc = false; continue; }
    if (ch === '\\') { cur += ch; esc = true; continue; }
    if (ch === "'") { inStr = !inStr; cur += ch; continue; }
    if (!inStr) {
      if (ch === '(') { depth++; if (depth === 1) { cur = ''; continue; } }
      else if (ch === ')') { depth--; if (depth === 0) { rows.push(cur); cur = ''; continue; } }
    }
    if (depth > 0) cur += ch;
  }
  return rows;
}

// 5. Split row values
function splitRow(tuple) {
  const items = [];
  let cur = '';
  let inStr = false;
  let esc = false;

  for (let i = 0; i < tuple.length; i++) {
    const c = tuple[i];
    if (esc) { cur += c; esc = false; continue; }
    if (c === '\\') { cur += c; esc = true; continue; }
    if (c === "'") { inStr = !inStr; continue; }
    if (c === ',' && !inStr) { items.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  items.push(cur.trim());
  return items;
}

// 6. Convert to JSON
const columns = extractColumns(content, tableName);
console.log(`Detected ${columns.length} columns:`, columns.join(', '));

const insertBlock = extractInsertBlock(content, tableName);
if (!insertBlock) {
  console.log(`No INSERT data found for table: ${tableName}`);
  process.exit(0);
}

const valIdx = insertBlock.indexOf('VALUES');
const tuples = parseSqlTuples(insertBlock.substring(valIdx + 6));
console.log(`Found ${tuples.length} rows in SQL dump.`);

const jsonRecords = [];

for (const tuple of tuples) {
  const vals = splitRow(tuple);
  const record = {};

  columns.forEach((col, idx) => {
    let raw = vals[idx];
    if (raw === undefined || raw === 'NULL') {
      record[col] = null;
    } else {
      // Clean up string
      raw = raw.replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').replace(/\\t/g, ' ').trim();

      // Number conversion check (only if pure integer/float and not a phone or code)
      const isPhoneOrCode = ['contact_number', 'phone', 'mobile', 'pan_number', 'gst_number', 'pin'].includes(col);
      if (!isPhoneOrCode && /^-?\d+(\.\d+)?$/.test(raw)) {
        record[col] = Number(raw);
      } else {
        record[col] = raw;
      }
    }
  });

  jsonRecords.push(record);
}

// Save output JSON
const outFilename = `${tableName}.json`;
const outPath = path.join(__dirname, '..', outFilename);
fs.writeFileSync(outPath, JSON.stringify(jsonRecords, null, 2), 'utf8');

console.log(`\n SUCCESS: Converted ${jsonRecords.length} records to JSON!`);
console.log(` Output File: ${outPath}`);
console.log(`\n You can now open MongoDB Compass, click "Import data", choose JSON, and select this file!`);
