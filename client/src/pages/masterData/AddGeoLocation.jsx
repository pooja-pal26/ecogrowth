import React, { useState } from 'react';
import MasterDataTable from '../../components/master-data/MasterDataTable';
import MasterDataForm from '../../components/master-data/MasterDataForm';

const AddGeoLocation = () => {
  const [data, setData] = useState([
    {
      _id: '1',
      location_name: 'Sample Data',
      status: true
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    location_name: '',
    latitude: '',
    longitude: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const columns = [
    { key: 'location_name', label: 'Location Name' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'status', label: 'Status', render: (row) => row.status ? 'Active' : 'Deactive' }
  ];

  const formFields = [
    {
        key: "location_name",
        label: "Location Name",
        type: "text",
        required: true
    },
    {
        key: "latitude",
        label: "Latitude",
        type: "text"
    },
    {
        key: "longitude",
        label: "Longitude",
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
      location_name: row.location_name,
      latitude: row.latitude,
      longitude: row.longitude,
      status: row.status
    });
    setEditId(row._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
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
        title="Geo Location"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MasterDataForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Location"
        fields={formFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </>
  );
};

export default AddGeoLocation;
