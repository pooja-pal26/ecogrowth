import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const CompanyDetails = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      name: 'EcoGrowth Technologies',
      address: '123 Tech Park, Silicon Valley',
      email: 'contact@ecogrowth.com',
      mobile_number: '9876543210',
      company_alias: 'EcoTech'
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    name: '',
    address: '',
    email: '',
    mobile_number: '',
    company_alias: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'name', label: 'Company' },
    { key: 'address', label: 'Address' },
    { key: 'email', label: 'Email' },
    { key: 'mobile_number', label: 'Mobile Number' }
  ];

  const formFields = [
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'address', label: 'Address', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text', required: true },
    { key: 'mobile_number', label: 'Mobile Number', type: 'text', required: true },
    { key: 'company_alias', label: 'Company Alias', type: 'text', required: true }
  ];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      address: row.address,
      email: row.email,
      mobile_number: row.mobile_number,
      company_alias: row.company_alias
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      setData(data.filter(v => v._id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      setData(data.map(v => 
        v._id === editId ? { ...v, ...formData } : v
      ));
    } else {
      setData([...data, { _id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <MasterDataTable
        title="Company Details"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Company"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default CompanyDetails;
