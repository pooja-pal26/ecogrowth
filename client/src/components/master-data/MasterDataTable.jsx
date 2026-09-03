import React, { useState } from 'react';
import { Edit, Trash2, Plus, Download } from 'lucide-react';

const MasterDataTable = ({ 
  title, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete, 
  onExport 
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
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer">Master Data</span>
            <span>/</span>
            <span className="text-gray-700">{title}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-slate-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-medium">{title} List</h2>
          <div className="flex gap-2">
            {onExport && (
              <button 
                onClick={onExport}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Download size={16} /> Excel
              </button>
            )}
            {onAdd && (
              <button 
                onClick={onAdd}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Add New
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>Show</span>
              <select 
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-2 border border-gray-300 rounded p-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Search:</label>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-sm text-left text-gray-600 whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 font-semibold">{col.label}</th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-4 py-3 font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={row._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">{(currentPage - 1) * entries + index + 1}</td>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                      {(onEdit || onDelete) && (
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {onEdit && (
                              <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800">
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button onClick={() => onDelete(row._id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-6 text-center text-gray-500 bg-gray-50/50">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
              Showing {filteredData.length > 0 ? (currentPage - 1) * entries + 1 : 0} to {Math.min(currentPage * entries, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
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
