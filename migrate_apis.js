const fs = require('fs');
const path = require('path');

const clientPagesDir = path.join(__dirname, 'client/src/pages');

// Map of React components to their API endpoints
const componentToApiMap = {
  'ClientList': '/api/master-data/clients',
  'StateList': '/api/master-data/states',
  'CompanyVendor': '/api/master-data/company-vendors',
  'POStatus': '/api/po-sites/po-status',
  'AllocatedSiteList': '/api/po-sites/allocated-sites',
  'AllocatedSiteStatus': '/api/po-sites/allocated-site-status',
  'IncidentsReport': '/api/po-sites/incidents',
  'InvoiceList': '/api/invoices',
  'AssetList': '/api/assets',
  'VendorList': '/api/vendors',
  'MaterialList': '/api/materials'
};

const findAndPatchFiles = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndPatchFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const componentName = path.basename(file, '.jsx');
      if (componentToApiMap[componentName]) {
        patchComponent(fullPath, componentName, componentToApiMap[componentName]);
      }
    }
  }
};

const patchComponent = (filePath, componentName, apiEndpoint) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // If already patched, skip
  if (content.includes('axios.get') || content.includes('fetchData')) return;

  console.log(`Patching ${componentName} to use API: ${apiEndpoint}`);

  // Add axios import if not present
  if (!content.includes("import axios")) {
    content = content.replace("import React, { useState }", "import React, { useState, useEffect }");
    content = content.replace("import MasterDataTable", "import axios from 'axios';\nimport MasterDataTable");
  }

  // Replace mock data with useEffect
  const mockDataRegex = /const \[data, setData\] = useState\(\[[\s\S]*?\]\);/;
  const useEffectCode = `const [data, setData] = useState([]);
  
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000${apiEndpoint}', { withCredentials: true });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);`;

  content = content.replace(mockDataRegex, useEffectCode);

  // Replace handleSubmit to use POST/PUT
  const handleSubmitRegex = /const handleSubmit = \(\) => {[\s\S]*?setIsModalOpen\(false\);\n  };/;
  const handleSubmitCode = `const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(\`http://localhost:5000${apiEndpoint}/\${editId}\`, formData, { withCredentials: true });
      } else {
        await axios.post('http://localhost:5000${apiEndpoint}', formData, { withCredentials: true });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };`;

  content = content.replace(handleSubmitRegex, handleSubmitCode);

  // Replace handleDelete to use DELETE
  const handleDeleteRegex = /const handleDelete = \(id\) => {[\s\S]*?};\n  };/;
  const handleDeleteCode = `const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(\`http://localhost:5000${apiEndpoint}/\${id}\`, { withCredentials: true });
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };`;
  
  content = content.replace(handleDeleteRegex, handleDeleteCode);

  fs.writeFileSync(filePath, content);
};

findAndPatchFiles(clientPagesDir);
console.log('Frontend API integration patching complete.');
