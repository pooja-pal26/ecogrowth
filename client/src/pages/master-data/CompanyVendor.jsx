import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const CompanyVendor = () => {
  const [vendors, setVendors] = useState([
    {
      _id: '1',
      vendor_company_name: 'Tech Solutions Inc',
      contact_person_name: 'John Doe',
      contact_number: '9876543210',
      pan_number: 'ABCDE1234F',
      is_active: true
    }
  ]);
  
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      setVendors(vendors.filter(v => v._id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      setVendors(vendors.map(v => 
        v._id === editId ? { ...v, ...formData } : v
      ));
    } else {
      setVendors([...vendors, { _id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
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
