import React, { useState, useEffect } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [states, setStates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    state_id: '',
    client_name: '',
    contact_number: '',
    client_gst: '',
    client_billing_address: '',
    client_shipping_address: '',
    is_active: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { 
      key: 'state_name', 
      label: 'State Name',
      render: (row) => row.state_id?.state_name || 'N/A'
    },
    { key: 'client_name', label: 'Client Name' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'client_billing_address', label: 'Address' },
    { key: 'client_gst', label: 'GST Number' },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => row.is_active ? 'Active' : 'Inactive'
    }
  ];

  const formFields = [
    { 
      key: 'state_id', 
      label: 'State Name', 
      type: 'select', 
      required: true,
      options: states.map(s => ({ value: s._id, label: s.state_name }))
    },
    { key: 'client_name', label: 'Client Name', type: 'text', required: true },
    { key: 'contact_number', label: 'Contact Number', type: 'text' },
    { key: 'client_gst', label: 'GST Number', type: 'text' },
    { key: 'client_billing_address', label: 'Billing Address', type: 'text' },
    { key: 'client_shipping_address', label: 'Shipping Address', type: 'text' },
    { 
      key: 'is_active', 
      label: 'Status', 
      type: 'select', 
      options: [
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' }
      ] 
    }
  ];

  const loadData = async () => {
    try {
      const [clientRes, stateRes] = await Promise.all([
        fetchList('clients'),
        fetchList('states')
      ]);
      if (clientRes.success) setClients(clientRes.data);
      if (stateRes.success) setStates(stateRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      state_id: row.state_id?._id || '',
      client_name: row.client_name,
      contact_number: row.contact_number,
      client_gst: row.client_gst,
      client_billing_address: row.client_billing_address,
      client_shipping_address: row.client_shipping_address,
      is_active: row.is_active
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteItem('clients', id);
        loadData();
      } catch (error) {
        console.error("Failed to delete client:", error);
        alert("Failed to delete client.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('clients', editId, formData);
      } else {
        await createItem('clients', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save client:", error);
      alert("Failed to save client. Please ensure fields are valid.");
    }
  };

  return (
    <>
      <MasterDataTable
        title="Client Master Data"
        data={clients}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Client"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default ClientList;
