import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Layers, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, Package, 
  Download, Printer, Filter
} from 'lucide-react';
import { fetchMaterialStockReport } from '../../services/materialApi';

const MaterialStockReport = () => {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterialStockReport();
      setStockList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct categories for filter
  const categories = useMemo(() => {
    const set = new Set(stockList.map(s => s.product_type).filter(Boolean));
    return Array.from(set).sort();
  }, [stockList]);

  // Metrics
  const metrics = useMemo(() => {
    const totalSKUs = stockList.length;
    const inStock = stockList.filter(s => Number(s.quantity) > 0).length;
    const outOfStock = stockList.filter(s => Number(s.quantity) <= 0).length;
    const totalQty = stockList.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);
    return { totalSKUs, inStock, outOfStock, totalQty };
  }, [stockList]);

  // Filtered list matching PHP search
  const filteredList = useMemo(() => {
    return stockList.filter(item => {
      // Stock status filter
      if (stockStatusFilter === 'in_stock' && Number(item.quantity) <= 0) return false;
      if (stockStatusFilter === 'out_of_stock' && Number(item.quantity) > 0) return false;

      // Category filter
      if (categoryFilter && item.product_type !== categoryFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesType = (item.product_type || '').toLowerCase().includes(q);
        const matchesName = (item.product_name || '').toLowerCase().includes(q);
        const matchesUnit = (item.unit || '').toLowerCase().includes(q);
        const matchesBrand = (item.brand_name || '').toLowerCase().includes(q);
        return matchesType || matchesName || matchesUnit || matchesBrand;
      }

      return true;
    });
  }, [stockList, searchQuery, categoryFilter, stockStatusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-3 sm:p-5 w-full max-w-7xl mx-auto space-y-4 font-sans">
      {/* Top Header Panel matching PHP panel-primary / panel-heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#337ab7] text-white px-5 py-3.5 rounded-t-md shadow-xs gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">Material Stock Report</h3>
          <p className="text-xs text-blue-100 mt-0.5">Real-time inventory levels and warehouse material balances</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-1.5 bg-blue-700/60 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/material-stock/stock-in"
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>Add Stock</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total SKUs</span>
            <div className="text-2xl font-bold text-gray-800 mt-1">{metrics.totalSKUs}</div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">In-Stock SKUs</span>
            <div className="text-2xl font-bold text-green-700 mt-1">{metrics.inStock}</div>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-md">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Zero Stock</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{metrics.outOfStock}</div>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-md">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Units in Stock</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">{metrics.totalQty.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-md">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search product type, name, unit..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filters & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-xs sm:text-sm bg-white focus:border-blue-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-xs sm:text-sm bg-white focus:border-blue-500 outline-none"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="out_of_stock">Out of Stock (= 0)</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center space-x-1 border border-gray-300 transition-colors"
              title="Export CSV"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center space-x-1 border border-gray-300 transition-colors"
              title="Print Table"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Table matching PHP DataTable in material-stock-report.phtml */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#f5f5f5] text-gray-700 border-b border-gray-300 font-bold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Product Type</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-right">Total Quantity</th>
                <th className="py-3 px-4">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw size={20} className="animate-spin text-blue-600" />
                      <span>Loading stock report...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No material stock records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  const qty = Number(item.quantity) || 0;
                  const isInStock = qty > 0;

                  return (
                    <tr 
                      key={item.id || index} 
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-gray-500 font-mono text-xs">
                        {rowIndex}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {item.product_type || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {item.product_name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isInStock ? 'text-green-700' : 'text-red-500'}>
                          {qty.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded border border-gray-200">
                          {item.unit || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching PHP DataTable pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 gap-3">
          <div>
            Showing <strong className="text-gray-800">{filteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-gray-800">{Math.min(currentPage * pageSize, filteredList.length)}</strong> of{' '}
            <strong className="text-gray-800">{filteredList.length}</strong> records
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <div className="flex items-center px-2 font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialStockReport;
