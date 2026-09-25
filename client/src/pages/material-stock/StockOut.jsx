import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  fetchMaterialMasterData, 
  fetchProductsByType, 
  fetchProductStock, 
  fetchSitesByPo, 
  submitStockOut 
} from '../../services/materialApi';

const StockOut = () => {
  const navigate = useNavigate();

  // Master Data state
  const [masterData, setMasterData] = useState({
    productTypes: [],
    brands: [],
    poNumbers: []
  });

  // Cached sites by PO { [poNo]: Array<Site> }
  const [sitesList, setSitesList] = useState([]);

  // Cached products by type { [typeId]: Array<Product> }
  const [productsCache, setProductsCache] = useState({});

  // Header form state matching PHP material-stock-out.phtml
  const [headerForm, setHeaderForm] = useState({
    date_of_stock_out: new Date().toISOString().slice(0, 10),
    po_number: '',
    site_id: '',
    stock_allocated_to: '',
    remarks: ''
  });

  // Multi-row product items
  const initialRow = {
    id: 1,
    product_category: '',
    product_id: '',
    brand: '',
    total_quantity: 0,
    unit: '',
    quantity: ''
  };

  const [items, setItems] = useState([initialRow]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const data = await fetchMaterialMasterData();
        setMasterData({
          productTypes: data.productTypes || [],
          brands: data.brands || [],
          poNumbers: data.poNumbers || []
        });
      } catch (err) {
        console.error('Error loading master data for stock out:', err);
      }
    };
    loadMaster();
  }, []);

  const handleHeaderChange = async (field, value) => {
    setHeaderForm(prev => ({ ...prev, [field]: value }));

    // Cascading sites when PO number changes
    if (field === 'po_number') {
      setHeaderForm(prev => ({ ...prev, po_number: value, site_id: '' }));
      if (value) {
        try {
          const sites = await fetchSitesByPo(value);
          setSitesList(sites);
        } catch (err) {
          console.error('Error loading sites for PO:', err);
          setSitesList([]);
        }
      } else {
        setSitesList([]);
      }
    }
  };

  // Row category change
  const handleCategoryChange = async (index, categoryId) => {
    const updated = [...items];
    updated[index].product_category = categoryId;
    updated[index].product_id = '';
    updated[index].unit = '';
    updated[index].total_quantity = 0;
    updated[index].quantity = '';
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

  // Row product change
  const handleProductChange = async (index, productId) => {
    const updated = [...items];
    updated[index].product_id = productId;
    const categoryId = updated[index].product_category;

    if (productId && categoryId) {
      try {
        const stockData = await fetchProductStock(categoryId, productId);
        updated[index].unit = stockData.unit || '';
        updated[index].total_quantity = Number(stockData.total_quantity || 0);
      } catch (err) {
        console.error('Error fetching stock and unit for product:', err);
      }
    } else {
      updated[index].unit = '';
      updated[index].total_quantity = 0;
    }
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Validate Quantity against Total Quantity matching PHP validateQuantity()
  const handleQuantityBlur = (index) => {
    const row = items[index];
    const qty = parseFloat(row.quantity);
    const totalQty = parseFloat(row.total_quantity);

    if (qty > totalQty) {
      Swal.fire({
        title: 'Invalid Quantity !',
        text: "Quantity can't be greater than total quantity.",
        icon: 'error'
      });
      const updated = [...items];
      updated[index].quantity = '';
      setItems(updated);
    }
  };

  const handleAddMoreRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        product_category: '',
        product_id: '',
        brand: '',
        total_quantity: 0,
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

    // Validations matching PHP validateData() in material-stock-out.phtml
    if (!headerForm.date_of_stock_out) {
      Swal.fire('Missing', 'Please select date of stock out.', 'info');
      return;
    }
    if (!headerForm.po_number) {
      Swal.fire('Missing', 'Please select PO number.', 'info');
      return;
    }
    if (!headerForm.site_id) {
      Swal.fire('Missing', 'Please select site id.', 'info');
      return;
    }
    if (!headerForm.stock_allocated_to.trim()) {
      Swal.fire('Error', 'Please enter receiver name.', 'error');
      return;
    }

    // Validate rows
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.product_category) {
        Swal.fire('Missing', `Please select Product Category for row ${i + 1}.`, 'info');
        return;
      }
      if (!row.product_id) {
        Swal.fire('Missing', `Please select Product Name for row ${i + 1}.`, 'info');
        return;
      }
      if (!row.quantity || parseFloat(row.quantity) <= 0) {
        Swal.fire('Missing', `Please enter a valid positive quantity for row ${i + 1}.`, 'info');
        return;
      }
      if (parseFloat(row.quantity) > parseFloat(row.total_quantity)) {
        Swal.fire('Error', `Quantity for row ${i + 1} cannot exceed available total quantity (${row.total_quantity}).`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      await submitStockOut({
        ...headerForm,
        items
      });
      Swal.fire({
        title: 'Success !',
        text: 'Stock out has been updated successfully.',
        icon: 'success'
      }).then(() => {
        navigate('/material-stock/material-stock-report');
      });
    } catch (err) {
      Swal.fire('Error !', err.message || 'Failed to update stock out.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4 w-full max-w-7xl mx-auto space-y-3 font-sans">
      {/* Header Banner matching PHP panel-primary / panel-heading */}
      <div 
        className="rounded-t-lg px-4 py-2.5 min-h-[44px] flex items-center justify-between shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)' }}
      >
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Material Stock Out</span>
        </h1>
        <Link
          to="/material-stock/material-stock-report"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow transition-colors"
        >
          <Layers size={14} />
          <span>View Stock Report</span>
        </Link>
      </div>

      {/* Main Form Body with clean white background */}
      <div className="bg-white rounded-b-lg border-x border-b border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Mandatory notice */}
        <div className="text-red-600 font-bold text-xs sm:text-sm">
          * Fields are mandatory.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Stock Out <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                value={headerForm.date_of_stock_out}
                onChange={(e) => handleHeaderChange('date_of_stock_out', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PO Number <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={headerForm.po_number}
                onChange={(e) => handleHeaderChange('po_number', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              >
                <option value="">Select PO Number</option>
                {masterData.poNumbers.map((po, i) => (
                  <option key={i} value={po}>{po}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Site ID <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={headerForm.site_id}
                onChange={(e) => handleHeaderChange('site_id', e.target.value)}
                disabled={!headerForm.po_number}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500 disabled:bg-gray-100"
                required
              >
                <option value="">Select Site</option>
                {sitesList.map(s => (
                  <option key={s.id} value={s.site_id}>{s.site_id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Allocated To <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Receiver Name"
                value={headerForm.stock_allocated_to}
                onChange={(e) => handleHeaderChange('stock_allocated_to', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Remarks */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Remarks (if any)
              </label>
              <textarea
                rows={2}
                placeholder="Enter remarks here"
                value={headerForm.remarks}
                onChange={(e) => handleHeaderChange('remarks', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 3: Product Details Multi-Row Table matching PHP productDetailsTable */}
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 mb-2">Product Stock Allocation</h3>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-2.5 px-3 min-w-[170px]">Product Type</th>
                    <th className="py-2.5 px-3 min-w-[190px]">Product Name</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Brand</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total Quantity</th>
                    <th className="py-2.5 px-3 w-20 text-center">Unit</th>
                    <th className="py-2.5 px-3 w-28 text-right">Quantity</th>
                    <th className="py-2.5 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-blue-50/20">
                      <td className="py-2 px-3">
                        <select
                          value={row.product_category}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                          required
                        >
                          <option value="">Select Product Category</option>
                          {masterData.productTypes.map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.product_type_name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={row.product_id}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          disabled={!row.product_category}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500 disabled:bg-gray-100"
                          required
                        >
                          <option value="">Select Product</option>
                          {(productsCache[row.product_category] || []).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} {p.price ? `(${p.price})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={row.brand}
                          onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="">Select Product Brand</option>
                          {masterData.brands.map(b => (
                            <option key={b.id} value={b.id}>{b.brand_name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={row.total_quantity}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 text-gray-700 font-semibold text-right"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <input
                          type="text"
                          value={row.unit}
                          readOnly
                          placeholder="-"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 text-gray-600 text-center"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={row.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          onBlur={() => handleQuantityBlur(idx)}
                          placeholder="Qty"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-teal-500 text-right font-medium"
                          required
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add More Product Button matching PHP addMoreRow */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAddMoreRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>Add More Product</span>
              </button>
            </div>
          </div>

          {/* Form Action: Save */}
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

export default StockOut;
