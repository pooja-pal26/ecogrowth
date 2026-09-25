import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Ban, CheckCircle, Trash2, X, RefreshCw, Layers
} from 'lucide-react';
import { 
  getServicesProducts, 
  addServiceProduct, 
  updateServiceProduct, 
  toggleServiceStatus,
  getGenerateInvoiceInitData
} from '../../services/invoiceService';

const ServicesProducts = () => {
  const [services, setServices] = useState([]);
  const [states, setStates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    state_id: '',
    client_id: '',
    service_name: '',
    hsn_sac_code: '',
    unit_of_measurement: '',
    gst_slab: '18',
    igst_percentage: '18',
    cgst_percentage: '9',
    sgst_percentage: '9',
    service_rate: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srvRes, initRes] = await Promise.all([
        getServicesProducts(),
        getGenerateInvoiceInitData()
      ]);

      if (srvRes.success) setServices(srvRes.data || []);
      if (initRes.success) {
        setStates(initRes.states || []);
        setClients(initRes.clients || []);
      }
    } catch (error) {
      console.error('Error loading services & products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter clients by selected state in modal
  const filteredClients = useMemo(() => {
    if (!formData.state_id) return clients;
    return clients.filter(c => String(c.state_id) === String(formData.state_id));
  }, [clients, formData.state_id]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (item) => {
    setFormData({
      state_id: String(item.state_id || ''),
      client_id: String(item.client_id || ''),
      service_name: item.name_of_service || '',
      hsn_sac_code: item.hsn_sac_code || '',
      unit_of_measurement: item.unit_of_measurement || '',
      gst_slab: String(item.gst_slab || '18'),
      igst_percentage: String(item.igst_percentage || '18'),
      cgst_percentage: String(item.cgst_percentage || '9'),
      sgst_percentage: String(item.sgst_percentage || '9'),
      service_rate: String(item.service_rate || '')
    });
    setEditId(item._id || item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gst_slab') {
      const slabNum = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        gst_slab: value,
        igst_percentage: value,
        cgst_percentage: (slabNum / 2).toString(),
        sgst_percentage: (slabNum / 2).toString()
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Save form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state_id) {
      alert('Please select a State.');
      return;
    }
    if (!formData.client_id) {
      alert('Please select a Client.');
      return;
    }
    if (!formData.service_name.trim()) {
      alert('Please enter Service/Product name.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await updateServiceProduct(editId, formData);
      } else {
        await addServiceProduct(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      alert('Failed to save service/product: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status toggle or deletion
  const handleToggle = async (item, action) => {
    let confirmMsg = '';
    if (action === 'activate') confirmMsg = `Activate "${item.name_of_service}"?`;
    else if (action === 'deactivate') confirmMsg = `Deactivate "${item.name_of_service}"?`;
    else if (action === 'delete') confirmMsg = `Delete "${item.name_of_service}" permanently?`;

    if (window.confirm(confirmMsg)) {
      try {
        await toggleServiceStatus(item._id || item.id, action);
        await loadData();
      } catch (error) {
        alert('Action failed: ' + error.message);
      }
    }
  };

  // Search & Pagination
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return services.filter(item => 
      (item.name_of_service || '').toLowerCase().includes(term) ||
      (item.state_name || '').toLowerCase().includes(term) ||
      (item.client_name || '').toLowerCase().includes(term) ||
      (item.hsn_sac_code || '').toLowerCase().includes(term) ||
      (item.unit_of_measurement || '').toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  const totalPages = Math.ceil(filteredServices.length / entriesCount) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * entriesCount;
    return filteredServices.slice(start, start + entriesCount);
  }, [filteredServices, currentPage, entriesCount]);

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap justify-between items-center gap-3 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Services/Products List</h2>
            <p className="text-[11px] text-white/80">Manage billable services, products, HSN/SAC codes and tax rates</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh List"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 p-1.5 rounded-md text-xs sm:text-sm transition-colors flex items-center justify-center backdrop-blur-xs cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all backdrop-blur-md flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              Add Service/Product
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="p-2.5 sm:p-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={entriesCount}
              onChange={(e) => {
                setEntriesCount(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search services, codes, client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-100/80 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 whitespace-nowrap">State Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Client Name</th>
                <th className="py-3 px-4 min-w-[220px]">Service/Product Name</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">HSN/SAC Code</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">UOM</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">GST Slab</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">IGST</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">CGST</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">SGST</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Service Rate</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-blue-600" />
                      <span>Loading Services & Products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-gray-400">
                    No services or products found. Click "Add Service/Product" to create one.
                  </td>
                </tr>
              ) : (
                paginatedServices.map((row, idx) => {
                  const isActive = row.is_active === '1' || row.is_active === 1;
                  const serialNo = (currentPage - 1) * entriesCount + idx + 1;
                  return (
                    <tr key={row._id || row.id || idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-medium text-gray-500">{serialNo}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">{row.state_name}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-gray-700">{row.client_name}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 leading-snug">{row.name_of_service}</td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-gray-600">{row.hsn_sac_code || '-'}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap text-gray-600">{row.unit_of_measurement || '-'}</td>
                      <td className="py-3 px-3 text-center font-semibold text-gray-700">{row.gst_slab ? `${row.gst_slab}%` : '-'}</td>
                      <td className="py-3 px-2 text-center text-gray-600">{row.igst_percentage ? `${row.igst_percentage}%` : '-'}</td>
                      <td className="py-3 px-2 text-center text-gray-600">{row.cgst_percentage ? `${row.cgst_percentage}%` : '-'}</td>
                      <td className="py-3 px-2 text-center text-gray-600">{row.sgst_percentage ? `${row.sgst_percentage}%` : '-'}</td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {row.service_rate && row.service_rate !== '0' ? `₹ ${parseFloat(row.service_rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isActive ? 'Active' : 'Deactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isActive ? (
                            <>
                              <button
                                onClick={() => handleOpenEdit(row)}
                                title="Edit Data"
                                className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Edit2 size={17} />
                              </button>
                              <button
                                onClick={() => handleToggle(row, 'deactivate')}
                                title="Deactivate Service/Product"
                                className="text-[#D66F00] hover:text-amber-700 p-1.5 hover:bg-amber-50 rounded transition-colors"
                              >
                                <Ban size={17} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggle(row, 'activate')}
                                title="Activate Service/Product"
                                className="text-[#1DAA29] hover:text-green-700 p-1.5 hover:bg-green-50 rounded transition-colors"
                              >
                                <CheckCircle size={17} />
                              </button>
                              <button
                                onClick={() => handleToggle(row, 'delete')}
                                title="Delete Service/Product"
                                className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 bg-gray-50/50">
          <div>
            Showing {filteredServices.length > 0 ? (currentPage - 1) * entriesCount + 1 : 0} to{' '}
            {Math.min(currentPage * entriesCount, filteredServices.length)} of {filteredServices.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-white transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div 
              className="text-white px-6 py-4 flex justify-between items-center shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers size={20} className="text-teal-200" />
                {isEditing ? 'Edit Service/Product' : 'Add Service/Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state_id"
                    value={formData.state_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.state_name}</option>
                    ))}
                  </select>
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Client</option>
                    {filteredClients.map(c => (
                      <option key={c.id} value={c.id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name of Service / Product */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Name of Service/Product <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Excavation for Boundary Wall in Barbed Wire"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HSN/SAC Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    HSN/SAC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="hsn_sac_code"
                    value={formData.hsn_sac_code}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 995433"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Unit of Measurement */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Unit of Measurement (UOM) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="unit_of_measurement"
                    value={formData.unit_of_measurement}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Cubic Meter, Meter, Numbers"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* GST Slab */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    GST Slab (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gst_slab"
                    value={formData.gst_slab}
                    onChange={handleChange}
                    required
                    placeholder="18"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* IGST */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    IGST (%)
                  </label>
                  <input
                    type="text"
                    name="igst_percentage"
                    value={formData.igst_percentage}
                    onChange={handleChange}
                    placeholder="18"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                {/* CGST */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    CGST (%)
                  </label>
                  <input
                    type="text"
                    name="cgst_percentage"
                    value={formData.cgst_percentage}
                    onChange={handleChange}
                    placeholder="9"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                {/* SGST */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    SGST (%)
                  </label>
                  <input
                    type="text"
                    name="sgst_percentage"
                    value={formData.sgst_percentage}
                    onChange={handleChange}
                    placeholder="9"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>

              {/* Service Rate */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Rate / Price of Service (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="service_rate"
                  value={formData.service_rate}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Service' : 'Submit Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesProducts;
