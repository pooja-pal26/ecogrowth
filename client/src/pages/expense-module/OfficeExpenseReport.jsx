import React from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfficeExpenseReport = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Office Expense Report</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Expense Module</span>
            <span>/</span>
            <span className="text-gray-700">Office Expense Report</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-slate-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            Office Expense Report <span className="ml-2 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">₹ 9314.80</span>
          </h2>
          <button 
            onClick={() => navigate('/expense-module/create-new-expense')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Add New Expense
          </button>
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
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option>Please Company</option>
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
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Transfer Date</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Transfered To</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Remark</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Bank Account</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3 whitespace-nowrap">Logimetrix Techsolutions Pvt. Ltd.</td>
                  <td className="px-4 py-3">19/03/2026</td>
                  <td className="px-4 py-3 whitespace-nowrap">Jyotsna Pandey</td>
                  <td className="px-4 py-3 text-blue-500 font-medium cursor-pointer hover:underline">319</td>
                  <td className="px-4 py-3">Medicine</td>
                  <td className="px-4 py-3">Cash<br/>4209211</td>
                  <td className="px-4 py-3">Upi</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100/50">
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3 whitespace-nowrap">Logimetrix Techsolutions Pvt. Ltd.</td>
                  <td className="px-4 py-3">18/03/2026</td>
                  <td className="px-4 py-3 whitespace-nowrap">Jyotsna Pandey</td>
                  <td className="px-4 py-3 text-blue-500 font-medium cursor-pointer hover:underline">827</td>
                  <td className="px-4 py-3">Alfiya Birthday</td>
                  <td className="px-4 py-3">Cash<br/>4209211</td>
                  <td className="px-4 py-3">Upi</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">3</td>
                  <td className="px-4 py-3 whitespace-nowrap">Logimetrix Techsolutions Pvt. Ltd.</td>
                  <td className="px-4 py-3">11/03/2026</td>
                  <td className="px-4 py-3 whitespace-nowrap">Pankaj Kashyap</td>
                  <td className="px-4 py-3 text-blue-500 font-medium cursor-pointer hover:underline">100</td>
                  <td className="px-4 py-3">Ginger office</td>
                  <td className="px-4 py-3">Cash<br/>4209211</td>
                  <td className="px-4 py-3">Upi</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100/50">
                  <td className="px-4 py-3">4</td>
                  <td className="px-4 py-3 whitespace-nowrap">Logimetrix Techsolutions Pvt. Ltd.</td>
                  <td className="px-4 py-3">11/03/2026</td>
                  <td className="px-4 py-3 whitespace-nowrap">Pankaj Kashyap</td>
                  <td className="px-4 py-3 text-blue-500 font-medium cursor-pointer hover:underline">100</td>
                  <td className="px-4 py-3">Ginger office</td>
                  <td className="px-4 py-3">Cash<br/>4209211</td>
                  <td className="px-4 py-3">Upi</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">5</td>
                  <td className="px-4 py-3 whitespace-nowrap">Logimetrix Techsolutions Pvt. Ltd.</td>
                  <td className="px-4 py-3">25/02/2026</td>
                  <td className="px-4 py-3 whitespace-nowrap">Reetesh Kashyap</td>
                  <td className="px-4 py-3 text-blue-500 font-medium cursor-pointer hover:underline">250</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">Cash<br/>4209211</td>
                  <td className="px-4 py-3">Upi</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>Showing 1 to 5 of 5 entries</div>
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

export default OfficeExpenseReport;
