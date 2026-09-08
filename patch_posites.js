const fs = require('fs');
const path = require('path');

const generateTableComponent = (title, columns) => `import React, { useState } from 'react';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const ${title.replace(/\s+/g, '')} = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      ${columns.map(c => `${c.key}: 'Sample ${c.label}'`).join(',\n      ')}
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    ${columns.map(c => `${c.key}: ''`).join(',\n    ')}
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    ${columns.map(c => `{ key: '${c.key}', label: '${c.label}' }`).join(',\n    ')}
  ];

  const formFields = [
    ${columns.map(c => `{ key: '${c.key}', label: '${c.label}', type: 'text', required: true }`).join(',\n    ')}
  ];

  const handleAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      ${columns.map(c => `${c.key}: row.${c.key}`).join(',\n      ')}
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

export default ${title.replace(/\s+/g, '')};
`;

const generateFormComponent = (title, fields) => `import React, { useState } from 'react';
import { Save } from 'lucide-react';

const ${title.replace(/\s+/g, '')} = () => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted', formData);
    alert('${title} submitted successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">${title}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${fields.map(f => `
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">${f.label}</label>
              <input 
                type="${f.type || 'text'}" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                onChange={(e) => setFormData({...formData, ${f.key}: e.target.value})}
                required
              />
            </div>`).join('')}
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={18} />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ${title.replace(/\s+/g, '')};
`;

const importSiteDataComponent = `import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const ImportSiteData = () => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('File to import', file);
    alert('File imported successfully!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Site Data</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Site Data File (CSV/Excel)</label>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              <span>Import Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportSiteData;
`;

const pagesToCreate = [
  {
    path: 'po-sites/po/POStatus.jsx',
    content: generateTableComponent('PO Status', [
      { key: 'poNumber', label: 'PO Number' },
      { key: 'status', label: 'Status' }
    ])
  },
  {
    path: 'po-sites/sites/AllocatedSiteList.jsx',
    content: generateTableComponent('Allocated Site List', [
      { key: 'poNumber', label: 'PO Number' },
      { key: 'poDate', label: 'PO Date' },
      { key: 'siteId', label: 'Site ID' },
      { key: 'dueDate', label: 'Due Date' }
    ])
  },
  {
    path: 'po-sites/sites/AllocatedSiteStatus.jsx',
    content: generateTableComponent('Allocated Site Status', [
      { key: 'siteId', label: 'Site ID' },
      { key: 'status', label: 'Status' }
    ])
  },
  {
    path: 'po-sites/sites/ImportSiteData.jsx',
    content: importSiteDataComponent
  },
  {
    path: 'po-sites/incidents-reporting/IncidentsReport.jsx',
    content: generateTableComponent('Incidents Report', [
      { key: 'incidentId', label: 'Incident ID' },
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' }
    ])
  },
  {
    path: 'po-sites/incidents-reporting/ReportNewIncident.jsx',
    content: generateFormComponent('Report New Incident', [
      { key: 'siteId', label: 'Site ID' },
      { key: 'incidentDate', label: 'Incident Date', type: 'date' },
      { key: 'description', label: 'Description' },
      { key: 'severity', label: 'Severity' },
      { key: 'reportedBy', label: 'Reported By' }
    ])
  }
];

pagesToCreate.forEach(page => {
  const fullPath = path.join(__dirname, 'client/src/pages', page.path);
  fs.writeFileSync(fullPath, page.content);
  console.log('Updated:', fullPath);
});
