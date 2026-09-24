import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const CompanyVendor = () => {
  const [vendors, setVendors] = useState([]);
  
  const loadData = async () => {
    try {
      const res = await fetchList('company-vendors');
      if (res.success) setVendors(res.data);
    } catch (error) {
      console.error('Failed to load company vendors:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    vendor_company_name: '',
    contact_person_name: '',
    contact_number: '',
    pan_number: '',
    gst_number: '',
    proprietor_name: '',
    company_address: '',
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'vendor_company_name', label: 'Company Name' },
    { key: 'contact_person_name', label: 'Contact Person Name' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'pan_number', label: 'PAN Number' },
    { key: 'gst_number', label: 'GST Number' },
    { key: 'proprietor_name', label: 'Proprietor Name' },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => row.is_active ? 'Active' : 'Inactive'
    }
  ];

  const formFields = [
    { key: 'vendor_company_name', label: 'Company Name', type: 'text', required: true },
    { key: 'contact_person_name', label: 'Contact Person Name', type: 'text', required: true },
    { key: 'contact_number', label: 'Contact Number', type: 'text', required: true },
    { key: 'pan_number', label: 'PAN Number', type: 'text', required: true },
    { key: 'gst_number', label: 'GST Number', type: 'text' },
    { key: 'proprietor_name', label: 'Proprietor Name', type: 'text' },
    { key: 'company_address', label: 'Company Address', type: 'text' },
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

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      vendor_company_name: row.vendor_company_name || '',
      contact_person_name: row.contact_person_name || '',
      contact_number: row.contact_number || '',
      pan_number: row.pan_number || '',
      gst_number: row.gst_number || '',
      proprietor_name: row.proprietor_name || '',
      company_address: row.company_address || '',
      is_active: row.is_active !== undefined ? row.is_active : true
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = vendors.find(d => (d._id || d.id) === id);
    const label = item?.vendor_company_name || 'this vendor';
    const result = await confirmDeleteDialog({
      title: 'Delete Company Vendor?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('company-vendors', id);
        showSuccessToast(`Vendor "${label}" deleted successfully.`, 'Vendor Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Failed to delete vendor.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.vendor_company_name?.trim()) {
      showWarningToast('Please enter the vendor company name.', 'Validation Required');
      return;
    }
    if (!formData.contact_person_name?.trim()) {
      showWarningToast('Please enter the contact person name.', 'Validation Required');
      return;
    }
    if (!formData.contact_number?.trim()) {
      showWarningToast('Please enter the contact number.', 'Validation Required');
      return;
    }
    if (!formData.pan_number?.trim()) {
      showWarningToast('Please enter the PAN number.', 'Validation Required');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('company-vendors', editId, formData);
        showSuccessToast(`Vendor "${formData.vendor_company_name}" updated successfully!`, 'Vendor Updated');
      } else {
        await createItem('company-vendors', formData);
        showSuccessToast(`Vendor "${formData.vendor_company_name}" added successfully!`, 'Vendor Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to save company vendor.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Company Vendor"
        data={vendors}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Company Vendor"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default CompanyVendor;
