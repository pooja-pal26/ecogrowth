import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-300`}>
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h5 className="text-2xl font-bold text-gray-800">{value !== null ? value : '...'}</h5>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
    </div>
  );
};

export default DashboardCard;
