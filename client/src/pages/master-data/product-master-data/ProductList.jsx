import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const ProductList = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/productlists');
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
    product_name: '',
    type: '',
    unit: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'product_name', label: 'Product Name' },
    { key: 'type', label: 'Type' },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status', render: (row) => row.status ? 'Active' : 'Deactive' }
  ];

  const formFields = [
    {
        key: "product_name",
        label: "Product Name",
        type: "text",
        required: true
    },
    {
        key: "type",
        label: "Type",
        type: "text"
    },
    {
        key: "unit",
        label: "Unit",
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
      product_name: row.product_name,
      type: row.type,
      unit: row.unit,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/productlists', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/productlists', editId, formData);
      } else {
        await createItem('dynamic/productlists', formData);
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
        title="Product List"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Product"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default ProductList;

