import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const AllocatedSiteStatus = () => {
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/po-sites/allocated-site-status', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    siteId: '',
    poNumber: '',
    dueDate: '',
    status: 'Allocated',
    closeStatus: 'Open'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'siteId', label: 'Site ID' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' },
    { key: 'closeStatus', label: 'Close Status' }
  ];

  const formFields = [
    { key: 'siteId', label: 'Site ID', type: 'text', readOnly: true },
    { key: 'poNumber', label: 'PO Number', type: 'text', readOnly: true },
    { key: 'dueDate', label: 'Due Date', type: 'text', readOnly: true },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Allocated', value: 'Allocated' },
      { label: 'Pending', value: 'Pending' }
    ] },
    { key: 'closeStatus', label: 'Close Status', type: 'select', options: [
      { label: 'Open', value: 'Open' },
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Closed', value: 'Closed' }
    ] }
  ];

  const handleAdd = () => {
    window.location.href = '/po-sites/sites/allocate-site';
  };

  const handleEdit = (row) => {
    setFormData({
      siteId: row.siteId || '',
      poNumber: row.poNumber || '',
      dueDate: row.dueDate || '',
      status: row.status || 'Allocated',
      closeStatus: row.closeStatus || 'Open'
    });
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/po-sites/allocated-sites/${id}`, { withCredentials: true });
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editId) {
        await axios.put(`http://localhost:5000/api/po-sites/allocated-site-status/${editId}`, {
          status: formData.status === 'Allocated' ? '1' : '0',
          close_status: formData.closeStatus
        }, { withCredentials: true });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Allocated Site Status"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Site Status"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default AllocatedSiteStatus;
