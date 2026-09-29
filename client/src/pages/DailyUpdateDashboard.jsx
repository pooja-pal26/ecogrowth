import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDailyUpdateData } from '../services/dashboardService';

const DailyUpdateDashboard = () => {
  const datePickerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  });

  const [dailyData, setDailyData] = useState(null);
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [officeExpenses, setOfficeExpenses] = useState([]);
  const [activeTabLeft, setActiveTabLeft] = useState('po');
  const [activeTabRight, setActiveTabRight] = useState('officeExpense');
  const [loading, setLoading] = useState(true);

  const fetchDailyData = async (dateVal = selectedDate) => {
    try {
      const res = await getDailyUpdateData({ date: dateVal });
      if (res) {
        setDailyData(res);
        setSiteExpenses(res.siteExpensesChart || []);
        setOfficeExpenses(res.officeExpensesChart || []);
      }
    } catch (error) {
      console.error('Error fetching daily update data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(selectedDate);
  }, []);

  const handleShowDate = (e) => {
    e.preventDefault();
    fetchDailyData(selectedDate);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1550px] mx-auto space-y-6">
        
        {/* Expenses Panel */}
        <div 
          className="rounded-t-lg px-5 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-white shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h3 className="text-xl font-bold">Expenses</h3>
          <form onSubmit={handleShowDate} className="flex items-center space-x-2">
            <div className="relative">
              <input 
                type="text" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select Date"
                className="px-3 py-1.5 rounded bg-white text-gray-800 text-sm font-medium outline-none w-36 text-center border border-gray-200 cursor-pointer" 
                onClick={() => {
                  if (datePickerRef.current?.showPicker) {
                    datePickerRef.current.showPicker();
                  } else {
                    datePickerRef.current?.focus();
                  }
                }}
              />
              <input
                type="date"
                ref={datePickerRef}
                className="absolute inset-0 opacity-0 pointer-events-none"
                tabIndex={-1}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    const formatted = `${d}/${m}/${y}`;
                    setSelectedDate(formatted);
                    fetchDailyData(formatted);
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Show
            </button>
          </form>
        </div>

        {/* Expenses Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-4 rounded-b-lg border border-gray-200 border-t-0 -mt-6 shadow-xs">
          {/* Site Expense Chart */}
          <div>
            <h4 className="text-center font-bold text-gray-800 my-4 text-base">Site Expense</h4>
            <div className="h-64 relative border-b border-gray-100 pb-2">
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 font-bold text-xs text-gray-500">Amount</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="total" fill="#0d9488" radius={[2, 2, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Office Expense Chart */}
          <div>
            <h4 className="text-center font-bold text-gray-800 my-4 text-base">Office Expense</h4>
            <div className="h-64 relative border-b border-gray-100 pb-2">
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 font-bold text-xs text-gray-500">Amount</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officeExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[2, 2, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recents Panel */}
        <div 
          className="rounded-t-lg px-5 py-3.5 text-white shadow-xs mt-6"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
          }}
        >
          <h3 className="text-xl font-bold">Recents</h3>
        </div>
        
        {/* Recents Tabs & Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-4 rounded-b-lg border border-gray-200 border-t-0 -mt-6 shadow-xs">
          
          {/* Left Column Tabs */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <nav 
              className="flex overflow-x-auto text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              {[
                { id: 'po', label: 'PO' },
                { id: 'po_sites', label: 'PO Sites' },
                { id: 'stock_in', label: 'Stock In' },
                { id: 'stock_out', label: 'Stock Out' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabLeft(tab.id)}
                  className={`py-2.5 px-5 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                    activeTabLeft === tab.id
                      ? 'bg-white text-gray-800'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="p-2 max-h-[340px] overflow-y-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <tbody>
                  {activeTabLeft === 'po' && (dailyData?.poSites || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The PO is added with PO Number <b>{item.po_no}</b> on Date <b>{item.created_at}</b> at location situated in <b>{item.operating_unit}</b> of client <b>{item.client_name}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabLeft === 'po_sites' && (dailyData?.poSites || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The PO is added with PO Number <b>{item.po_no}</b> on Date <b>{item.created_at}</b> at location situated in <b>{item.operating_unit}</b> of client <b>{item.client_name}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabLeft === 'stock_in' && (dailyData?.stockIn || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The stocks have been arrived at <b>{item.stock_in_date}</b> of product <b>{item.product_name}</b> from brand <b>{item.brand_name}</b> supplied by <b>{item.supplier_name}</b> of quantity <b>{item.quantity || item.brand_name}{item.unit}</b> and the product type is <b>{item.product_type_name}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabLeft === 'stock_out' && (dailyData?.stockOut || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The stocks are out at <b>{item.stock_out_date}</b> of product <b>{item.product_name}</b> from brand <b>{item.brand_name}</b> allocated to <b>{item.allocated_by}</b> of quantity <b>{item.quantity || item.brand_name}{item.unit}</b> and the product type is <b>{item.product_type_name}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="2" className="text-center py-3">
                      {activeTabLeft === 'po' && (
                        <Link to="/po-sites/po/po-details" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all PO Details &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabLeft === 'po_sites' && (
                        <Link to="/po-sites/po/po-details" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all PO Site Details &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabLeft === 'stock_in' && (
                        <Link to="/reports/stock-report/stock-in-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Stocks In Deatils &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabLeft === 'stock_out' && (
                        <Link to="/reports/stock-report/stock-out-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Stocks Out Details&nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column Tabs */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <nav 
              className="flex overflow-x-auto text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
            >
              {[
                { id: 'officeExpense', label: 'Office Expense' },
                { id: 'SiteExpense', label: 'Site Expense' },
                { id: 'Invoices', label: 'Invoices' },
                { id: 'Funds', label: 'Funds' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabRight(tab.id)}
                  className={`py-2.5 px-5 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                    activeTabRight === tab.id
                      ? 'bg-white text-gray-800'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="p-2 max-h-[340px] overflow-y-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <tbody>
                  {activeTabRight === 'officeExpense' && (dailyData?.officeExpense || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The Office expense of company <b>{item.company}</b> of amount <b>{item.amount}</b> which is transfered to <b>{item.payee}</b> from bank <b>{item.bank_name}</b> and account number is <b>{item.bank_account_number}</b> and the payment mode was <b>{item.payment_mode}</b> on date {item.tra || item.created_at || selectedDate}
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabRight === 'SiteExpense' && (dailyData?.siteExpense || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The Site expense of company <b>{item.company}</b> of amount <b>{item.amount}</b> which is transfered to <b>{item.transfer_to_name || item.payee}</b> from bank <b>{item.bank_name}</b> and account number is <b>{item.bank_account_number}</b> and the payment mode was <b>{item.payment_mode}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabRight === 'Invoices' && (dailyData?.invoices || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          THe invoice has been generate at <b>{item.invoice_date}</b> against PO <b>{item.po_no}</b> of Site <b>{item.site_id}</b> for client <b>{item.client_name}</b> in state <b>{item.state_name}</b> because <b>{item.invoice_remark}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  {activeTabRight === 'Funds' && (dailyData?.funds || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2.5 w-16 align-top">
                        <div style={{ border: '1px solid black', borderRadius: '20px' }} className="w-[50px] h-[50px] min-w-[50px] overflow-hidden flex items-center justify-center bg-white p-1">
                          <img src="/assets/images/ower.png" alt="" style={{ height: '50px', width: '50px' }} className="object-contain" />
                        </div>
                      </td>
                      <td className="p-2.5 align-middle">
                        <p className="text-gray-700 leading-relaxed">
                          The Fund transfered to company <b>{item.company}</b> of amount <b>{item.amount}</b> which is transfered to <b>{item.transfer_name}</b> from bank <b>{item.bank_name}</b> and account number is <b>{item.bank_account_number}</b> and the payment mode was <b>{item.payment_mode}</b>
                        </p>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="2" className="text-center py-3">
                      {activeTabRight === 'officeExpense' && (
                        <Link to="/expense-module/office-expense-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Office expense &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabRight === 'SiteExpense' && (
                        <Link to="/expense-module/site-expense-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Site Expense Details &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabRight === 'Invoices' && (
                        <Link to="/expense-module/invoice-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Invoice Deatils &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                      {activeTabRight === 'Funds' && (
                        <Link to="/expense-module/b2b-fund-transfer-report" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded border border-cyan-400 text-cyan-700 bg-white hover:bg-cyan-50 font-medium text-xs shadow-xs transition-colors">
                          <Users size={16} className="text-emerald-600" />
                          See all Fund Deatils &nbsp;<ArrowRight size={13} />
                        </Link>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DailyUpdateDashboard;
