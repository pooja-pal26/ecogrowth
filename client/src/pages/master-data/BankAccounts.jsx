import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const BankAccounts = () => {
  const [data, setData] = useState([]);
  const [bankMasters, setBankMasters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    bank_name: '',
    account_holder_name: '',
    bank_account_number: '',
    bank_branch: '',
    bank_ifsc_code: '',
    status: true
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/bankaccountss');
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const loadBankMasters = async () => {
    try {
      const res = await fetchList('dynamic/banknamelists');
      if (res.success && Array.isArray(res.data)) {
        setBankMasters(res.data.filter(b => b.is_active !== false && b.status !== false));
      }
    } catch (error) {
      console.error('Error fetching bank master list:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadBankMasters();
  }, []);

  const columns = [
    { 
      key: 'bank_name', 
      label: 'Bank Name',
      render: (row) => <span className="font-medium text-gray-800">{row.bank_name || '-'}</span>
    },
    { 
      key: 'bank_account_number', 
      label: 'Bank Account #',
      render: (row) => <span className="font-mono text-gray-700">{row.bank_account_number || row.account_number || '-'}</span>
    },
    { 
      key: 'bank_branch', 
      label: 'Bank Branch',
      render: (row) => row.bank_branch || row.branch_name || '-'
    },
    { 
      key: 'bank_ifsc_code', 
      label: 'Bank IFSC',
      render: (row) => <span className="font-mono uppercase text-gray-700">{row.bank_ifsc_code || row.ifsc_code || '-'}</span>
    },
    { 
      key: 'account_holder_name', 
      label: 'Account Holder Name',
      render: (row) => <span className="font-medium">{row.account_holder_name || row.account_name || '-'}</span>
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => {
        const isActive = row.is_active !== false && row.status !== false && row.status !== '0' && row.is_active !== '0';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Deactive'}
          </span>
        );
      } 
    }
  ];

  // If we have bank masters, provide select options; otherwise text input
  const formFields = [
    bankMasters.length > 0 ? {
      key: 'bank_name',
      label: 'Bank Name',
      type: 'select',
      required: true,
      options: bankMasters.map(b => ({
        value: b.bank_name,
        label: b.bank_name
      }))
    } : {
      key: 'bank_name',
      label: 'Bank Name',
      type: 'text',
      required: true
    },
    {
      key: 'bank_account_number',
      label: 'Bank Account Number',
      type: 'text',
      required: true
    },
    {
      key: 'bank_branch',
      label: 'Bank Branch',
      type: 'text',
      required: true
    },
    {
      key: 'bank_ifsc_code',
      label: 'Bank IFSC Code',
      type: 'text',
      required: true
    },
    {
      key: 'account_holder_name',
      label: 'Account Holder Name',
      type: 'text',
      required: true
    },
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
    const isActive = row.is_active !== false && row.status !== false && row.status !== '0' && row.is_active !== '0';
    setFormData({
      bank_name: row.bank_name || '',
      bank_account_number: row.bank_account_number || row.account_number || '',
      bank_branch: row.bank_branch || row.branch_name || '',
      bank_ifsc_code: row.bank_ifsc_code || row.ifsc_code || '',
      account_holder_name: row.account_holder_name || row.account_name || '',
      status: isActive
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = data.find(d => (d._id || d.id) === id);
    const accLabel = item?.bank_account_number || item?.bank_name ? `"${item.bank_name || ''} - ${item.bank_account_number || ''}"` : 'this bank account';
    const result = await confirmDeleteDialog({
      title: 'Delete Bank Account?',
      text: `Are you sure you want to delete ${accLabel}? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/bankaccountss', id);
        showSuccessToast(`Bank account ${accLabel} deleted successfully.`, 'Account Deleted');
        loadData();
      } catch (error) {
        console.error(error);
        showErrorToast('Failed to delete bank account.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.bank_name?.trim()) {
      showWarningToast('Please select or enter the Bank Name.', 'Validation Required');
      return;
    }
    if (!formData.bank_account_number?.trim()) {
      showWarningToast('Please enter the Bank Account Number.', 'Validation Required');
      return;
    }
    try {
      const payload = {
        ...formData,
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        account_number: formData.bank_account_number,
        bank_branch: formData.bank_branch,
        branch_name: formData.bank_branch,
        bank_ifsc_code: formData.bank_ifsc_code,
        ifsc_code: formData.bank_ifsc_code,
        account_holder_name: formData.account_holder_name,
        account_name: formData.account_holder_name,
        status: formData.status === true || formData.status === 'true' || formData.status === 1,
        is_active: formData.status === true || formData.status === 'true' || formData.status === 1
      };

      if (isEditing) {
        await updateItem('dynamic/bankaccountss', editId, payload);
        showSuccessToast(`Bank account "${formData.bank_account_number}" updated successfully!`, 'Account Updated');
      } else {
        await createItem('dynamic/bankaccountss', payload);
        showSuccessToast(`Bank account "${formData.bank_account_number}" created successfully!`, 'Account Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showErrorToast('Failed to save bank account. Please check inputs.', 'Save Error');
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
