import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const BankAccounts = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/bankaccountss');
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
    account_name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'account_name', label: 'Account Name' },
    { key: 'account_number', label: 'Account Number' },
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'ifsc_code', label: 'IFSC Code' },
    { key: 'status', label: 'Status', render: (row) => row.status ? 'Active' : 'Deactive' }
  ];

  const formFields = [
    {
        key: "account_name",
        label: "Account Name",
        type: "text",
        required: true
    },
    {
        key: "account_number",
        label: "Account Number",
        type: "text",
        required: true
    },
    {
        key: "bank_name",
        label: "Bank Name",
        type: "text",
        required: true
    },
    {
        key: "ifsc_code",
        label: "IFSC Code",
        type: "text"
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
      account_name: row.account_name,
      account_number: row.account_number,
      bank_name: row.bank_name,
      ifsc_code: row.ifsc_code,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteItem('dynamic/bankaccountss', id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateItem('dynamic/bankaccountss', editId, formData);
      } else {
        await createItem('dynamic/bankaccountss', formData);
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
        title="Bank Accounts"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Bank Account"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default BankAccounts;

