import React, { useState } from 'react';
import { Edit, Trash2, Plus, Download } from 'lucide-react';

const MasterDataTable = ({ 
  title, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete, 
  onExport,
  addButtonText,
  renderActions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Search logic
  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / entries);
  const paginatedData = filteredData.slice((currentPage - 1) * entries, currentPage * entries);

  return (
    <div className="py-1 px-1 sm:px-2 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="text-white px-4 py-2.5 sm:px-5 sm:py-3 flex justify-between items-center shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {title.endsWith('List') ? title : `${title} List`}
          </h2>
          <div className="flex gap-2">
            {onExport && (
              <button 
                onClick={onExport}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all backdrop-blur-sm flex items-center gap-1 shadow-xs"
              >
                <Download size={15} /> Excel
              </button>
            )}
            {onAdd && (
              <button 
                onClick={onAdd}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all backdrop-blur-md flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus size={16} /> {addButtonText || 'Add New'}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 w-full">
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <span>Show</span>
              <select 
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-1.5 border border-gray-300 rounded px-1.5 py-1 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 mr-2 shrink-0">Search:</label>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-56 focus:outline-none" 
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 text-xs sm:text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-4 py-2.5 font-bold w-12">#</th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-2.5 font-bold">{col.label}</th>
                  ))}
                  {(renderActions || onEdit || onDelete) && <th className="px-4 py-2.5 font-bold text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={row._id || index} className="border-b border-gray-100 hover:bg-teal-50/25 transition-colors">
                      <td className="px-4 py-2.5 text-gray-500 font-medium">{(currentPage - 1) * entries + index + 1}</td>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-4 py-2.5 font-medium text-gray-800">
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                      {renderActions ? (
                        <td className="px-4 py-2.5 text-center">
                          {renderActions(row)}
                        </td>
                      ) : (onEdit || onDelete) ? (
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {onEdit && (
                              <button onClick={() => onEdit(row)} className="text-teal-600 hover:text-teal-800 transition-colors p-1" title="Edit">
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button onClick={() => onDelete(row._id)} className="text-rose-500 hover:text-rose-700 transition-colors p-1" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-6 text-center text-gray-400 bg-gray-50/50">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between mt-3 gap-3 text-xs sm:text-sm text-gray-500 w-full pt-2 border-t border-gray-100">
            <div>
              Showing {filteredData.length > 0 ? (currentPage - 1) * entries + 1 : 0} to {Math.min(currentPage * entries, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 border rounded-md text-xs sm:text-sm transition-colors ${
                    currentPage === i + 1 
                      ? 'border-transparent bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold shadow-xs' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDataTable;
