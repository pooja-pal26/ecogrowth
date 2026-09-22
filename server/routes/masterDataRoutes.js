const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

// --- State List Routes ---
router.get('/states', masterDataController.getStates);
router.get('/states/:id', masterDataController.getStateById);
router.post('/states', masterDataController.addState);
router.put('/states/:id', masterDataController.updateState);
router.delete('/states/:id', masterDataController.deleteState);

// --- Client Master Routes ---
router.get('/clients', masterDataController.getClients);
router.get('/clients/:id', masterDataController.getClientDetails);
router.post('/clients', masterDataController.addClient);
router.put('/clients/:id', masterDataController.updateClient);
router.patch('/clients/:id/status', masterDataController.toggleClientStatus);
router.delete('/clients/:id', masterDataController.deleteClient);

// --- Company Vendor Routes ---
router.get('/company-vendors', masterDataController.getCompanyVendors);
router.get('/company-vendors/:id', masterDataController.getCompanyVendorById);
router.post('/company-vendors', masterDataController.addCompanyVendor);
router.put('/company-vendors/:id', masterDataController.updateCompanyVendor);
router.patch('/company-vendors/:id/status', masterDataController.toggleCompanyVendorStatus);
router.delete('/company-vendors/:id', masterDataController.deleteCompanyVendor);

// --- Debit Account Routes (PHP MasterController replica) ---
router.get('/debit-accounts', masterDataController.getDebitAccounts);
router.get('/debit-accounts/:id', masterDataController.getDebitAccountById);
router.post('/debit-accounts', masterDataController.addDebitAccount);
router.put('/debit-accounts/:id', masterDataController.updateDebitAccount);
router.delete('/debit-accounts/:id', masterDataController.deleteDebitAccount);

// --- Role Types Routes (PHP MasterController replica) ---
router.get('/role-types', masterDataController.getRoleTypes);
router.get('/role-types/:id', masterDataController.getRoleTypeById);
router.post('/role-types', masterDataController.addRoleType);
router.put('/role-types/:id', masterDataController.updateRoleType);
router.patch('/role-types/:id/status', masterDataController.toggleRoleTypeStatus);
router.delete('/role-types/:id', masterDataController.deleteRoleType);

// --- Employee Roles Routes (PHP MasterController replica) ---
router.get('/roles', masterDataController.getRoles);
router.get('/roles/:id', masterDataController.getRoleById);
router.post('/roles', masterDataController.addRole);
router.put('/roles/:id', masterDataController.updateRole);
router.patch('/roles/:id/status', masterDataController.toggleRoleStatus);
router.delete('/roles/:id', masterDataController.deleteRole);

// --- Expense Types Routes (PHP MasterController tbl_expense_type_master) ---
router.get('/expense-types', masterDataController.getExpenseTypes);
router.get('/expense-types/:id', masterDataController.getExpenseTypeById);
router.post('/expense-types', masterDataController.addExpenseType);
router.put('/expense-types/:id', masterDataController.updateExpenseType);
router.patch('/expense-types/:id/status', masterDataController.toggleExpenseTypeStatus);
router.delete('/expense-types/:id', masterDataController.deleteExpenseType);

// --- Expense In Routes (PHP MasterController tbl_expense_in_type_master) ---
router.get('/expense-ins', masterDataController.getExpenseIns);
router.get('/expense-ins/:id', masterDataController.getExpenseInById);
router.post('/expense-ins', masterDataController.addExpenseIn);
router.put('/expense-ins/:id', masterDataController.updateExpenseIn);
router.patch('/expense-ins/:id/status', masterDataController.toggleExpenseInStatus);
router.delete('/expense-ins/:id', masterDataController.deleteExpenseIn);

// --- Expense For Routes (PHP MasterController tbl_expense_transfer_for_master) ---
router.get('/expense-fors', masterDataController.getExpenseFors);
router.get('/expense-fors/:id', masterDataController.getExpenseForById);
router.post('/expense-fors', masterDataController.addExpenseFor);
router.put('/expense-fors/:id', masterDataController.updateExpenseFor);
router.patch('/expense-fors/:id/status', masterDataController.toggleExpenseForStatus);
router.delete('/expense-fors/:id', masterDataController.deleteExpenseFor);

// --- Work For Site Of Routes (PHP MasterController tbl_work_for_site_of_master) ---
router.get('/work-for-site-of', masterDataController.getWorkForSiteOfList);
router.get('/work-for-site-of/:id', masterDataController.getWorkForSiteOfById);
router.post('/work-for-site-of', masterDataController.addWorkForSiteOf);
router.put('/work-for-site-of/:id', masterDataController.updateWorkForSiteOf);
router.patch('/work-for-site-of/:id/status', masterDataController.toggleWorkForSiteOfStatus);
router.delete('/work-for-site-of/:id', masterDataController.deleteWorkForSiteOf);

