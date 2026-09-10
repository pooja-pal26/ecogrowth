import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const ProductSuppliers = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/productsupplierss');
      if (res.success) setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    supplier_name: '',
    contact_number: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'supplier_name', label: 'Supplier Name' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'status', label: 'Status', render: (row) => row.status ? 'Active' : 'Deactive' }
  ];

  const formFields = [
    {
        key: "supplier_name",
        label: "Supplier Name",
        type: "text",
        required: true
    },
    {
        key: "contact_number",
        label: "Contact Number",
        type: "text"
    },
    {
        key: "status",
        label: "Status",
        type: "select",
        options: [
            {
                value: true,
                label: "Active"
            },
            {
                value: false,
                label: "Deactive"
            }
        ]
    }
];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      supplier_name: row.supplier_name,
      contact_number: row.contact_number,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/productsupplierss', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/productsupplierss', editId, formData);
      } else {
        await createItem('dynamic/productsupplierss', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert('Failed to save');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Product Suppliers"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Product Supplier"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default ProductSuppliers;

