import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Download, FileText, DollarSign, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { canCreate } from '../utils/permissions';


const Payments = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/payments');
        setPayments(data || []);
      } catch (err) {
        console.error('Failed loading payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    let list = [...payments];
    if (startDate) list = list.filter(p => new Date(p.date) >= startDate);
    if (endDate) list = list.filter(p => new Date(p.date) <= endDate);
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter);
    setFiltered(list);
  }, [payments, startDate, endDate, statusFilter]);

  const [showVoidModal, setShowVoidModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const handleVoidPayment = async () => {
    if (!voidReason.trim()) {
      alert('Please provide a reason for voiding this payment');
      return;
    }

    setIsVoiding(true);
    try {
      await api.put(`/payments/${selectedPayment._id}`, {
        status: 'Failed',
        voidReason: voidReason,
        voidedAt: new Date().toISOString(),
        voidedBy: authState?.user?._id
      });
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p._id === selectedPayment._id 
          ? { ...p, status: 'Failed', voidReason, voidedAt: new Date().toISOString() }
          : p
      ));
      
      alert('Payment has been voided successfully');
      setShowVoidModal(false);
      setVoidReason('');
      setSelectedPayment(null);
    } catch (err) {
      console.error('Void payment failed', err);
      alert(err?.response?.data?.msg || 'Failed to void payment');
    } finally {
      setIsVoiding(false);
    }
  };

  const exportCSV = () => {
    const rows = filtered.map(p => ({
      Date: p.date ? new Date(p.date).toLocaleDateString() : '',
      Farmer: p.farmer?.name || 'N/A',
      'Farmer Phone': p.farmer?.cellNumber || '',
      'Weigh Station': p.farmer?.weighStation || '',
      'Amount Paid': p.amountPaid || 0,
      Currency: p.currency || 'KES',
      Status: p.status || '',
      'Delivery Date': p.delivery?.date ? new Date(p.delivery.date).toLocaleDateString() : '',
      'Kgs Delivered': p.delivery?.kgsDelivered || '',
      'Recorded By': p.recordedBy?.name || p.recordedBy?.username || ''
    }));
    
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(27, 67, 50); // Estate Green
    doc.text('Coffee Payments Report', 14, 20);
    
    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Payments: ${filtered.length}`, 14, 34);
    doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 14, 40);
    doc.text(`Completed: ${completedCount} | Pending: ${pendingCount} | Failed: ${failedCount}`, 14, 46);
    
    // Table
    const headers = [['Date', 'Farmer', 'Amount', 'Status', 'Recorded By']];
    const body = filtered.map(p => [
      p.date ? new Date(p.date).toLocaleDateString() : '',
      p.farmer?.name || 'N/A',
      `${p.currency || 'KES'} ${Number(p.amountPaid || 0).toLocaleString()}`,
      p.status || '',
      p.recordedBy?.name || p.recordedBy?.username || 'N/A'
    ]);
    
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 52,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [27, 67, 50] } // Estate Green
    });
    
    doc.save(`payments_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totalAmount = filtered.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
  const completedCount = filtered.filter(p => p.status === 'Completed').length;
  const pendingCount = filtered.filter(p => p.status === 'Pending').length;
  const failedCount = filtered.filter(p => p.status === 'Failed').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={16} />;
      case 'Pending': return <Clock size={16} />;
      case 'Failed': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100">Payments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage farmer payments</p>
          </div>
          <div className="flex gap-2">
            {canCreate(authState?.role, 'payments') && (
              <button
                onClick={() => navigate('/dashboard/payments/new')}
                className="flex items-center gap-2 bg-[#1B4332] dark:bg-dark-green-primary text-white px-6 py-3 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-[#1B4332] dark:border-dark-green-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mt-2">KES {totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="text-[#1B4332] dark:text-dark-green-primary opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 dark:border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{completedCount}</p>
            </div>
            <CheckCircle size={40} className="text-green-500 dark:text-green-400 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500 dark:border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{pendingCount}</p>
            </div>
            <Clock size={40} className="text-yellow-500 dark:text-yellow-400 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500 dark:border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{failedCount}</p>
            </div>
            <XCircle size={40} className="text-red-500 dark:text-red-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Start Date</label>
            <ReactDatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              isClearable
              placeholderText="Select start date"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">End Date</label>
            <ReactDatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              isClearable
              placeholderText="Select end date"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Export</label>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary rounded-lg hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white transition-all"
              >
                <FileText size={16} />
                <span>CSV</span>
              </button>
              <button
                onClick={exportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#D93025] dark:border-red-500 text-[#D93025] dark:text-red-400 rounded-lg hover:bg-[#D93025] dark:hover:bg-red-600 hover:text-white transition-all"
              >
                <Download size={16} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold text-[#1B4332] dark:text-gray-100">{filtered.length}</span> of {payments.length} payments
          </p>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-dark-text-tertiary">Loading payments...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No payments found</p>
          <p className="text-gray-400 dark:text-dark-text-muted mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B4332] dark:bg-dark-green-secondary text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Farmer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Recorded By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((payment, index) => (
                  <tr key={payment._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400 dark:text-dark-text-muted" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {payment.farmer?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1B4332] dark:text-dark-green-primary">
                      {payment.currency} {Number(payment.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                          {payment.voidReason && (
                            <span className="ml-1 text-xs">ⓘ</span>
                          )}
                        </span>
                        
                        {payment.voidReason && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
                            <p className="font-semibold mb-1">Void Reason:</p>
                            <p className="mb-2">{payment.voidReason}</p>
                            {payment.voidedAt && (
                              <p className="text-gray-300 dark:text-gray-400">
                                Voided on: {new Date(payment.voidedAt).toLocaleString()}
                              </p>
                            )}
                            <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {payment.recordedBy?.name || payment.recordedBy?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'Completed' && canCreate(authState?.role, 'payments') && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowVoidModal(true);
                          }}
                          className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors text-sm font-medium"
                        >
                          Void
                        </button>
                      )}
                      {payment.status === 'Failed' && payment.voidReason && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Voided
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Void Payment Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Void Payment
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                ⚠️ Warning: This action will mark the payment as Failed
              </p>
            </div>

            {selectedPayment && (
              <div className="mb-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Farmer: </span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedPayment.farmer?.name}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Amount: </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {selectedPayment.currency} {Number(selectedPayment.amountPaid).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date: </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedPayment.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Voiding *
              </label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason (e.g., Duplicate payment, Incorrect amount, Payment error...)"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This reason will be recorded in the payment history
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> The payment record will be preserved for audit purposes. 
                The delivery status will remain unchanged. To correct this payment, you may need to create a new payment record.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setVoidReason('');
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isVoiding}
              >
                Cancel
              </button>
              <button
                onClick={handleVoidPayment}
                disabled={isVoiding || !voidReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVoiding ? 'Voiding...' : 'Void Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
