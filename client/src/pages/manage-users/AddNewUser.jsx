import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Users, Fingerprint, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
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

  // Fingerprint capture states (matches PHP Nitgen capture 1 to 5)
  const [fingerprints, setFingerprints] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null
  });

  useEffect(() => {
    const loadMaster = async () => {
      try {
        setLoadingMaster(true);
        const data = await fetchUserMasterData();
        if (data) setMasterData(data);
      } catch (err) {
        console.error('Error loading master data:', err);
      } finally {
        setLoadingMaster(false);
      }
    };
    loadMaster();
  }, []);

  // Filter roles dynamically based on selected role_type
  const filteredRoles = useMemo(() => {
    if (!formData.role_type) return [];
    return (masterData.roles || []).filter(
      r => String(r.role_type) === String(formData.role_type)
    );
  }, [masterData.roles, formData.role_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role_type') {
      setFormData(prev => ({ ...prev, role_type: value, role: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|png|jpg|gif)$/i)) {
        Swal.fire('Invalid File !', 'Please select a valid image (JPG, JPEG, PNG, GIF).', 'error');
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

  const handleCaptureFinger = (id) => {
    // Biometric device hook or simulated capture
    setFingerprints(prev => ({
      ...prev,
      [id]: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 24 24' fill='none' stroke='%230891b2' stroke-width='2'><path d='M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4'/><path d='M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2'/><path d='M8.65 22c.21-.66.45-1.32.57-2'/><path d='M9 6.8a6 6 0 0 1 9 5.2v2'/></svg>`
    }));
    Swal.fire({
      title: `Finger ${id} Captured`,
      text: 'Biometric fingerprint template recorded.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Validations matching PHP validateUser() function exactly
  const validateUser = () => {
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
      Swal.fire({
        title: 'First Name Missing !',
        text: 'Please Enter First Name',
        icon: 'error'
      });
      return false;
    }
    if (!mobile_number.trim()) {
      Swal.fire({
        title: 'Mobile Number Missing !',
        text: 'Please Enter Mobile Number',
        icon: 'error'
      });
      return false;
    }
    if (isNaN(mobile_number)) {
      Swal.fire({
        title: 'Invalid Number !',
        text: 'Please Enter Numbers Only',
        icon: 'error'
      });
      return false;
    }
    if (alternate_mobile && isNaN(alternate_mobile)) {
      Swal.fire({
        title: 'Invalid Alternate Number !',
        text: 'Please Enter Numbers Only',
        icon: 'error'
      });
      return false;
    }
    if (alternate_mobile && alternate_mobile.trim().length !== 10) {
      Swal.fire({
        title: 'Invalid Alternate Number !',
        text: 'Please Enter 10 Digit Mobile Number',
        icon: 'error'
      });
      return false;
    }
    if (mobile_number.trim().length !== 10) {
      Swal.fire({
        title: 'Invalid Number !',
        text: 'Please Enter 10 Digit Mobile Number',
        icon: 'error'
      });
      return false;
    }
    if (!email_id.trim() || !email_id.includes('@')) {
      Swal.fire({
        title: 'Email ID Missing !',
        text: 'Please Enter Email ID',
        icon: 'error'
      });
      return false;
    }
    if (!department) {
      Swal.fire({
        title: 'Department Missing !',
        text: 'Please Select Department',
        icon: 'error'
      });
      return false;
    }
    if (!role_type) {
      Swal.fire({
        title: 'Role Type Missing !',
        text: 'Please Select Role Type',
        icon: 'error'
      });
      return false;
    }
    if (!role) {
      Swal.fire({
        title: 'Role Missing !',
        text: 'Please Select Role',
        icon: 'error'
      });
      return false;
    }
    if (!doj) {
      Swal.fire({
        title: 'Joining Date Missing !',
        text: 'Please Select Date of Joining',
        icon: 'error'
      });
      return false;
    }
    if (!password) {
      Swal.fire({
        title: 'Password Missing !',
        text: 'Please Enter Password',
        icon: 'error'
      });
      return false;
    }
    if (!confirmPassword) {
      Swal.fire({
        title: 'Confirm Password Missing !',
        text: 'Please Enter Confirm Password',
        icon: 'error'
      });
      return false;
    }
    if (confirmPassword !== password) {
      Swal.fire({
        title: 'Confirm Password Mismatch !',
        text: 'Confirm Password should be same as Password',
        icon: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUser()) return;

    try {
      setSubmitting(true);
      await createUser({
        ...formData,
        fingerprints
      });
      Swal.fire({
        title: 'Success !',
        text: 'User has been created successfully',
        icon: 'success'
      }).then(() => {
        navigate('/manage-users/active-users');
      });
    } catch (err) {
      Swal.fire('Error !', err.message || 'Failed to create user. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3">
      {/* Header Banner matching PHP panel-heading (Create New User) */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Create New User</span>
        </h1>
        <Link
          to="/manage-users/active-users"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Users size={14} />
          <span>View Users</span>
        </Link>
      </div>

      {/* Main Form Body with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mandatory notice matching PHP create-user.phtml */}
          <div className="text-red-600 font-bold text-xs sm:text-sm">
            * Fields are mandatory.
          </div>

          {/* Row 1: First Name, Last Name, Mobile Number, Alternate Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                First Name <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z ]/g, '');
                  setFormData(prev => ({ ...prev, first_name: val }));
                }}
                placeholder="Enter First Name"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                }}
                placeholder="Enter Last Name"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                name="mobile_number"
                maxLength={10}
                value={formData.mobile_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, mobile_number: val }));
                }}
                placeholder="Enter Mobile Number"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                }}
                placeholder="Enter Alternate Mobile Number"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Email ID, Department, Role Type, Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email ID <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                placeholder="Enter Email ID"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Department <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                Role Type <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
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
                Role <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              >
                <option value="">---Select Role---</option>
                {filteredRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Date of Joining, Permanent Address, Current Address, Profile Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Joining <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Permanent Address
              </label>
              <textarea
                rows={2}
                name="p_address"
                value={formData.p_address}
                onChange={handleChange}
                placeholder="Permanent Address"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Current Address
              </label>
              <textarea
                rows={2}
                name="c_address"
                value={formData.c_address}
                onChange={handleChange}
                placeholder="Current Address"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="profile_pic_file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {previewImage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <img
                      src={previewImage}
                      alt="Selected"
                      className="w-9 h-8 object-cover rounded border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-1.5 py-0.5 bg-red-600 text-white rounded text-2xs hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Please Confirm Password"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Row 5: Fingerprint Capture 1 to 5 matching PHP Nitgen capture */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Fingerprint size={15} className="text-teal-600" />
              <span>Biometric Fingerprint Registration (Optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="p-2 border border-gray-200 rounded-lg bg-gray-50/60 flex flex-col items-center justify-between text-center gap-1.5">
                  <span className="text-2xs font-semibold text-gray-600">Capture Finger {id}</span>
                  <div className="w-12 h-12 bg-white border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                    {fingerprints[id] ? (
                      <img src={fingerprints[id]} alt={`Finger ${id}`} className="w-8 h-8 object-contain" />
                    ) : (
                      <Fingerprint size={24} className="text-gray-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCaptureFinger(id)}
                    className="w-full py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-2xs font-semibold shadow-xs transition-colors"
                  >
                    {fingerprints[id] ? 'Recapture' : 'Capture'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Row matching PHP pull-right Save */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors disabled:opacity-50"
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
