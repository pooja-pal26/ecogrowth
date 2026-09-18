import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

const ImportSiteData = () => {
  const [file, setFile] = useState(null);
  const [sheetType, setSheetType] = useState('deployment');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file first.');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetType', sheetType);
    
    try {
      setLoading(true);
      setMessage(null);
      const res = await axios.post('http://localhost:5000/api/po-sites/import-sites', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setMessage({ type: 'success', text: res.data.message || 'File imported successfully!' });
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error importing file' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Import Site Data</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>PO & Sites</span>
            <span>/</span>
            <span className="text-gray-700">Import Site Data</span>
          </nav>
        </div>
        <a href="/po-sites/sites/allocated-site-list" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
          View Allocated Sites
        </a>
      </div>
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Sheet Type <span className="text-red-500">*</span></label>
            <select
              value={sheetType}
              onChange={(e) => setSheetType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white mb-4"
              required
            >
              <option value="deployment">Deployment Sheet (tbl_deployment)</option>
              <option value="matrix">Site Matrix Sheet (tbl_site_matrix)</option>
              <option value="location">Location Mapping Sheet (tbl_location_mapping)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Site Data File (CSV)</label>
            <input 
              type="file" 
              accept=".csv"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              <span>{loading ? 'Importing...' : 'Import Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportSiteData;
