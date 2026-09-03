import React from 'react';

const B2BFundTransferReport = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">B2B Fund Transfer Report</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Expense Module</span>
            <span>/</span>
            <span className="text-gray-700">B2B Fund Transfer Report</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-slate-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            Fund Transfer Report <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-bold flex items-center justify-center w-6 h-6">₹</span>
          </h2>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            Add Fund Transfer
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="flex-1 min-w-[150px]">
              <input type="text" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" placeholder="From Date" readOnly />
            </div>
            <div className="flex-1 min-w-[150px]">
              <input type="text" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" placeholder="To Date" readOnly />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Submit</button>
              <button className="bg-cyan-400 text-white px-6 py-2 rounded-md hover:bg-cyan-500 transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium">Excel</button>
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Search:</label>
              <input type="text" className="border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-sm text-left text-gray-600 whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-white border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Transfer Date</th>
                  <th className="px-4 py-3 font-semibold">Transferred To</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Remark</th>
                  <th className="px-4 py-3 font-semibold">PO Number</th>
                  <th className="px-4 py-3 font-semibold">Site Id</th>
                  <th className="px-4 py-3 font-semibold">Bank Account</th>
                  <th className="px-4 py-3 font-semibold">Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="10" className="px-4 py-6 text-center text-gray-500 bg-gray-50/50 border-b border-gray-200">
                    No data available in table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>Showing 0 to 0 of 0 entries</div>
            <div className="flex space-x-2">
              <button className="text-gray-500 hover:text-gray-700 font-medium">Previous</button>
              <button className="text-gray-500 hover:text-gray-700 font-medium">Next</button>
            </div>
          </div>
          
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full relative">
            <div className="absolute left-0 top-0 h-full w-3/4 bg-gray-400 rounded-full"></div>
            <div className="absolute left-0 top-0 h-full w-full flex justify-between items-center px-1">
               <span className="text-gray-500 text-[10px]">◀</span>
               <span className="text-gray-500 text-[10px]">▶</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BFundTransferReport;
