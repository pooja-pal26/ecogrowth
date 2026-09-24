import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const SiteDocuments = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/sitedocumentss');
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
    document_name: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'document_name', label: 'Document Name' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (row.status !== false && row.status !== '0' && row.is_active !== false) ? 'Active' : 'Deactive' 
    }
  ];

  const formFields = [
    {
        key: "document_name",
        label: "Document Name",
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
      document_name: row.document_name || '',
      status: row.status !== undefined ? (row.status === true || row.status === '1' || row.status === 1) : (row.is_active !== false)
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = data.find(d => (d._id || d.id) === id);
    const label = item?.document_name || 'this document';
    const result = await confirmDeleteDialog({
      title: 'Delete Site Document?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/sitedocumentss', id);
        showSuccessToast(`Document "${label}" deleted successfully.`, 'Document Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Failed to delete site document.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.document_name?.trim()) {
      showWarningToast('Please enter the document name.', 'Validation Required');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('dynamic/sitedocumentss', editId, formData);
        showSuccessToast(`Document "${formData.document_name}" updated successfully!`, 'Document Updated');
      } else {
        await createItem('dynamic/sitedocumentss', formData);
        showSuccessToast(`Document "${formData.document_name}" added successfully!`, 'Document Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to save site document.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Site Documents"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Document"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default SiteDocuments;

