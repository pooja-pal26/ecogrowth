import React from 'react';

const MaterialStock = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Material Stock</h1>
        <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <span>/</span>
          <span className="text-gray-700">Material Stock</span>
        </nav>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Material Stock Overview</h2>
        <div className="text-gray-500 flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <p>Material Stock Module - Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default MaterialStock;
