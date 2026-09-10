import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const Transporters = () => {
  const [transporters, setTransporters] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/transporterss');
      if (res.success) setTransporters(res.data);
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
    transporter_name: '',
    contact_person: '',
    contact_number: '',
    gst_number: '',
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'transporter_name', label: 'Transporter Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'gst_number', label: 'GST Number' },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => row.is_active ? 'Active' : 'Deactive'
    }
  ];

  const formFields = [
    { key: 'transporter_name', label: 'Transporter Name', type: 'text', required: true },
    { key: 'contact_person', label: 'Contact Person', type: 'text' },
    { key: 'contact_number', label: 'Contact Number', type: 'text' },
    { key: 'gst_number', label: 'GST Number', type: 'text' },
    { 
      key: 'is_active', 
      label: 'Status', 
      type: 'select', 
      options: [
        { value: true, label: 'Active' },
        { value: false, label: 'Deactive' }
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
      transporter_name: row.transporter_name,
      contact_person: row.contact_person,
      contact_number: row.contact_number,
      gst_number: row.gst_number,
      is_active: row.is_active
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/transporterss', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/transporterss', editId, formData);
      } else {
        await createItem('dynamic/transporterss', formData);
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
        title="Transporter's List"
        data={transporters}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transporter"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default Transporters;

