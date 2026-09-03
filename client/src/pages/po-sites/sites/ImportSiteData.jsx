import React from 'react';

const ImportSiteData = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Site Data</h1>
        <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>PO & Sites</span>
          <span>/</span>
          <span className="text-gray-700">Import Site Data</span>
        </nav>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Import Site Data Overview</h2>
      </div>
    </div>
  );
};
export default ImportSiteData;
