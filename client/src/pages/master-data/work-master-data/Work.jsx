import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem, patchItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Ban, LogIn, Trash2 } from 'lucide-react';

const Work = () => {
  const [data, setData] = useState([]);
  const [workForOptions, setWorkForOptions] = useState([]);
  const [siteTypeOptions, setSiteTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [siteTypeLoading, setSiteTypeLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    work_for_id: '',
    work_type_id: '',
    work_name: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch works list
      let res;
      try {
        res = await fetchList('works');
      } catch {
        res = await fetchList('dynamic/works');
      }
      if (res && res.success) {
        setData(res.data || []);
      }

      // 2. Fetch active work for site of for dropdown
      let workForRes;
      try {
        workForRes = await fetchList('work-for-site-of?active_only=true');
      } catch {
        workForRes = await fetchList('dynamic/workforsiteofs?active_only=true');
      }
      if (workForRes && workForRes.success) {
        setWorkForOptions(workForRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load works list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch cascading Site Types when Work For is selected
  const fetchSiteTypesByWorkFor = async (workForId) => {
    if (!workForId) {
      setSiteTypeOptions([]);
      return;
    }
    setSiteTypeLoading(true);
    try {
      let res;
      try {
        res = await fetchList(`site-types?work_for_id=${workForId}&active_only=true`);
      } catch {
        res = await fetchList(`dynamic/sitetypes?work_for_id=${workForId}`);
      }
      if (res && res.success) {
        setSiteTypeOptions(res.data || []);
      } else {
        setSiteTypeOptions([]);
      }
    } catch (error) {
      console.error('Failed to load site types for work for:', error);
      setSiteTypeOptions([]);
    } finally {
      setSiteTypeLoading(false);
    }
  };

  const handleWorkForChange = async (e) => {
    const selectedWorkForId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      work_for_id: selectedWorkForId,
      work_type_id: ''
    }));
    await fetchSiteTypesByWorkFor(selectedWorkForId);
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Do you want to ${action} clicked work?`)) {
      return;
    }

    try {
      let res;
      if (action === 'delete') {
        try {
          res = await deleteItem('works', id);
        } catch {
          res = await deleteItem('dynamic/works', id);
        }
      } else {
        try {
          res = await patchItem(`works/${id}/status`, '', { type: action });
        } catch {
          res = await updateItem('dynamic/works', id, { status: action === 'activate' ? '1' : '0' });
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
    setSiteTypeOptions([]);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (row) => {
    const workForId = String(row.work_for_id || '');
    const workTypeId = String(row.work_type_id || row.work_type || '');

    setFormData({
      work_for_id: workForId,
      work_type_id: workTypeId,
      work_name: row.work_name || row.name || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);

    if (workForId) {
      await fetchSiteTypesByWorkFor(workForId);
    } else {
      setSiteTypeOptions([]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.work_for_id) {
      alert('Site Work For Missing! Please select site work for.');
      return;
    }

    if (!formData.work_type_id) {
      alert('Site Type Missing! Please select site type.');
      return;
    }

    if (!formData.work_name.trim()) {
      alert('Work Missing! Please enter work.');
      return;
    }

    try {
      let res;
      const payload = {
        work_for_id: formData.work_for_id,
        work_type_id: formData.work_type_id,
        work_type: formData.work_type_id,
        work_name: formData.work_name.trim(),
        name: formData.work_name.trim()
      };

      if (isEditing) {
        try {
          res = await updateItem('works', editId, payload);
        } catch {
          res = await updateItem('dynamic/works', editId, payload);
        }
      } else {
        try {
          res = await createItem('works', payload);
        } catch {
          res = await createItem('dynamic/works', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save work:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'work_for_site_of_name',
      label: 'Site Of',
      render: (row) => row.work_for_site_of_name || row.site_of || '-'
    },
    {
      key: 'site_type',
      label: 'Site Type',
      render: (row) => row.site_type || row.work_type || '-'
    },
    {
      key: 'work_name',
      label: 'Work',
      render: (row) => row.work_name || row.name || '-'
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
        title="Work List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Work"
        renderActions={(row) => {
          const rowId = row.id || row._id;
          const isActive = row.is_active === '1' || row.is_active === 1 || row.is_active === true;

          return (
            <div className="flex items-center space-x-3">
              {/* Edit Icon */}
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Work"
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
                {isEditing ? 'Edit Work' : 'Add Work'}
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
              {/* Site Work For Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Work For : <span className="text-red-500">*</span>
                </label>
                <select
                  name="work_for_id"
                  value={formData.work_for_id}
                  onChange={handleWorkForChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Work Type</option>
                  {workForOptions.map((opt) => (
                    <option key={opt.id || opt._id} value={opt.id || opt._id}>
                      {opt.work_for_site_of_name || opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Type Dropdown (Cascading) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Type : <span className="text-red-500">*</span>
                  {siteTypeLoading && <span className="text-xs text-teal-600 ml-2 animate-pulse">Loading...</span>}
                </label>
                <select
                  name="work_type_id"
                  value={formData.work_type_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_type_id: e.target.value }))
                  }
                  disabled={!formData.work_for_id || siteTypeLoading}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Site Type</option>
                  {siteTypeOptions.map((opt) => (
                    <option key={opt.id || opt._id} value={opt.id || opt._id}>
                      {opt.site_type || opt.work_type || opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Name Text Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="work_name"
                  value={formData.work_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_name: e.target.value }))
                  }
                  placeholder="Enter Work Name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
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

export default Work;
