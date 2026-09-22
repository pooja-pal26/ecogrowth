import React, { useState, useEffect } from 'react';
import { fetchList, createItem, updateItem, deleteItem } from '../../../services/masterDataApi';
import MasterDataTable from '../../../components/master-data/MasterDataTable';
import MasterDataForm from '../../../components/master-data/MasterDataForm';

const Roles = () => {
  const [data, setData] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const initialForm = {
    role: '',
    role_type: '',
    status: true
  };

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Roles
      let rolesRes;
      try {
        rolesRes = await fetchList('roles');
      } catch {
        rolesRes = await fetchList('dynamic/roless');
      }
      if (rolesRes && rolesRes.success) {
        setData(rolesRes.data || []);
      }

      // 2. Fetch Role Types for dropdown
      let typesRes;
      try {
        typesRes = await fetchList('role-types?active_only=true');
      } catch {
        typesRes = await fetchList('dynamic/roletypess');
      }
      if (typesRes && typesRes.success) {
        setRoleTypes(typesRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load employee roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      key: 'role_type_name',
      label: 'Role Type',
      render: (row) => (
        <span className="font-medium text-slate-700">
          {row.role_type_name || '-'}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role Name',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.role || row.name || '-'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isActive =
          row.status === true ||
          row.status === '1' ||
          row.status === 1 ||
          row.is_active === true;

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

  const roleTypeOptions = (roleTypes || []).map((rt) => ({
    value: String(rt.id || rt._id),
    label: rt.role_type || rt.name
  }));

  const formFields = [
    {
      key: 'role_type',
      label: 'Role Type',
      type: 'select',
      required: true,
      options: roleTypeOptions
    },
    {
      key: 'role',
      label: 'Role Name',
      type: 'text',
      required: true,
      placeholder: 'Enter Role Name'
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
      row.status === true ||
      row.status === '1' ||
      row.status === 1 ||
      row.is_active === true;

    setFormData({
      role: row.role || row.name || '',
      role_type: String(row.role_type || row.role_type_id || ''),
      status: isActive
    });
    setErrorMsg('');
    setEditId(row._id || row.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Do you want to delete clicked role?')) {
      try {
        let res;
        try {
          res = await deleteItem('roles', id);
        } catch {
          res = await deleteItem('dynamic/roless', id);
        }
        if (res && res.message) {
          alert(res.message);
        }
        loadData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.role_type) {
      alert('Please select role type.');
      return;
    }
    if (!formData.role || formData.role.trim() === '') {
      alert('Please enter role name.');
      return;
    }

    try {
      const payload = {
        role: formData.role.trim(),
        name: formData.role.trim(),
        role_type: String(formData.role_type),
        role_type_id: String(formData.role_type),
        status: formData.status === true || formData.status === 'true' || formData.status === 1 || formData.status === '1',
        is_active: formData.status === true || formData.status === 'true' || formData.status === 1 || formData.status === '1'
      };

      if (isEditing) {
        try {
          await updateItem('roles', editId, payload);
        } catch {
          await updateItem('dynamic/roless', editId, payload);
        }
      } else {
        try {
          await createItem('roles', payload);
        } catch {
          await createItem('dynamic/roless', payload);
        }
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save role');
    }
  };

  return (
    <>
      <MasterDataTable
        title="Employee Roles"
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
        title="Employee Role"
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

export default Roles;
