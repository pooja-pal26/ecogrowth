import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Layers, Download, Printer, Package 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { fetchMaterialStockReport } from '../../services/materialApi';

const MaterialStockReport = () => {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterialStockReport();
      setStockList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading stock report:', error);
      Swal.fire('Error !', 'Failed to load material stock report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list matching PHP search
  const filteredList = useMemo(() => {
    let result = [...stockList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const matchesType = (item.product_type || '').toLowerCase().includes(q);
        const matchesName = (item.product_name || '').toLowerCase().includes(q);
        const matchesUnit = (item.unit || '').toLowerCase().includes(q);
        return matchesType || matchesName || matchesUnit;
      });
    }

    return result;
  }, [stockList, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = ['#', 'Product Type', 'Product Name', 'Total Quantity', 'Unit'];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      `"${item.product_type || ''}"`,
      `"${item.product_name || ''}"`,
      item.quantity,
      `"${item.unit || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `material-stock-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3 font-sans">
      {/* Header Banner matching PHP panel-primary / panel-heading */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Material Stock Report</span>
        </h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/material-stock/stock-in"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
          >
            <Plus size={14} />
            <span>Add Stock</span>
          </Link>
        </div>
      </div>

      {/* Main Table Card with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
        {/* Controls: Page size, Export CSV, and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-600 font-medium">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-600 font-medium">entries</span>

            <button
              onClick={handleExportCSV}
              className="ml-2 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold border border-gray-300 transition-colors flex items-center gap-1"
              title="Export CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Data Table matching PHP materialStockTable in material-stock-report.phtml */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-r-transparent mb-2" />
            <p className="text-xs font-medium">Loading Material Stock Report...</p>
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Package className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-gray-700">No Stock Records Found !</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Product Type</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Product Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Total Quantity</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedList.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center font-medium text-gray-500 whitespace-nowrap">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-medium text-gray-900">
                      {item.product_type}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-800">
                      {item.product_name}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-semibold text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                      {item.unit || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2 text-xs text-gray-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700 bg-gray-100 rounded border border-gray-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialStockReport;
