const jsonDb = require('../services/jsonDb');

/**
 * GET /api/vendors/master-data
 * Returns dropdown options matching PHP getMasterData()
 */
exports.getVendorMasterData = async (req, res) => {
  try {
    const states = (jsonDb.getTable('tbl_states') || [])
      .filter(s => String(s.is_active || s.status || '1') === '1')
      .map(s => ({
        id: String(s.id),
        state_name: s.state_name || s.name
      }))
      .sort((a, b) => (a.state_name || '').localeCompare(b.state_name || ''));

    const bankList = (jsonDb.getTable('tbl_bank_master') || [])
      .filter(b => String(b.is_active || b.status || '1') === '1')
      .map(b => ({
        id: String(b.id),
        bank_name: b.bank_name || b.name
      }))
      .sort((a, b) => (a.bank_name || '').localeCompare(b.bank_name || ''));

    const relativeExperienceList = (jsonDb.getTable('tbl_vendor_experience_master') || [])
      .filter(e => String(e.is_active || '1') === '1')
      .map(e => ({
        id: String(e.id),
        experience: e.experience
      }));

    const organizationTypeList = (jsonDb.getTable('tbl_organization_type_master') || [])
      .filter(o => String(o.is_active || '1') === '1')
      .map(o => ({
        id: String(o.id),
        organization_type: o.organization_type
      }));

    const associationYearsList = (jsonDb.getTable('tbl_association_years_master') || [])
      .filter(a => String(a.is_active || '1') === '1')
      .map(a => ({
        id: String(a.id),
        association_years: a.association_years
      }));

    const geographicalPresenceList = (jsonDb.getTable('tbl_vendor_geographical_presence_master') || [])
      .filter(g => String(g.is_active || '1') === '1')
      .map(g => ({
        id: String(g.id),
        geographical_presence: g.geographical_presence
      }));

    const vendorMajorClientsList = (jsonDb.getTable('tbl_vendor_major_clients_master') || [])
      .filter(m => String(m.is_active || '1') === '1')
      .map(m => ({
        id: String(m.id),
        major_clients: m.major_clients
      }));

    const teamStrengthList = (jsonDb.getTable('tbl_vendor_team_strength_master') || [])
      .filter(t => String(t.is_active || '1') === '1')
      .map(t => ({
        id: String(t.id),
        team_strength: t.team_strength
      }));

    const annualTurnoverList = (jsonDb.getTable('tbl_annual_turnover_master') || [])
      .filter(a => String(a.is_active || '1') === '1')
      .map(a => ({
        id: String(a.id),
        annual_turnover: a.annual_turnover
      }));

    const workHandlingAmountList = (jsonDb.getTable('tbl_work_handling_amount_master') || [])
      .filter(w => String(w.is_active || '1') === '1')
      .map(w => ({
        id: String(w.id),
        work_handling_amount: w.work_handling_amount
      }));

    res.json({
      success: true,
      data: {
        states,
        bankList,
        relativeExperienceList,
        organizationTypeList,
        associationYearsList,
        geographicalPresenceList,
        vendorMajorClientsList,
        teamStrengthList,
        annualTurnoverList,
        workHandlingAmountList
      }
    });
  } catch (error) {
    console.error('Error in getVendorMasterData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/vendors
 * Returns active or deactivated vendors with joined bank/GST details
 */
exports.getAll = async (req, res) => {
  try {
    const { status = 'active', search = '' } = req.query;

    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const bankGstList = jsonDb.getTable('tbl_vendor_bank_and_gst_details') || [];

    // Map vendor_id -> bank/gst record
    const bankGstMap = {};
    bankGstList.forEach(bg => {
      if (bg.vendor_id) {
        bankGstMap[String(bg.vendor_id)] = bg;
      }
    });

    // Filter by active/deactive status & soft delete (status == '2')
    let list = rawVendors.filter(v => {
      // status: 1 = normal, 2 = deleted
      if (String(v.status) === '2') return false;

      const isActive = String(v.is_active || '1');
      if (status === 'deactive' || status === 'deactivated' || status === '0') {
        return isActive === '0';
      }
      // default: active
      return isActive === '1';
    });

    // Merge bank/GST data
    let enriched = list.map(v => {
      const vId = String(v.id || v._id);
      const bg = bankGstMap[vId] || {};

      return {
        ...v,
        id: vId,
        _id: v._id || v.id,
        vendor_name: v.vendor_name || '',
        prop_director_name: v.prop_director_name || '',
        contact_person: v.contact_person || '',
        contact_number: v.contact_number || '',
        email: v.email || '',
        address: v.address || '',
        registered_office_address: v.registered_office_address || '',
        registration_number: v.registration_number || bg.registration_number || '',
        // Bank and Financials
        bank_name: bg.bank_name || '',
        bank_branch_name: bg.bank_branch_name || '',
        bank_address: bg.bank_address || '',
        bank_contact_number: bg.bank_contact_number || '',
        bank_account_no: bg.bank_account_no || '',
        bank_micr_code: bg.bank_micr_code || '',
        bank_ifsc_code: bg.bank_ifsc_code || '',
        pan_number: bg.pan_number || '',
        esi_number: bg.esi_number || '',
        gst_number: bg.gst_number || '',
        gst_state_name: bg.gst_state_name || '',
        pf_number: bg.pf_number || '',
        // Evaluation fields
        relative_experience: v.relative_experience || '',
        organization_type: v.organization_type || '',
        association_with_ril: v.association_with_ril || '',
        geographical_presence: v.geographical_presence || '',
        major_clients: v.major_clients || '',
        other_work_intrest: v.other_work_intrest || '',
        sop_sign_off: v.sop_sign_off || '',
        sop_for_quality: v.sop_for_quality || '',
        total_team_available: v.total_team_available || '',
        plant_and_machinery: v.plant_and_machinery || '',
        organization_chart: v.organization_chart || '',
        annual_turnover: v.annual_turnover || '',
        audited_balance_sheet: v.audited_balance_sheet || '',
        work_handle_amount: v.work_handle_amount || '',
        experience_certificate_path: v.experience_certificate_path || '',
        pan_card_path: v.pan_card_path || '',
        gst_certificate_path: v.gst_certificate_path || '',
        registration_certificate_path: v.registration_certificate_path || '',
        is_active: String(v.is_active || '1'),
        status: String(v.status || '1'),
        created_at: v.created_at || '',
        updated_at: v.updated_at || ''
      };
    });

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(v =>
        (v.vendor_name && v.vendor_name.toLowerCase().includes(q)) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(q)) ||
        (v.contact_number && v.contact_number.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.prop_director_name && v.prop_director_name.toLowerCase().includes(q)) ||
        (v.pan_number && v.pan_number.toLowerCase().includes(q)) ||
        (v.gst_number && v.gst_number.toLowerCase().includes(q))
      );
    }

    // Sort descending by numeric ID
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.status(200).json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch (error) {
    console.error('Error in getAllVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/vendors/:id
 * Returns single vendor profile with merged bank/gst data
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const target = rawVendors.find(v => String(v.id || v._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const bankGstList = jsonDb.getTable('tbl_vendor_bank_and_gst_details') || [];
    const bg = bankGstList.find(b => String(b.vendor_id) === String(target.id)) || {};

    const profile = {
      ...target,
      id: String(target.id || target._id),
      bank_name: bg.bank_name || '',
      bank_branch_name: bg.bank_branch_name || '',
      bank_address: bg.bank_address || '',
      bank_contact_number: bg.bank_contact_number || '',
      bank_account_no: bg.bank_account_no || '',
      bank_micr_code: bg.bank_micr_code || '',
      bank_ifsc_code: bg.bank_ifsc_code || '',
      pan_number: bg.pan_number || '',
      esi_number: bg.esi_number || '',
      gst_number: bg.gst_number || '',
      gst_state_name: bg.gst_state_name || '',
      pf_number: bg.pf_number || ''
    };

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/vendors
 * Replicates PHP createVendorAction validation, duplicate checks, and insertion
 */
exports.create = async (req, res) => {
  try {
    const {
      nameOfCompany,
      vendor_name,
      propDirName,
      prop_director_name,
      contactPerson,
      contact_person,
      contactNumber,
      contact_number,
      emailId,
      email,
      address,
      regHeadOfficeAddress,
      registered_office_address,
      registrationNumber,
      registration_number,
      bankName,
      bank_name,
      bankBranchName,
      bank_branch_name,
      bankAddress,
      bank_address,
      bankContactNumber,
      bank_contact_number,
      bankAccountNumber,
      bank_account_no,
      bankMicrCode,
      bank_micr_code,
      bankRtgsCode,
      bankNeftCode,
      bank_ifsc_code,
      panNumber,
      pan_number,
      esiNumber,
      esi_number,
      pfNumber,
      pf_number,
      gstNumber,
      gst_number,
      gstState,
      gst_state_name,
      annualTurnover,
      annual_turnover,
      auditedBalanceSheet,
      audited_balance_sheet,
      annualWorkHandleCapacity,
      work_handle_amount,
      organizationType,
      organization_type,
      totalTeam,
      total_team_available,
      plantAndMechnery,
      plant_and_machinery,
      organizationChart,
      organization_chart,
      interestOtherWorkType,
      other_work_intrest,
      associationWithRil,
      association_with_ril,
      geographicalPresence,
      geographical_presence,
      majorClients,
      major_clients,
      sopQapSignOff,
      sop_sign_off,
      sopForQuality,
      sop_for_quality,
      experience,
      relative_experience,
      experienceCertificate,
      experience_certificate_path,
      panCard,
      pan_card_path,
      gstDocument,
      gst_certificate_path,
      registrationCertificate,
      registration_certificate_path
    } = req.body;

    // Normalize field values
    const companyName = (nameOfCompany || vendor_name || '').trim();
    const propName = (propDirName || prop_director_name || '').trim();
    const contactName = (contactPerson || contact_person || '').trim();
    const contactNo = (contactNumber || contact_number || '').trim();
    const addr = (address || '').trim();
    const bName = (bankName || bank_name || '').trim();
    const bAccount = (bankAccountNumber || bank_account_no || '').trim();
    const pan = (panNumber || pan_number || '').trim();
    const bIfsc = (bankNeftCode || bankRtgsCode || bank_ifsc_code || '').trim();

    // 1. Mandatory Validations matching PHP createVendorAction
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company Name Missing! Please Enter Company Name.' });
    }
    if (!propName) {
      return res.status(400).json({ success: false, message: 'Proprietor or Director Name Missing! Please Enter Proprietor or Director Name.' });
    }
    if (!contactName) {
      return res.status(400).json({ success: false, message: 'Contact Person Name Missing! Please Enter Contact Person Name.' });
    }
    if (!contactNo) {
      return res.status(400).json({ success: false, message: 'Contact Number Missing! Please Enter Contact Number.' });
    }
    if (!addr) {
      return res.status(400).json({ success: false, message: 'Address is Missing! Please Enter Address.' });
    }
    if (!bName) {
      return res.status(400).json({ success: false, message: 'Bank Name is Missing! Please Enter Bank Name.' });
    }
    if (!bAccount) {
      return res.status(400).json({ success: false, message: 'Bank Account Number is Missing! Please Enter Bank Account Number.' });
    }
    if (!pan) {
      return res.status(400).json({ success: false, message: 'PAN Number is Missing! Please Enter PAN Number.' });
    }
    if (!bIfsc) {
      return res.status(400).json({ success: false, message: 'Bank IFS Code is Missing! Please Enter Bank IFS Code.' });
    }

    // 2. Duplicate Check matching PHP checkDuplicateVendorData
    const allVendors = jsonDb.getTable('tbl_vendor') || [];
    const allBankGst = jsonDb.getTable('tbl_vendor_bank_and_gst_details') || [];

    const duplicateVendorName = allVendors.some(v =>
      String(v.status) !== '2' &&
      v.vendor_name &&
      v.vendor_name.trim().toLowerCase() === companyName.toLowerCase()
    );

    const duplicatePan = allBankGst.some(bg =>
      bg.pan_number &&
      bg.pan_number.trim().toUpperCase() === pan.toUpperCase()
    );

    if (duplicateVendorName || duplicatePan) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered data already exists.'
      });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 3. Insert into tbl_vendor
    const newVendor = jsonDb.insert('tbl_vendor', {
      vendor_name: companyName,
      prop_director_name: propName,
      contact_person: contactName,
      contact_number: contactNo,
      email: (emailId || email || '').trim().toLowerCase(),
      address: addr,
      registered_office_address: (regHeadOfficeAddress || registered_office_address || '').trim(),
      registration_number: (registrationNumber || registration_number || '').trim().toUpperCase(),
      relative_experience: (experience || relative_experience || '').trim(),
      organization_type: (organizationType || organization_type || '').trim(),
      association_with_ril: (associationWithRil || association_with_ril || '').trim(),
      geographical_presence: (geographicalPresence || geographical_presence || '').trim(),
      major_clients: (majorClients || major_clients || '').trim(),
      other_work_intrest: (interestOtherWorkType || other_work_intrest || '').trim(),
      sop_sign_off: (sopQapSignOff || sop_sign_off || '').trim(),
      sop_for_quality: (sopForQuality || sop_for_quality || '').trim(),
      total_team_available: (totalTeam || total_team_available || '').trim(),
      plant_and_machinery: (plantAndMechnery || plant_and_machinery || '').trim(),
      organization_chart: (organizationChart || organization_chart || '').trim(),
      annual_turnover: (annualTurnover || annual_turnover || '').trim(),
      audited_balance_sheet: (auditedBalanceSheet || audited_balance_sheet || '').trim(),
      work_handle_amount: (annualWorkHandleCapacity || work_handle_amount || '').trim(),
      experience_certificate_path: experienceCertificate || experience_certificate_path || '',
      pan_card_path: panCard || pan_card_path || '',
      gst_certificate_path: gstDocument || gst_certificate_path || '',
      registration_certificate_path: registrationCertificate || registration_certificate_path || '',
      is_active: '1',
      status: '1',
      created_by: String(req.user?.id || '1'),
      created_at: nowStr,
      updated_at: nowStr
    });

    // 4. Insert into tbl_vendor_bank_and_gst_details
    jsonDb.insert('tbl_vendor_bank_and_gst_details', {
      vendor_id: String(newVendor.id),
      bank_name: bName,
      bank_branch_name: (bankBranchName || bank_branch_name || '').trim(),
      bank_address: (bankAddress || bank_address || '').trim(),
      bank_contact_number: (bankContactNumber || bank_contact_number || '').trim(),
      bank_account_no: bAccount.toUpperCase(),
      bank_micr_code: (bankMicrCode || bank_micr_code || '').trim().toUpperCase(),
      bank_ifsc_code: bIfsc.toUpperCase(),
      registration_number: (registrationNumber || registration_number || '').trim().toUpperCase(),
      pan_number: pan.toUpperCase(),
      esi_number: (esiNumber || esi_number || '').trim().toUpperCase(),
      gst_number: (gstNumber || gst_number || '').trim().toUpperCase(),
      gst_state_name: (gstState || gst_state_name || '').trim(),
      pf_number: (pfNumber || pf_number || '').trim().toUpperCase(),
      created_by: String(req.user?.id || '1'),
      created_at: nowStr,
      updated_at: nowStr,
      is_active: '1'
    });

    res.status(201).json({
      success: true,
      message: 'Vendor details has been saved successfully.',
      data: newVendor
    });
  } catch (error) {
    console.error('Error in createVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/vendors/:id
 * Replicates PHP editVendorInfoAction
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const current = rawVendors.find(v => String(v.id || v._id) === String(id));

    if (!current) {
      return res.status(404).json({ success: false, message: 'Vendor not found to update' });
    }

    const {
      nameOfCompany,
      vendor_name,
      propDirName,
      prop_director_name,
      contactPerson,
      contact_person,
      contactNumber,
      contact_number,
      emailId,
      email,
      address,
      regHeadOfficeAddress,
      registered_office_address,
      registrationNumber,
      registration_number,
      bankName,
      bank_name,
      bankBranchName,
      bank_branch_name,
      bankAddress,
      bank_address,
      bankContactNumber,
      bank_contact_number,
      bankAccountNumber,
      bank_account_no,
      bankMicrCode,
      bank_micr_code,
      bankRtgsCode,
      bankNeftCode,
      bank_ifsc_code,
      panNumber,
      pan_number,
      esiNumber,
      esi_number,
      pfNumber,
      pf_number,
      gstNumber,
      gst_number,
      gstState,
      gst_state_name,
      annualTurnover,
      annual_turnover,
      auditedBalanceSheet,
      audited_balance_sheet,
      annualWorkHandleCapacity,
      work_handle_amount,
      organizationType,
      organization_type,
      totalTeam,
      total_team_available,
      plantAndMechnery,
      plant_and_machinery,
      organizationChart,
      organization_chart,
      interestOtherWorkType,
      other_work_intrest,
      associationWithRil,
      association_with_ril,
      geographicalPresence,
      geographical_presence,
      majorClients,
      major_clients,
      sopQapSignOff,
      sop_sign_off,
      sopForQuality,
      sop_for_quality,
      experience,
      relative_experience,
      experience_certificate_path,
      pan_card_path,
      gst_certificate_path,
      registration_certificate_path
    } = req.body;

    const companyName = (nameOfCompany || vendor_name || current.vendor_name || '').trim();
    const pan = (panNumber || pan_number || '').trim();

    // Duplicate checks excluding current vendor
    const allVendors = jsonDb.getTable('tbl_vendor') || [];
    const allBankGst = jsonDb.getTable('tbl_vendor_bank_and_gst_details') || [];

    if (companyName && companyName.toLowerCase() !== (current.vendor_name || '').toLowerCase()) {
      const dupName = allVendors.some(v =>
        String(v.id || v._id) !== String(id) &&
        String(v.status) !== '2' &&
        v.vendor_name &&
        v.vendor_name.trim().toLowerCase() === companyName.toLowerCase()
      );
      if (dupName) {
        return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered company name already exists.' });
      }
    }

    if (pan) {
      const dupPan = allBankGst.some(bg =>
        String(bg.vendor_id) !== String(current.id) &&
        bg.pan_number &&
        bg.pan_number.trim().toUpperCase() === pan.toUpperCase()
      );
      if (dupPan) {
        return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered PAN card already exists.' });
      }
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update tbl_vendor
    const vendorUpdates = {
      vendor_name: companyName,
      updated_at: nowStr
    };

    if (propDirName || prop_director_name) vendorUpdates.prop_director_name = (propDirName || prop_director_name).trim();
    if (contactPerson || contact_person) vendorUpdates.contact_person = (contactPerson || contact_person).trim();
    if (contactNumber || contact_number) vendorUpdates.contact_number = (contactNumber || contact_number).trim();
    if (emailId !== undefined || email !== undefined) vendorUpdates.email = (emailId || email || '').trim().toLowerCase();
    if (address) vendorUpdates.address = address.trim();
    if (regHeadOfficeAddress || registered_office_address) vendorUpdates.registered_office_address = (regHeadOfficeAddress || registered_office_address).trim();
    if (registrationNumber || registration_number) vendorUpdates.registration_number = (registrationNumber || registration_number).trim().toUpperCase();
    if (experience || relative_experience) vendorUpdates.relative_experience = (experience || relative_experience).trim();
    if (organizationType || organization_type) vendorUpdates.organization_type = (organizationType || organization_type).trim();
    if (associationWithRil || association_with_ril) vendorUpdates.association_with_ril = (associationWithRil || association_with_ril).trim();
    if (geographicalPresence || geographical_presence) vendorUpdates.geographical_presence = (geographicalPresence || geographical_presence).trim();
    if (majorClients || major_clients) vendorUpdates.major_clients = (majorClients || major_clients).trim();
    if (interestOtherWorkType || other_work_intrest) vendorUpdates.other_work_intrest = (interestOtherWorkType || other_work_intrest).trim();
    if (sopQapSignOff || sop_sign_off) vendorUpdates.sop_sign_off = (sopQapSignOff || sop_sign_off).trim();
    if (sopForQuality || sop_for_quality) vendorUpdates.sop_for_quality = (sopForQuality || sop_for_quality).trim();
    if (totalTeam || total_team_available) vendorUpdates.total_team_available = (totalTeam || total_team_available).trim();
    if (plantAndMechnery || plant_and_machinery) vendorUpdates.plant_and_machinery = (plantAndMechnery || plant_and_machinery).trim();
    if (organizationChart || organization_chart) vendorUpdates.organization_chart = (organizationChart || organization_chart).trim();
    if (annualTurnover || annual_turnover) vendorUpdates.annual_turnover = (annualTurnover || annual_turnover).trim();
    if (auditedBalanceSheet || audited_balance_sheet) vendorUpdates.audited_balance_sheet = (auditedBalanceSheet || audited_balance_sheet).trim();
    if (annualWorkHandleCapacity || work_handle_amount) vendorUpdates.work_handle_amount = (annualWorkHandleCapacity || work_handle_amount).trim();
    if (experience_certificate_path) vendorUpdates.experience_certificate_path = experience_certificate_path;
    if (pan_card_path) vendorUpdates.pan_card_path = pan_card_path;
    if (gst_certificate_path) vendorUpdates.gst_certificate_path = gst_certificate_path;
    if (registration_certificate_path) vendorUpdates.registration_certificate_path = registration_certificate_path;

    jsonDb.update('tbl_vendor', current._id || current.id, vendorUpdates);

    // Update tbl_vendor_bank_and_gst_details
    const existingBg = allBankGst.find(bg => String(bg.vendor_id) === String(current.id));
    const bgUpdates = {
      updated_at: nowStr
    };
    if (bankName || bank_name) bgUpdates.bank_name = (bankName || bank_name).trim();
    if (bankBranchName || bank_branch_name) bgUpdates.bank_branch_name = (bankBranchName || bank_branch_name).trim();
    if (bankAddress || bank_address) bgUpdates.bank_address = (bankAddress || bank_address).trim();
    if (bankContactNumber || bank_contact_number) bgUpdates.bank_contact_number = (bankContactNumber || bank_contact_number).trim();
    if (bankAccountNumber || bank_account_no) bgUpdates.bank_account_no = (bankAccountNumber || bank_account_no).trim().toUpperCase();
    if (bankMicrCode || bank_micr_code) bgUpdates.bank_micr_code = (bankMicrCode || bank_micr_code).trim().toUpperCase();
    if (bankNeftCode || bankRtgsCode || bank_ifsc_code) bgUpdates.bank_ifsc_code = (bankNeftCode || bankRtgsCode || bank_ifsc_code).trim().toUpperCase();
    if (registrationNumber || registration_number) bgUpdates.registration_number = (registrationNumber || registration_number).trim().toUpperCase();
    if (pan) bgUpdates.pan_number = pan.toUpperCase();
    if (esiNumber || esi_number) bgUpdates.esi_number = (esiNumber || esi_number).trim().toUpperCase();
    if (gstNumber || gst_number) bgUpdates.gst_number = (gstNumber || gst_number).trim().toUpperCase();
    if (gstState || gst_state_name) bgUpdates.gst_state_name = (gstState || gst_state_name).trim();
    if (pfNumber || pf_number) bgUpdates.pf_number = (pfNumber || pf_number).trim().toUpperCase();

    if (existingBg) {
      jsonDb.update('tbl_vendor_bank_and_gst_details', existingBg._id || existingBg.id, bgUpdates);
    } else {
      jsonDb.insert('tbl_vendor_bank_and_gst_details', {
        vendor_id: String(current.id),
        ...bgUpdates,
        created_at: nowStr,
        is_active: '1'
      });
    }

    res.json({
      success: true,
      message: 'Vendor details has been updated successfully.'
    });
  } catch (error) {
    console.error('Error in updateVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/vendors/:id/deactivate
 * Replicates PHP deactivateVendorProfileAction
 */
exports.deactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const target = rawVendors.find(v => String(v.id || v._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, flag: false, message: 'Please try after refreshing the page.' });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    jsonDb.update('tbl_vendor', target._id || target.id, {
      is_active: '0',
      updated_at: nowStr
    });

    res.json({
      success: true,
      flag: true,
      message: 'Vendor Profile has been deactivated successfully.'
    });
  } catch (error) {
    console.error('Error in deactivateVendor:', error);
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

/**
 * POST /api/vendors/:id/activate
 * Replicates PHP activateVendorProfileAction
 */
exports.activate = async (req, res) => {
  try {
    const { id } = req.params;
    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const target = rawVendors.find(v => String(v.id || v._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, flag: false, message: 'Please try after refreshing the page.' });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    jsonDb.update('tbl_vendor', target._id || target.id, {
      is_active: '1',
      updated_at: nowStr
    });

    res.json({
      success: true,
      flag: true,
      message: 'Vendor Profile has been activated successfully.'
    });
  } catch (error) {
    console.error('Error in activateVendor:', error);
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

/**
 * DELETE /api/vendors/:id
 * Replicates PHP deleteVendorProfileAction (status = '2')
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const rawVendors = jsonDb.getTable('tbl_vendor') || [];
    const target = rawVendors.find(v => String(v.id || v._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, flag: false, message: 'Please try after refreshing the page.' });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    jsonDb.update('tbl_vendor', target._id || target.id, {
      status: '2',
      updated_at: nowStr
    });

    res.json({
      success: true,
      flag: true,
      message: 'Vendor Profile has been deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteVendor:', error);
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};