// --- Nature Of Work Routes (PHP MasterController tbl_nature_of_work) ---
router.get('/nature-of-work', masterDataController.getNatureOfWorkList);
router.get('/nature-of-work/:id', masterDataController.getNatureOfWorkById);
router.post('/nature-of-work', masterDataController.addNatureOfWork);
router.put('/nature-of-work/:id', masterDataController.updateNatureOfWork);
router.delete('/nature-of-work/:id', masterDataController.deleteNatureOfWork);

// --- Site Type Routes (PHP MasterController tbl_site_type_master) ---
router.get('/site-types', masterDataController.getSiteTypeList);
router.get('/site-types/:id', masterDataController.getSiteTypeById);
router.post('/site-types', masterDataController.addSiteType);
router.put('/site-types/:id', masterDataController.updateSiteType);
router.patch('/site-types/:id/status', masterDataController.toggleSiteTypeStatus);
router.delete('/site-types/:id', masterDataController.deleteSiteType);

// --- Work Routes (PHP MasterController tbl_work_master) ---
router.get('/works', masterDataController.getWorkList);
router.get('/works/:id', masterDataController.getWorkById);
router.post('/works', masterDataController.addWork);
router.put('/works/:id', masterDataController.updateWork);
router.patch('/works/:id/status', masterDataController.toggleWorkStatus);
router.delete('/works/:id', masterDataController.deleteWork);

// --- Work Description Routes (PHP MasterController tbl_work_description_master) ---
router.get('/work-descriptions', masterDataController.getWorkDescriptionList);
router.get('/work-descriptions/:id', masterDataController.getWorkDescriptionById);
router.post('/work-descriptions', masterDataController.addWorkDescription);
router.put('/work-descriptions/:id', masterDataController.updateWorkDescription);
router.patch('/work-descriptions/:id/status', masterDataController.toggleWorkDescriptionStatus);
router.delete('/work-descriptions/:id', masterDataController.deleteWorkDescription);

// --- Vendor Master Data Routes (PHP MasterController replica) ---
// 1. Vendor Experience
router.get('/vendor-experience', masterDataController.getVendorExperienceList);
router.get('/vendor-experience/:id', masterDataController.getVendorExperienceById);
router.post('/vendor-experience', masterDataController.addVendorExperience);
router.put('/vendor-experience/:id', masterDataController.updateVendorExperience);
router.delete('/vendor-experience/:id', masterDataController.deleteVendorExperience);

// 2. Organization Type
router.get('/organization-type', masterDataController.getOrganizationTypeList);
router.get('/organization-type/:id', masterDataController.getOrganizationTypeById);
router.post('/organization-type', masterDataController.addOrganizationType);
router.put('/organization-type/:id', masterDataController.updateOrganizationType);
router.delete('/organization-type/:id', masterDataController.deleteOrganizationType);

// 3. Association Years
router.get('/association-years', masterDataController.getAssociationYearsList);
router.get('/association-years/:id', masterDataController.getAssociationYearsById);
router.post('/association-years', masterDataController.addAssociationYears);
router.put('/association-years/:id', masterDataController.updateAssociationYears);
router.delete('/association-years/:id', masterDataController.deleteAssociationYears);

// 4. Geographical Presence
router.get('/geographical-presence', masterDataController.getGeographicalPresenceList);
router.get('/geographical-presence/:id', masterDataController.getGeographicalPresenceById);
router.post('/geographical-presence', masterDataController.addGeographicalPresence);
router.put('/geographical-presence/:id', masterDataController.updateGeographicalPresence);
router.delete('/geographical-presence/:id', masterDataController.deleteGeographicalPresence);

// 5. Major Clients
router.get('/major-clients', masterDataController.getMajorClientsList);
router.get('/major-clients/:id', masterDataController.getMajorClientsById);
router.post('/major-clients', masterDataController.addMajorClients);
router.put('/major-clients/:id', masterDataController.updateMajorClients);
router.delete('/major-clients/:id', masterDataController.deleteMajorClients);

// 6. Team Strength
router.get('/team-strength', masterDataController.getTeamStrengthList);
router.get('/team-strength/:id', masterDataController.getTeamStrengthById);
router.post('/team-strength', masterDataController.addTeamStrength);
router.put('/team-strength/:id', masterDataController.updateTeamStrength);
router.delete('/team-strength/:id', masterDataController.deleteTeamStrength);

// 7. Annual Turnover
router.get('/annual-turnover', masterDataController.getAnnualTurnoverList);
router.get('/annual-turnover/:id', masterDataController.getAnnualTurnoverById);
router.post('/annual-turnover', masterDataController.addAnnualTurnover);
router.put('/annual-turnover/:id', masterDataController.updateAnnualTurnover);
router.delete('/annual-turnover/:id', masterDataController.deleteAnnualTurnover);

