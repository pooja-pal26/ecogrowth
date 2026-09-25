import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem, patchItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Ban, LogIn, Trash2 } from 'lucide-react';

const WorkDescription = () => {
  const [data, setData] = useState([]);
  const [siteTypeOptions, setSiteTypeOptions] = useState([]);
  const [workNameOptions, setWorkNameOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workNameLoading, setWorkNameLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    work_type_id: '',
    work_name_id: '',
    work_description: '',
    aging_days: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch work descriptions list
      let res;
      try {
        res = await fetchList('work-descriptions');
      } catch {
        res = await fetchList('dynamic/workdescriptions');
      }
      if (res && res.success) {
        setData(res.data || []);
      }

      // 2. Fetch active site types (Work Types) for dropdown
      let typesRes;
      try {
        typesRes = await fetchList('site-types?active_only=true');
      } catch {
        typesRes = await fetchList('dynamic/sitetypes?active_only=true');
      }
      if (typesRes && typesRes.success) {
        setSiteTypeOptions(typesRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load work descriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch cascading Work Names when Site Type (Work Type) is selected
  const fetchWorksBySiteType = async (workTypeId) => {
    if (!workTypeId) {
      setWorkNameOptions([]);
      return;
    }
    setWorkNameLoading(true);
    try {
      let res;
      try {
        res = await fetchList(`works?work_type_id=${workTypeId}&active_only=true`);
      } catch {
        res = await fetchList(`dynamic/works?work_type_id=${workTypeId}`);
      }
      if (res && res.success) {
        setWorkNameOptions(res.data || []);
      } else {
        setWorkNameOptions([]);
      }
    } catch (error) {
      console.error('Failed to load works for site type:', error);
      setWorkNameOptions([]);
    } finally {
      setWorkNameLoading(false);
    }
  };

  const handleWorkTypeChange = async (e) => {
    const selectedTypeId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      work_type_id: selectedTypeId,
      work_name_id: ''
    }));
    await fetchWorksBySiteType(selectedTypeId);
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Do you want to ${action} clicked work description?`)) {
      return;
    }

    try {
      let res;
      if (action === 'delete') {
        try {
          res = await deleteItem('work-descriptions', id);
        } catch {
          res = await deleteItem('dynamic/workdescriptions', id);
        }
      } else {
        try {
          res = await patchItem(`work-descriptions/${id}/status`, '', { type: action });
        } catch {
          res = await updateItem('dynamic/workdescriptions', id, { status: action === 'activate' ? '1' : '0' });
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Action completed successfully');
      }
      loadData();
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
      alert(error.response?.data?.message || `Failed to ${action} item`);
    }
  };

  const handleAdd = () => {
    setFormData(initialForm);
    setWorkNameOptions([]);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (row) => {
    const typeId = String(row.work_type_id || row.work_type || '');
    const nameId = String(row.work_name_id || row.work_name || '');

    setFormData({
      work_type_id: typeId,
      work_name_id: nameId,
      work_description: row.work_description || row.description || '',
      aging_days: row.aging_days !== undefined ? String(row.aging_days) : ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);

    if (typeId) {
      await fetchWorksBySiteType(typeId);
    } else {
      setWorkNameOptions([]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.work_type_id) {
      alert('Work Type Missing! Please select work type.');
      return;
    }

    if (!formData.work_name_id) {
      alert('Work Name Missing! Please select work name.');
      return;
    }

    if (!formData.work_description.trim()) {
      alert('Work Description Missing! Please enter work description.');
      return;
    }

    try {
      let res;
      const payload = {
        work_type_id: formData.work_type_id,
        work_type: formData.work_type_id,
        work_name_id: formData.work_name_id,
        work_name: formData.work_name_id,
        work_description: formData.work_description.trim(),
        description: formData.work_description.trim(),
        aging_days: formData.aging_days ? Number(formData.aging_days) : 0
      };

      if (isEditing) {
        try {
          res = await updateItem('work-descriptions', editId, payload);
        } catch {
          res = await updateItem('dynamic/workdescriptions', editId, payload);
        }
      } else {
        try {
          res = await createItem('work-descriptions', payload);
        } catch {
          res = await createItem('dynamic/workdescriptions', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save work description:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'site_type',
      label: 'Work Type',
      render: (row) => row.site_type || row.work_type || '-'
    },
    {
      key: 'work_name',
      label: 'Work Name',
      render: (row) => row.work_name || '-'
    },
    {
      key: 'work_description',
      label: 'Work Description',
      render: (row) => row.work_description || row.description || '-'
    },
    {
      key: 'aging_days',
      label: 'Aging Days',
      render: (row) => (row.aging_days !== undefined && row.aging_days !== null ? row.aging_days : '0')
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isActive = row.is_active === '1' || row.is_active === 1 || row.is_active === true;
        return (
          <span
            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
              isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            {isActive ? 'Active' : 'Deactive'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-3">
      <MasterDataTable
        title="Work Description List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Work Description"
        renderActions={(row) => {
          const rowId = row.id || row._id;
          const isActive = row.is_active === '1' || row.is_active === 1 || row.is_active === true;

          return (
            <div className="flex items-center space-x-3">
              {/* Edit Icon */}
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Work Description"
              >
                <Pencil size={18} />
              </button>

              {/* Status Toggle Icon */}
              {isActive ? (
                <button
                  onClick={() => handleAction(rowId, 'deactivate')}
                  className="transition-transform hover:scale-110"
                  style={{ color: '#D66F00' }}
                  title="Deactivate Work Type"
                >
                  <Ban size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAction(rowId, 'activate')}
                    className="transition-transform hover:scale-110"
                    style={{ color: '#1DAA29' }}
                    title="Activate Work Type"
                  >
                    <LogIn size={18} />
                  </button>
                  <button
                    onClick={() => handleAction(rowId, 'delete')}
                    className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                    title="Delete Work Type"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          );
        }}
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header with gradient */}
            <div
              className="px-4 py-2.5 flex items-center justify-between text-white min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-base font-bold tracking-tight">
                {isEditing ? 'Edit Work Description' : 'Add Work Description'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Work Type (Site Type) Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Type : <span className="text-red-500">*</span>
                </label>
                <select
                  name="work_type_id"
                  value={formData.work_type_id}
                  onChange={handleWorkTypeChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Work Type</option>
                  {siteTypeOptions.map((opt) => (
                    <option key={opt.id || opt._id} value={opt.id || opt._id}>
                      {opt.site_type || opt.work_type || opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Name Dropdown (Cascading) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Name : <span className="text-red-500">*</span>
                  {workNameLoading && <span className="text-xs text-teal-600 ml-2 animate-pulse">Loading...</span>}
                </label>
                <select
                  name="work_name_id"
                  value={formData.work_name_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_name_id: e.target.value }))
                  }
                  disabled={!formData.work_type_id || workNameLoading}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Work Name</option>
                  {workNameOptions.map((opt) => (
                    <option key={opt.id || opt._id} value={opt.id || opt._id}>
                      {opt.work_name || opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Description Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Description : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="work_description"
                  value={formData.work_description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_description: e.target.value }))
                  }
                  placeholder="Enter Work Description"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Aging Days Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aging Days :
                </label>
                <input
                  type="text"
                  name="aging_days"
                  value={formData.aging_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aging_days: e.target.value.replace(/[^0-9]/g, '')
                    }))
                  }
                  placeholder="Enter Work Aging Days"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-medium rounded-lg shadow-md transition-all hover:opacity-95"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
                  }}
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDescription;
