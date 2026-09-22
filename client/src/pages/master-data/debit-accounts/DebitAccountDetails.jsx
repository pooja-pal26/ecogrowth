import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const DebitAccountDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const initialForm = {
    debit_account: '',
    status: true
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      // Primary route: debit-accounts, with fallback to dynamic endpoint
      let res;
      try {
        res = await fetchList('debit-accounts');
      } catch {
        res = await fetchList('dynamic/debitaccountdetailss');
      }
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load debit accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      key: 'debit_account',
      label: 'Debit Account Name',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.debit_account || row.name || '-'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isActive =
          row.is_active === true ||
          row.is_active === 1 ||
          row.is_active === '1' ||
          row.status === true ||
          row.status === '1';

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {isActive ? 'Active' : 'Deactive'}
          </span>
        );
      }
    }
  ];

  const formFields = [
    {
      key: 'debit_account',
      label: 'Debit Account Name',
      type: 'text',
      required: true,
      placeholder: 'Enter Debit Account Name'
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
    setErrorMsg('');
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    const isActive =
      row.is_active === true ||
      row.is_active === 1 ||
      row.is_active === '1' ||
      row.status === true ||
      row.status === '1';

    setFormData({
      debit_account: row.debit_account || row.name || '',
      status: isActive
    });
    setErrorMsg('');
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Do you want to delete clicked debit account?')) {
      try {
        let res;
        try {
          res = await deleteItem('debit-accounts', id);
        } catch {
          res = await deleteItem('dynamic/debitaccountdetailss', id);
        }
        if (res && res.message) {
          alert(res.message);
        }
        loadData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete debit account');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.debit_account || formData.debit_account.trim() === '') {
      alert('Please enter the debit_account');
      return;
    }

    try {
      const payload = {
        debit_account: formData.debit_account.trim(),
        name: formData.debit_account.trim(),
        is_active: formData.status === true || formData.status === 'true' || formData.status === 1 || formData.status === '1',
        status: formData.status === true || formData.status === 'true' || formData.status === 1 || formData.status === '1'
      };

      if (isEditing) {
        try {
          await updateItem('debit-accounts', editId, payload);
        } catch {
          await updateItem('dynamic/debitaccountdetailss', editId, payload);
        }
      } else {
        try {
          await createItem('debit-accounts', payload);
        } catch {
          await createItem('dynamic/debitaccountdetailss', payload);
        }
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save debit account');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Debit Accounts"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Debit Account"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        error={errorMsg}
      />
    </>
  );
};

export default DebitAccountDetails;
