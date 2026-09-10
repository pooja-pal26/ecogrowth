import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const CompanyVendor = () => {
  const [vendors, setVendors] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/companyvendors');
      if (res.success) setVendors(res.data);
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
    vendor_company_name: '',
    contact_person_name: '',
    contact_number: '',
    pan_number: '',
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'vendor_company_name', label: 'Company Name' },
    { key: 'contact_person_name', label: 'Contact Person Name' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'pan_number', label: 'PAN Number' },
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
      vendor_company_name: row.vendor_company_name,
      contact_person_name: row.contact_person_name,
      contact_number: row.contact_number,
      pan_number: row.pan_number,
      is_active: row.is_active
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/companyvendors', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/companyvendors', editId, formData);
      } else {
        await createItem('dynamic/companyvendors', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert('Failed to save');
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

