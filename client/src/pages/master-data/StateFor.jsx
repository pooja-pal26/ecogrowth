import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const StateFor = () => {
  const [stateForList, setStateForList] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/statefors');
      if (res.success) setStateForList(res.data);
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
    state_for: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: '_id', label: '#' },
    { key: 'state_for', label: 'State For' }
  ];

  const formFields = [
    { key: 'state_for', label: 'State For', type: 'text', required: true }
  ];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      state_for: row.state_for
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = stateForList.find(d => (d._id || d.id) === id);
    const label = item?.state_for || 'this record';
    const result = await confirmDeleteDialog({
      title: 'Delete State For?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/statefors', id);
        showSuccessToast(`Record "${label}" deleted successfully.`, 'Record Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Failed to delete record.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.state_for?.trim()) {
      showWarningToast('Please enter the State For value.', 'Validation Required');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('dynamic/statefors', editId, formData);
        showSuccessToast(`Record "${formData.state_for}" updated successfully!`, 'Record Updated');
      } else {
        await createItem('dynamic/statefors', formData);
        showSuccessToast(`Record "${formData.state_for}" added successfully!`, 'Record Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to save record.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="State For"
        data={stateForList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="State For"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default StateFor;

