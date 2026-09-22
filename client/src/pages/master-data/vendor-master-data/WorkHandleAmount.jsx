import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Trash2 } from 'lucide-react';

const WorkHandleAmount = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    work_handling_amount: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetchList('work-handling-amount');
      } catch {
        res = await fetchList('dynamic/workhandlingamounts');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load work handling amount list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete selected work handling amount?')) {
      return;
    }

    try {
      let res;
      try {
        res = await deleteItem('work-handling-amount', id);
      } catch {
        res = await deleteItem('dynamic/workhandlingamounts', id);
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Deleted successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to delete work handling amount:', error);
      alert(error.response?.data?.message || 'Failed to delete');
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
      work_handling_amount: row.work_handling_amount || row.name || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.work_handling_amount.trim()) {
      alert('Work Handling Amount Missing! Please enter work handling amount.');
      return;
    }

    try {
      let res;
      const payload = {
        work_handling_amount: formData.work_handling_amount.trim(),
        name: formData.work_handling_amount.trim()
      };

      if (isEditing) {
        try {
          res = await updateItem('work-handling-amount', editId, payload);
        } catch {
          res = await updateItem('dynamic/workhandlingamounts', editId, payload);
        }
      } else {
        try {
          res = await createItem('work-handling-amount', payload);
        } catch {
          res = await createItem('dynamic/workhandlingamounts', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save work handling amount:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'work_handling_amount',
      label: 'Work Handling Amount Name',
      render: (row) => row.work_handling_amount || row.name || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <MasterDataTable
        title="Work Handling Amount Master List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Work Handling Amount"
        renderActions={(row) => {
          const rowId = row.id || row._id;

          return (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Work Handling Amount"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(rowId)}
                className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                title="Delete Work Handling Amount"
              >
                <Trash2 size={18} />
              </button>
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
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-lg font-bold">
                {isEditing ? 'Edit Work Handling Amount' : 'Add Work Handling Amount'}
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
                  Work Handling Amount : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="work_handling_amount"
                  value={formData.work_handling_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, work_handling_amount: e.target.value }))
                  }
                  placeholder="Enter work handling amount"
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

export default WorkHandleAmount;