// 8. Work Handling Amount (and alias work-handle-amount)
router.get('/work-handling-amount', masterDataController.getWorkHandlingAmountList);
router.get('/work-handling-amount/:id', masterDataController.getWorkHandlingAmountById);
router.post('/work-handling-amount', masterDataController.addWorkHandlingAmount);
router.put('/work-handling-amount/:id', masterDataController.updateWorkHandlingAmount);
router.delete('/work-handling-amount/:id', masterDataController.deleteWorkHandlingAmount);

router.get('/work-handle-amount', masterDataController.getWorkHandlingAmountList);
router.get('/work-handle-amount/:id', masterDataController.getWorkHandlingAmountById);
router.post('/work-handle-amount', masterDataController.addWorkHandlingAmount);
router.put('/work-handle-amount/:id', masterDataController.updateWorkHandlingAmount);
router.delete('/work-handle-amount/:id', masterDataController.deleteWorkHandlingAmount);

// --- Product Master Data Routes (PHP MasterController replica) ---
// 1. Product Suppliers (tbl_suppliers)
router.get('/product-suppliers', masterDataController.getProductSuppliers);
router.get('/product-suppliers/:id', masterDataController.getProductSupplierById);
router.post('/product-suppliers', masterDataController.addProductSupplier);
router.put('/product-suppliers/:id', masterDataController.updateProductSupplier);
router.delete('/product-suppliers/:id', masterDataController.deleteProductSupplier);

// 2. Products / Product List (tbl_products)
router.get('/products', masterDataController.getProductList);
router.get('/products/:id', masterDataController.getProductById);
router.post('/products', masterDataController.addProduct);
router.put('/products/:id', masterDataController.updateProduct);
router.delete('/products/:id', masterDataController.deleteProduct);

router.get('/product-list', masterDataController.getProductList);
router.get('/product-list/:id', masterDataController.getProductById);
router.post('/product-list', masterDataController.addProduct);
router.put('/product-list/:id', masterDataController.updateProduct);
router.delete('/product-list/:id', masterDataController.deleteProduct);

// 3. Product Types (tbl_product_type)
router.get('/product-types', masterDataController.getProductTypeList);
router.get('/product-types/:id', masterDataController.getProductTypeById);
router.post('/product-types', masterDataController.addProductType);
router.put('/product-types/:id', masterDataController.updateProductType);
router.delete('/product-types/:id', masterDataController.deleteProductType);

router.get('/product-type', masterDataController.getProductTypeList);
router.get('/product-type/:id', masterDataController.getProductTypeById);
router.post('/product-type', masterDataController.addProductType);
router.put('/product-type/:id', masterDataController.updateProductType);
router.delete('/product-type/:id', masterDataController.deleteProductType);

// 4. Product Units (tbl_material_unit)
router.get('/product-units', masterDataController.getProductUnitList);
router.get('/product-units/:id', masterDataController.getProductUnitById);
router.post('/product-units', masterDataController.addProductUnit);
router.put('/product-units/:id', masterDataController.updateProductUnit);
router.delete('/product-units/:id', masterDataController.deleteProductUnit);

router.get('/product-unit', masterDataController.getProductUnitList);
router.get('/product-unit/:id', masterDataController.getProductUnitById);
router.post('/product-unit', masterDataController.addProductUnit);
router.put('/product-unit/:id', masterDataController.updateProductUnit);
router.delete('/product-unit/:id', masterDataController.deleteProductUnit);

// 5. Product Brands (tbl_material_brand)
router.get('/product-brands', masterDataController.getProductBrandList);
router.get('/product-brands/:id', masterDataController.getProductBrandById);
router.post('/product-brands', masterDataController.addProductBrand);
router.put('/product-brands/:id', masterDataController.updateProductBrand);
router.delete('/product-brands/:id', masterDataController.deleteProductBrand);

router.get('/product-brand', masterDataController.getProductBrandList);
router.get('/product-brand/:id', masterDataController.getProductBrandById);
router.post('/product-brand', masterDataController.addProductBrand);
router.put('/product-brand/:id', masterDataController.updateProductBrand);
router.delete('/product-brand/:id', masterDataController.deleteProductBrand);

// --- DYNAMIC CRUD ROUTES ---
// Catch-all routes for any master data collection
router.get('/dynamic/:collection', masterDataController.getDynamicList);
router.post('/dynamic/:collection', masterDataController.addDynamicItem);
router.put('/dynamic/:collection/:id', masterDataController.updateDynamicItem);
router.delete('/dynamic/:collection/:id', masterDataController.deleteDynamicItem);

module.exports = router;

