const { createJsonModel } = require('../JsonModel');

// Core Master Models
const State = require('./State');
const ClientMaster = require('./ClientMaster');
const CompanyVendor = require('./CompanyVendor');

// Master Models backed directly by corresponding JSON files
const NatureOfWork = createJsonModel('tbl_nature_of_work');
const WorkForSiteOf = createJsonModel('tbl_work_for_site_of_master');
const SiteType = createJsonModel('tbl_site_type_master');
const WorkMaster = createJsonModel('tbl_work_master');
const WorkDescription = createJsonModel('tbl_work_description_master');
const MaterialSupplier = createJsonModel('tbl_suppliers');
const Transporter = createJsonModel('tbl_transporter_master');
const ExpenseType = createJsonModel('tbl_expense_type_master');
const ExpenseIn = createJsonModel('tbl_expense_in_type_master');
const ExpenseFor = createJsonModel('tbl_expense_transfer_for_master');
const BankMaster = createJsonModel('tbl_bank_master');
const PaymentMode = createJsonModel('tbl_payment_modes');
const BankAccount = createJsonModel('tbl_bank_accounts');
const ProductList = createJsonModel('tbl_products');
const ProductType = createJsonModel('tbl_product_type');
const ProductUnit = createJsonModel('tbl_material_unit');
const ProductBrand = createJsonModel('tbl_products');
const ProductSupplier = createJsonModel('tbl_suppliers');
const VendorExperience = createJsonModel('tbl_vendor_experience_master');
const OrganizationType = createJsonModel('tbl_organization_type_master');
const AssociationYears = createJsonModel('tbl_association_years_master');
const GeographicalPresence = createJsonModel('tbl_vendor_geographical_presence_master');
const MajorClients = createJsonModel('tbl_vendor_major_clients_master');
const TeamStrength = createJsonModel('tbl_vendor_team_strength_master');
const AnnualTurnover = createJsonModel('tbl_annual_turnover_master');
const WorkHandleAmount = createJsonModel('tbl_work_handling_amount_master');
const Role = createJsonModel('tbl_roles');
const RoleType = createJsonModel('tbl_role_type');
const StateFor = createJsonModel('tbl_state_for');
const GeoLocation = createJsonModel('tbl_location_mapping');
const DebitAccount = createJsonModel('tbl_debit_account');
const SiteDocument = createJsonModel('tbl_site_document');

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
