import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem, patchItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Ban, LogIn, Trash2 } from 'lucide-react';

const ExpenseType = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    expense_type: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetchList('expense-types');
      } catch {
        res = await fetchList('dynamic/expensetypes');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load expense types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Do you want to ${action} clicked expense type?`)) {
      return;
    }

    try {
      let res;
      if (action === 'delete') {
        try {
          res = await deleteItem('expense-types', id);
        } catch {
          res = await deleteItem('dynamic/expensetypes', id);
        }
      } else {
        try {
          res = await patchItem(`expense-types/${id}/status`, '', { type: action });
        } catch {
          res = await updateItem('dynamic/expensetypes', id, { status: action === 'activate' ? '1' : '0' });
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || `${action.toUpperCase()} successfully.`);
      }
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} expense type.`);
    }
  };

  const columns = [
    {
      key: 'expense_type',
      label: 'Expense Type',
      render: (row) => row.expense_type || row.name || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isActive =
          row.status === true ||
          row.status === '1' ||
          row.status === 1 ||
          row.is_active === true;
        return isActive ? 'Active' : 'Deactive';
      }
    }
  ];

  const renderActions = (row) => {
    const isActive =
      row.status === true ||
      row.status === '1' ||
      row.status === 1 ||
      row.is_active === true;

    const id = row.id || row._id;

    return (
      <div className="flex items-center justify-center space-x-3">
        {isActive ? (
          <>
            <button
              onClick={() => handleEdit(row)}
              className="p-1 hover:opacity-80 transition-opacity"
              title="Edit Expense Type"
            >
              <Pencil size={15} style={{ color: '#1DAA29' }} />
            </button>
            <button
              onClick={() => handleAction(id, 'deactivate')}
              className="p-1 hover:opacity-80 transition-opacity"
              title="Deactivate Expense Type"
            >
              <Ban size={15} style={{ color: '#D66F00' }} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleAction(id, 'activate')}
              className="p-1 hover:opacity-80 transition-opacity"
              title="Activate Expense Type"
            >
              <LogIn size={15} style={{ color: '#1DAA29' }} />
            </button>
            <button
              onClick={() => handleAction(id, 'delete')}
              className="p-1 hover:opacity-80 transition-opacity"
              title="Delete Expense Type"
            >
              <Trash2 size={15} style={{ color: 'red' }} />
            </button>
          </>
        )}
      </div>
    );
  };

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      expense_type: row.expense_type || row.name || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.expense_type || formData.expense_type.trim() === '') {
      alert('Expense Type Missing! Please enter expense type.');
      return;
    }

    try {
      const payload = {
        expense_type: formData.expense_type.trim(),
        name: formData.expense_type.trim()
      };

      let res;
      if (isEditing) {
        try {
          res = await updateItem('expense-types', editId, payload);
        } catch {
          res = await updateItem('dynamic/expensetypes', editId, payload);
        }
      } else {
        try {
          res = await createItem('expense-types', payload);
        } catch {
          res = await createItem('dynamic/expensetypes', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || (isEditing ? 'Updated Successfully' : 'Saved Successfully'));
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save expense type');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Expense Type"
        addButtonText="Add Expense Type"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        renderActions={renderActions}
        loading={loading}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background:
                  'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">
                {isEditing ? 'Edit Expense Type' : 'Add Expense Type'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expense Type :
                </label>
                <input
                  type="text"
                  name="expenseType"
                  id="expenseType"
                  value={formData.expense_type}
                  onChange={(e) =>
                    setFormData({ expense_type: e.target.value })
                  }
                  placeholder="Enter Expense Type"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 via-cyan-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:opacity-95 shadow-sm active:scale-95 transition-all"
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseType;
