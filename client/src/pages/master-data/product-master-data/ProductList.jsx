import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Trash2 } from 'lucide-react';

const ProductList = () => {
  const [data, setData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    product_name: '',
    product_type_id: '',
    unit: '',
    price: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      let res;
      try {
        res = await fetchList('products');
      } catch {
        res = await fetchList('dynamic/products');
      }
      if (res && res.success) {
        setData(res.data || []);
      }

      // 2. Fetch Product Types
      let typesRes;
      try {
        typesRes = await fetchList('product-types');
      } catch {
        typesRes = await fetchList('dynamic/producttypes');
      }
      if (typesRes && typesRes.success) {
        setProductTypes(typesRes.data || []);
      }

      // 3. Fetch Product Units
      let unitsRes;
      try {
        unitsRes = await fetchList('product-units');
      } catch {
        unitsRes = await fetchList('dynamic/productunits');
      }
      if (unitsRes && unitsRes.success) {
        setProductUnits(unitsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const name = row.product_name || row.name || 'clicked product';

    if (!window.confirm(`Do you want to delete clicked product?`)) {
      return;
    }

    try {
      let res;
      try {
        res = await deleteItem('products', id);
      } catch {
        res = await deleteItem('dynamic/products', id);
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Product deleted successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
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
      product_name: row.product_name || row.name || '',
      product_type_id: String(row.product_type_id || ''),
      unit: row.unit || '',
      price: row.price !== undefined ? String(row.price) : ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_type_id) {
      alert('Product Type Missing! Please select product category / type.');
      return;
    }
    if (!formData.product_name.trim()) {
      alert('Product Name Missing! Please enter product name.');
      return;
    }
    if (!formData.unit) {
      alert('Product Unit Missing! Please select product unit.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      alert('Price Missing! Please enter a valid product price.');
      return;
    }

    try {
      let res;
      const payload = {
        product_name: formData.product_name.trim(),
        name: formData.product_name.trim(),
        product_type_id: String(formData.product_type_id),
        product_category: String(formData.product_type_id),
        unit: formData.unit,
        price: String(formData.price)
      };

      if (isEditing) {
        try {
          res = await updateItem('products', editId, payload);
        } catch {
          res = await updateItem('dynamic/products', editId, payload);
        }
      } else {
        try {
          res = await createItem('products', payload);
        } catch {
          res = await createItem('dynamic/products', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'product_name',
      label: 'Product Name',
      render: (row) => row.product_name || row.name || '-'
    },
    {
      key: 'product_type_name',
      label: 'Product Type',
      render: (row) => row.product_type_name || row.product_type || '-'
    },
    {
      key: 'unit',
      label: 'Product Unit',
      render: (row) => row.unit || '-'
    },
    {
      key: 'price',
      label: 'Price/Unit',
      render: (row) => (row.price !== undefined && row.price !== null ? `₹ ${row.price}` : '-')
    }
  ];

  return (
    <div className="space-y-6">
      <MasterDataTable
        title="Product List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Product"
        renderActions={(row) => {
          return (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Product"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                title="Delete Product"
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
                {isEditing ? 'Edit Product' : 'Add New Product'}
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
                  Product Type : <span className="text-red-500">*</span>
                </label>
                <select
                  name="product_type_id"
                  value={formData.product_type_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, product_type_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Product Category</option>
                  {productTypes.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id}>
                      {t.product_type_name || t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, product_name: e.target.value }))
                  }
                  placeholder="Enter Product Name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Unit : <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select product unit</option>
                    {productUnits.map((u) => (
                      <option key={u.id || u._id} value={u.unit_name || u.name}>
                        {u.unit_name || u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price (INR) : <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="Enter Price"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
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

export default ProductList;
