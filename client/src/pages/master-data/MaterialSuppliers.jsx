import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const MaterialSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/materialsupplierss');
      if (res.success) setSuppliers(res.data);
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
    supplier_name: '',
    supplier_gst: '',
    supplier_person_name: '',
    supplier_contact_number: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { 
      key: 'supplier_name', 
      label: 'Supplier Name',
      render: (row) => row.supplier_name || row.name || '-'
    },
    { 
      key: 'supplier_gst', 
      label: 'Supplier GST Number',
      render: (row) => row.supplier_gst || row.gst_number || '-'
    },
    { 
      key: 'supplier_person_name', 
      label: 'Supplier Contact Person',
      render: (row) => row.supplier_person_name || row.contact_person || row.name || '-'
    },
    { 
      key: 'supplier_contact_number', 
      label: 'Supplier Contact Number',
      render: (row) => row.supplier_contact_number || row.contact_1 || row.contact_number || '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (row.status !== false && row.is_active !== false) ? 'Active' : 'Deactive'
    }
  ];

  const formFields = [
    { key: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
    { key: 'supplier_gst', label: 'Supplier GST Number', type: 'text' },
    { key: 'supplier_person_name', label: 'Supplier Contact Person', type: 'text' },
    { key: 'supplier_contact_number', label: 'Supplier Contact Number', type: 'text' },
    { 
      key: 'status', 
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
      supplier_name: row.supplier_name || row.name || '',
      supplier_gst: row.supplier_gst || row.gst_number || '',
      supplier_person_name: row.supplier_person_name || row.contact_person || '',
      supplier_contact_number: row.supplier_contact_number || row.contact_1 || row.contact_number || '',
      status: row.status !== undefined ? row.status : (row.is_active !== undefined ? row.is_active : true)
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = suppliers.find(d => (d._id || d.id) === id);
    const label = item?.supplier_name || item?.name || 'this supplier';
    const result = await confirmDeleteDialog({
      title: 'Delete Material Supplier?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/materialsupplierss', id);
        showSuccessToast(`Material Supplier "${label}" deleted successfully.`, 'Supplier Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Failed to delete supplier.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.supplier_name?.trim()) {
      showWarningToast('Please enter the supplier name.', 'Validation Required');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('dynamic/materialsupplierss', editId, formData);
        showSuccessToast(`Supplier "${formData.supplier_name}" updated successfully!`, 'Supplier Updated');
      } else {
        await createItem('dynamic/materialsupplierss', formData);
        showSuccessToast(`Supplier "${formData.supplier_name}" added successfully!`, 'Supplier Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to save material supplier.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Material Supplier(s) List For Site"
        data={suppliers}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Material Supplier"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default MaterialSuppliers;

