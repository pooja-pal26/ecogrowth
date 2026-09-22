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
const ProductBrand = createJsonModel('tbl_material_brand');
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
  natureofwork: NatureOfWork,
  'nature-of-work': NatureOfWork,
  tbl_nature_of_work: NatureOfWork,
  workforsiteofs: WorkForSiteOf,
  workforsiteof: WorkForSiteOf,
  'work-for-site-of': WorkForSiteOf,
  tbl_work_for_site_of_master: WorkForSiteOf,
  sitetypes: SiteType,
  sitetype: SiteType,
  'site-type': SiteType,
  'site-types': SiteType,
  tbl_site_type_master: SiteType,
  works: WorkMaster,
  work: WorkMaster,
  'work-master': WorkMaster,
  tbl_work_master: WorkMaster,
  workdescriptions: WorkDescription,
  workdescription: WorkDescription,
  'work-description': WorkDescription,
  'work-descriptions': WorkDescription,
  tbl_work_description_master: WorkDescription,
  materialsupplierss: MaterialSupplier,
  transporterss: Transporter,
  expensetypes: ExpenseType,
  expensetype: ExpenseType,
  'expense-types': ExpenseType,
  'expense-type': ExpenseType,
  tbl_expense_type_master: ExpenseType,
  expenseins: ExpenseIn,
  expensein: ExpenseIn,
  'expense-ins': ExpenseIn,
  'expense-in': ExpenseIn,
  'expense-in-type': ExpenseIn,
  'expense-in-types': ExpenseIn,
  expenseintypes: ExpenseIn,
  tbl_expense_in_type_master: ExpenseIn,
  expensefors: ExpenseFor,
  expensefor: ExpenseFor,
  'expense-fors': ExpenseFor,
  'expense-for': ExpenseFor,
  'transfer-for': ExpenseFor,
  'expense-transfer-for': ExpenseFor,
  tbl_expense_transfer_for_master: ExpenseFor,
  banknamelists: BankMaster,
  paymentmodess: PaymentMode,
  bankaccountss: BankAccount,
  productlists: ProductList,
  productlist: ProductList,
  'product-list': ProductList,
  products: ProductList,
  product: ProductList,
  tbl_products: ProductList,
  producttypes: ProductType,
  producttype: ProductType,
  'product-type': ProductType,
  'product-types': ProductType,
  tbl_product_type: ProductType,
  productunits: ProductUnit,
  productunit: ProductUnit,
  'product-unit': ProductUnit,
  'product-units': ProductUnit,
  tbl_material_unit: ProductUnit,
  productbrands: ProductBrand,
  productbrand: ProductBrand,
  'product-brand': ProductBrand,
  'product-brands': ProductBrand,
  tbl_material_brand: ProductBrand,
  productsupplierss: ProductSupplier,
  productsuppliers: ProductSupplier,
  productsupplier: ProductSupplier,
  'product-suppliers': ProductSupplier,
  'product-supplier': ProductSupplier,
  suppliers: ProductSupplier,
  supplier: ProductSupplier,
  tbl_suppliers: ProductSupplier,
  vendorexperiences: VendorExperience,
  vendorexperience: VendorExperience,
  'vendor-experience': VendorExperience,
  'vendor-experiences': VendorExperience,
  tbl_vendor_experience_master: VendorExperience,
  organizationtypes: OrganizationType,
  organizationtype: OrganizationType,
  'organization-type': OrganizationType,
  'organization-types': OrganizationType,
  tbl_organization_type_master: OrganizationType,
  associationyearss: AssociationYears,
  associationyears: AssociationYears,
  'association-years': AssociationYears,
  tbl_association_years_master: AssociationYears,
  geographicalpresences: GeographicalPresence,
  geographicalpresence: GeographicalPresence,
  'geographical-presence': GeographicalPresence,
  'geographical-presences': GeographicalPresence,
  tbl_vendor_geographical_presence_master: GeographicalPresence,
  majorclientss: MajorClients,
  majorclients: MajorClients,
  majorclient: MajorClients,
  'major-clients': MajorClients,
  'major-client': MajorClients,
  tbl_vendor_major_clients_master: MajorClients,
  teamstrengths: TeamStrength,
  teamstrength: TeamStrength,
  'team-strength': TeamStrength,
  'team-strengths': TeamStrength,
  tbl_vendor_team_strength_master: TeamStrength,
  annualturnovers: AnnualTurnover,
  annualturnover: AnnualTurnover,
  'annual-turnover': AnnualTurnover,
  'annual-turnovers': AnnualTurnover,
  tbl_annual_turnover_master: AnnualTurnover,
  workhandleamounts: WorkHandleAmount,
  workhandleamount: WorkHandleAmount,
  workhandlingamounts: WorkHandleAmount,
  workhandlingamount: WorkHandleAmount,
  'work-handle-amount': WorkHandleAmount,
  'work-handle-amounts': WorkHandleAmount,
  'work-handling-amount': WorkHandleAmount,
  'work-handling-amounts': WorkHandleAmount,
  tbl_work_handling_amount_master: WorkHandleAmount,
  roless: Role,
  roles: Role,
  'employee-roles': Role,
  tbl_roles: Role,
  roletypess: RoleType,
  roletypes: RoleType,
  'role-types': RoleType,
  'employee-role-types': RoleType,
  tbl_role_type: RoleType,
  statefors: StateFor,
  addgeolocations: GeoLocation,
  debitaccountdetailss: DebitAccount,
  debitaccountdetails: DebitAccount,
  debitaccounts: DebitAccount,
  'debit-accounts': DebitAccount,
  tbl_debit_account: DebitAccount,
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
