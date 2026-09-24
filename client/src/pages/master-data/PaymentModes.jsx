import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../services/masterDataApi';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';
import { showSuccessToast, showErrorToast, showWarningToast, confirmDeleteDialog } from '../../utils/toast';

const PaymentModes = () => {
  const [data, setData] = useState([]);
  
  
  const loadData = async () => {
    try {
      const res = await fetchList('dynamic/paymentmodess');
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
    payment_mode: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'payment_mode', label: 'Payment Mode' },
    { key: 'status', label: 'Status', render: (row) => row.status ? 'Active' : 'Deactive' }
  ];

  const formFields = [
    {
        key: "payment_mode",
        label: "Payment Mode",
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
      payment_mode: row.payment_mode,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const item = data.find(d => (d._id || d.id) === id);
    const label = item?.payment_mode || 'this payment mode';
    const result = await confirmDeleteDialog({
      title: 'Delete Payment Mode?',
      text: `Are you sure you want to delete "${label}"? This action cannot be undone.`
    });
    if (result.isConfirmed) {
      try {
        await deleteItem('dynamic/paymentmodess', id);
        showSuccessToast(`Payment Mode "${label}" deleted successfully.`, 'Payment Mode Deleted');
        loadData();
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Failed to delete payment mode.', 'Delete Error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.payment_mode?.trim()) {
      showWarningToast('Please enter the payment mode.', 'Validation Required');
      return;
    }
    try {
      if (isEditing) {
        await updateItem('dynamic/paymentmodess', editId, formData);
        showSuccessToast(`Payment mode "${formData.payment_mode}" updated successfully!`, 'Payment Mode Updated');
      } else {
        await createItem('dynamic/paymentmodess', formData);
        showSuccessToast(`Payment mode "${formData.payment_mode}" added successfully!`, 'Payment Mode Created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to save payment mode.', 'Save Error');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Payment Modes"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payment Mode"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default PaymentModes;

