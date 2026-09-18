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
        <div 
          className="text-white px-4 py-3 flex justify-between items-center shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h3 className="font-bold text-lg">{isEditing ? 'Edit' : 'Add'} {title}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
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
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
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
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg text-sm hover:opacity-90 shadow-sm transition-all"
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
