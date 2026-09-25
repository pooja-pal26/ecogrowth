import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Trash2 } from 'lucide-react';

const ProductUnit = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    unit_name: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetchList('product-units');
      } catch {
        res = await fetchList('dynamic/productunits');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load product units:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const name = row.unit_name || row.name || 'selected product unit';

    if (!window.confirm(`Do you want to delete ${name} from product unit?`)) {
      return;
    }

    try {
      let res;
      try {
        res = await deleteItem('product-units', id);
      } catch {
        res = await deleteItem('dynamic/productunits', id);
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Deleted successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to delete product unit:', error);
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
      unit_name: row.unit_name || row.name || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.unit_name.trim()) {
      alert('Product Unit Missing! Please enter product unit.');
      return;
    }

    try {
      let res;
      const payload = {
        unit_name: formData.unit_name.trim(),
        name: formData.unit_name.trim()
      };

      if (isEditing) {
        try {
          res = await updateItem('product-units', editId, payload);
        } catch {
          res = await updateItem('dynamic/productunits', editId, payload);
        }
      } else {
        try {
          res = await createItem('product-units', payload);
        } catch {
          res = await createItem('dynamic/productunits', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save product unit:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'unit_name',
      label: 'Product Unit',
      render: (row) => row.unit_name || row.name || '-'
    }
  ];

  return (
    <div className="space-y-3">
      <MasterDataTable
        title="Product Unit List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Product Unit"
        renderActions={(row) => {
          return (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Product Unit"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                title="Delete Product Unit"
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
              className="px-4 py-2.5 flex items-center justify-between text-white min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-base font-bold tracking-tight">
                {isEditing ? 'Edit Product Unit' : 'Add Product Unit'}
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
                  Product Unit : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit_name"
                  value={formData.unit_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit_name: e.target.value }))
                  }
                  placeholder="Enter product unit"
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

export default ProductUnit;
