import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const ActiveUsers = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      name: 'Sample Data',
      status: 'Active'
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    name: '',
    status: 'Active'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ];

  const formFields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
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
      name: row.name,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
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
        title="Active Users"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Active Users"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default ActiveUsers;
