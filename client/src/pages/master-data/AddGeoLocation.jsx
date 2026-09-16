import React, { useState, useEffect, useMemo } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import { MapPin, Map, ExternalLink, Edit2, Trash2, Search, X, CheckCircle, AlertTriangle } from 'lucide-react';

const AddGeoLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form State
  const initialForm = {
    site_id: '',
    site_name: '',
    latitude: '',
    longitude: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedMapSite, setSelectedMapSite] = useState(null);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await fetchList('dynamic/tbl_site_maps');
      if (res.success && Array.isArray(res.data)) {
        setLocations(res.data);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      showAlert('danger', 'Failed to load locations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.site_id.trim()) {
      showAlert('danger', 'Please enter Site Id.');
      return;
    }
    if (!formData.site_name.trim()) {
      showAlert('danger', 'Please enter Site Name.');
      return;
    }
    if (!formData.latitude.toString().trim()) {
      showAlert('danger', 'Please enter Latitude.');
      return;
    }
    if (!formData.longitude.toString().trim()) {
      showAlert('danger', 'Please enter Longitude.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        site_id: formData.site_id.trim(),
        site_name: formData.site_name.trim(),
        lat: formData.latitude.toString().trim(),
        lng: formData.longitude.toString().trim(),
        latitude: formData.latitude.toString().trim(),
        longitude: formData.longitude.toString().trim(),
        is_deleted: false
      };

      if (editId) {
        await updateItem('dynamic/tbl_site_maps', editId, payload);
        showAlert('success', 'Location updated successfully.');
        setEditId(null);
      } else {
        await createItem('dynamic/tbl_site_maps', payload);
        showAlert('success', 'Location added successfully.');
      }
      setFormData(initialForm);
      loadLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      showAlert('danger', 'Failed to save location data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      site_id: row.site_id || '',
      site_name: row.site_name || '',
      latitude: row.lat || row.latitude || '',
      longitude: row.lng || row.longitude || ''
    });
    setEditId(row._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData(initialForm);
    setEditId(null);
  };

  const handleDelete = async (id, siteName) => {
    if (window.confirm(`Are you sure you want to delete location "${siteName || 'this site'}"?`)) {
      try {
        await deleteItem('dynamic/tbl_site_maps', id);
        showAlert('success', 'Location deleted successfully.');
        if (editId === id) {
          handleCancelEdit();
        }
        loadLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
        showAlert('danger', 'Failed to delete location.');
      }
    }
  };

  // Filtered & Paginated List
  const filteredLocations = useMemo(() => {
    return locations.filter(item => {
      const sId = (item.site_id || '').toLowerCase();
      const sName = (item.site_name || '').toLowerCase();
      const sLat = (item.lat || item.latitude || '').toString();
      const sLng = (item.lng || item.longitude || '').toString();
      const q = searchTerm.toLowerCase();
      return sId.includes(q) || sName.includes(q) || sLat.includes(q) || sLng.includes(q);
    });
  }, [locations, searchTerm]);

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage) || 1;
  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLocations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLocations, currentPage, itemsPerPage]);

  const openMapForSite = (site) => {
    setSelectedMapSite(site);
    setIsMapModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Add Location</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard / Master Data / Add Location</p>
      </div>

      {/* Alert Banner */}
      {alertInfo.show && (
        <div
          className={`flex items-center justify-between p-4 rounded-md border text-sm transition-all duration-300 ${
            alertInfo.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertInfo.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold">{alertInfo.type === 'success' ? 'Success !' : 'Error !'}</span>
            <span>{alertInfo.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertInfo({ show: false, type: '', message: '' })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Card Matching PHP Screenshot */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Dark Card Header */}
        <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-wide">
            {editId ? 'Edit Location' : 'Add Location'}
          </h2>
          {editId && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded font-medium">
              Editing Record
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Top Right "View Site map" Link */}
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => {
                setSelectedMapSite(locations[0] || null);
                setIsMapModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-medium text-sm transition-colors cursor-pointer"
            >
              <Map className="w-4 h-4 text-sky-600" />
              <span>View Site map</span>
            </button>
          </div>

          {/* Light Blue Styled Form Container Matching PHP (#DCF2FE) */}
          <div
            className="p-5 rounded-md border"
            style={{ backgroundColor: '#DCF2FE', borderColor: '#bae6fd' }}
          >
            <form onSubmit={handleSubmit}>
              {/* Mandatory Note */}
              <div className="mb-4">
                <span className="text-red-600 font-bold text-sm tracking-wide">
                  * Field is mandatory.
                </span>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* Site Id */}
                <div>
                  <label htmlFor="site_id" className="block text-xs font-semibold text-gray-700 mb-1">
                    Site id <span className="text-red-600 font-bold">*</span> :
                  </label>
                  <input
                    type="text"
                    id="site_id"
                    name="site_id"
                    value={formData.site_id}
                    onChange={handleInputChange}
                    placeholder="Enter Site Id"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  />
                </div>

                {/* Site Name */}
                <div>
                  <label htmlFor="site_name" className="block text-xs font-semibold text-gray-700 mb-1">
                    Site Name <span className="text-red-600 font-bold">*</span> :
                  </label>
                  <input
                    type="text"
                    id="site_name"
                    name="site_name"
                    value={formData.site_name}
                    onChange={handleInputChange}
                    placeholder="Enter Site Name"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label htmlFor="latitude" className="block text-xs font-semibold text-gray-700 mb-1">
                    Latitude <span className="text-red-600 font-bold">*</span> :
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Enter Latitude (e.g. 27.1453)"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label htmlFor="longitude" className="block text-xs font-semibold text-gray-700 mb-1">
                    Longitude <span className="text-red-600 font-bold">*</span> :
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Enter Longitude (e.g. 82.5315)"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded shadow-sm hover:shadow transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : editId ? (
                    <span>Update Location</span>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dynamic Data Table of Saved Site Locations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header with Search & Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800">Saved Site Locations</h3>
            <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-medium">
              {filteredLocations.length} {filteredLocations.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Show per page */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-sky-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-44 sm:w-56"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold">Site ID</th>
                <th className="px-4 py-3 font-semibold">Site Name</th>
                <th className="px-4 py-3 font-semibold">Latitude</th>
                <th className="px-4 py-3 font-semibold">Longitude</th>
                <th className="px-4 py-3 font-semibold text-center">Map</th>
                <th className="px-4 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading locations data...
                  </td>
                </tr>
              ) : paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No locations found.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((item, index) => {
                  const sLat = item.lat || item.latitude || '-';
                  const sLng = item.lng || item.longitude || '-';
                  const hasCoords = sLat !== '-' && sLng !== '-' && !isNaN(Number(sLat)) && !isNaN(Number(sLng));

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-sky-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.site_id || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.site_name || '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {sLat}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {sLng}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasCoords ? (
                          <button
                            type="button"
                            onClick={() => openMapForSite(item)}
                            className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded transition-colors cursor-pointer"
                            title="View on Map"
                          >
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-1"
                            title="Edit Location"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.site_name)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Delete Location"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            Showing{' '}
            <span className="font-medium text-gray-800">
              {filteredLocations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium text-gray-800">
              {Math.min(currentPage * itemsPerPage, filteredLocations.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-800">{filteredLocations.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-sky-500 text-white rounded text-sm font-medium">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Site Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold">
                  Site Map View {selectedMapSite?.site_name ? `- ${selectedMapSite.site_name} (${selectedMapSite.site_id || ''})` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Site Selector / Filter Bar inside Modal */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Select Site:</span>
                  <select
                    value={selectedMapSite?._id || ''}
                    onChange={(e) => {
                      const found = locations.find(l => l._id === e.target.value);
                      if (found) setSelectedMapSite(found);
                    }}
                    className="border border-gray-300 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-sky-500"
                  >
                    {locations.map((loc, i) => (
                      <option key={loc._id || i} value={loc._id}>
                        {loc.site_name || 'Unnamed'} ({loc.site_id || 'No ID'}) - [{loc.lat || loc.latitude}, {loc.lng || loc.longitude}]
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMapSite && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedMapSite.lat || selectedMapSite.latitude},${selectedMapSite.lng || selectedMapSite.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 bg-white border border-sky-200 px-3 py-1.5 rounded shadow-2xs font-medium transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>

              {/* Map Canvas / Embed */}
              <div className="w-full h-96 bg-gray-100 rounded-md overflow-hidden border border-gray-300 relative">
                {selectedMapSite && (selectedMapSite.lat || selectedMapSite.latitude) ? (
                  <iframe
                    title="Site Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      Number(selectedMapSite.lng || selectedMapSite.longitude) - 0.08
                    }%2C${
                      Number(selectedMapSite.lat || selectedMapSite.latitude) - 0.08
                    }%2C${
                      Number(selectedMapSite.lng || selectedMapSite.longitude) + 0.08
                    }%2C${
                      Number(selectedMapSite.lat || selectedMapSite.latitude) + 0.08
                    }&layer=mapnik&marker=${selectedMapSite.lat || selectedMapSite.latitude}%2C${selectedMapSite.lng || selectedMapSite.longitude}`}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm">Please select a site with valid coordinates to view on map.</p>
                  </div>
                )}
              </div>

              {/* Quick Coordinates Badge */}
              {selectedMapSite && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-sky-50 p-3 rounded border border-sky-100">
                  <div>
                    <span className="text-gray-500 block">Site ID:</span>
                    <span className="font-semibold text-gray-800">{selectedMapSite.site_id || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Site Name:</span>
                    <span className="font-semibold text-gray-800">{selectedMapSite.site_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Latitude:</span>
                    <span className="font-mono text-gray-800">{selectedMapSite.lat || selectedMapSite.latitude || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Longitude:</span>
                    <span className="font-mono text-gray-800">{selectedMapSite.lng || selectedMapSite.longitude || '-'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGeoLocation;
