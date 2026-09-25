import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileSpreadsheet, List } from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const ImportSiteData = () => {
  const [file, setFile] = useState(null);
  const [sheetType, setSheetType] = useState('Matrix');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sheetType) {
      showErrorToast('Please select type of sheet.', 'Validation Error');
      return;
    }
    if (!file) {
      showErrorToast('Please select an Excel / CSV file first.', 'File Missing');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetType', sheetType.toLowerCase());

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/po-sites/import-sites', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data && res.data.success) {
        showSuccessToast(res.data.message || 'Site data imported successfully!', 'Import Success');
        setFile(null);
        const fileInput = document.getElementById('uploaded_excel');
        if (fileInput) fileInput.value = '';
      } else {
        showErrorToast(res.data?.message || 'Error importing site data file.', 'Import Failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      showErrorToast(error.response?.data?.message || 'Error importing site data file.', 'Import Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto">
      {/* Main Panel */}
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Upload size={18} className="text-cyan-200" />
            <h2 className="text-base font-bold tracking-wide">Import Site Data</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/excel/matrix.xls"
              download="matrix.xls"
              className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
              title="Download Matrix Template Sheet"
            >
              <FileSpreadsheet size={14} />
              <span>Matrix Sheet</span>
            </a>
            <Link
              to="/po-sites/sites/allocated-site-list"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
            >
              <List size={14} />
              <span>View Allocated Sites</span>
            </Link>
          </div>
        </div>

        {/* Panel Body - Normal White Background */}
        <div className="p-5 sm:p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="type_of_sheet" className="block text-xs font-bold text-gray-700 mb-1">
                  Type of Sheet <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  id="type_of_sheet"
                  name="type_of_sheet"
                  value={sheetType}
                  onChange={(e) => setSheetType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-800"
                  required
                >
                  <option value="">Please Select</option>
                  <option value="Matrix">Matrix Sheet</option>
                  <option value="Deployment">Deployment Sheet</option>
                  <option value="Location">Location Sheet</option>
                </select>
              </div>

              <div>
                <label htmlFor="uploaded_excel" className="block text-xs font-bold text-gray-700 mb-1">
                  Upload Excel File <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="file"
                  id="uploaded_excel"
                  name="uploaded_excel"
                  accept=".xls,.xlsx,.csv"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-6 py-2 rounded transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>{loading ? 'Importing...' : 'Import'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportSiteData;
