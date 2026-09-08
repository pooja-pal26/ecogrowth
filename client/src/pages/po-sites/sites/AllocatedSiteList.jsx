import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const AllocatedSiteList = () => {
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/po-sites/allocated-sites', { withCredentials: true });
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
    poNumber: '',
    poDate: '',
    siteId: '',
    dueDate: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'poNumber', label: 'PO Number' },
    { key: 'poDate', label: 'PO Date' },
    { key: 'siteId', label: 'Site ID' },
    { key: 'dueDate', label: 'Due Date' }
  ];

  const formFields = [
    { key: 'poNumber', label: 'PO Number', type: 'text', required: true },
    { key: 'poDate', label: 'PO Date', type: 'text', required: true },
    { key: 'siteId', label: 'Site ID', type: 'text', required: true },
    { key: 'dueDate', label: 'Due Date', type: 'text', required: true }
  ];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      poNumber: row.poNumber,
      poDate: row.poDate,
      siteId: row.siteId,
      dueDate: row.dueDate
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

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/po-sites/allocated-sites/${editId}`, formData, { withCredentials: true });
      } else {
        await axios.post('http://localhost:5000/api/po-sites/allocated-sites', formData, { withCredentials: true });
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
        title="Allocated Site List"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Allocated Site List"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default AllocatedSiteList;
