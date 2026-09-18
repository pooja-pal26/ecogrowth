import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Users, AlertCircle, CheckCircle2, Upload, X, ArrowLeft } from 'lucide-react';
import { fetchUserMasterData, createUser } from '../../services/userApi';

const AddNewUser = () => {
  const navigate = useNavigate();

  const [masterData, setMasterData] = useState({
    departments: [],
    roleTypes: [],
    roles: []
  });
  const [loadingMaster, setLoadingMaster] = useState(true);

  const initialForm = {
    first_name: '',
    last_name: '',
    mobile_number: '',
    alternate_mobile: '',
    email_id: '',
    department: '',
    role_type: '',
    role: '',
    doj: new Date().toISOString().substring(0, 10),
    p_address: '',
    c_address: '',
    password: '',
    confirmPassword: '',
    profile_pic: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [formError, setFormError] = useState('');

  // Load departments, role types, and roles
  useEffect(() => {
    const loadMaster = async () => {
      try {
        setLoadingMaster(true);
        const data = await fetchUserMasterData();
        if (data) setMasterData(data);
      } catch (err) {
        console.error('Error loading master data for user form:', err);
      } finally {
        setLoadingMaster(false);
      }
    };
    loadMaster();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4500);
  };

  // Filter roles based on selected role_type (matching PHP get-all-role)
  const filteredRoles = masterData.roles.filter(
    r => !formData.role_type || String(r.role_type) === String(formData.role_type)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role_type') {
      // Reset role when role_type changes
      setFormData(prev => ({ ...prev, role_type: value, role: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormError('');
  };

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|png|jpg|gif)$/i)) {
        setFormError('Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setFormData(prev => ({ ...prev, profile_pic: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, profile_pic: '' }));
  };

  // Client-side validations matching PHP validateUser()
  const validateForm = () => {
    const {
      first_name,
      mobile_number,
      alternate_mobile,
      email_id,
      department,
      role_type,
      role,
      doj,
      password,
      confirmPassword
    } = formData;

    if (!first_name.trim()) {
      setFormError('First Name Missing ! Please enter First Name.');
      return false;
    }
    if (!mobile_number.trim()) {
      setFormError('Mobile Number Missing ! Please enter Mobile Number.');
      return false;
    }
    if (isNaN(mobile_number) || mobile_number.trim().length !== 10) {
      setFormError('Invalid Number ! Please enter 10 Digit Mobile Number.');
      return false;
    }
    if (alternate_mobile.trim()) {
      if (isNaN(alternate_mobile) || alternate_mobile.trim().length !== 10) {
        setFormError('Invalid Alternate Number ! Please enter 10 Digit Mobile Number.');
        return false;
      }
    }
    if (!email_id.trim() || !email_id.includes('@')) {
      setFormError('Email ID Missing ! Please enter a valid Email ID.');
      return false;
    }
    if (!department) {
      setFormError('Department Missing ! Please select Department.');
      return false;
    }
    if (!role_type) {
      setFormError('Role Type Missing ! Please select Role Type.');
      return false;
    }
    if (!role) {
      setFormError('Role Missing ! Please select Role.');
      return false;
    }
    if (!doj) {
      setFormError('Joining Date Missing ! Please select Date of Joining.');
      return false;
    }
    if (!password) {
      setFormError('Password Missing ! Please enter Password.');
      return false;
    }
    if (!confirmPassword) {
      setFormError('Confirm Password Missing ! Please enter Confirm Password.');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Confirm Password Mismatch ! Confirm Password should be same as Password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError('');
      await createUser(formData);
      showNotification('success', 'User has been created successfully');
      setFormData(initialForm);
      setPreviewImage(null);

      // Navigate to active users after brief toast
      setTimeout(() => {
        navigate('/manage-users/active-users');
      }, 1200);
    } catch (err) {
      setFormError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header matching PHP create-user.phtml */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="text-green-600" size={26} />
            <span>Create New User</span>
          </h1>
          <nav className="text-sm font-medium text-gray-500 mt-1 flex space-x-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Manage Users</span>
            <span>/</span>
            <span className="text-gray-700">Create New User</span>
          </nav>
        </div>
        <Link
          to="/manage-users/active-users"
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Users size={18} />
          <span>View Users</span>
        </Link>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 border ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Form Error Alert */}
      {formError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-3.5 flex justify-between items-center">
          <span className="text-sm font-bold text-red-600">
            * Fields are mandatory.
          </span>
          <span className="text-xs text-gray-500">
            Ensure details match official identity documents.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: First Name, Last Name, Mobile Number, Alternate Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z ]/g, '');
                  setFormData(prev => ({ ...prev, first_name: val }));
                  setFormError('');
                }}
                placeholder="Enter First Name"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z ]/g, '');
                  setFormData(prev => ({ ...prev, last_name: val }));
                  setFormError('');
                }}
                placeholder="Enter Last Name"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile_number"
                maxLength={10}
                value={formData.mobile_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, mobile_number: val }));
                  setFormError('');
                }}
                placeholder="Enter 10 Digit Mobile"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alternate Mobile Number
              </label>
              <input
                type="text"
                name="alternate_mobile"
                maxLength={10}
                value={formData.alternate_mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, alternate_mobile: val }));
                  setFormError('');
                }}
                placeholder="Enter Alternate Mobile"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Email ID, Department, Role Type, Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                placeholder="Enter Email ID"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">---Select Department---</option>
                {masterData.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.department}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Role Type <span className="text-red-500">*</span>
              </label>
              <select
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">---Select Role Type---</option>
                {masterData.roleTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.role_type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">---Select Role---</option>
                {filteredRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.role}</option>
                ))}
              </select>
              {formData.role_type && filteredRoles.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No roles found under this role type.</p>
              )}
            </div>
          </div>

          {/* Row 3: Date of Joining, Permanent Address, Current Address, Profile Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Permanent Address
              </label>
              <textarea
                rows="2"
                name="p_address"
                value={formData.p_address}
                onChange={handleChange}
                placeholder="Enter Permanent Address"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Current Address
              </label>
              <textarea
                rows="2"
                name="c_address"
                value={formData.c_address}
                onChange={handleChange}
                placeholder="Enter Current Address"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="profile_pic_input"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile_pic_input"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Upload size={14} className="mr-1.5" />
                  <span>Choose Image</span>
                </label>

                {previewImage && (
                  <div className="relative inline-block">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-2xs text-gray-400 mt-1">Supported: JPG, JPEG, PNG, GIF</p>
            </div>
          </div>

          {/* Row 4: Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setPreviewImage(null);
                setFormError('');
              }}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewUser;
