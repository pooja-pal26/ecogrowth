const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const JSON_DIR = path.resolve(__dirname, '../../json_data');

// Exact list of all 75 JSON data sources
const REQUIRED_FILES = [
  'asset_types.json',
  'assets.json',
  'cairn_department.json',
  'logi_admin.json',
  'logi_user_login_detail.json',
  'modules.json',
  'monthly_invoice_details.json',
  'open_po_notification_duration.json',
  'role_module_associations.json',
  'sub_modules.json',
  'tbl_annual_turnover_master.json',
  'tbl_asset_assignments.json',
  'tbl_association_years_master.json',
  'tbl_attendance_settings.json',
  'tbl_bank_accounts.json',
  'tbl_bank_master.json',
  'tbl_client_master.json',
  'tbl_companies.json',
  'tbl_company_vendor_master.json',
  'tbl_debit_account.json',
  'tbl_deployment.json',
  'tbl_expense_details.json',
  'tbl_expense_in_type_master.json',
  'tbl_expense_transfer_for_master.json',
  'tbl_expense_type_master.json',
  'tbl_global_data.json',
  'tbl_incident_report_person.json',
  'tbl_inventory.json',
  'tbl_invoice_services_master.json',
  'tbl_location_mapping.json',
  'tbl_material_supplier.json',
  'tbl_material_unit.json',
  'tbl_nature_of_work.json',
  'tbl_notification.json',
  'tbl_office_expense.json',
  'tbl_organization_type_master.json',
  'tbl_payees.json',
  'tbl_payment_modes.json',
  'tbl_po_details.json',
  'tbl_po_sites.json',
  'tbl_product_type.json',
  'tbl_products.json',
  'tbl_punched_invoice_details.json',
  'tbl_role_type.json',
  'tbl_roles.json',
  'tbl_site_allocation.json',
  'tbl_site_document.json',
  'tbl_site_expense.json',
  'tbl_site_expense_details.json',
  'tbl_site_map.json',
  'tbl_site_matrix.json',
  'tbl_site_nature_of_work.json',
  'tbl_site_status.json',
  'tbl_site_type_master.json',
  'tbl_staff_attendance.json',
  'tbl_staff_office_attendance.json',
  'tbl_state_for.json',
  'tbl_states.json',
  'tbl_stock_in_details.json',
  'tbl_suppliers.json',
  'tbl_transporter_master.json',
  'tbl_user.json',
  'tbl_user_balance.json',
  'tbl_user_path.json',
  'tbl_vendor.json',
  'tbl_vendor_bank_and_gst_details.json',
  'tbl_vendor_experience_master.json',
  'tbl_vendor_geographical_presence_master.json',
  'tbl_vendor_major_clients_master.json',
  'tbl_vendor_manpower.json',
  'tbl_vendor_team_strength_master.json',
  'tbl_work_description_master.json',
  'tbl_work_for_site_of_master.json',
  'tbl_work_handling_amount_master.json',
  'tbl_work_master.json',
  'tbl_work_type_master.json',
  'under_sub_module.json'
];

