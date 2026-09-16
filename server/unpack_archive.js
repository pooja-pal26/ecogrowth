/**
 * unpack_archive.js
 * 
 * Unpacks the mongodump archive (sjslayjy_ecogrowth.archive)
 * and writes each collection's documents as a JSON file in e:\Logimetrix 2026\ecogrowth-mern\json_data\
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const bson = require('bson');

const ARCHIVE_FILE = path.resolve('e:/Logimetrix 2026/ecogrowth-mern/sjslayjy_ecogrowth.archive');
const OUTPUT_DIR = path.resolve('e:/Logimetrix 2026/ecogrowth-mern/json_data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Reading archive from: ${ARCHIVE_FILE}`);
const raw = fs.readFileSync(ARCHIVE_FILE);
console.log('Decompressing gzip archive...');
const unzipped = zlib.gunzipSync(raw);
console.log(`Uncompressed size: ${(unzipped.length / 1024 / 1024).toFixed(2)} MB`);

// 1. Skip magic (4 bytes)
let offset = 4;

// 2. Skip archive header doc
const headerLen = unzipped.readInt32LE(offset);
offset += headerLen;

// 3. Skip collection metadata
while (offset < unzipped.length) {
  const marker = unzipped.readInt32LE(offset);
  if (marker === -1) break;
  offset += marker;
}

// 4. Stream extraction
const collectionDocs = {};
let currentCollection = null;
let totalDocs = 0;

console.log('Extracting collection documents...');
while (offset < unzipped.length - 4) {
  const len = unzipped.readInt32LE(offset);
  if (len === -1) {
    offset += 4;
    const headerDocLen = unzipped.readInt32LE(offset);
    const headerDoc = bson.deserialize(unzipped.subarray(offset, offset + headerDocLen));
    offset += headerDocLen;
    if (!headerDoc.EOF) {
      currentCollection = headerDoc.collection;
      if (!collectionDocs[currentCollection]) {
        collectionDocs[currentCollection] = [];
      }
    }
    continue;
  }

  if (len <= 4 || offset + len > unzipped.length) {
    break;
  }

  if (currentCollection) {
    const docBytes = unzipped.subarray(offset, offset + len);
    const doc = bson.deserialize(docBytes);
    collectionDocs[currentCollection].push(doc);
    totalDocs++;
  }

  offset += len;
}

console.log(`Extracted ${totalDocs} total documents across ${Object.keys(collectionDocs).length} collections.`);

// 5. Write each collection to JSON
let filesWritten = 0;
for (const [colName, docs] of Object.entries(collectionDocs)) {
  if (docs.length === 0) continue;
  const filePath = path.join(OUTPUT_DIR, `${colName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
  filesWritten++;
}

console.log(`Successfully wrote ${filesWritten} JSON files to: ${OUTPUT_DIR}`);
