import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Papa from 'papaparse';
import jsPDF from 'jspdf';


const Payments = () => {
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
      Date: new Date(p.date).toLocaleDateString(),
      Farmer: p.farmer?.name || (p.farmer ?? ''),
      Amount: p.amountPaid,
      Currency: p.currency,
      Status: p.status,
      Delivery: p.delivery?._id || ''
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Payments Report', 10, 10);
    let y = 20;
    const header = ['Date', 'Farmer', 'Amount', 'Currency', 'Status'];
    doc.text(header.join(' | '), 10, y); y += 8;
    filtered.forEach(p => {
      const line = [
        new Date(p.date).toLocaleDateString(),
        p.farmer?.name || '',
        p.amountPaid,
        p.currency,
        p.status
      ].join(' | ');
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 10, y);
      y += 8;
    });
    doc.save('payments.pdf');
  };

  const totalAmount = filtered.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);

  return (
    <div className="p-4">
      <h1 className="mb-4">Payments</h1>

      <div className="d-flex align-items-center mb-3 gap-2">
        <label className="me-2">Start:</label>
        <ReactDatePicker selected={startDate} onChange={date => setStartDate(date)} isClearable />
        <label className="ms-3 me-2">End:</label>
        <ReactDatePicker selected={endDate} onChange={date => setEndDate(date)} isClearable />
        <label className="ms-3 me-2">Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-auto">
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Failed</option>
        </select>

        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-secondary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      <div className="mb-2">Showing {filtered.length} payments — Total: {totalAmount}</div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Farmer</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Recorded By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.farmer?.name || ''}</td>
                <td>{p.amountPaid}</td>
                <td>{p.currency}</td>
                <td>{p.status}</td>
                <td>{p.recordedBy || ''}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deletePayment(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Payments;