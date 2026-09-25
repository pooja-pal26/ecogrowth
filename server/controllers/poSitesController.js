const PoSite = require('../models/PoSite');
const SiteAllocation = require('../models/SiteAllocation');
const csv = require('csv-parser');
const fs = require('fs');
const jsonDb = require('../services/jsonDb');

exports.importSites = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const results = [];
  const sheetType = req.body.sheetType || 'deployment';
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const targetTable = sheetType === 'location' 
          ? 'tbl_location_mapping' 
          : sheetType === 'matrix' 
            ? 'tbl_site_matrix' 
            : 'tbl_deployment';

        results.forEach(row => {
          if (row && Object.keys(row).length > 0) {
            jsonDb.insert(targetTable, {
              ...row,
              created_at: new Date().toISOString()
            });
          }
        });

        try {
          fs.unlinkSync(req.file.path); // Clean up uploaded file
        } catch (unlinkErr) {
          console.warn('Could not remove temp file:', unlinkErr);
        }
        res.json({ 
          success: true, 
          message: `Successfully imported ${results.length} rows into ${targetTable}!` 
        });
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPoStatus = async (req, res) => {
  try {
    const poList = jsonDb.getTable('tbl_po_details') || [];
    const allSites = jsonDb.getTable('tbl_po_sites') || [];
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];

    const activePOs = poList.filter(po => String(po.is_deleted) !== '1');

    const enriched = activePOs.map(po => {
      const poNo = String(po.po_no || '').trim();
      const sitesForPo = allSites.filter(s => String(s.po_no).trim() === poNo && String(s.is_deleted) !== '1');
      const allocationsForPo = allocations.filter(a => String(a.po_no).trim() === poNo);

      return {
        ...po,
        id: po.id || po._id,
        poNumber: po.po_no,
        totalSites: sitesForPo.length,
        allocatedSites: allocationsForPo.length,
        status: po.status || 'Open',
        completionPercentage: po.po_completion_status ? parseInt(po.po_completion_status, 10) : (po.status === 'Closed' ? 100 : 0)
      };
    });

    // Sort descending by id
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({ success: true, data: enriched });
  } catch(e) {
    console.error('Error fetching PO status:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updatePoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, po_completion_status } = req.body;

    const updated = jsonDb.update('tbl_po_details', id, {
      status: status || 'Open',
      po_completion_status: po_completion_status !== undefined ? String(po_completion_status) : '0'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'PO record not found' });
    }

    res.json({ success: true, message: 'PO Status updated successfully', data: updated });
  } catch(e) {
    console.error('Error updating PO status:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get Allocated Sites list (matches PHP siteallocation/index.phtml)
 */
exports.getAllocatedSites = async (req, res) => {
  try {
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];
    const active = allocations.filter(a => String(a.is_deleted) !== '1');

    const mapped = active.map(a => ({
      id: a.id || a._id,
      _id: a._id || a.id,
      poNumber: a.po_no || '-',
      poDate: a.po_date ? a.po_date.substring(0, 10) : '-',
      siteId: a.site_id || '-',
      dueDate: a.due_date ? a.due_date.substring(0, 10) : '-',
      workType: a.work_type || '-',
      status: a.status === '1' ? 'Allocated' : a.status === '2' ? 'In Progress' : 'Closed',
      closeStatus: a.close_status === '1' ? 'Closed' : 'Open',
      raw: a
    }));

    // Sort descending by id
    mapped.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({ success: true, data: mapped });
  } catch(e) {
    console.error('Error fetching allocated sites:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get Allocated Site Status list (matches PHP site allocation status)
 */
exports.getAllocatedSiteStatus = async (req, res) => {
  try {
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];
    const active = allocations.filter(a => String(a.is_deleted) !== '1');

    const mapped = active.map(a => ({
      id: a.id || a._id,
      _id: a._id || a.id,
      siteId: a.site_id || '-',
      poNumber: a.po_no || '-',
      dueDate: a.due_date ? a.due_date.substring(0, 10) : '-',
      status: a.close_status === '1' ? 'Closed' : (a.status === '1' ? 'Allocated' : a.status === '2' ? 'In Progress' : 'Open'),
      closeStatus: a.close_status === '1' ? 'Close' : 'Open'
    }));

    mapped.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({ success: true, data: mapped });
  } catch(e) {
    console.error('Error fetching allocated site status:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Update Allocated Site Status (matches PHP SetSiteCloseStatus)
 */
exports.updateAllocatedSiteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, close_status } = req.body;

    const updated = jsonDb.update('tbl_site_allocation', id, {
      status: status || '1',
      close_status: close_status !== undefined ? String(close_status) : (status === 'Closed' ? '1' : '0')
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }

    res.json({ success: true, message: 'Status updated successfully', data: updated });
  } catch(e) {
    console.error('Error updating allocated site status:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Delete Allocated Site (matches PHP deleteAllocatedSite)
 */
exports.deleteAllocatedSite = async (req, res) => {
  try {
    const { id } = req.params;
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];
    const target = allocations.find(a => String(a.id || a._id) === String(id));

    const updated = jsonDb.update('tbl_site_allocation', id, { is_deleted: '1', status: '0' });

    // Mark site available again in tbl_po_sites
    const po_no = req.body?.po_number || req.query?.po_number || target?.po_no;
    const site_id = req.body?.site_id || req.query?.site_id || target?.site_id;
    if (po_no && site_id) {
      const poSites = jsonDb.getTable('tbl_po_sites') || [];
      const siteRec = poSites.find(s => String(s.po_no).trim() === String(po_no).trim() && String(s.site_id).trim() === String(site_id).trim());
      if (siteRec) {
        jsonDb.update('tbl_po_sites', siteRec._id || siteRec.id, { status: '0' });
      }
    }

    res.json({ success: true, message: 'Site allocation has been deleted successfully.' });
  } catch(e) {
    console.error('Error deleting allocated site:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get Allocated Site Details (matches PHP view-allocated-site-details.phtml)
 */
exports.getAllocatedSiteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];
    const target = allocations.find(a => String(a.id || a._id) === String(id));
    if (!target) {
      return res.status(404).json({ success: false, message: 'Site allocation record not found' });
    }

    const works = jsonDb.getTable('tbl_site_nature_of_work') || [];
    const vendors = jsonDb.getTable('tbl_company_vendor_master') || jsonDb.getTable('tbl_vendor') || [];
    const users = jsonDb.getTable('tbl_user') || [];
    const manpower = jsonDb.getTable('tbl_vendor_manpower') || [];

    const siteWorks = works.filter(w =>
      (String(w.site_allocation_id) === String(target.id || target._id) || String(w.site_id) === String(target.site_id)) &&
      String(w.is_deleted) !== '1'
    );

    const enrichedWorks = siteWorks.map(w => {
      const v = vendors.find(vend => String(vend.id || vend._id) === String(w.vendor_id));
      const u = users.find(usr => String(usr.id || usr._id) === String(w.supervisor_id));
      const m = manpower.find(mp => String(mp.id || mp._id) === String(w.supervisor_id));
      return {
        nature_of_work: w.nature_of_work || w.nature_of_work_id || '-',
        allocation_type: w.allocation_type || '-',
        vendor_name: v ? (v.vendor_company_name || v.vendor_name) : '-',
        supervisor_name: u ? u.name : (m ? (m.manpower_name || m.name) : (v ? (v.contact_person || v.vendor_name) : '-')),
        due_date: w.work_completion_date ? String(w.work_completion_date).substring(0, 10) : (target.due_date ? String(target.due_date).substring(0, 10) : '-')
      };
    });

    res.json({
      success: true,
      data: {
        po_no: target.po_no || '-',
        po_date: target.po_date ? String(target.po_date).substring(0, 10) : '-',
        site_id: target.site_id || '-',
        due_date: target.due_date ? String(target.due_date).substring(0, 10) : '-',
        infratel_id: target.infratel_id || '-',
        zone: target.zone || '-',
        district: target.district || '-',
        cluster: target.cluster || '-',
        tech_name: target.tech_name || '-',
        tech_mobile: target.tech_mobile || '-',
        works: enrichedWorks.length > 0 ? enrichedWorks : [{
          nature_of_work: target.work_type || 'Civil & Electrical Work',
          allocation_type: 'Staff',
          vendor_name: '-',
          supervisor_name: target.tech_name || 'Supervisor',
          due_date: target.due_date ? String(target.due_date).substring(0, 10) : '-'
        }]
      }
    });
  } catch (e) {
    console.error('Error fetching allocated site details:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Site Close Status (matches PHP siteCloseStatusAction)
 */
exports.siteCloseStatus = async (req, res) => {
  try {
    const { allocation_id, close_status, remark } = req.body;
    if (!allocation_id) {
      return res.status(400).json({ success: false, message: 'Site Allocation Id Missing!' });
    }

    const updated = jsonDb.update('tbl_site_allocation', allocation_id, {
      close_status: String(close_status || '1'),
      status: String(close_status) === '1' ? 'Closed' : '1',
      remark: remark || ''
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }

    res.json({ success: true, message: 'Closed has been set successfully.', data: updated });
  } catch (e) {
    console.error('Error updating site close status:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Initial Data for Site Allocation Form (matches PHP allocateSiteAction dropdowns)
 */
exports.getAllocationInitData = async (req, res) => {
  try {
    const legacyStates = jsonDb.getTable('tbl_states') || [];
    const stateForList = jsonDb.getTable('tbl_state_for') || [];
    const clients = jsonDb.getTable('tbl_client_master') || [];
    const poDetails = jsonDb.getTable('tbl_po_details') || [];
    const poSites = jsonDb.getTable('tbl_po_sites') || [];
    const natureOfWork = jsonDb.getTable('tbl_nature_of_work') || [];
    const vendors = jsonDb.getTable('tbl_company_vendor_master') || [];
    const manpower = jsonDb.getTable('tbl_vendor_manpower') || [];

    // Distinct states
    const stateMap = new Map();
    legacyStates.forEach(s => {
      const id = String(s.id || s._id);
      if (id && s.state_name) stateMap.set(id, { id, state_name: s.state_name });
    });
    stateForList.forEach(s => {
      const id = String(s.id || s._id);
      const name = s.state_for || s.state_name;
      if (id && name && !stateMap.has(id)) stateMap.set(id, { id, state_name: name });
    });

    // PO & Sites relations for cascading
    const poList = poDetails.filter(p => String(p.is_deleted) !== '1').map(p => ({
      po_no: p.po_no,
      state_id: String(p.state_id || ''),
      client_id: String(p.client_id || ''),
      order_date: p.order_date ? p.order_date.substring(0, 10) : ''
    }));

    const sitesList = poSites.filter(s => String(s.is_deleted) !== '1').map(s => ({
      site_id: s.site_id,
      site_name: s.site_name || '',
      po_no: s.po_no,
      state_id: String(s.state_id || ''),
      client_id: String(s.client_id || '')
    }));

    const payload = {
      states: Array.from(stateMap.values()),
      clients: clients.map(c => ({ id: String(c.id || c._id), state_id: String(c.state_id || ''), client_name: c.client_name })),
      pos: poList,
      poList,
      sites: sitesList,
      sitesList,
      natureOfWork: natureOfWork.map(n => ({ id: String(n.id || n._id), nature_of_work: n.nature_of_work })),
      vendors: vendors.map(v => ({ id: String(v.id || v._id), vendor_company_name: v.vendor_company_name })),
      supervisors: manpower.map(m => ({ 
        id: String(m.id || m._id), 
        vendor_id: String(m.company_vendor_id || ''), 
        company_vendor_id: String(m.company_vendor_id || ''),
        name: m.manpower_name,
        manpower_name: m.manpower_name
      }))
    };

    res.json({
      success: true,
      data: payload,
      ...payload
    });
  } catch(e) {
    console.error('Error fetching allocation init data:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get Site Technical Details for Allocation form (matches PHP getSiteTechnicalDetails)
 */
exports.getSiteTechnicalDetails = async (req, res) => {
  try {
    const { site_id, po_no } = req.query;
    if (!site_id) {
      return res.status(400).json({ success: false, message: 'site_id is required' });
    }

    const deployments = jsonDb.getTable('tbl_deployment') || [];
    const locations = jsonDb.getTable('tbl_location_mapping') || [];
    const poDetails = jsonDb.getTable('tbl_po_details') || [];

    // Find deployment record
    const dep = deployments.find(d => 
      String(d.site_id).trim() === String(site_id).trim() && 
      (!po_no || String(d.po).trim() === String(po_no).trim())
    ) || {};

    // Find location mapping record
    const loc = dep.infratel_id 
      ? locations.find(l => String(l.infratel_site_id).trim() === String(dep.infratel_id).trim()) || {}
      : {};

    // Find PO date
    const po = poDetails.find(p => String(p.po_no).trim() === String(po_no || dep.po).trim()) || {};

    const details = {
      infratel_id: dep.infratel_id || '-',
      zone: dep.zone || 'North',
      location: dep.location || '-',
      cluster: dep.cluster || 'Cluster 1',
      cluster_incharge: 'Ashok Kumar',
      cluster_mobile: '9876543210',
      technician_name: 'Rajesh Sharma',
      technician_mobile: '9876543211',
      site_latitude: loc.latitude || dep.latitude || '26.8467',
      site_longitude: loc.longitude || dep.longitude || '80.9462',
      work_type: dep.work_type || 'Civil & Electrical Work',
      po_date: po.order_date ? po.order_date.substring(0, 10) : (dep.po_date ? dep.po_date.substring(0, 10) : '')
    };

    res.json({ success: true, data: details, details });
  } catch(e) {
    console.error('Error fetching site technical details:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Allocate Site (matches PHP allocateSiteAction POST)
 */
exports.allocateSite = async (req, res) => {
  try {
    const formFields = req.body.formData || req.body;
    const {
      state_id,
      client_id,
      poNumber,
      siteId,
      po_date,
      site_completion_date
    } = formFields;
    const siteDetails = req.body.siteDetails || formFields.siteDetails || {};
    const allocations = req.body.allocations || formFields.allocations || [];

    if (!siteId || !poNumber) {
      return res.status(400).json({ success: false, message: 'PO Number and Site ID are required' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Insert allocation record
    const firstAlloc = (allocations && allocations[0]) || {};
    const newAlloc = jsonDb.insert('tbl_site_allocation', {
      state_id: String(state_id || '').trim(),
      client_id: String(client_id || '').trim(),
      po_no: String(poNumber).trim(),
      po_date: po_date || '',
      site_id: String(siteId).trim(),
      due_date: site_completion_date || '',
      infratel_id: siteDetails?.infratel_id || '',
      zone: siteDetails?.zone || '',
      district: siteDetails?.location || '',
      cluster: siteDetails?.cluster || '',
      cluster_incharge: siteDetails?.cluster_incharge || '',
      cluster_mobile: siteDetails?.cluster_mobile || '',
      tech_name: siteDetails?.technician_name || '',
      tech_mobile: siteDetails?.technician_mobile || '',
      latitude: siteDetails?.site_latitude || '',
      longitude: siteDetails?.site_longitude || '',
      work_type: siteDetails?.work_type || firstAlloc.nature_of_work || '',
      allocated_company_vendor_id: String(firstAlloc.vendor_id || '0'),
      supervisor_id: firstAlloc.supervisor_id || null,
      status: '1',
      site_completion_status: '0',
      close_status: '0',
      created_at: now
    });

    // Insert nature of work items into tbl_site_nature_of_work
    if (Array.isArray(allocations)) {
      allocations.forEach(item => {
        if (item.nature_of_work || item.resource_type || item.supervisor_id) {
          jsonDb.insert('tbl_site_nature_of_work', {
            site_id: String(siteId).trim(),
            site_allocation_id: String(newAlloc.id || newAlloc._id),
            nature_of_work_id: item.nature_of_work_id || item.nature_of_work,
            nature_of_work: item.nature_of_work || '',
            allocation_type: item.resource_type || '',
            vendor_id: item.vendor_id || '',
            supervisor_id: item.supervisor_id || '',
            work_completion_date: item.completion_date || site_completion_date || '',
            created_at: now
          });
        }
      });
    }

    // Update status in tbl_po_sites
    const poSites = jsonDb.getTable('tbl_po_sites');
    const targetSite = poSites.find(s => String(s.po_no).trim() === String(poNumber).trim() && String(s.site_id).trim() === String(siteId).trim());
    if (targetSite) {
      jsonDb.update('tbl_po_sites', targetSite._id || targetSite.id, { status: '1' });
    }

    res.json({
      success: true,
      message: 'Site Allocated Successfully!',
      data: newAlloc
    });
  } catch(e) {
    console.error('Error allocating site:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Incident Reporting Masters (matches legacy PHP incident reporting form dropdowns)
 */
exports.getIncidentsInitData = async (req, res) => {
  try {
    const poList = jsonDb.getTable('tbl_po_details') || [];
    const sitesList = jsonDb.getTable('tbl_po_sites') || [];
    // In PHP, vendor master is queried from tbl_vendor where status = 1
    const vendors = jsonDb.getTable('tbl_vendor') || [];
    const users = jsonDb.getTable('tbl_user') || [];

    const activePOs = poList
      .filter(p => String(p.is_deleted) !== '1')
      .map(p => ({ id: String(p.id || p._id), po_no: p.po_no, client_id: p.client_id }));

    const activeSites = sitesList
      .filter(s => String(s.is_deleted) !== '1')
      .map(s => ({ id: String(s.id || s._id), site_id: s.site_id, po_no: s.po_no }));

    const activeVendors = vendors
      .filter(v => String(v.is_deleted) !== '1' && String(v.status) !== '0')
      .map(v => ({
        id: String(v.id || v._id),
        vendor_name: v.vendor_name || v.vendor_company_name,
        contact_person: v.contact_person || '',
        label: v.contact_person ? `${v.vendor_name} (${v.contact_person})` : (v.vendor_name || 'Vendor ' + v.id)
      }));

    const activeUsers = users
      .filter(u => String(u.is_deleted) !== '1' && String(u.status) !== '0')
      .map(u => ({
        id: String(u.id || u._id),
        name: u.name || u.user_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User ' + u.id,
        email: u.email_id || u.email || ''
      }));

    res.json({
      success: true,
      data: {
        poList: activePOs,
        sitesList: activeSites,
        vendors: activeVendors,
        users: activeUsers,
        types: [
          { id: '1', label: 'Office Incident' },
          { id: '2', label: 'Site Incident' }
        ]
      }
    });
  } catch(e) {
    console.error('Error in getIncidentsInitData:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get all incident reports (matches PHP siteIncidentsReportAction)
 */
exports.getIncidents = async (req, res) => {
  try {
    const rawIncidents = jsonDb.getTable('tbl_site_incidents_report') || [];
    const vendors = jsonDb.getTable('tbl_vendor') || [];
    const users = jsonDb.getTable('tbl_user') || [];
    const incidentPersons = jsonDb.getTable('tbl_incident_report_person') || [];

    const vendorMap = new Map();
    vendors.forEach(v => {
      const vName = v.vendor_name || v.vendor_company_name;
      const label = v.contact_person ? `${vName} (${v.contact_person})` : (vName || 'Vendor ' + v.id);
      vendorMap.set(String(v.id || v._id), label);
    });

    const userMap = new Map();
    users.forEach(u => userMap.set(String(u.id || u._id), u.name || u.user_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User ' + u.id));

    const activeIncidents = rawIncidents.filter(r => String(r.is_deleted) !== '1');

    const enriched = activeIncidents.map(item => {
      const typeLabel = String(item.type) === '1' ? 'Office Incident' : 'Site Incident';

      // Resolve staff names from employee_ids or tbl_incident_report_person
      let staffNames = [];
      if (item.employee_ids) {
        const ids = String(item.employee_ids).split(',').map(s => s.trim());
        staffNames = ids.map(id => userMap.get(id) || '').filter(Boolean);
      }
      if (staffNames.length === 0) {
        const persons = incidentPersons.filter(p => String(p.incident_id) === String(item.id) && p.user_id);
        staffNames = persons.map(p => userMap.get(String(p.user_id)) || '').filter(Boolean);
      }
      if (staffNames.length === 0 && item.reported_by) {
        const rep = userMap.get(String(item.reported_by));
        if (rep) staffNames.push(rep);
      }

      // Resolve vendor name
      let vendorName = '-';
      if (item.vendor_ids) {
        const vIds = String(item.vendor_ids).split(',').map(s => s.trim()).filter(Boolean);
        const vNames = vIds.map(id => vendorMap.get(id) || '').filter(Boolean);
        if (vNames.length > 0) vendorName = vNames.join(', ');
      }
      if (vendorName === '-' && item.company_vendor_id && vendorMap.has(String(item.company_vendor_id))) {
        vendorName = vendorMap.get(String(item.company_vendor_id));
      }
      if (vendorName === '-') {
        const persons = incidentPersons.filter(p => String(p.incident_id) === String(item.id) && p.vendor_id && String(p.vendor_id) !== '0');
        const vNames = persons.map(p => vendorMap.get(String(p.vendor_id)) || '').filter(Boolean);
        if (vNames.length > 0) vendorName = vNames.join(', ');
      }

      const reportText = item.incident || item.incident_report || '';
      const consequenceText = item.incident_consequence || item.incident_effect || '';

      // Format dates like d/m/Y as in PHP
      const rawIncDate = item.incident_date || '';
      let formattedIncDate = '';
      if (rawIncDate) {
        const dObj = new Date(rawIncDate);
        if (!isNaN(dObj.getTime())) {
          const dd = String(dObj.getDate()).padStart(2, '0');
          const mm = String(dObj.getMonth() + 1).padStart(2, '0');
          const yyyy = dObj.getFullYear();
          formattedIncDate = `${dd}/${mm}/${yyyy}`;
        } else {
          formattedIncDate = rawIncDate.substring(0, 10);
        }
      }

      const rawRepDate = item.created_at || item.incident_date || '';
      let formattedRepDate = '';
      if (rawRepDate) {
        const dObj = new Date(rawRepDate);
        if (!isNaN(dObj.getTime())) {
          const dd = String(dObj.getDate()).padStart(2, '0');
          const mm = String(dObj.getMonth() + 1).padStart(2, '0');
          const yyyy = dObj.getFullYear();
          formattedRepDate = `${dd}/${mm}/${yyyy}`;
        } else {
          formattedRepDate = rawRepDate.substring(0, 10);
        }
      }

      return {
        _id: item._id || item.id,
        id: item.id,
        incidentId: '#INC-' + String(item.id).padStart(3, '0'),
        poNumber: item.po_no || '-',
        siteId: item.site_id || '-',
        incidentDate: formattedIncDate,
        rawIncidentDate: rawIncDate,
        type: typeLabel,
        typeId: String(item.type || '2'),
        staffName: staffNames.join(', ') || '-',
        vendorName: vendorName || '-',
        reportingDate: formattedRepDate,
        reportedBy: item.reported_by || '',
        reportedByName: item.reported_by ? (userMap.get(String(item.reported_by)) || 'Admin') : 'Admin',
        severity: item.severity || 'Medium',
        description: reportText,
        incidentReport: reportText,
        consequence: consequenceText,
        incidentEffect: consequenceText,
        employeeIds: item.employee_ids || '',
        vendorIds: item.vendor_ids || ''
      };
    });

    // Sort descending by id
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch(e) {
    console.error('Error in getIncidents:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Report New Incident (matches PHP saveReportNewIncidentAction)
 */
exports.createIncident = async (req, res) => {
  try {
    const {
      type,
      incident_type,
      po_no,
      poNumber,
      site_id,
      siteId,
      incident_date,
      incidentDate,
      employee_id,
      employee_ids,
      employeeIds,
      vendor_id,
      vendor_ids,
      vendorIds,
      incident_report,
      incident,
      description,
      incident_effect,
      incident_consequence,
      consequence,
      severity
    } = req.body;

    const chosenType = String(type || incident_type || '2');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateStr = incident_date || incidentDate || new Date().toISOString().substring(0, 10);
    const desc = incident_report || incident || description || '';
    const chosenConsequence = incident_effect || incident_consequence || consequence || '';

    // Handle employee IDs (array or comma-separated string)
    let empIdList = [];
    const rawEmp = employee_id || employee_ids || employeeIds;
    if (Array.isArray(rawEmp)) {
      empIdList = rawEmp.map(String).filter(Boolean);
    } else if (typeof rawEmp === 'string' && rawEmp.trim()) {
      empIdList = rawEmp.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Handle vendor ID (can be single or array)
    let chosenVendor = '';
    const rawVen = vendor_id || vendor_ids || vendorIds;
    if (Array.isArray(rawVen)) {
      chosenVendor = rawVen.filter(Boolean)[0] || '';
    } else if (rawVen) {
      chosenVendor = String(rawVen).trim();
    }

    // Validation matching PHP
    if (!dateStr) {
      return res.status(400).json({ success: false, message: 'Please select incident date.' });
    }

    if (chosenType === '2') {
      // Site Incident requires PO, Site, Employee, Incident Report
      const po = po_no || poNumber;
      const site = site_id || siteId;
      if (!po) {
        return res.status(400).json({ success: false, message: 'Please select PO number.' });
      }
      if (!site) {
        return res.status(400).json({ success: false, message: 'Please select site ID.' });
      }
      if (empIdList.length === 0) {
        return res.status(400).json({ success: false, message: 'Please select employee name.' });
      }
      if (!desc) {
        return res.status(400).json({ success: false, message: 'Please enter incident report.' });
      }

      const newRecord = jsonDb.insert('tbl_site_incidents_report', {
        type: '2',
        po_no: String(po).trim(),
        site_id: String(site).trim(),
        incident_date: dateStr.includes(':') ? dateStr : `${dateStr} 12:00:00`,
        employee_ids: empIdList.join(','),
        vendor_ids: chosenVendor || '',
        incident: desc,
        incident_consequence: chosenConsequence,
        severity: severity || 'Medium',
        reported_by: String(req.user?.id || '1'),
        created_by: String(req.user?.id || '1'),
        created_at: now,
        updated_by: String(req.user?.id || '1'),
        updated_at: now,
        is_deleted: '0'
      });

      // Insert persons involved
      empIdList.forEach(empId => {
        jsonDb.insert('tbl_incident_report_person', {
          incident_id: String(newRecord.id),
          user_id: String(empId),
          vendor_id: chosenVendor ? String(chosenVendor) : null
        });
      });

      return res.status(201).json({
        success: true,
        message: 'Incident report has been saved successfully.',
        data: newRecord
      });
    } else {
      // Office Incident (Type 1) - only requires Date, Employee, Incident Report
      if (empIdList.length === 0) {
        return res.status(400).json({ success: false, message: 'Please select employee name.' });
      }
      if (!desc) {
        return res.status(400).json({ success: false, message: 'Please enter incident report.' });
      }

      const newRecord = jsonDb.insert('tbl_site_incidents_report', {
        type: '1',
        po_no: '',
        site_id: '',
        incident_date: dateStr.includes(':') ? dateStr : `${dateStr} 12:00:00`,
        employee_ids: empIdList.join(','),
        vendor_ids: '',
        incident: desc,
        incident_consequence: chosenConsequence,
        severity: severity || 'Medium',
        reported_by: String(req.user?.id || '1'),
        created_by: String(req.user?.id || '1'),
        created_at: now,
        updated_by: String(req.user?.id || '1'),
        updated_at: now,
        is_deleted: '0'
      });

      // Insert persons involved
      empIdList.forEach(empId => {
        jsonDb.insert('tbl_incident_report_person', {
          incident_id: String(newRecord.id),
          user_id: String(empId),
          vendor_id: null
        });
      });

      return res.status(201).json({
        success: true,
        message: 'Incident report has been saved successfully.',
        data: newRecord
      });
    }
  } catch(e) {
    console.error('Error creating incident:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Update Incident Details / Consequence / Status
 */
exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      incident,
      description,
      incident_consequence,
      consequence,
      severity,
      type
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    if (incident !== undefined || description !== undefined) {
      updates.incident = incident !== undefined ? incident : description;
    }
    if (incident_consequence !== undefined || consequence !== undefined) {
      updates.incident_consequence = incident_consequence !== undefined ? incident_consequence : consequence;
    }
    if (severity !== undefined) {
      updates.severity = severity;
    }
    if (type !== undefined) {
      updates.type = String(type);
    }

    const updated = jsonDb.update('tbl_site_incidents_report', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    res.json({
      success: true,
      message: 'Incident updated successfully',
      data: updated
    });
  } catch(e) {
    console.error('Error updating incident:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Delete Incident (Soft delete)
 */
exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = jsonDb.update('tbl_site_incidents_report', id, { is_deleted: '1' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch(e) {
    console.error('Error deleting incident:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get PO Details list with optional date filters (matches PHP poDetailsAction)
 */
exports.getPODetails = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const poList = jsonDb.getTable('tbl_po_details') || [];

    // Filter active and non-deleted
    let filtered = poList.filter(po => {
      const isDeleted = String(po.is_deleted) === '1';
      if (isDeleted) return false;

      if (fromDate) {
        const orderDate = po.order_date ? po.order_date.substring(0, 10) : '';
        if (orderDate && orderDate < fromDate) return false;
      }
      if (toDate) {
        const orderDate = po.order_date ? po.order_date.substring(0, 10) : '';
        if (orderDate && orderDate > toDate) return false;
      }
      return true;
    });

    // Sort descending by ID or order_date
    filtered.sort((a, b) => {
      const idA = parseInt(a.id || 0, 10);
      const idB = parseInt(b.id || 0, 10);
      return idB - idA;
    });

    res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (err) {
    console.error('Error fetching PO Details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete PO Details (soft delete PO and associated sites)
 */
exports.deletePODetails = async (req, res) => {
  try {
    const { id } = req.params;
    const poTable = jsonDb.getTable('tbl_po_details') || [];
    const target = poTable.find(p => String(p.id || p._id) === String(id) || String(p.po_no) === String(id));
    if (!target) {
      return res.status(404).json({ success: false, message: 'PO not found' });
    }
    
    // Soft delete PO record
    jsonDb.update('tbl_po_details', target._id || target.id, { is_deleted: '1' });

    // Also soft delete sites under this PO
    if (target.po_no) {
      const allSites = jsonDb.getTable('tbl_po_sites') || [];
      allSites.forEach(s => {
        if (String(s.po_no).trim() === String(target.po_no).trim()) {
          jsonDb.update('tbl_po_sites', s._id || s.id, { is_deleted: '1' });
        }
      });
    }

    res.json({ success: true, message: 'PO and associated sites deleted successfully' });
  } catch (e) {
    console.error('Error deleting PO:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Get Site List by PO Number with Expenses & Allocations (matches PHP getSiteListByPoNumberAction)
 */
exports.getSitesByPONumber = async (req, res) => {
  try {
    const poNumber = req.body.po_number || req.query.po_number;
    if (!poNumber) {
      return res.status(400).json({ success: false, message: 'PO Number is required' });
    }

    const allSites = jsonDb.getTable('tbl_po_sites') || [];
    const expenses = jsonDb.getTable('tbl_site_expense') || [];
    const allocations = jsonDb.getTable('tbl_site_allocation') || [];

    const poSites = allSites.filter(s => 
      String(s.po_no).trim() === String(poNumber).trim() && 
      String(s.is_deleted) !== '1'
    );

    const siteDetailsArray = poSites.map(site => {
      // Sum expenses for this site & PO
      const siteExpenses = expenses.filter(e => 
        String(e.po_no).trim() === String(poNumber).trim() && 
        String(e.site_id).trim() === String(site.site_id).trim()
      );
      const totalExpense = siteExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      // Find allocation
      const allocation = allocations.find(a => 
        String(a.po_no).trim() === String(poNumber).trim() && 
        String(a.site_id).trim() === String(site.site_id).trim()
      );

      return {
        ...site,
        total_site_expense: totalExpense > 0 ? totalExpense.toFixed(2) : '',
        site_allocation_id: allocation ? allocation.id : '',
        site_status: allocation ? allocation.status : '',
        site_due_date: allocation ? allocation.due_date : '',
        site_allocation_date: allocation ? allocation.created_at : ''
      };
    });

    res.status(200).json({
      success: true,
      po_number: poNumber,
      data: siteDetailsArray
    });
  } catch (err) {
    console.error('Error fetching sites for PO:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Initial Data for PO forms: States, Clients, PO list (matches PHP addPoAndSites / addPoSites)
 */
exports.getPOInitData = async (req, res) => {
  try {
    const legacyStates = jsonDb.getTable('tbl_states') || [];
    const stateForList = jsonDb.getTable('tbl_state_for') || [];
    const clientMaster = jsonDb.getTable('tbl_client_master') || [];
    const poDetails = jsonDb.getTable('tbl_po_details') || [];
    const poSites = jsonDb.getTable('tbl_po_sites') || [];

    // Combine distinct states
    const stateMap = new Map();
    legacyStates.forEach(s => {
      const id = String(s.id || s._id);
      const name = s.state_name;
      if (id && name && !stateMap.has(id)) {
        stateMap.set(id, { id, state_name: name });
      }
    });
    stateForList.forEach(s => {
      const id = String(s.id || s._id);
      const name = s.state_for || s.state_name;
      if (id && name && !stateMap.has(id)) {
        stateMap.set(id, { id, state_name: name });
      }
    });
    const states = Array.from(stateMap.values());

    // Clients
    const clients = clientMaster.map(c => ({
      id: String(c.id || c._id),
      state_id: String(c.state_id || ''),
      client_name: c.client_name || '',
      client_gst: c.client_gst || '',
      is_active: c.is_active || '1'
    }));

    // Distinct PO list
    const poSet = new Set();
    const poList = [];
    [...poDetails, ...poSites].forEach(p => {
      const poNo = String(p.po_no || '').trim();
      if (poNo && !poSet.has(poNo)) {
        poSet.add(poNo);
        poList.push({ po_no: poNo });
      }
    });

    res.status(200).json({
      success: true,
      states,
      clients,
      poList
    });
  } catch (err) {
    console.error('Error fetching PO Init Data:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Add New PO and Sites manually (matches PHP addPoAndSitesAction)
 */
exports.addPOAndSites = async (req, res) => {
  try {
    const {
      state_id,
      client_id,
      po_type,
      po_amount,
      po_number,
      po_date,
      revision,
      site_type,
      operating_unit,
      sites
    } = req.body;

    // Validation
    if (!state_id) {
      return res.status(200).json({ flag: false, title: 'State Missing!', message: 'Please select state name.' });
    }
    if (!client_id) {
      return res.status(200).json({ flag: false, title: 'Client Missing!', message: 'Please select client name.' });
    }
    if (!po_type) {
      return res.status(200).json({ flag: false, title: 'PO Type Missing!', message: 'Please select PO type.' });
    }
    if (!po_amount) {
      return res.status(200).json({ flag: false, title: 'PO Amount Missing!', message: 'Please enter PO Amount.' });
    }
    if (!po_number) {
      return res.status(200).json({ flag: false, title: 'PO Number Missing!', message: 'Please enter PO number.' });
    }
    if (!po_date) {
      return res.status(200).json({ flag: false, title: 'PO Date Missing!', message: 'Please enter PO date.' });
    }
    if (!sites || !Array.isArray(sites) || sites.length === 0 || !sites[0].site_id) {
      return res.status(200).json({ flag: false, title: 'Site ID Missing!', message: 'Please enter at least one site ID.' });
    }

    const trimmedPoNo = String(po_number).trim();

    // Check if PO already exists
    const existingPo = jsonDb.findOne('tbl_po_details', {
      po_no: trimmedPoNo,
      is_deleted: '0'
    });
    if (existingPo) {
      return res.status(200).json({
        flag: false,
        title: 'Not Added',
        message: 'This PO Already Exist.'
      });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Insert into tbl_po_details
    jsonDb.insert('tbl_po_details', {
      state_id: String(state_id).trim(),
      client_id: String(client_id).trim(),
      po_no: trimmedPoNo,
      po_amount: String(po_amount).trim(),
      document_type: String(po_type).trim(),
      order_date: String(po_date).trim(),
      rev: String(revision || '0').trim(),
      site_type: String(site_type || '').trim(),
      operating_unit: String(operating_unit || '').trim(),
      status: 'Open',
      po_completion_status: '0',
      is_deleted: '0',
      created_at: now
    });

    // 2. Insert each site into tbl_po_sites, tbl_deployment, tbl_location_mapping
    for (const site of sites) {
      if (!site.site_id) continue;
      const trimmedSiteId = String(site.site_id).trim();

      jsonDb.insert('tbl_po_sites', {
        state_id: String(state_id).trim(),
        client_id: String(client_id).trim(),
        po_no: trimmedPoNo,
        site_id: trimmedSiteId,
        site_name: String(site.site_name || '').trim(),
        status: '0',
        order_date: String(po_date).trim(),
        is_deleted: '0',
        created_at: now
      });

      jsonDb.insert('tbl_deployment', {
        state_id: String(state_id).trim(),
        client_id: String(client_id).trim(),
        po: trimmedPoNo,
        site_id: trimmedSiteId,
        work_type: String(site.work_type || '').trim(),
        site_type: String(site_type || '').trim(),
        infratel_id: String(site.infratel_id || '').trim(),
        so_no: String(site.so_number || '').trim(),
        location: String(site.location || '').trim(),
        status: '0',
        po_date: String(po_date).trim(),
        importation_datetime: now
      });

      if (site.infratel_id) {
        jsonDb.insert('tbl_location_mapping', {
          infratel_site_id: String(site.infratel_id).trim(),
          longitude: String(site.longitude || '').trim(),
          latitude: String(site.latitude || '').trim(),
          importation_datetime: now
        });
      }
    }

    res.status(200).json({
      flag: true,
      success: true,
      title: 'Added Successfully',
      message: 'PO and Sites have been added successfully.'
    });
  } catch (err) {
    console.error('Error adding PO and Sites:', err);
    res.status(500).json({ flag: false, title: 'Error', message: err.message });
  }
};

/**
 * Add New Sites to existing PO (matches PHP addPoSitesAction)
 */
exports.addPOSites = async (req, res) => {
  try {
    const { po, sites } = req.body;

    if (!po) {
      return res.status(200).json({ flag: false, title: 'PO Missing!', message: 'Please select PO.' });
    }
    if (!sites || !Array.isArray(sites) || sites.length === 0 || !sites[0].site_id) {
      return res.status(200).json({ flag: false, title: 'Site ID Missing!', message: 'Please enter at least one site ID.' });
    }

    const trimmedPoNo = String(po).trim();
    const poDetails = jsonDb.findOne('tbl_po_details', { po_no: trimmedPoNo }) || {};
    const stateId = String(poDetails.state_id || '').trim();
    const clientId = String(poDetails.client_id || '').trim();
    const orderDate = String(poDetails.order_date || new Date().toISOString().substring(0, 10)).trim();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    for (const site of sites) {
      if (!site.site_id) continue;
      const trimmedSiteId = String(site.site_id).trim();

      jsonDb.insert('tbl_po_sites', {
        state_id: stateId,
        client_id: clientId,
        po_no: trimmedPoNo,
        site_id: trimmedSiteId,
        site_name: String(site.site_name || '').trim(),
        status: '0',
        order_date: orderDate,
        is_deleted: '0',
        created_at: now
      });

      jsonDb.insert('tbl_deployment', {
        state_id: stateId,
        client_id: clientId,
        po: trimmedPoNo,
        site_id: trimmedSiteId,
        work_type: String(site.work_type || '').trim(),
        site_type: String(site.site_type || '').trim(),
        infratel_id: String(site.infratel_id || '').trim(),
        so_no: String(site.so_number || '').trim(),
        location: String(site.location || '').trim(),
        status: '0',
        po_date: orderDate,
        importation_datetime: now
      });

      if (site.infratel_id) {
        jsonDb.insert('tbl_location_mapping', {
          infratel_site_id: String(site.infratel_id).trim(),
          longitude: String(site.longitude || '').trim(),
          latitude: String(site.latitude || '').trim(),
          importation_datetime: now
        });
      }
    }

    res.status(200).json({
      flag: true,
      success: true,
      title: 'Added Successfully',
      message: 'Sites have been added successfully to PO.'
    });
  } catch (err) {
    console.error('Error adding sites to PO:', err);
    res.status(500).json({ flag: false, title: 'Error', message: err.message });
  }
};

/**
 * Get Site Matrix details by site_id (matches PHP ManagePoSiteController::getSiteMatrixDataAction)
 */
exports.getSiteMatrixData = async (req, res) => {
  try {
    const site_id = req.params.site_id || req.query.site_id;
    if (!site_id) {
      return res.status(200).json(null);
    }
    const cleanId = String(site_id).trim().toLowerCase();
    const siteMatrix = jsonDb.getTable('tbl_site_matrix') || [];
    const match = siteMatrix.find(m => 
      m.technical_site_id && String(m.technical_site_id).trim().toLowerCase().startsWith(cleanId)
    );
    res.status(200).json(match || null);
  } catch (err) {
    console.error('Error in getSiteMatrixData:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};