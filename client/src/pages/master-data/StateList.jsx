import React, { useState, useEffect } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';

const StateList = () => {
  const [states, setStates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ state_name: '', state_code: '' });
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'state_name', label: 'State Name' },
    { 
      key: 'state_code', 
      label: 'State Code',
      render: (row) => String(row.state_code).padStart(2, '0')
    }
  ];

  const formFields = [
    { key: 'state_name', label: 'State Name', type: 'text', required: true },
    { key: 'state_code', label: 'State Code', type: 'text', required: true }
  ];

  const loadData = async () => {
    try {
      const res = await fetchList('states');
      if (res.success) setStates(res.data);
    } catch (error) {
      console.error("Failed to load states:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setFormData({ state_name: '', state_code: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({ state_name: row.state_name, state_code: row.state_code });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      try {
        await deleteItem('states', id);
        loadData();
      } catch (error) {
        console.error("Failed to delete state:", error);
        alert("Failed to delete state.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('states', editId, formData);
      } else {
        await createItem('states', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save state:", error);
      alert("Failed to save state. Please ensure fields are valid.");
    }
  };

  return (
    <>
      <MasterDataTable
        title="State"
        data={states}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="State"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default StateList;
