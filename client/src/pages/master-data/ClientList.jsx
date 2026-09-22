import React, { useState, useEffect, useMemo } from 'react';
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

  // Dynamic state lookup map indexing by both id and _id
  const stateMap = useMemo(() => {
    const map = {};
    states.forEach(s => {
      if (s.id !== undefined && s.id !== null) map[String(s.id)] = s.state_name;
      if (s._id) map[String(s._id)] = s.state_name;
    });
    return map;
  }, [states]);

  const columns = [
    { 
      key: 'state_name', 
      label: 'State Name',
      render: (row) => {
        if (row.state_name) return row.state_name;
        if (row.state_id?.state_name) return row.state_id.state_name;
        const lookupKey = String(row.raw_state_id || (typeof row.state_id === 'string' ? row.state_id : (row.state_id?.id || row.state_id?._id || '')));
        return stateMap[lookupKey] || 'N/A';
      }
    },
    { 
      key: 'client_name', 
      label: 'Client Name',
      render: (row) => row.client_name || '-'
    },
    { 
      key: 'contact_number', 
      label: 'Contact Number',
      render: (row) => row.contact_number || row.client_contact_number || '-'
    },
    { 
      key: 'client_billing_address', 
      label: 'Address',
      render: (row) => row.client_billing_address || '-'
    },
    { 
      key: 'client_gst', 
      label: 'GST Number',
      render: (row) => row.client_gst || '-'
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => (row.is_active === true || row.is_active === '1' || row.is_active === 1) ? 'Active' : 'Inactive'
    }
  ];

  const formFields = [
    { 
      key: 'state_id', 
      label: 'State Name', 
      type: 'select', 
      required: true,
      options: states.map(s => ({ value: String(s.id || s._id), label: s.state_name }))
    },
    { key: 'client_name', label: 'Client Name', type: 'text', required: true },
    { key: 'contact_number', label: 'Contact Number', type: 'text' },
    { key: 'client_gst', label: 'GST Number', type: 'text', required: true },
    { key: 'client_billing_address', label: 'Billing Address', type: 'text', required: true },
    { key: 'client_shipping_address', label: 'Shipping Address', type: 'text', required: true },
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
      if (clientRes?.success && Array.isArray(clientRes.data)) {
        setClients(clientRes.data);
      }
      if (stateRes?.success && Array.isArray(stateRes.data)) {
        setStates(stateRes.data);
      }
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
    const rawState = row.state_id?.id || row.raw_state_id || (typeof row.state_id === 'string' ? row.state_id : (row.state_id?._id || ''));
    setFormData({
      state_id: String(rawState || ''),
      client_name: row.client_name || '',
      contact_number: row.contact_number || row.client_contact_number || '',
      client_gst: row.client_gst || '',
      client_billing_address: row.client_billing_address || '',
      client_shipping_address: row.client_shipping_address || '',
      is_active: row.is_active === true || row.is_active === '1' || row.is_active === 1
    });
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const targetId = rowOrId?._id || rowOrId?.id || rowOrId;
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteItem('clients', targetId);
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
