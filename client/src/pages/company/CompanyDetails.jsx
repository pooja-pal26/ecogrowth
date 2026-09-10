import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const CompanyDetails = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/companydetailss');
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/companydetailss', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/companydetailss', editId, formData);
      } else {
        await createItem('dynamic/companydetailss', formData);
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

