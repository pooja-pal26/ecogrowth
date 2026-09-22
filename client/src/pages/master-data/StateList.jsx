import React, { useState, useEffect } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  confirmDeleteDialog
} from '../../utils/toast';

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
      showErrorToast('Failed to load state list from server.', 'Fetch Error');
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
    const targetState = states.find(s => s._id === id);
    const stateLabel = targetState?.state_name ? `"${targetState.state_name}"` : 'this state';

    const result = await confirmDeleteDialog({
      title: 'Delete State?',
      text: `Are you sure you want to delete ${stateLabel}? This action cannot be undone.`,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteItem('states', id);
        if (res && res.success === false) {
          showErrorToast(res.message || 'Failed to delete state.', 'Delete Failed');
          return;
        }
        showSuccessToast(`State ${stateLabel} deleted successfully!`, 'State Deleted');
        loadData();
      } catch (error) {
        console.error("Failed to delete state:", error);
        showErrorToast(error.response?.data?.message || 'Failed to delete state.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.state_name?.trim() || !formData.state_code?.toString().trim()) {
      showWarningToast('Please fill in both State Name and State Code.', 'Validation Missing');
      return;
    }

    try {
      if (isEditing) {
        const res = await updateItem('states', editId, formData);
        if (res && res.success === false) {
          showErrorToast(res.message || 'Failed to update state.', 'Update Failed');
          return;
        }
        setIsModalOpen(false);
        showSuccessToast(`State "${formData.state_name}" updated successfully!`, 'State Updated');
      } else {
        const res = await createItem('states', formData);
        if (res && res.success === false) {
          showErrorToast(res.message || 'Failed to create state.', 'Creation Failed');
          return;
        }
        setIsModalOpen(false);
        showSuccessToast(`State "${formData.state_name}" added successfully!`, 'State Created');
      }
      loadData();
    } catch (error) {
      console.error("Failed to save state:", error);
      showErrorToast(error.response?.data?.message || 'Failed to save state. Please check fields.', 'Save Error');
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
