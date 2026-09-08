import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

const ImportSiteData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file first.');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      setMessage(null);
      const res = await axios.post('http://localhost:5000/api/po-sites/import-sites', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Site Data</h1>
      </div>
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
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
