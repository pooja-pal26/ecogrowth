import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  fetchMaterialMasterData, 
  fetchProductsByType, 
  fetchProductStock, 
  submitStockIn 
} from '../../services/materialApi';

const StockIn = () => {
  const navigate = useNavigate();

  // Master Data state
  const [masterData, setMasterData] = useState({
    productTypes: [],
    suppliers: [],
    brands: [],
    users: []
  });

  // Cached products by type { [typeId]: Array<Product> }
  const [productsCache, setProductsCache] = useState({});

  // Header form state matching PHP material-stock-in.phtml
  const [headerForm, setHeaderForm] = useState({
    dateOfStockIn: new Date().toISOString().slice(0, 10),
    supplier: '',
    recieved_by: '',
    bill_no: '',
    bill_date: new Date().toISOString().slice(0, 10),
    remarks: ''
  });

  // Multi-row product items
  const initialRow = {
    id: 1,
    product_category: '',
    product_id: '',
    brand: '',
    unit: '',
    quantity: ''
  };

  const [items, setItems] = useState([initialRow]);
  const [loading, setLoading] = useState(false);
  const [swalAlert, setSwalAlert] = useState({ isOpen: false, title: '', text: '', icon: 'info' });

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const data = await fetchMaterialMasterData();
        setMasterData(data);
      } catch (err) {
        console.error('Error loading master data for stock in:', err);
      }
    };
    loadMaster();
  }, []);

  const handleHeaderChange = (field, value) => {
    setHeaderForm(prev => ({ ...prev, [field]: value }));
  };

  // Row changes
  const handleCategoryChange = async (index, categoryId) => {
    const updated = [...items];
    updated[index].product_category = categoryId;
    updated[index].product_id = '';
    updated[index].unit = '';
    setItems(updated);

    if (categoryId && !productsCache[categoryId]) {
      try {
        const prods = await fetchProductsByType(categoryId);
        setProductsCache(prev => ({ ...prev, [categoryId]: prods }));
      } catch (err) {
        console.error('Error loading products for category:', err);
      }
    }
  };

  const handleProductChange = async (index, productId) => {
    const updated = [...items];
    updated[index].product_id = productId;
    const categoryId = updated[index].product_category;

    if (productId && categoryId) {
      try {
        const stockData = await fetchProductStock(categoryId, productId);
        updated[index].unit = stockData.unit || '';
      } catch (err) {
        console.error('Error fetching unit for product:', err);
      }
    } else {
      updated[index].unit = '';
    }
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddMoreRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        product_category: '',
        product_id: '',
        brand: '',
        unit: '',
        quantity: ''
      }
    ]);
  };

  const handleDeleteRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations matching PHP validateData() in material-stock-in.phtml
    if (!headerForm.dateOfStockIn) {
      setSwalAlert({
        isOpen: true,
        title: 'Missing',
        text: 'Please select date of stock in.',
        icon: 'info'
      });
      return;
    }
    if (!headerForm.supplier) {
      setSwalAlert({
        isOpen: true,
        title: 'Missing',
        text: 'Please select supplier.',
        icon: 'info'
      });
      return;
    }
    if (!headerForm.recieved_by) {
      setSwalAlert({
        isOpen: true,
        title: 'Error',
        text: 'Please enter reciever name.',
        icon: 'error'
      });
      return;
    }
    if (!headerForm.bill_no.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Error',
        text: 'Please enter bill number.',
        icon: 'error'
      });
      return;
    }
    if (!headerForm.bill_date) {
      setSwalAlert({
        isOpen: true,
        title: 'Missing',
        text: 'Please select bill date.',
        icon: 'info'
      });
      return;
    }

    // Validate rows
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.product_category) {
        setSwalAlert({
          isOpen: true,
          title: 'Missing',
          text: `Please select Product Category for row ${i + 1}.`,
          icon: 'info'
        });
        return;
      }
      if (!row.product_id) {
        setSwalAlert({
          isOpen: true,
          title: 'Missing',
          text: `Please select Product Name for row ${i + 1}.`,
          icon: 'info'
        });
        return;
      }
      if (!row.quantity || parseFloat(row.quantity) <= 0) {
        setSwalAlert({
          isOpen: true,
          title: 'Missing',
          text: `Please enter a valid quantity for row ${i + 1}.`,
          icon: 'info'
        });
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...headerForm,
        items
      };
      const res = await submitStockIn(payload);
      setSwalAlert({
        isOpen: true,
        title: 'Success !',
        text: res.message || 'Stock details have been saved successfully.',
        icon: 'success'
      });
      setTimeout(() => {
        navigate('/material-stock/material-stock-report');
      }, 1500);
    } catch (err) {
      setSwalAlert({
        isOpen: true,
        title: 'Error !',
        text: err.message || 'Failed to save stock in details.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-5 w-full max-w-7xl mx-auto space-y-4 font-sans">
      {/* Top Header matching PHP panel-primary / panel-heading */}
      <div className="flex justify-between items-center bg-[#337ab7] text-white px-5 py-3 rounded-t-md shadow-xs">
        <h3 className="text-base sm:text-lg font-bold">Material Stock In</h3>
        <Link
          to="/material-stock/material-stock-report"
          className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-3.5 py-1.5 rounded text-sm font-semibold transition-colors shadow-xs"
        >
          View Stock Report
        </Link>
      </div>

      {/* Main Container matching PHP .mainDiv background #DCF2FE */}
      <div className="bg-[#DCF2FE] p-3 sm:p-5 rounded-md border border-[#bce8f1]">
        <div className="mb-3">
          <span className="text-sm font-bold text-[#D60019]">* Fields are mandatory.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Inputs: 4 columns matching PHP material-stock-in.phtml */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Date of Stock In<span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                value={headerForm.dateOfStockIn}
                onChange={(e) => handleHeaderChange('dateOfStockIn', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Supplier<span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={headerForm.supplier}
                onChange={(e) => handleHeaderChange('supplier', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              >
                <option value="">Select Supplier</option>
                {masterData.suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Recieved By<span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={headerForm.recieved_by}
                onChange={(e) => handleHeaderChange('recieved_by', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              >
                <option value="">Select Reciever</option>
                {masterData.users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Bill/Challan Number<span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Challan Number"
                value={headerForm.bill_no}
                onChange={(e) => handleHeaderChange('bill_no', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Row 2: Bill Date & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Bill/Challan Date<span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                value={headerForm.bill_date}
                onChange={(e) => handleHeaderChange('bill_date', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Remarks (if any)
              </label>
              <textarea
                rows="1"
                placeholder="Enter remarks here"
                value={headerForm.remarks}
                onChange={(e) => handleHeaderChange('remarks', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Multi-Row Product Details Table matching PHP #productDetailsTable */}
          <div className="mt-4 bg-white rounded-md border-2 border-gray-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 border-b-2 border-gray-800 font-bold text-xs uppercase">
                    <th className="py-2.5 px-3 border-r border-gray-800">Product Type</th>
                    <th className="py-2.5 px-3 border-r border-gray-800">Product Name</th>
                    <th className="py-2.5 px-3 border-r border-gray-800">Brand</th>
                    <th className="py-2.5 px-3 border-r border-gray-800 w-24">Unit</th>
                    <th className="py-2.5 px-3 border-r border-gray-800 w-28">Quantity</th>
                    <th className="py-2.5 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {items.map((row, index) => {
                    const rowProducts = productsCache[row.product_category] || [];

                    return (
                      <tr key={row.id} className="hover:bg-blue-50/30">
                        {/* Product Type */}
                        <td className="p-2 border-r border-gray-800">
                          <select
                            value={row.product_category}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs sm:text-sm focus:border-blue-500 outline-none"
                          >
                            <option value="">Select Product Category</option>
                            {masterData.productTypes.map(t => (
                              <option key={t.id} value={t.id}>{t.product_type_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Product Name */}
                        <td className="p-2 border-r border-gray-800">
                          <select
                            value={row.product_id}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            disabled={!row.product_category}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs sm:text-sm focus:border-blue-500 outline-none disabled:bg-gray-100"
                          >
                            <option value="">Select Product</option>
                            {rowProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.product_name} {p.price ? `(${p.price})` : ''}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Brand */}
                        <td className="p-2 border-r border-gray-800">
                          <select
                            value={row.brand}
                            onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs sm:text-sm focus:border-blue-500 outline-none"
                          >
                            <option value="">Select Product Brand</option>
                            {masterData.brands.map(b => (
                              <option key={b.id} value={b.id}>{b.brand_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Unit (readonly) */}
                        <td className="p-2 border-r border-gray-800">
                          <input
                            type="text"
                            readOnly
                            value={row.unit}
                            className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-300 rounded text-xs sm:text-sm text-gray-700 outline-none"
                            placeholder="Unit"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-2 border-r border-gray-800">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs sm:text-sm focus:border-blue-500 outline-none font-mono"
                            placeholder="Qty"
                            required
                          />
                        </td>

                        {/* Delete Row Action */}
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(index)}
                              title="Delete Row"
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row matching PHP: Add More Product button on left, Save button on right */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleAddMoreRow}
              className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Add More Product</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-7 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* SweetAlert Notification Modal */}
      {swalAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              {swalAlert.icon === 'error' && (
                <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center bg-red-50 text-red-600 text-3xl font-bold">
                  &times;
                </div>
              )}
              {swalAlert.icon === 'info' && (
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center bg-blue-50 text-blue-600 text-3xl font-bold">
                  !
                </div>
              )}
              {swalAlert.icon === 'success' && (
                <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center bg-green-50 text-green-600 text-3xl font-bold">
                  &#10003;
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {swalAlert.title}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {swalAlert.text}
            </p>

            <button
              type="button"
              onClick={() => setSwalAlert({ isOpen: false, title: '', text: '', icon: 'info' })}
              className="w-full bg-[#7cd1f9] hover:bg-[#68c6f3] text-white font-bold py-2 px-4 rounded transition-colors text-sm uppercase cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockIn;
