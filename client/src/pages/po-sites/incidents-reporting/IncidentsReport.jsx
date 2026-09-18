import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, RefreshCw } from 'lucide-react';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const IncidentsReport = () => {
  const [data, setData] = useState([]);
  const [initMasters, setInitMasters] = useState({
    poList: [],
    sitesList: [],
    users: []
  });

  // Search filter states matching PHP
  const [searchFilters, setSearchFilters] = useState({
    incidentType: '',
    poNumber: '',
    siteId: '',
    userId: ''
  });

  // Applied filter state that filters the table
  const [appliedFilters, setAppliedFilters] = useState({
    incidentType: '',
    poNumber: '',
    siteId: '',
    userId: ''
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/po-sites/incidents', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching incidents data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchMasters = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/po-sites/incidents-init', { withCredentials: true });
        if (res.data && res.data.success) {
          setInitMasters({
            poList: res.data.data.poList || [],
            sitesList: res.data.data.sitesList || [],
            users: res.data.data.users || []
          });
        }
      } catch (err) {
        console.error('Error fetching init masters:', err);
      }
    };
    fetchMasters();
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    incidentId: '',
    poNumber: '',
    siteId: '',
    incidentDate: '',
    type: 'Site Incident',
    staffName: '',
    vendorName: '',
    incidentReport: '',
    incidentEffect: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  // Exact columns matching PHP site-incidents-report.phtml
  const columns = [
    { key: 'poNumber', label: 'PO Number' },
    { key: 'siteId', label: 'Site ID' },
    { key: 'incidentDate', label: 'Incident Date' },
    { key: 'staffName', label: 'Staff Name' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'reportingDate', label: 'Date of Reporting' },
    { key: 'incidentReport', label: 'Incident Report' },
    { key: 'incidentEffect', label: 'Incident Consequence' }
  ];

  const formFields = [
    { key: 'poNumber', label: 'PO Number', type: 'text', readOnly: true },
    { key: 'siteId', label: 'Site ID', type: 'text', readOnly: true },
    { key: 'incidentDate', label: 'Incident Date', type: 'text', readOnly: true },
    { key: 'staffName', label: 'Staff Name', type: 'text', readOnly: true },
    { key: 'vendorName', label: 'Vendor Name', type: 'text', readOnly: true },
    { key: 'incidentReport', label: 'Incident Report', type: 'textarea', required: true },
    { key: 'incidentEffect', label: 'Incident Consequence', type: 'textarea' }
  ];

  // Cascading site options based on selected filter PO
  const filteredFilterSites = (initMasters.sitesList || []).filter(s => {
    if (!searchFilters.poNumber) return true;
    return String(s.po_no || '').trim() === String(searchFilters.poNumber || '').trim();
  });

  // Client-side filtering matching PHP search filters
  const displayedData = data.filter(item => {
    if (appliedFilters.incidentType) {
      const typeNum = appliedFilters.incidentType === '1' ? 'Office Incident' : 'Site Incident';
      if (item.type !== typeNum && String(item.typeId) !== String(appliedFilters.incidentType)) return false;
    }
    if (appliedFilters.poNumber && String(item.poNumber || '').trim() !== String(appliedFilters.poNumber).trim()) {
      return false;
    }
    if (appliedFilters.siteId && String(item.siteId || '').trim() !== String(appliedFilters.siteId).trim()) {
      return false;
    }
    if (appliedFilters.userId) {
      const matchedUser = initMasters.users.find(u => String(u.id) === String(appliedFilters.userId));
      const userName = matchedUser ? matchedUser.name.toLowerCase() : '';
      if (userName && !String(item.staffName || '').toLowerCase().includes(userName) && !String(item.reportedByName || '').toLowerCase().includes(userName)) {
        return false;
      }
    }
    return true;
  });

  const handleAdd = () => {
    window.location.href = '/po-sites/incidents-reporting/report-new-incident';
  };

  const handleEdit = (row) => {
    setFormData({
      incidentId: row.incidentId || '',
      poNumber: row.poNumber || '',
      siteId: row.siteId || '',
      incidentDate: row.incidentDate || '',
      type: row.type || 'Site Incident',
      staffName: row.staffName || '',
      vendorName: row.vendorName || '',
      incidentReport: row.incidentReport || row.description || '',
      incidentEffect: row.incidentEffect || row.consequence || ''
    });
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this incident report?")) {
      try {
        await axios.delete(`http://localhost:5000/api/po-sites/incidents/${id}`, { withCredentials: true });
        fetchData();
      } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Error deleting incident report');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editId) {
        await axios.put(`http://localhost:5000/api/po-sites/incidents/${editId}`, {
          incident: formData.incidentReport,
          incident_report: formData.incidentReport,
          incident_consequence: formData.incidentEffect,
          incident_effect: formData.incidentEffect
        }, { withCredentials: true });
      } else {
        await axios.post('http://localhost:5000/api/po-sites/incidents', formData, { withCredentials: true });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  // Filter 1 handler: Show by incident type (matches submitSearchTypeForm in PHP)
  const handleShowType = (e) => {
    e?.preventDefault();
    setAppliedFilters(prev => ({
      ...prev,
      incidentType: searchFilters.incidentType
    }));
  };

  // Filter 2 handler: Search by PO, Site, Employee (matches submitSearchForm in PHP)
  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchFilters.poNumber && !searchFilters.siteId && !searchFilters.userId) {
      alert('Please select at least one search criteria.');
      return;
    }
    setAppliedFilters(prev => ({
      ...prev,
      poNumber: searchFilters.poNumber,
      siteId: searchFilters.siteId,
      userId: searchFilters.userId
    }));
  };

  // Clear search handler: Reset all filters (matches clearSearchButton in PHP)
  const clearSearch = () => {
    setSearchFilters({
      incidentType: '',
      poNumber: '',
      siteId: '',
      userId: ''
    });
    setAppliedFilters({
      incidentType: '',
      poNumber: '',
      siteId: '',
      userId: ''
    });
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto space-y-4">
      {/* Top Filter Panel matching PHP site-incidents-report.phtml */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
        {/* Form 1: Incident Type Filter with Show button */}
        <form onSubmit={handleShowType} className="flex flex-wrap items-end gap-3 pb-4 border-b border-gray-100">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Incident Type <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={searchFilters.incidentType}
              onChange={(e) => setSearchFilters({ ...searchFilters, incidentType: e.target.value })}
              className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select Incident Type</option>
              <option value="1">Office Incident</option>
              <option value="2">Site Incident</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-xs"
          >
            Show
          </button>
        </form>

        {/* Form 2: PO Number, Site ID, Employee Name with Search button & Clear Search icon */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              PO Number <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={searchFilters.poNumber}
              onChange={(e) => setSearchFilters({ ...searchFilters, poNumber: e.target.value, siteId: '' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select PO Number</option>
              {(initMasters.poList || []).map(p => (
                <option key={p.id || p.po_no} value={p.po_no}>{p.po_no}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Site ID <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={searchFilters.siteId}
              onChange={(e) => setSearchFilters({ ...searchFilters, siteId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select Site ID</option>
              {filteredFilterSites.map(s => (
                <option key={s.id || s.site_id} value={s.site_id}>{s.site_id}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Employee Name :
            </label>
            <select
              value={searchFilters.userId}
              onChange={(e) => setSearchFilters({ ...searchFilters, userId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Please Select</option>
              {(initMasters.users || []).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-xs"
            >
              <Search size={15} />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={clearSearch}
              title="Clear Search"
              className="p-2 text-[#D48611] hover:bg-amber-50 rounded-md border border-amber-200 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </form>
      </div>

      <MasterDataTable
        title="Incidents Report"
        data={displayedData}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Incident Details & Update"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
};

export default IncidentsReport;
