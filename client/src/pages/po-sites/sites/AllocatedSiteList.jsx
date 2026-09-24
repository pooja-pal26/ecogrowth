import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, confirmDeleteDialog } from '../../../utils/toast';

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
    dueDate: '',
    workType: '',
    status: 'Allocated',
    closeStatus: 'Open'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'poNumber', label: 'PO Number' },
    { key: 'poDate', label: 'PO Date' },
    { key: 'siteId', label: 'Site ID' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'workType', label: 'Work Type' },
    { key: 'status', label: 'Status' },
    { key: 'closeStatus', label: 'Close Status' }
  ];

  const formFields = [
    { key: 'poNumber', label: 'PO Number', type: 'text', readOnly: true },
    { key: 'poDate', label: 'PO Date', type: 'text', readOnly: true },
    { key: 'siteId', label: 'Site ID', type: 'text', readOnly: true },
    { key: 'dueDate', label: 'Due Date', type: 'text', readOnly: true },
    { key: 'workType', label: 'Work Type', type: 'text', readOnly: true },
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
      poNumber: row.poNumber || '',
      poDate: row.poDate || '',
      siteId: row.siteId || '',
      dueDate: row.dueDate || '',
      workType: row.workType || '',
      status: row.status || 'Allocated',
      closeStatus: row.closeStatus || 'Open'
    });
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await confirmDeleteDialog({
      title: 'Delete Site Allocation?',
      text: 'Are you sure you want to delete this allocated site record? This action cannot be undone.'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/po-sites/allocated-sites/${id}`, { withCredentials: true });
        showSuccessToast('Allocated site record deleted successfully.', 'Record Deleted');
        fetchData();
      } catch (error) {
        console.error('Error deleting site allocation:', error);
        showErrorToast('Failed to delete site allocation.', 'Delete Failed');
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
        showSuccessToast('Allocated site updated successfully!', 'Site Updated');
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      showErrorToast('Failed to save allocated site status.', 'Save Error');
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
        title="Edit Allocated Site"
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
