import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const ProductSuppliers = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      supplier_name: 'Sample Data',
      status: true
    }
  ]);
  
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product supplier?")) {
      setData(data.filter(v => v._id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      setData(data.map(v => 
        v._id === editId ? { ...v, ...formData } : v
      ));
    } else {
      setData([...data, { _id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
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
