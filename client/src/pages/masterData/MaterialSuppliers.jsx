import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const MaterialSuppliers = () => {
  const [suppliers, setSuppliers] = useState([
    {
      _id: '1',
      supplier_name: 'BuildMat Solutions',
      supplier_gst: '22AAAAA0000A1Z5',
      supplier_person_name: 'Alice Smith',
      supplier_contact_number: '9876543211',
      status: true
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    supplier_name: '',
    supplier_gst: '',
    supplier_person_name: '',
    supplier_contact_number: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'supplier_name', label: 'Supplier Name' },
    { key: 'supplier_gst', label: 'Supplier GST Number' },
    { key: 'supplier_person_name', label: 'Supplier Contact Person' },
    { key: 'supplier_contact_number', label: 'Supplier Contact Number' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => row.status ? 'Active' : 'Deactive'
    }
  ];

  const formFields = [
    { key: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
    { key: 'supplier_gst', label: 'Supplier GST Number', type: 'text' },
    { key: 'supplier_person_name', label: 'Supplier Contact Person', type: 'text' },
    { key: 'supplier_contact_number', label: 'Supplier Contact Number', type: 'text' },
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
    setFormData({
      supplier_name: row.supplier_name,
      supplier_gst: row.supplier_gst,
      supplier_person_name: row.supplier_person_name,
      supplier_contact_number: row.supplier_contact_number,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter(v => v._id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      setSuppliers(suppliers.map(v => 
        v._id === editId ? { ...v, ...formData } : v
      ));
    } else {
      setSuppliers([...suppliers, { _id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <MasterDataTable
        title="Material Supplier(s) List For Site"
        data={suppliers}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Material Supplier"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default MaterialSuppliers;