// Entity Aliases mapping any client/API name to its underlying JSON file
const TABLE_ALIASES = {
  // Users & Roles
  users: 'tbl_user',
  user: 'tbl_user',
  tbl_user: 'tbl_user',
  tbl_users: 'tbl_user',
  cairn_department: 'cairn_department',
  departments: 'cairn_department',
  tbl_role_type: 'tbl_role_type',
  role_types: 'tbl_role_type',
  tbl_roles: 'tbl_roles',
  roles: 'tbl_roles',

  // States
  states: 'tbl_states',
  state: 'tbl_states',
  tbl_states: 'tbl_states',
  statefors: 'tbl_state_for',
  state_for: 'tbl_state_for',
  tbl_state_for: 'tbl_state_for',

  // Clients & Companies
  clients: 'tbl_client_master',
  client: 'tbl_client_master',
  clientmasters: 'tbl_client_master',
  tbl_client_master: 'tbl_client_master',
  companies: 'tbl_companies',
  tbl_companies: 'tbl_companies',
  companyvendors: 'tbl_company_vendor_master',
  companyvendor: 'tbl_company_vendor_master',
  'company-vendors': 'tbl_company_vendor_master',
  tbl_company_vendor_master: 'tbl_company_vendor_master',

  // Vendors
  vendors: 'tbl_vendor',
  vendor: 'tbl_vendor',
  tbl_vendor: 'tbl_vendor',
  vendor_bank_gst: 'tbl_vendor_bank_and_gst_details',
  tbl_vendor_bank_and_gst_details: 'tbl_vendor_bank_and_gst_details',
  vendor_manpower: 'tbl_vendor_manpower',
  tbl_vendor_manpower: 'tbl_vendor_manpower',
  vendorexperiences: 'tbl_vendor_experience_master',
  tbl_vendor_experience_master: 'tbl_vendor_experience_master',
  organizationtypes: 'tbl_organization_type_master',
  tbl_organization_type_master: 'tbl_organization_type_master',
  associationyearss: 'tbl_association_years_master',
  tbl_association_years_master: 'tbl_association_years_master',
  geographicalpresences: 'tbl_vendor_geographical_presence_master',
  tbl_vendor_geographical_presence_master: 'tbl_vendor_geographical_presence_master',
  majorclientss: 'tbl_vendor_major_clients_master',
  tbl_vendor_major_clients_master: 'tbl_vendor_major_clients_master',
  teamstrengths: 'tbl_vendor_team_strength_master',
  tbl_vendor_team_strength_master: 'tbl_vendor_team_strength_master',
  annualturnovers: 'tbl_annual_turnover_master',
  tbl_annual_turnover_master: 'tbl_annual_turnover_master',
  workhandleamounts: 'tbl_work_handling_amount_master',
  tbl_work_handling_amount_master: 'tbl_work_handling_amount_master',

  // Bank & Payment
  bankaccountss: 'tbl_bank_accounts',
  bankaccounts: 'tbl_bank_accounts',
  tbl_bank_accounts: 'tbl_bank_accounts',
  banknamelists: 'tbl_bank_master',
  bankmasters: 'tbl_bank_master',
  tbl_bank_master: 'tbl_bank_master',
  paymentmodess: 'tbl_payment_modes',
  paymentmodes: 'tbl_payment_modes',
  tbl_payment_modes: 'tbl_payment_modes',
  debitaccountdetailss: 'tbl_debit_account',
  debitaccounts: 'tbl_debit_account',
  tbl_debit_account: 'tbl_debit_account',
  payees: 'tbl_payees',
  tbl_payees: 'tbl_payees',

  // Expenses
  site_expenses: 'tbl_site_expense',
  siteexpenses: 'tbl_site_expense',
  tbl_site_expense: 'tbl_site_expense',
  tbl_site_expense_details: 'tbl_site_expense_details',
  office_expenses: 'tbl_office_expense',
  officeexpenses: 'tbl_office_expense',
  tbl_office_expense: 'tbl_office_expense',
  tbl_expense_details: 'tbl_expense_details',
  expensetypes: 'tbl_expense_type_master',
  tbl_expense_type_master: 'tbl_expense_type_master',
  expenseins: 'tbl_expense_in_type_master',
  tbl_expense_in_type_master: 'tbl_expense_in_type_master',
  expensefors: 'tbl_expense_transfer_for_master',
  tbl_expense_transfer_for_master: 'tbl_expense_transfer_for_master',

  // Sites & PO
  po_sites: 'tbl_po_sites',
  posites: 'tbl_po_sites',
  tbl_po_sites: 'tbl_po_sites',
  po_details: 'tbl_po_details',
  tbl_po_details: 'tbl_po_details',
  site_allocations: 'tbl_site_allocation',
  siteallocations: 'tbl_site_allocation',
  tbl_site_allocation: 'tbl_site_allocation',
  sitetypes: 'tbl_site_type_master',
  tbl_site_type_master: 'tbl_site_type_master',
  sitestatuses: 'tbl_site_status',
  tbl_site_status: 'tbl_site_status',
  sitedocumentss: 'tbl_site_document',
  tbl_site_document: 'tbl_site_document',
  tbl_site_map: 'tbl_site_map',
  tbl_site_matrix: 'tbl_site_matrix',
  tbl_site_nature_of_work: 'tbl_site_nature_of_work',
  natureofworks: 'tbl_nature_of_work',
  tbl_nature_of_work: 'tbl_nature_of_work',
  workforsiteofs: 'tbl_work_for_site_of_master',
  tbl_work_for_site_of_master: 'tbl_work_for_site_of_master',
  works: 'tbl_work_master',
  tbl_work_master: 'tbl_work_master',
  worktypes: 'tbl_work_type_master',
  tbl_work_type_master: 'tbl_work_type_master',
  workdescriptions: 'tbl_work_description_master',
  tbl_work_description_master: 'tbl_work_description_master',
  incident_report_person: 'tbl_incident_report_person',
  tbl_incident_report_person: 'tbl_incident_report_person',
  addgeolocations: 'tbl_location_mapping',
  tbl_location_mapping: 'tbl_location_mapping',
  deployments: 'tbl_deployment',
  tbl_deployment: 'tbl_deployment',

  // Invoices
  punched_invoices: 'tbl_punched_invoice_details',
  punchedinvoices: 'tbl_punched_invoice_details',
  punchedinvoicess: 'tbl_punched_invoice_details',
  tbl_punched_invoice_details: 'tbl_punched_invoice_details',
  monthly_invoices: 'monthly_invoice_details',
  monthlyinvoicereports: 'monthly_invoice_details',
  monthly_invoice_details: 'monthly_invoice_details',
  invoice_services: 'tbl_invoice_services_master',
  tbl_invoice_services_master: 'tbl_invoice_services_master',
  invoices: 'tbl_punched_invoice_details',

  // Products, Inventory & Material
  products: 'tbl_products',
  productlists: 'tbl_products',
  tbl_products: 'tbl_products',
  producttypes: 'tbl_product_type',
  tbl_product_type: 'tbl_product_type',
  productunits: 'tbl_material_unit',
  tbl_material_unit: 'tbl_material_unit',
  productbrands: 'tbl_products', // brand stored within products
  productsupplierss: 'tbl_suppliers',
  materialsupplierss: 'tbl_suppliers',
  tbl_suppliers: 'tbl_suppliers',
  tbl_material_supplier: 'tbl_material_supplier',
  transporterss: 'tbl_transporter_master',
  tbl_transporter_master: 'tbl_transporter_master',
  inventory: 'tbl_inventory',
  tbl_inventory: 'tbl_inventory',
  materials: 'tbl_products',
  stock_in_details: 'tbl_stock_in_details',
  tbl_stock_in_details: 'tbl_stock_in_details',

  // Users, Roles & Auth
  users: 'tbl_user',
  user: 'tbl_user',
  tbl_user: 'tbl_user',
  roles: 'tbl_roles',
  roless: 'tbl_roles',
  tbl_roles: 'tbl_roles',
  roletypes: 'tbl_role_type',
  roletypess: 'tbl_role_type',
  tbl_role_type: 'tbl_role_type',
  modules: 'modules',
  sub_modules: 'sub_modules',
  under_sub_module: 'under_sub_module',
  role_module_associations: 'role_module_associations',
  logi_admin: 'logi_admin',
  logi_user_login_detail: 'logi_user_login_detail',

  // Staff & Attendance
  tbl_staff_attendance: 'tbl_staff_attendance',
  tbl_staff_office_attendance: 'tbl_staff_office_attendance',
  tbl_attendance_settings: 'tbl_attendance_settings',
  tbl_user_balance: 'tbl_user_balance',
  tbl_user_path: 'tbl_user_path',

  // Asset Management
  asset_types: 'asset_types',
  assettypes: 'asset_types',
  assets: 'assets',
  asset: 'assets',
  tbl_asset_assignments: 'tbl_asset_assignments',
  asset_assignments: 'tbl_asset_assignments',
  assetassignments: 'tbl_asset_assignments',
  cairn_department: 'cairn_department',
  tbl_global_data: 'tbl_global_data',
  tbl_notification: 'tbl_notification',
  open_po_notification_duration: 'open_po_notification_duration'
};

