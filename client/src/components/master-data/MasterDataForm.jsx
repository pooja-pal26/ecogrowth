import React from 'react';
import { X } from 'lucide-react';

const MasterDataForm = ({
  isOpen,
  onClose,
  title,
  fields, // Array of { key, label, type (text/select), options (if select), required }
  formData,
  setFormData,
  onSubmit,
  isEditing
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">{isEditing ? 'Edit' : 'Add'} {title}</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterDataForm;
