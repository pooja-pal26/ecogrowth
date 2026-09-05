import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const Transporters = () => {
  const [transporters, setTransporters] = useState([
    {
      _id: '1',
      transporter_name: 'Fast Track Logistics',
      contact_person: 'Michael Jordan',
      contact_number: '9876543212',
      gst_number: '33BBBBB0000B1Z6',
      is_active: true
    }
  ]);
  
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transporter?")) {
      setTransporters(transporters.filter(v => v._id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      setTransporters(transporters.map(v => 
        v._id === editId ? { ...v, ...formData } : v
      ));
    } else {
      setTransporters([...transporters, { _id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
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