class JsonDbService {
  constructor() {
    this.tables = new Map(); // tableName -> Array of records
    this.indices = new Map(); // tableName -> Map(_id -> record)
    this.initialized = false;
    this.saveQueues = new Set();
  }

  /**
   * Resolve table key from entity name / alias
   */
  resolveTableName(name) {
    if (!name) return null;
    const clean = String(name).trim().toLowerCase().replace(/[-_]/g, '');
    
    // Direct match
    if (this.tables.has(name)) return name;

    // Alias map match
    const lower = String(name).trim().toLowerCase();
    if (TABLE_ALIASES[lower] && this.tables.has(TABLE_ALIASES[lower])) {
      return TABLE_ALIASES[lower];
    }
    if (TABLE_ALIASES[clean] && this.tables.has(TABLE_ALIASES[clean])) {
      return TABLE_ALIASES[clean];
    }

    // Fuzzy check against table names
    for (const tableName of this.tables.keys()) {
      const normTable = tableName.toLowerCase().replace(/[-_]/g, '');
      if (normTable === clean || normTable === `tbl${clean}` || `${clean}s` === normTable) {
        return tableName;
      }
    }

    return name;
  }

  /**
   * Initialize and load all 75 JSON files into memory with validation
   */
  init() {
    if (this.initialized) return;

    console.log(`[JSON-DB] Initializing JSON Database from: ${JSON_DIR}`);

    if (!fs.existsSync(JSON_DIR)) {
      throw new Error(`[JSON-DB FATAL] The data directory does not exist: ${JSON_DIR}`);
    }

    let loadedCount = 0;
    const errors = [];

    for (const file of REQUIRED_FILES) {
      const filePath = path.join(JSON_DIR, file);
      const tableName = file.replace(/\.json$/, '');

      if (!fs.existsSync(filePath)) {
        errors.push(`Missing required JSON file: ${file}`);
        continue;
      }

      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        let records = JSON.parse(raw);

        if (!Array.isArray(records)) {
          records = [records];
        }

        // Normalize IDs and indexes
        const indexMap = new Map();
        for (let i = 0; i < records.length; i++) {
          const rec = records[i];
          if (!rec._id) {
            rec._id = rec.id ? String(rec.id) : crypto.randomBytes(12).toString('hex');
          }
          rec._id = String(rec._id);
          indexMap.set(rec._id, rec);
          if (rec.id !== undefined && rec.id !== null) {
            indexMap.set(String(rec.id), rec);
          }
        }

        this.tables.set(tableName, records);
        this.indices.set(tableName, indexMap);
        loadedCount++;
      } catch (err) {
        errors.push(`Malformed JSON file: ${file} (${err.message})`);
      }
    }

