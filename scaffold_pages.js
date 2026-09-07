const fs = require('fs');
const path = require('path');

const pagesToCreate = [
  // 1. Invoice Module
  { folder: 'invoice-module', file: 'PunchedInvoices.jsx', title: 'Punched Invoices' },
  { folder: 'invoice-module', file: 'PunchInvoice.jsx', title: 'Punch Invoice' },
  { folder: 'invoice-module', file: 'MonthlyInvoiceReport.jsx', title: 'Monthly Invoice Report' },
  { folder: 'invoice-module', file: 'GenerateInvoice.jsx', title: 'Generate Invoice' },
  { folder: 'invoice-module', file: 'ServicesProducts.jsx', title: 'Services / Products' },
  // 2. Asset Management
  { folder: 'asset-management', file: 'AssetType.jsx', title: 'Asset Type' },
  { folder: 'asset-management', file: 'Assets.jsx', title: 'Assets' },
  { folder: 'asset-management', file: 'AssetAssignments.jsx', title: 'Asset Assignments' },
  // 3. Manage Users
  { folder: 'manage-users', file: 'AddNewUser.jsx', title: 'Add New User' },
  { folder: 'manage-users', file: 'ActiveUsers.jsx', title: 'Active Users' },
  { folder: 'manage-users', file: 'DeactiveUsers.jsx', title: 'Deactive Users' },
  // 4. Manage Vendors
  { folder: 'manage-vendors', file: 'AddNewVendor.jsx', title: 'Add New Vendor' },
  { folder: 'manage-vendors', file: 'ActiveVendors.jsx', title: 'Active Vendors' },
  { folder: 'manage-vendors', file: 'DeactiveVendors.jsx', title: 'Deactive Vendors' },
  // 5. Material Stock
  { folder: 'material-stock', file: 'MaterialStockReport.jsx', title: 'Material Stock Report' },
  { folder: 'material-stock', file: 'StockIn.jsx', title: 'Stock In' },
  { folder: 'material-stock', file: 'StockOut.jsx', title: 'Stock Out' },
  // 6. Reports
  { folder: 'reports', file: 'StockInReport.jsx', title: 'Stock In Report' },
  { folder: 'reports', file: 'StockOutReport.jsx', title: 'Stock Out Report' },
  { folder: 'reports', file: 'SummaryReport.jsx', title: 'Summary Report' },
];

const template = (title, componentName) => `import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const ${componentName} = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      name: 'Sample Data',
      status: 'Active'
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    name: '',
    status: 'Active'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ];

  const formFields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
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
      name: row.name,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
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
        title="${title}"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="${title}"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default ${componentName};
`;

pagesToCreate.forEach(page => {
  const componentName = page.file.replace('.jsx', '');
  const content = template(page.title, componentName);
  const fullPath = path.join(__dirname, 'client/src/pages', page.folder, page.file);
  
  if (!fs.existsSync(path.dirname(fullPath))) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  console.log('Created:', fullPath);
});
