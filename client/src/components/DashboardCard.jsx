import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className={`group bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 transition-all duration-300 hover:bg-blue-900 hover:shadow-md cursor-pointer`}>
      <div className={`p-4 rounded-full ${colorClass} group-hover:bg-blue-800 transition-colors duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h5 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
          {value !== null && value !== undefined ? value : '...'}
        </h5>
        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-100 uppercase tracking-wide transition-colors duration-300">
          {title}
        </span>
      </div>
    </div>
  );
};

export default DashboardCard;