    if (errors.length > 0) {
      console.error('[JSON-DB ERROR] Data validation failed for the following sources:');
      errors.forEach(e => console.error(`  - ${e}`));
      throw new Error(`[JSON-DB FATAL] ${errors.length} JSON data sources are missing or malformed.`);
    }

    this.initialized = true;

    // Ensure default admin user exists in tbl_user
    this.ensureAdminUser();

    console.log(`[JSON-DB SUCCESS] All ${loadedCount} JSON data sources loaded and validated successfully.`);
  }

  /**
   * Ensure default admin user is available in tbl_user for testing/login
   */
  ensureAdminUser() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'pooja55@gmail.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const users = this.getTable('tbl_user');

    const existing = users.find(u => (u.email_id || u.email || '').trim().toLowerCase() === adminEmail);
    if (!existing) {
      const bcrypt = require('bcrypt');
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      const newAdmin = {
        _id: crypto.randomBytes(12).toString('hex'),
        id: String(users.length + 1),
        name: 'Administrator',
        email_id: adminEmail,
        email: adminEmail,
        password: hashedPassword,
        role: '1',
        role_type: '1',
        status: 1,
        is_active: true,
        is_deleted: 0,
        created_at: new Date().toISOString()
      };
      users.push(newAdmin);
      this.indices.get('tbl_user').set(newAdmin._id, newAdmin);
      this.indices.get('tbl_user').set(newAdmin.id, newAdmin);
      this.saveTable('tbl_user');
      console.log(`[JSON-DB] Default admin user initialized: ${adminEmail}`);
    }
  }

  /**
   * Get raw records array for a table
   */
  getTable(name) {
    if (!this.initialized) this.init();
    const resolved = this.resolveTableName(name);
    if (!this.tables.has(resolved)) {
      const filePath = path.join(JSON_DIR, `${resolved}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const records = JSON.parse(raw);
          const indexMap = new Map();
          if (Array.isArray(records)) {
            for (const rec of records) {
              if (rec && rec._id) indexMap.set(String(rec._id), rec);
              if (rec && rec.id !== undefined && rec.id !== null) indexMap.set(String(rec.id), rec);
            }
            this.tables.set(resolved, records);
            this.indices.set(resolved, indexMap);
            return this.tables.get(resolved);
          }
        } catch (e) {
          console.warn(`[JSON-DB] Could not load ${resolved}.json:`, e.message);
        }
      }
      // Auto-create in-memory collection if unknown
      this.tables.set(resolved, []);
      this.indices.set(resolved, new Map());
    }
    return this.tables.get(resolved);
  }

  /**
   * Safe asynchronous file persistence
   */
  saveTable(name) {
    const resolved = this.resolveTableName(name);
    const records = this.tables.get(resolved);
    if (!records) return;

    const filePath = path.join(JSON_DIR, `${resolved}.json`);
    
    // Throttle writes per table
    if (this.saveQueues.has(resolved)) return;
    this.saveQueues.add(resolved);

    setTimeout(() => {
      try {
        fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
      } catch (err) {
        console.error(`[JSON-DB ERROR] Failed to persist ${resolved}.json:`, err.message);
      } finally {
        this.saveQueues.delete(resolved);
      }
    }, 100);
  }

  /**
   * Check if a record matches a query filter
   */
  matchesFilter(record, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, expected] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(expected)) {
        const matchesAny = expected.some(subFilter => this.matchesFilter(record, subFilter));
        if (!matchesAny) return false;
        continue;
      }
      if (key === '$and' && Array.isArray(expected)) {
        const matchesAll = expected.every(subFilter => this.matchesFilter(record, subFilter));
        if (!matchesAll) return false;
        continue;
      }

      const val = record[key];

      if (expected instanceof RegExp) {
        if (!expected.test(String(val ?? ''))) return false;
        continue;
      }

      if (expected !== null && typeof expected === 'object' && !(expected instanceof Date)) {
        if (expected.$ne !== undefined) {
          if (String(val) === String(expected.$ne) || val === expected.$ne) return false;
        }
        if (expected.$in && Array.isArray(expected.$in)) {
          const inList = expected.$in.map(String);
          if (!inList.includes(String(val))) return false;
        }
        if (expected.$nin && Array.isArray(expected.$nin)) {
          const ninList = expected.$nin.map(String);
          if (ninList.includes(String(val))) return false;
        }
        if (expected.$regex !== undefined) {
          const flags = expected.$options || '';
          const reg = new RegExp(expected.$regex, flags);
          if (!reg.test(String(val ?? ''))) return false;
        }
        if (expected.$gte !== undefined) {
          if (Number(val) < Number(expected.$gte)) return false;
        }
        if (expected.$lte !== undefined) {
          if (Number(val) > Number(expected.$lte)) return false;
        }
        continue;
      }

      // Boolean equivalence
      if (typeof expected === 'boolean') {
        const isTrue = val === true || val === 1 || val === '1' || val === 'true';
        if (isTrue !== expected) return false;
        continue;
      }

      // Strict / Loose string equality
      if (String(val ?? '') !== String(expected ?? '')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find records matching a query with optional sorting & pagination
   */
  find(tableName, filter = {}, options = {}) {
    const records = this.getTable(tableName);
    let results = records.filter(rec => this.matchesFilter(rec, filter));

    // Sorting
    if (options.sort) {
      const sortFields = Object.entries(options.sort);
      results.sort((a, b) => {
        for (const [field, order] of sortFields) {
          const aVal = a[field] ?? '';
          const bVal = b[field] ?? '';
          if (aVal < bVal) return order === -1 ? 1 : -1;
          if (aVal > bVal) return order === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    // Pagination
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Find single matching record
   */
  findOne(tableName, filter = {}) {
    const records = this.getTable(tableName);
    return records.find(rec => this.matchesFilter(rec, filter)) || null;
  }

  /**
   * Find by ID (_id, id, or legacy_id)
   */
  findById(tableName, id) {
    if (!id) return null;
    const resolved = this.resolveTableName(tableName);
    const indexMap = this.indices.get(resolved);
    const stringId = String(id);

    if (indexMap && indexMap.has(stringId)) {
      return indexMap.get(stringId);
    }

    const records = this.getTable(resolved);
    return records.find(r => String(r._id) === stringId || String(r.id) === stringId || String(r.legacy_id) === stringId) || null;
  }

  /**
   * Count documents matching query
   */
  count(tableName, filter = {}) {
    return this.find(tableName, filter).length;
  }

  /**
   * Insert new record into table and persist
   */
  insert(tableName, data) {
    const resolved = this.resolveTableName(tableName);
    const records = this.getTable(resolved);
    const indexMap = this.indices.get(resolved) || new Map();

    const newDoc = { ...data };
    if (!newDoc._id) {
      newDoc._id = crypto.randomBytes(12).toString('hex');
    }
    newDoc._id = String(newDoc._id);

    if (newDoc.id === undefined) {
      const maxId = records.reduce((max, r) => {
        const num = parseInt(r.id, 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      newDoc.id = String(maxId + 1);
    }

    newDoc.createdAt = newDoc.createdAt || new Date().toISOString();
    newDoc.updatedAt = new Date().toISOString();

    records.unshift(newDoc);
    indexMap.set(newDoc._id, newDoc);
    indexMap.set(String(newDoc.id), newDoc);

    this.saveTable(resolved);
    return newDoc;
  }

  /**
   * Update existing record
   */
  update(tableName, idOrFilter, updateData) {
    const resolved = this.resolveTableName(tableName);
    let target = null;

    if (typeof idOrFilter === 'string' || typeof idOrFilter === 'number') {
      target = this.findById(resolved, idOrFilter);
    } else {
      target = this.findOne(resolved, idOrFilter);
    }

    if (!target) return null;

    Object.assign(target, updateData);
    target.updatedAt = new Date().toISOString();

    this.saveTable(resolved);
    return target;
  }

  /**
   * Delete record (soft or hard)
   */
  delete(tableName, idOrFilter, isSoft = false) {
    const resolved = this.resolveTableName(tableName);
    const records = this.getTable(resolved);

    let targetIndex = -1;
    if (typeof idOrFilter === 'string' || typeof idOrFilter === 'number') {
      const stringId = String(idOrFilter);
      targetIndex = records.findIndex(r => String(r._id) === stringId || String(r.id) === stringId);
    } else {
      targetIndex = records.findIndex(r => this.matchesFilter(r, idOrFilter));
    }

    if (targetIndex === -1) return null;

    if (isSoft) {
      const item = records[targetIndex];
      item.is_deleted = 1;
      item.is_active = false;
      item.status = 0;
      item.updatedAt = new Date().toISOString();
      this.saveTable(resolved);
      return item;
    }

    const removed = records.splice(targetIndex, 1)[0];
    const indexMap = this.indices.get(resolved);
    if (indexMap) {
      indexMap.delete(String(removed._id));
      indexMap.delete(String(removed.id));
    }

    this.saveTable(resolved);
    return removed;
  }

  /**
   * Resolve cross-entity relationships (e.g. role, module, company, vendor)
   */
  enrichRecord(tableName, record) {
    if (!record) return null;
    const enriched = { ...record };

    // 1. Resolve User
    if (record.created_by) {
      const user = this.findById('tbl_user', record.created_by);
      if (user) enriched.created_by_name = user.name;
    }
    // 2. Resolve Role
    if (record.role_id) {
      const role = this.findById('tbl_roles', record.role_id);
      if (role) enriched.role_name = role.role_name || role.name;
    }
    // 3. Resolve Company
    if (record.company_id) {
      const comp = this.findById('tbl_companies', record.company_id);
      if (comp) enriched.company_name = comp.name || comp.company_name;
    }
    // 4. Resolve Vendor
    if (record.vendor_id) {
      const vendor = this.findById('tbl_vendor', record.vendor_id);
      if (vendor) enriched.vendor_name = vendor.vendor_name || vendor.name;
    }

    return enriched;
  }
}

// Export singleton instance
const jsonDb = new JsonDbService();
module.exports = jsonDb;
