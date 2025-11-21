import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const defaultFilters = {
  startDate: '',
  endDate: '',
  type: '',
  region: '',
  driver: '',
  groupBy: 'weighStation',
};

const Reports = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [aggregated, setAggregated] = useState([]); // [{ group, totalKgs, totalPayout, deliveryCount }]
  const [transactions, setTransactions] = useState([]); // transaction level rows
  const [kpis, setKpis] = useState({ totalKgs: 0, dailyAvg: 0, totalPaid: 0, outstanding: 0 });

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchReports(opts = {}) {
    const p = { ...filters, ...opts };
    setLoading(true);
    try {
      const params = {};
      if (p.startDate) params.startDate = p.startDate;
      if (p.endDate) params.endDate = p.endDate;
      if (p.type) params.type = p.type;
      if (p.region) params.region = p.region;
      if (p.driver) params.driver = p.driver;
      if (p.groupBy) params.groupBy = p.groupBy;

      const res = await api.get('/reports/deliveries', { params });
      const data = res.data;

      // If backend returns an array (aggregated results), use it directly
      let agg = [];
      let tx = [];
      if (Array.isArray(data)) {
        agg = data;
      } else {
        // Defensive mapping: adapt to common response shapes
        agg = data?.aggregated || data?.grouped || data?.results || [];
        tx = data?.transactions || data?.rows || data?.items || [];
      }

      // If backend returns a flat shape with keys, try to map
      // Example: [{ region: 'North', weighStation: 'A', totalKgs: 1200, totalPayout: 50000 }]
      const normalizedAgg = agg.map(it => {
        return {
          group: it.groupName ?? it.group ?? it.weighStation ?? it.region ?? it.driver ?? 'Unknown',
          totalKgs: Number(it.totalKgs ?? it.kgs ?? it.total ?? 0),
          totalPayout: Number(it.totalPayout ?? it.totalPaid ?? it.payout ?? 0),
          deliveryCount: Number(it.deliveryCount ?? it.count ?? 0),
        };
      });

      setAggregated(normalizedAgg);
      setTransactions(tx.map(t => ({
        date: t.date || t.createdAt || t.timestamp,
        farmer: t.farmer?.name || t.farmerName || t.farmer,
        nationalId: t.farmer?.nationalId || t.nationalId || '',
        weighStation: t.weighStation || t.station || t.weighStationName || '',
        kgs: t.kgsDelivered ?? t.kgs ?? t.amount ?? 0,
        amount: t.amountPaid ?? t.amount ?? 0,
        driver: t.driver || t.driverName || '',
        status: t.status || '',
      })));

      // compute KPIs
      const totalKgs = normalizedAgg.reduce((s, a) => s + a.totalKgs, 0);
      const totalPaid = normalizedAgg.reduce((s, a) => s + a.totalPayout, 0);
      // daily average: if date range provided compute average per day, else per 30 days
      let days = 30;
      if (p.startDate && p.endDate) {
        const sd = new Date(p.startDate);
        const ed = new Date(p.endDate);
        const diff = Math.max(1, Math.ceil((ed - sd) / (1000 * 60 * 60 * 24)));
        days = diff;
      }
      const dailyAvg = days ? Math.round(totalKgs / days) : 0;
      const outstanding = Math.max(0, totalKgs * 0 - totalPaid); // placeholder if backend doesn't return outstanding

      setKpis({ totalKgs, dailyAvg, totalPaid, outstanding });
    } catch (err) {
      console.error('Failed fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    const labels = aggregated.map(a => a.group);
    const values = aggregated.map(a => a.totalKgs);
    return {
      labels,
      datasets: [
        {
          label: 'Kgs Delivered',
          data: values,
          backgroundColor: 'rgba(37,99,235,0.8)'
        }
      ]
    };
  }, [aggregated]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
  }

  async function applyFilters() {
    await fetchReports(filters);
  }

  function downloadCSV() {
    // build CSV from transactions if available, otherwise aggregated
    const rows = transactions.length > 0 ? transactions : aggregated.map(a => ({ group: a.group, kgs: a.totalKgs, payout: a.totalPayout }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${filters.groupBy || 'report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Deliveries Report', 14, 20);
    doc.setFontSize(10);
    const headers = [['Date', 'Farmer', 'National ID', 'Weigh Station', 'Kgs', 'Amount', 'Status']];
    const body = transactions.length > 0 ? transactions.map(t => [
      t.date ? new Date(t.date).toLocaleDateString() : '',
      t.farmer || '',
      t.nationalId || '',
      t.weighStation || '',
      String(t.kgs || ''),
      String(t.amount || ''),
      t.status || ''
    ]) : aggregated.map(a => [ '', a.group, '', '', String(a.totalKgs), String(a.totalPayout), String(a.deliveryCount) ]);

    // @ts-ignore - autoTable attached to jsPDF
    doc.autoTable({ head: headers, body, startY: 30, styles: { fontSize: 9 } });
    doc.save(`report_${filters.groupBy || 'report'}.pdf`);
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-2">Reports</h1>
      <p className="text-sm text-gray-600 mb-6">Generate and export deliveries & payments reports. Filter by date, delivery, region and driver.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 md:col-span-3 bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-600">Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-600">End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Delivery</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="select select-bordered w-full">
                <option value="">All</option>
                <option value="Cherry">Cherry</option>
                <option value="Parchment">Parchment</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Region</label>
              <input name="region" value={filters.region} onChange={handleFilterChange} className="input input-bordered w-full" placeholder="Region" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Driver</label>
              <input name="driver" value={filters.driver} onChange={handleFilterChange} className="input input-bordered w-full" placeholder="Driver name" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Group By</label>
              <select name="groupBy" value={filters.groupBy} onChange={handleFilterChange} className="select select-bordered w-full">
                <option value="weighStation">Weigh Station</option>
                <option value="region">Region</option>
                <option value="driver">Driver</option>
                <option value="month">Month</option>
                <option value="farmer">Farmer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="btn btn-primary">Apply</button>
            <button onClick={() => { setFilters(defaultFilters); fetchReports(defaultFilters); }} className="btn">Reset</button>
            <div className="ml-auto flex gap-2">
              <button onClick={downloadCSV} className="btn btn-outline">Export CSV</button>
              <button onClick={exportPDF} className="btn btn-outline">Export PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Production (by {filters.groupBy})</h3>
          {loading ? <div>Loading...</div> : (
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          )}
        </div>

        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">KPIs</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><div>Total Kgs</div><div className="font-bold">{kpis.totalKgs.toLocaleString()}</div></div>
            <div className="flex justify-between"><div>Daily Avg</div><div className="font-bold">{kpis.dailyAvg.toLocaleString()}</div></div>
            <div className="flex justify-between"><div>Total Paid</div><div className="font-bold">KES {kpis.totalPaid.toLocaleString()}</div></div>
            <div className="flex justify-between"><div>Outstanding</div><div className="font-bold">KES {kpis.outstanding.toLocaleString()}</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Farmer</th>
                <th>National ID</th>
                <th>Weigh Station</th>
                <th>Kgs</th>
                <th>Amount</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
                  <td>{t.farmer}</td>
                  <td>{t.nationalId}</td>
                  <td>{t.weighStation}</td>
                  <td>{t.kgs}</td>
                  <td>{t.amount}</td>
                  <td>{t.driver}</td>
                  <td>{t.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">No transactions for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;