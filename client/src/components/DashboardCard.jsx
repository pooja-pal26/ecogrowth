import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 p-3.5 sm:p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 cursor-pointer w-full h-full select-none">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 shadow-xs`}>
        <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <h5 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight truncate">
          {value !== null && value !== undefined ? value : '0'}
        </h5>
        <span
          className="block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-tight mt-0.5 leading-snug break-words"
          title={title}
        >
          {title}
        </span>
      </div>
    </div>
  );
};

export default DashboardCard;
