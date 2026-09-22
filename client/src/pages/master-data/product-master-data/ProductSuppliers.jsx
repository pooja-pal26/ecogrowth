import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import { X, Pencil, Trash2 } from 'lucide-react';

const ProductSuppliers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    name: '',
    contact_1: '',
    contact_2: '',
    gst_number: '',
    address: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetchList('product-suppliers');
      } catch {
        res = await fetchList('dynamic/productsupplierss');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load supplier list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    const name = row.name || row.supplier_name || 'selected supplier';

    if (!window.confirm(`Do you want to delete ${name} from supplier list ?`)) {
      return;
    }

    try {
      let res;
      try {
        res = await deleteItem('product-suppliers', id);
      } catch {
        res = await deleteItem('dynamic/productsupplierss', id);
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Supplier deleted successfully');
      }
      loadData();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
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
      name: row.name || row.supplier_name || '',
      contact_1: row.contact_1 || row.mobile_no || '',
      contact_2: row.contact_2 || row.alternate_mobie || '',
      gst_number: row.gst_number || row.gst_no || '',
      address: row.address || ''
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Supplier Name Missing! Please enter supplier name.');
      return;
    }
    if (!formData.contact_1.trim()) {
      alert('Mobile Number Missing! Please enter mobile number.');
      return;
    }
    if (!formData.gst_number.trim()) {
      alert('GST Number Missing! Please enter GST number.');
      return;
    }
    if (!formData.address.trim()) {
      alert('Address Missing! Please enter address.');
      return;
    }

    try {
      let res;
      const payload = {
        name: formData.name.trim(),
        supplier_name: formData.name.trim(),
        contact_1: formData.contact_1.trim(),
        mobile_no: formData.contact_1.trim(),
        contact_2: formData.contact_2.trim(),
        alternate_mobie: formData.contact_2.trim(),
        gst_number: formData.gst_number.trim(),
        gst_no: formData.gst_number.trim(),
        address: formData.address.trim()
      };

      if (isEditing) {
        try {
          res = await updateItem('product-suppliers', editId, payload);
        } catch {
          res = await updateItem('dynamic/productsupplierss', editId, payload);
        }
      } else {
        try {
          res = await createItem('product-suppliers', payload);
        } catch {
          res = await createItem('dynamic/productsupplierss', payload);
        }
      }

      if (res && (res.message || res.title)) {
        alert(res.message || 'Saved successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save supplier:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Supplier Name',
      render: (row) => row.name || row.supplier_name || '-'
    },
    {
      key: 'contact_1',
      label: 'Mobile Number',
      render: (row) => row.contact_1 || row.mobile_no || '-'
    },
    {
      key: 'gst_number',
      label: 'GST Number',
      render: (row) => row.gst_number || row.gst_no || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <MasterDataTable
        title="Supplier(s) List"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        addButtonText="Add Supplier"
        renderActions={(row) => {
          return (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Supplier"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                title="Delete Supplier"
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header with gradient */}
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              <h3 className="text-lg font-bold">
                {isEditing ? 'Edit Supplier' : 'Add Supplier'}
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
                  Supplier Name : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter Supplier Name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number : <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_1"
                    value={formData.contact_1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_1: e.target.value.replace(/[^0-9]/g, '')
                      }))
                    }
                    placeholder="Enter Supplier Mobile Number"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alternate Mobile Number :
                  </label>
                  <input
                    type="text"
                    name="contact_2"
                    value={formData.contact_2}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_2: e.target.value.replace(/[^0-9]/g, '')
                      }))
                    }
                    placeholder="Enter Alternate Mobile Number"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GST Number : <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gst_number: e.target.value.toUpperCase() }))
                  }
                  placeholder="Enter GST Number"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address : <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Enter Address"
                  rows={3}
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

export default ProductSuppliers;
