import React from 'react';
import { Download } from 'lucide-react';

const SiteExpenseReport = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Site Expense Report</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Expense Module</span>
            <span>/</span>
            <span className="text-gray-700">Site Expense Report</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-slate-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            Site Expense Report <span className="ml-2 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">₹ 150944436.00</span>
          </h2>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" placeholder="From Date" readOnly />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" placeholder="To Date" readOnly />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Session</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option>2023-2024</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Quarter</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option>Select Quarter</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Submit</button>
              <button className="bg-cyan-400 text-white px-6 py-2 rounded-md hover:bg-cyan-500 transition-colors">Reset</button>
              <button className="bg-cyan-500 text-white px-3 py-2 rounded-md hover:bg-cyan-600 transition-colors flex items-center justify-center">
                <Download size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>Show</span>
              <select className="mx-2 border border-gray-300 rounded p-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Search:</label>
              <input type="text" className="border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">PO Number</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">PO Date</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Site ID</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Site Name</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Transferred Amount</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Reported Amount</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Not Reported Amount</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Last Fund Transferred Date</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Last Expense Added By</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">54030076067</td>
                  <td className="px-4 py-3">07/07/2026</td>
                  <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer whitespace-nowrap">IN-3594004</td>
                  <td className="px-4 py-3">IIM, Raipur</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">380696.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">380696.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">0</td>
                  <td className="px-4 py-3">12/08/2026</td>
                  <td className="px-4 py-3">NISHI KANCI</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100/50">
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3">54030077278</td>
                  <td className="px-4 py-3">27/07/2026</td>
                  <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer whitespace-nowrap">IN-3627764</td>
                  <td className="px-4 py-3">CHARBHATHA</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">295384.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">295384.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">0</td>
                  <td className="px-4 py-3">11/08/2026</td>
                  <td className="px-4 py-3">NISHI KANCI</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">3</td>
                  <td className="px-4 py-3">54030070813</td>
                  <td className="px-4 py-3">17/04/2026</td>
                  <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer whitespace-nowrap">IN-3531589</td>
                  <td className="px-4 py-3">Temari</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">580164.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">580164.00</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">0</td>
                  <td className="px-4 py-3">14/07/2026</td>
                  <td className="px-4 py-3">NISHI KANCI</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>Showing 1 to 3 of 3 entries</div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-600 rounded">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteExpenseReport;
