import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const POStatus = () => {
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/po-sites/po-status', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    po_no: '',
    status: 'Open',
    po_completion_status: '0'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'po_no', label: 'PO Number', render: (row) => row.po_no || row.poNumber || '-' },
    { 
      key: 'order_date', 
      label: 'Order Date',
      render: (row) => {
        if (!row.order_date) return '-';
        try {
          const d = new Date(row.order_date);
          return isNaN(d.getTime()) ? row.order_date : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch { return row.order_date; }
      }
    },
    { 
      key: 'po_amount', 
      label: 'PO Amount', 
      render: (row) => row.po_amount ? `₹${parseFloat(row.po_amount).toLocaleString('en-IN')}` : '-' 
    },
    { key: 'site_type', label: 'Site Type', render: (row) => row.site_type || 'Standard' },
    { key: 'totalSites', label: 'Total Sites', render: (row) => row.totalSites ?? 0 },
    { key: 'allocatedSites', label: 'Allocated Sites', render: (row) => row.allocatedSites ?? 0 },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          (row.status || '').toLowerCase() === 'open' ? 'bg-blue-100 text-blue-800' :
          (row.status || '').toLowerCase() === 'completed' || (row.status || '').toLowerCase() === 'closed' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status || 'Open'}
        </span>
      )
    },
    { 
      key: 'po_completion_status', 
      label: 'Completion %',
      render: (row) => `${row.po_completion_status || (row.status === 'Closed' ? '100' : '0')}%`
    }
  ];

  const formFields = [
    { key: 'po_no', label: 'PO Number', type: 'text', required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Open', label: 'Open' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Closed', label: 'Closed' }
      ]
    },
    { key: 'po_completion_status', label: 'Completion % (0-100)', type: 'text', required: false }
  ];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      po_no: row.po_no || row.poNumber || '',
      status: row.status || 'Open',
      po_completion_status: String(row.po_completion_status || (row.status === 'Closed' ? '100' : '0'))
    });
    setEditId(row.id || row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setData(prev => prev.filter(v => (v.id || v._id) !== id));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/po-sites/po-status/${editId}`, formData, { withCredentials: true });
      } else {
        await axios.post('http://localhost:5000/api/po-sites/po-status', formData, { withCredentials: true });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <>
      <MasterDataTable
        title="PO Status"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="PO Status"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default POStatus;
