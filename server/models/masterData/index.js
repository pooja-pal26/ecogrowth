const mongoose = require('mongoose');

// Core Master Models
const State = require('./State');
const ClientMaster = require('./ClientMaster');
const CompanyVendor = require('./CompanyVendor');

// Helper to create or retrieve master schema
const defineMasterModel = (modelName, collectionName, fields) => {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  
  const schemaDefinition = {
    ...fields,
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  };
  
  const schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
    collection: collectionName
  });
  
  return mongoose.model(modelName, schema);
};

// Define all other master entities derived from MasterController.php & frontend pages
const NatureOfWork = defineMasterModel('NatureOfWork', 'natureofworks', {
  name: { type: String, trim: true },
  nature_of_work: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const WorkForSiteOf = defineMasterModel('WorkForSiteOf', 'workforsiteofs', {
  name: { type: String, trim: true },
  work_for_site_of_name: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const SiteType = defineMasterModel('SiteType', 'sitetypes', {
  name: { type: String, trim: true },
  site_type: { type: String, trim: true },
  work_for_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkForSiteOf' },
  status: { type: Boolean, default: true }
});

const WorkMaster = defineMasterModel('WorkMaster', 'works', {
  name: { type: String, trim: true },
  work_name: { type: String, trim: true },
  site_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SiteType' },
  status: { type: Boolean, default: true }
});

const WorkDescription = defineMasterModel('WorkDescription', 'workdescriptions', {
  name: { type: String, trim: true },
  work_description: { type: String, trim: true },
  work_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkMaster' },
  site_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SiteType' },
  status: { type: Boolean, default: true }
});

const MaterialSupplier = defineMasterModel('MaterialSupplier', 'materialsupplierss', {
  supplier_name: { type: String, required: true, trim: true },
  supplier_gst: { type: String, trim: true, uppercase: true },
  supplier_person_name: { type: String, trim: true },
  supplier_contact_number: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const Transporter = defineMasterModel('Transporter', 'transporterss', {
  transporter_name: { type: String, required: true, trim: true },
  contact_person: { type: String, trim: true },
  contact_number: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ExpenseType = defineMasterModel('ExpenseType', 'expensetypes', {
  name: { type: String, trim: true },
  expense_type: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ExpenseIn = defineMasterModel('ExpenseIn', 'expenseins', {
  name: { type: String, trim: true },
  expense_in_type: { type: String, trim: true },
  expense_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseType' },
  status: { type: Boolean, default: true }
});

const ExpenseFor = defineMasterModel('ExpenseFor', 'expensefors', {
  name: { type: String, trim: true },
  expense_transfer_for: { type: String, trim: true },
  expense_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseType' },
  status: { type: Boolean, default: true }
});

const BankMaster = defineMasterModel('BankMaster', 'banknamelists', {
  bank_name: { type: String, required: true, trim: true },
  status: { type: Boolean, default: true }
});

const PaymentMode = defineMasterModel('PaymentMode', 'paymentmodess', {
  payment_mode: { type: String, required: true, trim: true },
  status: { type: Boolean, default: true }
});

const BankAccount = defineMasterModel('BankAccount', 'bankaccountss', {
  account_holder_name: { type: String, required: true, trim: true },
  bank_name: { type: String, trim: true },
  bank_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BankMaster' },
  account_number: { type: String, required: true, trim: true },
  ifsc_code: { type: String, trim: true, uppercase: true },
  branch_name: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ProductList = defineMasterModel('ProductList', 'productlists', {
  product_name: { type: String, required: true, trim: true },
  product_type: { type: String, trim: true },
  unit: { type: String, trim: true },
  brand: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ProductType = defineMasterModel('ProductType', 'producttypes', {
  name: { type: String, trim: true },
  product_type: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ProductUnit = defineMasterModel('ProductUnit', 'productunits', {
  name: { type: String, trim: true },
  unit_name: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ProductBrand = defineMasterModel('ProductBrand', 'productbrands', {
  name: { type: String, trim: true },
  brand_name: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const ProductSupplier = defineMasterModel('ProductSupplier', 'productsupplierss', {
  supplier_name: { type: String, required: true, trim: true },
  contact_person: { type: String, trim: true },
  contact_number: { type: String, trim: true },
  gst_number: { type: String, trim: true, uppercase: true },
  address: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const VendorExperience = defineMasterModel('VendorExperience', 'vendorexperiences', {
  name: { type: String, trim: true },
  experience: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const OrganizationType = defineMasterModel('OrganizationType', 'organizationtypes', {
  name: { type: String, trim: true },
  organization_type: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const AssociationYears = defineMasterModel('AssociationYears', 'associationyearss', {
  name: { type: String, trim: true },
  association_years: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const GeographicalPresence = defineMasterModel('GeographicalPresence', 'geographicalpresences', {
  name: { type: String, trim: true },
  geographical_presence: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const MajorClients = defineMasterModel('MajorClients', 'majorclientss', {
  name: { type: String, trim: true },
  major_clients: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const TeamStrength = defineMasterModel('TeamStrength', 'teamstrengths', {
  name: { type: String, trim: true },
  team_strength: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const AnnualTurnover = defineMasterModel('AnnualTurnover', 'annualturnovers', {
  name: { type: String, trim: true },
  annual_turnover: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const WorkHandleAmount = defineMasterModel('WorkHandleAmount', 'workhandleamounts', {
  name: { type: String, trim: true },
  work_handling_amount: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const Role = defineMasterModel('Role', 'roless', {
  name: { type: String, trim: true },
  role_name: { type: String, trim: true },
  role_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RoleType' },
  status: { type: Boolean, default: true }
});

const RoleType = defineMasterModel('RoleType', 'roletypess', {
  name: { type: String, trim: true },
  role_type: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const StateFor = defineMasterModel('StateFor', 'statefors', {
  name: { type: String, trim: true },
  state_for: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const GeoLocation = defineMasterModel('GeoLocation', 'addgeolocations', {
  name: { type: String, trim: true },
  location: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const DebitAccount = defineMasterModel('DebitAccount', 'debitaccountdetailss', {
  account_name: { type: String, trim: true },
  bank_name: { type: String, trim: true },
  account_number: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

const SiteDocument = defineMasterModel('SiteDocument', 'sitedocumentss', {
  name: { type: String, trim: true },
  document_name: { type: String, trim: true },
  status: { type: Boolean, default: true }
});

// Lookup map connecting collection / endpoint keys to their registered models
const masterModelMap = {
  states: State,
  state: State,
  clients: ClientMaster,
  client: ClientMaster,
  clientmasters: ClientMaster,
  companyvendors: CompanyVendor,
  companyvendor: CompanyVendor,
  'company-vendors': CompanyVendor,
  natureofworks: NatureOfWork,
  workforsiteofs: WorkForSiteOf,
  sitetypes: SiteType,
  works: WorkMaster,
  workdescriptions: WorkDescription,
  materialsupplierss: MaterialSupplier,
  transporterss: Transporter,
  expensetypes: ExpenseType,
  expenseins: ExpenseIn,
  expensefors: ExpenseFor,
  banknamelists: BankMaster,
  paymentmodess: PaymentMode,
  bankaccountss: BankAccount,
  productlists: ProductList,
  producttypes: ProductType,
  productunits: ProductUnit,
  productbrands: ProductBrand,
  productsupplierss: ProductSupplier,
  vendorexperiences: VendorExperience,
  organizationtypes: OrganizationType,
  associationyearss: AssociationYears,
  geographicalpresences: GeographicalPresence,
  majorclientss: MajorClients,
  teamstrengths: TeamStrength,
  annualturnovers: AnnualTurnover,
  workhandleamounts: WorkHandleAmount,
  roless: Role,
  roletypess: RoleType,
  statefors: StateFor,
  addgeolocations: GeoLocation,
  debitaccountdetailss: DebitAccount,
  sitedocumentss: SiteDocument
};

module.exports = {
  State,
  ClientMaster,
  CompanyVendor,
  NatureOfWork,
  WorkForSiteOf,
  SiteType,
  WorkMaster,
  WorkDescription,
  MaterialSupplier,
  Transporter,
  ExpenseType,
  ExpenseIn,
  ExpenseFor,
  BankMaster,
  PaymentMode,
  BankAccount,
  ProductList,
  ProductType,
  ProductUnit,
  ProductBrand,
  ProductSupplier,
  VendorExperience,
  OrganizationType,
  AssociationYears,
  GeographicalPresence,
  MajorClients,
  TeamStrength,
  AnnualTurnover,
  WorkHandleAmount,
  Role,
  RoleType,
  StateFor,
  GeoLocation,
  DebitAccount,
  SiteDocument,
  masterModelMap
};
