import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const BankNameList = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/banknamelists');
      if (res.success) setData(res.data);
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
    bank_name: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'bank_name', label: 'Bank Name' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (row.is_active !== false && row.status !== false && row.status !== '0') ? 'Active' : 'Deactive' 
    }
  ];

  const formFields = [
    {
        key: "bank_name",
        label: "Bank Name",
        type: "text",
        required: true
    },
    {
        key: "status",
        label: "Status",
        type: "select",
        options: [
            {
                value: true,
                label: "Active"
            },
            {
                value: false,
                label: "Deactive"
            }
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
      bank_name: row.bank_name || '',
      status: row.is_active !== undefined ? row.is_active : (row.status !== undefined ? (row.status === true || row.status === '1') : true)
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = data.find(d => (d._id || d.id) === id);
    const label = item?.bank_name || 'this bank';
    const result = await confirmDeleteDialog({
      title: 'Delete Bank?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/banknamelists', id);
        showSuccessToast(`Bank "${label}" deleted successfully.`, 'Bank Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error.response?.data?.message || 'Failed to delete bank.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.bank_name || !formData.bank_name.trim()) {
      showWarningToast('Please enter the bank name.', 'Required Field');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('dynamic/banknamelists', editId, formData);
        showSuccessToast(`Bank "${formData.bank_name}" updated successfully!`, 'Bank Updated');
      } else {
        await createItem('dynamic/banknamelists', formData);
        showSuccessToast(`Bank "${formData.bank_name}" added successfully!`, 'Bank Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to save bank information.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Bank Name List"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Bank"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default BankNameList;

