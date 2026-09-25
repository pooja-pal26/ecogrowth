import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem, patchItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Ban, LogIn, Trash2 } from 'lucide-react';

const WorkForSiteOf = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    work_for_site_of_name: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetchList('work-for-site-of');
      } catch {
        res = await fetchList('dynamic/workforsiteofs');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load work for site of list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Do you want to ${action} clicked work for site of?`)) {
      return;
    }

    try {
      let res;
      if (action === 'delete') {
        try {
          res = await deleteItem('work-for-site-of', id);
        } catch {
          res = await deleteItem('dynamic/workforsiteofs', id);
        }
      } else {
        try {
          res = await patchItem(`work-for-site-of/${id}/status`, '', { type: action });
        } catch {
          res = await updateItem('dynamic/workforsiteofs', id, { status: action === 'activate' ? '1' : '0' });
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
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      work_for_site_of_name: row.work_for_site_of_name || row.name || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.work_for_site_of_name.trim()) {
      alert('Work For Missing! Please enter work for site of.');
      return;
    }

    try {
      let res;
      const payload = {
        work_for_site_of_name: formData.work_for_site_of_name.trim(),
        work_for: formData.work_for_site_of_name.trim()
      };

      if (isEditing) {
        try {
          res = await updateItem('work-for-site-of', editId, payload);
        } catch {
          res = await updateItem('dynamic/workforsiteofs', editId, payload);
        }
      } else {
        try {
          res = await createItem('work-for-site-of', payload);
        } catch {
          res = await createItem('dynamic/workforsiteofs', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save work for site of:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'work_for_site_of_name',
      label: 'Work For Site Of Name',
      render: (row) => row.work_for_site_of_name || row.name || '-'
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
        title="Work For Site Of List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Work For Site Of"
        renderActions={(row) => {
          const rowId = row.id || row._id;
          const isActive = row.is_active === '1' || row.is_active === 1 || row.is_active === true;

          return (
            <div className="flex items-center space-x-3">
              {/* Edit Icon */}
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Work For Site Of"
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
                {isEditing ? 'Edit Work For Site Of' : 'Add Work For Site Of'}
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work For Site Of : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="work_for_site_of_name"
                  value={formData.work_for_site_of_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_for_site_of_name: e.target.value }))
                  }
                  placeholder="Enter work for site of"
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

export default WorkForSiteOf;
