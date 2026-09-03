import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

const CreateNewExpense = () => {
  const [expenseType, setExpenseType] = useState('');
  
  // Dynamic table rows
  const [siteRows, setSiteRows] = useState([{ id: 1 }]);
  const [officeRows, setOfficeRows] = useState([{ id: 1 }]);

  // Dummy dropdown data for now (to be replaced by API calls)
  const dummyOptions = [{ id: '1', name: 'Option 1' }, { id: '2', name: 'Option 2' }];

  const handleAddSiteRow = () => {
    setSiteRows([...siteRows, { id: siteRows.length + 1 }]);
  };

  const handleRemoveSiteRow = (id) => {
    setSiteRows(siteRows.filter(row => row.id !== id));
  };

  const handleAddOfficeRow = () => {
    setOfficeRows([...officeRows, { id: officeRows.length + 1 }]);
  };

  const handleRemoveOfficeRow = (id) => {
    setOfficeRows(officeRows.filter(row => row.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Expense</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Expense Module</span>
            <span>/</span>
            <span className="text-gray-700">Create New Expense</span>
          </nav>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
          Back
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
        <p className="text-red-500 font-semibold mb-4">* Fields are mandatory.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
            >
              <option value="">Please Select</option>
              <option value="Site Expense">Site Expense</option>
              <option value="Office Expense">Office Expense</option>
            </select>
          </div>
        </div>

        {/* SITE EXPENSE FORM */}
        {expenseType === 'Site Expense' && (
          <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-center mb-6 underline">Site Expense Form</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Please Select</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Transfer <span className="text-red-500">*</span></label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select PO Number</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site ID <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Site ID</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Amount <span className="text-red-500">*</span></label>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment/Bill Number</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Please Select</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (if any)</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Bank Account</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Payment Mode</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit Account <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Debit Account</option></select>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense In</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense For</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Spent Amount</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense Remark</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Required Documents</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Bill Attachment</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Date</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {siteRows.map((row) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-2"><select className="w-full border border-gray-300 rounded p-1"><option>Select</option></select></td>
                      <td className="border border-gray-300 p-2"><select className="w-full border border-gray-300 rounded p-1"><option>Select</option></select></td>
                      <td className="border border-gray-300 p-2"><input type="text" className="w-full border border-gray-300 rounded p-1" /></td>
                      <td className="border border-gray-300 p-2"><input type="text" className="w-full border border-gray-300 rounded p-1" /></td>
                      <td className="border border-gray-300 p-2"><select className="w-full border border-gray-300 rounded p-1"><option>Select</option></select></td>
                      <td className="border border-gray-300 p-2"><input type="file" className="w-full text-sm" /></td>
                      <td className="border border-gray-300 p-2"><input type="date" className="w-full border border-gray-300 rounded p-1" /></td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button onClick={() => handleRemoveSiteRow(row.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button onClick={handleAddSiteRow} className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-6">
              <Plus size={16} className="mr-1" /> Add More Row
            </button>

            <div className="flex justify-end">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                Save Expense
              </button>
            </div>
          </div>
        )}

        {/* OFFICE EXPENSE FORM */}
        {expenseType === 'Office Expense' && (
          <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-center mb-6 underline">Office Expense Form</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Please Select</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Transfer <span className="text-red-500">*</span></label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Please Select</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Amount <span className="text-red-500">*</span></label>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment/Bill Number <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Attachment</label>
                <input type="file" className="w-full text-sm mt-1" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Bank Account</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Payment Mode</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit Account <span className="text-red-500">*</span></label>
                <select className="w-full border border-gray-300 rounded-lg p-2"><option>Select Debit Account</option></select>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense In</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense For</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Spent Amount</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Expense Remark</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {officeRows.map((row) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-2"><select className="w-full border border-gray-300 rounded p-1"><option>Select</option></select></td>
                      <td className="border border-gray-300 p-2"><select className="w-full border border-gray-300 rounded p-1"><option>Select</option></select></td>
                      <td className="border border-gray-300 p-2"><input type="text" className="w-full border border-gray-300 rounded p-1" /></td>
                      <td className="border border-gray-300 p-2"><input type="text" className="w-full border border-gray-300 rounded p-1" /></td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button onClick={() => handleRemoveOfficeRow(row.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button onClick={handleAddOfficeRow} className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-6">
              <Plus size={16} className="mr-1" /> Add More Row
            </button>

            <div className="flex justify-end">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                Save Expense
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateNewExpense;
