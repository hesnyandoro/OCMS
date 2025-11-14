import React, { useState } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import ReactDatePicker from 'react-datepicker';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  // region, driver inputs

  const fetchReport = async () => {
    const { data } = await api.get('/reports', { params: { startDate, endDate /*, region, driver*/ } });
    setReport(data);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(report.deliveries); // Simplify
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Report', 10, 10);
    // Add data
    doc.save('report.pdf');
  };

  return (
    <div>
      <label style={{ marginRight: 8 }}>
        Start Date:
        <ReactDatePicker selected={startDate} onChange={date => setStartDate(date)} />
      </label>
      <label style={{ marginRight: 8 }}>
        End Date:
        <ReactDatePicker selected={endDate} onChange={date => setEndDate(date)} />
      </label>
      <button onClick={fetchReport}>Generate</button>
      <button onClick={exportCSV}>Export CSV</button>
      <button onClick={exportPDF}>Export PDF</button>
      {/* Display report in react-table */}
    </div>
  );
};

export default Reports;