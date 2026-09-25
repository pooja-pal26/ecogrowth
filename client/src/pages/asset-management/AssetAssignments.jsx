import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, RotateCcw, Trash2, X } from 'lucide-react';
import { fetchAssignments, fetchAssetInitData, fetchAssets, assignAsset, returnAsset } from '../../services/assetApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Swal from 'sweetalert2';

// Helper to format names to Title Case matching PHP ucwords(strtolower($user['name']))
const formatName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AssetAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Assign Asset Modal matching PHP assign-asset.phtml
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRows, setAssignRows] = useState([
    { id: 1, asset_type: '', asset_id: '', assigned_to: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asgData, initData, assetsList] = await Promise.all([
        fetchAssignments(),
        fetchAssetInitData(),
        fetchAssets()
      ]);
      setAssignments(Array.isArray(asgData) ? asgData : []);
      if (initData) {
        if (Array.isArray(initData.types)) {
          setAssetTypes(initData.types.filter(t => String(t.is_active) !== '2' && String(t.is_active) !== '0'));
        }
        if (Array.isArray(initData.employees)) {
          setUsers(initData.employees);
        }
      }
      setAllAssets(Array.isArray(assetsList) ? assetsList.filter(a => String(a.is_active) !== '2') : []);
    } catch (err) {
      console.error('Error loading asset assignments data:', err);
      showErrorToast('Failed to load assigned system details.', 'Error !');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Date to DD-MM-YYYY matching PHP date('d-m-Y', strtotime(...))
  const formatDisplayDate = (dtStr) => {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr.substring(0, 10);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format Time to HH:mm:ss matching PHP date('H:i:s', strtotime(...))
  const formatDisplayTime = (dtStr) => {
    if (!dtStr) return '';
    if (dtStr.includes(' ')) {
      const parts = dtStr.split(' ');
      if (parts[1]) return parts[1].substring(0, 8);
    }
    if (dtStr.includes('T')) {
      const parts = dtStr.split('T');
      if (parts[1]) return parts[1].substring(0, 8);
    }
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    return d.toTimeString().substring(0, 8);
  };

  // Search logic
  const filteredAssignments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return assignments;
    return assignments.filter(asg => {
      const name = (asg.assetName || asg.name || '').toLowerCase();
      const code = (asg.assetCode || asg.code || '').toLowerCase();
      const user = (asg.assignedToName || asg.user_name || '').toLowerCase();
      const assignDate = formatDisplayDate(asg.assign_date).toLowerCase();
      const returnDate = formatDisplayDate(asg.return_date).toLowerCase();
      const status = (asg.status || (asg.return_date ? 'Returned' : 'Assigned')).toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        user.includes(q) ||
        assignDate.includes(q) ||
        returnDate.includes(q) ||
        status.includes(q)
      );
    });
  }, [assignments, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / entries) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * entries;
    return filteredAssignments.slice(start, start + entries);
  }, [filteredAssignments, currentPage, entries]);

  // Open Assign Asset Modal
  const handleOpenAssign = () => {
    setAssignRows([{ id: 1, asset_type: '', asset_id: '', assigned_to: '' }]);
    setIsAssignModalOpen(true);
  };

  // Add more row matching PHP addMoreRow()
  const handleAddRow = () => {
    const nextId = assignRows.length > 0 ? Math.max(...assignRows.map(r => r.id)) + 1 : 1;
    setAssignRows(prev => [...prev, { id: nextId, asset_type: '', asset_id: '', assigned_to: '' }]);
  };

  // Delete row matching PHP deleteRow(count)
  const handleDeleteRow = (id) => {
    if (assignRows.length === 1) {
      setAssignRows([{ id: 1, asset_type: '', asset_id: '', assigned_to: '' }]);
      return;
    }
    setAssignRows(prev => prev.filter(r => r.id !== id));
  };

  // Update row value
  const handleRowChange = (id, field, value) => {
    setAssignRows(prev =>
      prev.map(row => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          if (field === 'asset_type') {
            updated.asset_id = ''; // reset asset when type changes
          }
          return updated;
        }
        return row;
      })
    );
  };

  // Submit Assign Asset matching PHP assignAssetAction & validateInputData
  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < assignRows.length; i++) {
      const row = assignRows[i];
      if (!row.asset_type) {
        showErrorToast(`Please select asset type in row ${i + 1}.`, 'Asset Type Missing !');
        return;
      }
      if (!row.asset_id) {
        showErrorToast(`Please select asset in row ${i + 1}.`, 'Asset Missing !');
        return;
      }
      if (!row.assigned_to) {
        showErrorToast(`Please select user in row ${i + 1}.`, 'User Missing !');
        return;
      }
    }

    try {
      setSubmitting(true);
      const assignmentsPayload = assignRows.map(r => ({
        asset_id: r.asset_id,
        assigned_to: r.assigned_to,
        assign_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));

      await assignAsset({ assignments: assignmentsPayload });
      showSuccessToast('Assets assigned successfully.', 'Success !');
      setIsAssignModalOpen(false);
      loadData();
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || 'Failed to assign assets.', 'Error !');
    } finally {
      setSubmitting(false);
    }
  };

  // Return Device / Return Asset matching PHP returnDevice(id)
  const handleReturnDevice = async (asg) => {
    const asgId = asg.id || asg._id;
    const assetName = asg.assetName || asg.name || 'this asset';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to return ${assetName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Return',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
      try {
        await returnAsset({
          assignment_id: asgId,
          id: asgId,
          asset_id: asg.asset_id,
          return_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
        showSuccessToast('Asset has been returned successfully.', 'Device Returned Successfully');
        loadData();
      } catch (err) {
        showErrorToast(err.response?.data?.message || err.message || 'Failed to return asset.', 'Error !');
      }
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Main Panel matching PHP asset-assignments.phtml panel-primary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          className="text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h2 className="text-base font-bold tracking-tight">Assigned System Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAssign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Assign Asset</span>
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-3.5 sm:p-4 bg-white">
          {/* Controls: Show Entries & Search matching DataTable */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 w-full">
            <div className="flex items-center text-xs text-gray-600">
              <span>Show</span>
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-1.5 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-700 mr-2 shrink-0">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="border border-gray-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-56 focus:outline-none bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Table matching PHP #systemListTable in asset-assignments.phtml */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 uppercase text-xs border-b border-gray-200 font-bold">
                  <th className="px-3.5 py-2 w-12 text-center">#</th>
                  <th className="px-3.5 py-2">Name</th>
                  <th className="px-3.5 py-2">System Code</th>
                  <th className="px-3.5 py-2">Assigned To</th>
                  <th className="px-3.5 py-2">Assigned Date</th>
                  <th className="px-3.5 py-2">Assigned Time</th>
                  <th className="px-3.5 py-2">Return Date</th>
                  <th className="px-3.5 py-2">Return Time</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-400 bg-gray-50/50">
                      Loading assignments...
                    </td>
                  </tr>
                ) : paginatedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-gray-400 bg-gray-50/50">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedAssignments.map((asg, index) => {
                    const isReturned = Boolean(asg.return_date);
                    return (
                      <tr key={asg.id || asg._id || index} className="border-b border-gray-100 hover:bg-teal-50/25 transition-colors">
                        <td className="px-3.5 py-2 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * entries + index + 1}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asg.assetName || asg.name || '-'}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asg.assetCode || asg.code || '-'}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asg.assignedToName || asg.user_name || '-'}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {formatDisplayDate(asg.assign_date)}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asg.assignTime || formatDisplayTime(asg.assign_date)}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {formatDisplayDate(asg.return_date)}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-gray-800">
                          {asg.returnTime || formatDisplayTime(asg.return_date)}
                        </td>
                        <td className="px-3.5 py-2 font-medium">
                          <span className={isReturned ? 'text-gray-500 font-medium' : 'text-green-600 font-semibold'}>
                            {isReturned ? 'Returned' : 'Assigned'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          {!isReturned && (
                            <button
                              type="button"
                              onClick={() => handleReturnDevice(asg)}
                              title="Return Device"
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-3 gap-3 text-xs text-gray-500 w-full pt-2 border-t border-gray-100">
            <div>
              Showing {filteredAssignments.length > 0 ? (currentPage - 1) * entries + 1 : 0} to {Math.min(currentPage * entries, filteredAssignments.length)} of {filteredAssignments.length} entries
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 border rounded text-xs transition-colors cursor-pointer ${
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
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Asset Modal matching PHP assign-asset.phtml */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl overflow-hidden border border-gray-200">
            <div 
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">Assign Asset</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 bg-white space-y-4">
              <div>
                <span className="font-bold text-xs text-[#D60019]">
                  * Fields are mandatory.
                </span>
              </div>

              {/* Table of Rows matching PHP #assetDetailsTable */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 uppercase">
                    <tr>
                      <th className="px-3 py-2">Asset Type</th>
                      <th className="px-3 py-2">Asset</th>
                      <th className="px-3 py-2">Assigned To</th>
                      <th className="px-3 py-2 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignRows.map((row, idx) => {
                      // Filter assets available for this row's selected type
                      const typeAssets = allAssets.filter(a => {
                        if (!row.asset_type) return false;
                        return String(a.asset_type_id) === String(row.asset_type);
                      });

                      return (
                        <tr key={row.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <select
                              value={row.asset_type}
                              onChange={(e) => handleRowChange(row.id, 'asset_type', e.target.value)}
                              required
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                            >
                              <option value="">Select Asset Type</option>
                              {assetTypes.map(at => (
                                <option key={at.id || at._id} value={at.id || at._id}>
                                  {at.type || at.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-2">
                            <select
                              value={row.asset_id}
                              onChange={(e) => handleRowChange(row.id, 'asset_id', e.target.value)}
                              required
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                            >
                              <option value="">Select Asset</option>
                              {typeAssets.map(ast => (
                                <option key={ast.id || ast._id} value={ast.id || ast._id}>
                                  {ast.name} ({ast.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-2">
                            <select
                              value={row.assigned_to}
                              onChange={(e) => handleRowChange(row.id, 'assigned_to', e.target.value)}
                              required
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                            >
                              <option value="">Select User</option>
                              {users.map(u => (
                                <option key={u.id || u._id} value={u.id || u._id}>
                                  {formatName(u.name)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-2 text-center">
                            {assignRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                                title="Delete Row"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Assign More Assets button matching PHP */}
              <div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Assign More Assets</span>
                </button>
              </div>

              {/* Bottom Save & Cancel */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAssignments;
