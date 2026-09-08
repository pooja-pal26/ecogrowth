import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const ImportSiteData = () => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('File to import', file);
    alert('File imported successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Site Data</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Site Data File (CSV/Excel)</label>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              <span>Import Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportSiteData;
