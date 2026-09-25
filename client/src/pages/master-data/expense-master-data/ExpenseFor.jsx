import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem, patchItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Ban, LogIn, Trash2 } from 'lucide-react';

const ExpenseFor = () => {
  const [data, setData] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseInOptions, setExpenseInOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inLoading, setInLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    expense_type_id: '',
    expense_in_id: '',
    expense_transfer_for: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Load Main Data and Expense Types
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Expense For List
      let forRes;
      try {
        forRes = await fetchList('expense-fors');
      } catch {
        forRes = await fetchList('dynamic/expensefors');
      }
      if (forRes && forRes.success) {
        setData(forRes.data || []);
      }

      // 2. Fetch Active Expense Types for dropdown
      let typesRes;
      try {
        typesRes = await fetchList('expense-types?active_only=true');
      } catch {
        typesRes = await fetchList('dynamic/expensetypes?active_only=true');
      }
      if (typesRes && typesRes.success) {
        setExpenseTypes(typesRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load expense transfer for list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch cascading Expense In options by Expense Type ID
  const fetchExpenseInByType = async (typeId) => {
    if (!typeId) {
      setExpenseInOptions([]);
      return;
    }
    setInLoading(true);
    try {
      let res;
      try {
        res = await fetchList(`expense-ins?expense_type_id=${typeId}&active_only=true`);
      } catch {
        res = await fetchList(`dynamic/expenseins?expense_type_id=${typeId}`);
      }
      if (res && res.success) {
        setExpenseInOptions(res.data || []);
      } else {
        setExpenseInOptions([]);
      }
    } catch (error) {
      console.error('Failed to load expense in options:', error);
      setExpenseInOptions([]);
    } finally {
      setInLoading(false);
    }
  };

  // When user changes Expense Type dropdown in form
  const handleExpenseTypeChange = async (e) => {
    const selectedTypeId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      expense_type_id: selectedTypeId,
      expense_in_id: ''
    }));
    await fetchExpenseInByType(selectedTypeId);
  };

  // Activate / Deactivate / Delete handling (Matches PHP editDeactivateActivateDeleteExpenseTransferFor)
  const handleAction = async (id, action) => {
    if (!window.confirm(`Do you want to ${action} clicked transfer for?`)) {
      return;
    }

    try {
      let res;
      if (action === 'delete') {
        try {
          res = await deleteItem('expense-fors', id);
        } catch {
          res = await deleteItem('dynamic/expensefors', id);
        }
      } else {
        try {
          res = await patchItem(`expense-fors/${id}/status`, '', { type: action });
        } catch {
          res = await updateItem('dynamic/expensefors', id, { status: action === 'activate' ? '1' : '0' });
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || `${action.toUpperCase()} successfully.`);
      }
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} expense transfer for.`);
    }
  };

  // Table Columns (Notice # is handled by MasterDataTable automatically)
  const columns = [
    {
      key: 'expense_type',
      label: 'Expense Type',
      render: (row) => row.expense_type_name || row.expense_type || '-'
    },
    {
      key: 'expense_in',
      label: 'Expense In',
      render: (row) => row.expense_in_name || row.expense_in_type || '-'
    },
    {
      key: 'expense_transfer_for',
      label: 'Expense For',
      render: (row) => row.expense_transfer_for || row.name || '-'
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

  // Action Column rendering (Matches PHP: Active -> Edit & Deactivate; Deactive -> Activate & Delete)
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

  // Open Add Modal
  const handleAdd = () => {
    setFormData(initialForm);
    setExpenseInOptions([]);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal (Loads matching Expense In Type options for that Expense Type)
  const handleEdit = async (row) => {
    const typeId = String(row.expense_type_id || '');
    const inId = String(row.expense_in_id || '');

    setFormData({
      expense_type_id: typeId,
      expense_in_id: inId,
      expense_transfer_for: row.expense_transfer_for || row.name || ''
    });

    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);

    if (typeId) {
      await fetchExpenseInByType(typeId);
    }
  };

  // Submit Add or Edit Form (Matches PHP validation and alerts)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.expense_type_id || formData.expense_type_id === '') {
      alert('Expense Type Missing! Please select expense type.');
      return;
    }
    if (!formData.expense_in_id || formData.expense_in_id === '') {
      alert('Expense In Missing! Please select expense in.');
      return;
    }
    if (!formData.expense_transfer_for || formData.expense_transfer_for.trim() === '') {
      alert('Transfer For Missing! Please enter expense transfer for.');
      return;
    }

    try {
      const payload = {
        expense_type_id: String(formData.expense_type_id),
        expense_in_id: String(formData.expense_in_id),
        expense_transfer_for: formData.expense_transfer_for.trim(),
        name: formData.expense_transfer_for.trim()
      };

      let res;
      if (isEditing) {
        try {
          res = await updateItem('expense-fors', editId, payload);
        } catch {
          res = await updateItem('dynamic/expensefors', editId, payload);
        }
      } else {
        try {
          res = await createItem('expense-fors', payload);
        } catch {
          res = await createItem('dynamic/expensefors', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || (isEditing ? 'Updated Successfully' : 'Saved Successfully'));
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save expense transfer for.');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Expense Transfer For"
        addButtonText="Add Expense Transfer For"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        renderActions={renderActions}
        loading={loading}
      />

      {/* Add / Edit Expense Transfer For Modal (Matches PHP addExpenseTransferForModal & editExpenseTransferForModal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div
              className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
              style={{
                background:
                  'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="font-bold text-base tracking-tight">
                {isEditing ? 'Edit Expense In Type' : 'Add Expense Transfer For'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* 1. Expense Type Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expense Type :
                </label>
                <select
                  name="expenseTypeId"
                  id="expenseTypeId"
                  value={formData.expense_type_id}
                  onChange={handleExpenseTypeChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Please Select</option>
                  {expenseTypes.map((et) => (
                    <option key={et.id || et._id} value={String(et.id || et._id)}>
                      {et.expense_type || et.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Expense In Type Select (Cascading based on Expense Type) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expense In Type :
                </label>
                <select
                  name="expenseInId"
                  id="expenseInId"
                  value={formData.expense_in_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expense_in_id: e.target.value }))
                  }
                  disabled={!formData.expense_type_id || inLoading}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">Please Select</option>
                  {expenseInOptions.map((ei) => (
                    <option key={ei.id || ei._id} value={String(ei.id || ei._id)}>
                      {ei.expense_in_type || ei.name}
                    </option>
                  ))}
                </select>
                {inLoading && (
                  <p className="text-xs text-teal-600 mt-1">Loading expense in options...</p>
                )}
              </div>

              {/* 3. Expense Transfer For Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expense Transfer For :
                </label>
                <input
                  type="text"
                  name="expenseTransferfor"
                  id="expenseTransferfor"
                  value={formData.expense_transfer_for}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expense_transfer_for: e.target.value }))
                  }
                  placeholder="Enter Expense Transfer For"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Modal Footer / Save or Update Button */}
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

export default ExpenseFor;
  