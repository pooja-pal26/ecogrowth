import React, { useState } from 'react';
import { Download, Edit } from 'lucide-react';

const PODetails = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });

  const [poList, setPoList] = useState([
    {
      id: 1,
      poNumber: 'PO-1001',
      orderDate: '2026-09-01',
      revision: '0',
      amount: '50000',
      siteType: 'RTT',
      exclusiveTax: '4500',
      totalTax: '5000',
      status: 'Active'
    },
    {
      id: 2,
      poNumber: 'PO-1002',
      orderDate: '2026-09-02',
      revision: '1',
      amount: '75000',
      siteType: 'GBT',
      exclusiveTax: '6000',
      totalTax: '7500',
      status: 'Pending'
    }
  ]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search with filters:', filters);
  };

  const handleReset = () => {
    setFilters({ fromDate: '', toDate: '' });
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
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
        <div className="flex space-x-3">
          <button onClick={handleExport} className="flex items-center space-x-1 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors">
            <Download size={18} />
            <span>Export Excel</span>
          </button>
          <a href="/po-sites/po/add-new-po" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Add New PO
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Submit
          </button>
          <button type="button" onClick={handleReset} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
            Reset
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              {poList.map((po, index) => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer font-medium">{po.poNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.orderDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.revision}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">₹{po.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{po.siteType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{po.exclusiveTax}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{po.totalTax}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${po.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {poList.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-4 py-6 text-center text-sm text-gray-500">
                    No POs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PODetails;
