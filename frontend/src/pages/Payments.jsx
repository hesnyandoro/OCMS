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

  const deletePayment = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await api.delete(`/payments/${id}`);
      setPayments(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete payment');
    }
  };

  const exportCSV = () => {
    const rows = filtered.map(p => ({
      Date: p.date ? new Date(p.date).toLocaleDateString() : '',
      Farmer: p.farmer?.name || 'N/A',
      'Farmer Phone': p.farmer?.cellNumber || '',
      'Weigh Station': p.farmer?.weighStation || '',
      'Amount Paid': p.amountPaid || 0,
      Currency: p.currency || 'Ksh',
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
    doc.text(`Total Amount: Ksh ${totalAmount.toLocaleString()}`, 14, 40);
    doc.text(`Completed: ${completedCount} | Pending: ${pendingCount} | Failed: ${failedCount}`, 14, 46);
    
    // Table
    const headers = [['Date', 'Farmer', 'Amount', 'Status', 'Recorded By']];
    const body = filtered.map(p => [
      p.date ? new Date(p.date).toLocaleDateString() : '',
      p.farmer?.name || 'N/A',
      `${p.currency || 'Ksh'} ${Number(p.amountPaid || 0).toLocaleString()}`,
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
    <div className="min-h-screen bg-[#F1F8F4] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332]">Payments</h1>
            <p className="text-gray-600 mt-1">Manage payment records and transactions</p>
          </div>
          <div className="flex gap-2">
            {canCreate(authState?.role, 'payments') && (
              <button
                onClick={() => navigate('/dashboard/payments/new')}
                className="flex items-center gap-2 bg-[#1B4332] text-white px-6 py-3 rounded-lg hover:bg-[#2D6A4F] transition-all shadow-md hover:shadow-lg"
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
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1B4332]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-[#1B4332] mt-2">Ksh {totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="text-[#1B4332] opacity-20" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{completedCount}</p>
            </div>
            <CheckCircle size={40} className="text-green-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <Clock size={40} className="text-yellow-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{failedCount}</p>
            </div>
            <XCircle size={40} className="text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <ReactDatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              isClearable
              placeholderText="Select start date"
              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <ReactDatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              isClearable
              placeholderText="Select end date"
              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export</label>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#1B4332] text-[#1B4332] rounded-lg hover:bg-[#1B4332] hover:text-white transition-all"
              >
                <FileText size={16} />
                <span>CSV</span>
              </button>
              <button
                onClick={exportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#D93025] text-[#D93025] rounded-lg hover:bg-[#D93025] hover:text-white transition-all"
              >
                <Download size={16} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-[#1B4332]">{filtered.length}</span> of {payments.length} payments
          </p>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading payments...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No payments found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B4332] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Farmer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Recorded By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((payment, index) => (
                  <tr key={payment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {payment.farmer?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1B4332]">
                      {payment.currency} {Number(payment.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.recordedBy?.name || payment.recordedBy?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deletePayment(payment._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
