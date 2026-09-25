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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
        <div 
          className="text-white px-4 py-2.5 flex justify-between items-center shadow-xs min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h3 className="font-bold text-base tracking-tight">{isEditing ? 'Edit' : 'Add'} {title}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 bg-white">
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-[#D60019] font-bold">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
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
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-5 flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs shadow-sm transition-all cursor-pointer"
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
