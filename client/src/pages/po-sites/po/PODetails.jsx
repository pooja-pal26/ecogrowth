import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Edit, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PODetails = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });

  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Site List Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [siteDetails, setSiteDetails] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const fetchPODetails = async (withFilters = false) => {
    setLoading(true);
    try {
      const params = {};
      if (withFilters && filters.fromDate) params.fromDate = filters.fromDate;
      if (withFilters && filters.toDate) params.toDate = filters.toDate;

      const res = await axios.get('http://localhost:5000/api/po-sites/po-details', { params, withCredentials: true });
      if (res.data && res.data.success) {
        setPoList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching PO Details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetails(false);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPODetails(true);
  };

  const handleReset = () => {
    setFilters({ fromDate: '', toDate: '' });
    setLoading(true);
    axios.get('http://localhost:5000/api/po-sites/po-details', { withCredentials: true })
      .then(res => {
        if (res.data?.success) setPoList(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Open Site List Modal (PHP get-site-list-by-po-number.phtml parity)
  const getSiteList = async (poNumber) => {
    setSelectedPoNumber(poNumber);
    setIsModalOpen(true);
    setLoadingSites(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/po-sites/po-sites-list',
        { po_number: poNumber },
        { withCredentials: true }
      );
      if (res.data && res.data.success) {
        setSiteDetails(res.data.data || []);
      } else {
        setSiteDetails([]);
      }
    } catch (err) {
      console.error('Error fetching sites for PO:', err);
      setSiteDetails([]);
    } finally {
      setLoadingSites(false);
    }
  };

  // Export Excel CSV
  const handleExport = () => {
    if (poList.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['#', 'PO Number', 'PO Order Date', 'Revision', 'Amount', 'Site Type', 'Exclusive Tax', 'Total Tax', 'Status'];
    const rows = poList.map((po, idx) => [
      idx + 1,
      `"${po.po_no || ''}"`,
      `"${formatDate(po.order_date)}"`,
      `"${po.rev || '0'}"`,
      `"${po.po_amount || '0'}"`,
      `"${po.site_type || ''}"`,
      `"${po.exclusive_tax || '0'}"`,
      `"${po.tax_amount || '0'}"`,
      `"${po.status || 'Open'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `po_details_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">PO Details</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>PO & Sites</span>
            <span>/</span>
            <span className="text-gray-700">PO Details</span>
          </nav>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="flex items-center space-x-1 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors">
            <Download size={18} />
            <span>Export Excel</span>
          </button>
          <Link to="/po-sites/po/add-new-po" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Add New PO
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Submit
          </button>
          <button type="button" onClick={handleReset} className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
            Reset
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Order Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revision</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exclusive Tax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading PO details...
                  </td>
                </tr>
              ) : poList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                    No POs found.
                  </td>
                </tr>
              ) : (
                poList.map((po, index) => (
                  <tr key={po.id || po._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}.</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => getSiteList(po.po_no)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        title="View Sites"
                      >
                        {po.po_no}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(po.order_date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.rev || '0'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{parseFloat(po.po_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.site_type || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.exclusive_tax || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.tax_amount || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (po.status || '').toLowerCase() === 'open' || (po.status || '').toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {po.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => getSiteList(po.po_no)} className="text-blue-500 hover:text-blue-700" title="View Sites">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Site(s) List Modal (PHP get-site-list-by-po-number.phtml parity) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div 
              className="px-6 py-4 text-white flex justify-between items-center shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-lg font-medium">PO Number: {selectedPoNumber} Site(s) List</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingSites ? (
                <div className="py-12 text-center text-gray-500">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Loading site list...</span>
                </div>
              ) : siteDetails.length === 0 ? (
                <div className="py-8 text-center text-red-600 font-medium">
                  Site(s) Not Found!
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Site Id</th>
                        <th className="px-4 py-3 text-left">Site Allocated</th>
                        <th className="px-4 py-3 text-left">Allocation Date</th>
                        <th className="px-4 py-3 text-left">Site Expense</th>
                        <th className="px-4 py-3 text-left">Site Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {siteDetails.map((site, sIdx) => (
                        <tr key={site.id || site._id || sIdx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{sIdx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-blue-600">{site.site_id}</td>
                          <td className="px-4 py-3">{site.site_allocation_id ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(site.site_allocation_date)}</td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {site.total_site_expense ? `₹${parseFloat(site.total_site_expense).toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(site.site_due_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium px-4 py-2 rounded-md transition-colors"
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

export default PODetails;
