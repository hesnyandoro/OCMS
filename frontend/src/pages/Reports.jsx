import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DollarSign, TrendingUp, TrendingDown, Users, Package, AlertCircle, Download, FileText, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);



const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [kpis, setKpis] = useState({ 
    totalKgs: 0, 
    dailyAvg: 0, 
    totalPaid: 0, 
    outstanding: 0,
    avgCostPerKg: 0,
    totalDeliveries: 0,
    totalFarmers: 0
  });

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAllData() {
    setLoading(true);
    try {
      // Fetch deliveries, payments, and farmers in parallel
      const [deliveriesRes, paymentsRes, farmersRes] = await Promise.all([
        api.get('/deliveries'),
        api.get('/payments'),
        api.get('/farmers')
      ]);

      setDeliveries(deliveriesRes.data);
      setPayments(paymentsRes.data);
      
      processData(deliveriesRes.data, paymentsRes.data, farmersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function processData(deliveriesData, paymentsData, farmersData) {
    // Calculate comprehensive KPIs
    const totalKgs = deliveriesData.reduce((sum, d) => sum + (d.kgsDelivered || 0), 0);
    const totalPaid = paymentsData.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalDeliveries = deliveriesData.length;
    const avgCostPerKg = totalKgs > 0 ? (totalPaid / totalKgs) : 0;
    
    // Calculate outstanding (total value - total paid)
    // Assuming average price per kg for estimation
    const estimatedTotalValue = totalKgs * avgCostPerKg;
    const outstanding = Math.max(0, estimatedTotalValue - totalPaid);
    
    // Daily average (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentDeliveries = deliveriesData.filter(d => new Date(d.date || d.createdAt) >= thirtyDaysAgo);
    const dailyAvg = Math.round(recentDeliveries.reduce((sum, d) => sum + (d.kgsDelivered || 0), 0) / 30);

    setKpis({
      totalKgs,
      totalPaid,
      outstanding,
      avgCostPerKg,
      dailyAvg,
      totalDeliveries,
      totalFarmers: farmersData.length
    });
  }



  // Season Analytics
  const seasonAnalytics = useMemo(() => {
    const longSeason = deliveries.filter(d => d.season === 'Long');
    const shortSeason = deliveries.filter(d => d.season === 'Short');
    
    return {
      long: {
        totalKgs: longSeason.reduce((sum, d) => sum + (d.kgsDelivered || 0), 0),
        deliveries: longSeason.length,
        farmers: new Set(longSeason.map(d => d.farmer?._id || d.farmer)).size
      },
      short: {
        totalKgs: shortSeason.reduce((sum, d) => sum + (d.kgsDelivered || 0), 0),
        deliveries: shortSeason.length,
        farmers: new Set(shortSeason.map(d => d.farmer?._id || d.farmer)).size
      }
    };
  }, [deliveries]);

  // Regional Distribution (for pie chart)
  const regionalData = useMemo(() => {
    const byRegion = {};
    payments.filter(p => p.status === 'Completed').forEach(payment => {
      const region = payment.farmer?.weighStation || payment.weighStation || 'Unknown';
      byRegion[region] = (byRegion[region] || 0) + (payment.amountPaid || 0);
    });
    
    return {
      labels: Object.keys(byRegion),
      datasets: [{
        data: Object.values(byRegion),
        backgroundColor: ['#1B4332', '#D93025', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        borderWidth: 0
      }]
    };
  }, [payments]);

  // Payouts vs Deliveries Over Time (line chart)
  const timelineData = useMemo(() => {
    // Group by month
    const monthlyData = {};
    
    deliveries.forEach(d => {
      const month = new Date(d.date || d.createdAt).toLocaleDateString('default', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { kgs: 0, payout: 0 };
      monthlyData[month].kgs += d.kgsDelivered || 0;
    });
    
    payments.filter(p => p.status === 'Completed').forEach(p => {
      const month = new Date(p.date || p.createdAt).toLocaleDateString('default', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { kgs: 0, payout: 0 };
      monthlyData[month].payout += p.amountPaid || 0;
    });
    
    const labels = Object.keys(monthlyData).sort();
    
    return {
      labels,
      datasets: [
        {
          label: 'Kgs Delivered',
          data: labels.map(l => monthlyData[l].kgs),
          borderColor: '#1B4332',
          backgroundColor: 'rgba(27, 67, 50, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Payout (Ksh)',
          data: labels.map(l => monthlyData[l].payout),
          borderColor: '#D93025',
          backgroundColor: 'rgba(217, 48, 37, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }, [deliveries, payments]);

  // Top 5 Performers (VIP farmers)
  const topPerformers = useMemo(() => {
    const farmerPayments = {};
    
    payments.filter(p => p.status === 'Completed').forEach(payment => {
      const farmerId = payment.farmer?._id || payment.farmer;
      const farmerName = payment.farmer?.name || 'Unknown';
      
      if (!farmerPayments[farmerId]) {
        farmerPayments[farmerId] = { name: farmerName, total: 0, count: 0 };
      }
      farmerPayments[farmerId].total += payment.amountPaid || 0;
      farmerPayments[farmerId].count += 1;
    });
    
    return Object.values(farmerPayments)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [payments]);





  function downloadCSV() {
    // Export deliveries data to CSV
    const rows = deliveries.map(d => ({
      Date: d.date ? new Date(d.date).toLocaleDateString() : '',
      Farmer: d.farmer?.name || '',
      'National ID': d.farmer?.nationalId || '',
      'Weigh Station': d.weighStation || '',
      'Kgs Delivered': d.kgsDelivered || 0,
      Season: d.season || '',
      'Vehicle Reg': d.vehicleReg || '',
      Driver: d.driver || ''
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Coffee Deliveries Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    const headers = [['Date', 'Farmer', 'National ID', 'Station', 'Kgs', 'Season', 'Driver']];
    const body = deliveries.map(d => [
      d.date ? new Date(d.date).toLocaleDateString() : '',
      d.farmer?.name || '',
      d.farmer?.nationalId || '',
      d.weighStation || '',
      String(d.kgsDelivered || 0),
      d.season || '',
      d.driver || ''
    ]);
    
    autoTable(doc, { head: headers, body, startY: 35 });
    doc.save(`deliveries_report_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  return (
    <div className="p-4 md:p-8 bg-[#F3F4F6] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Financial Intelligence & Reports</h1>
        <p className="text-gray-600">Comprehensive analytics and insights into deliveries, payments, and farmer performance</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      ) : (
        <>
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Outstanding */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#D93025]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Outstanding</p>
                  <h3 className="text-3xl font-bold text-gray-900">Ksh {kpis.outstanding.toLocaleString()}</h3>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Amount we owe
                  </p>
                </div>
                <div className="bg-[#D93025] p-3 rounded-lg">
                  <DollarSign size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Average Cost Per Kg */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#F59E0B]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Avg Cost Per Kg</p>
                  <h3 className="text-3xl font-bold text-gray-900">Ksh {kpis.avgCostPerKg.toFixed(2)}</h3>
                  <p className="text-xs text-gray-500 mt-1">Per kilogram delivered</p>
                </div>
                <div className="bg-[#F59E0B] p-3 rounded-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#1B4332]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Paid Out</p>
                  <h3 className="text-3xl font-bold text-gray-900">Ksh {kpis.totalPaid.toLocaleString()}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingDown size={12} />
                    Completed payments
                  </p>
                </div>
                <div className="bg-[#1B4332] p-3 rounded-lg">
                  <DollarSign size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Total Deliveries */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#10B981]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Deliveries</p>
                  <h3 className="text-3xl font-bold text-gray-900">{kpis.totalDeliveries.toLocaleString()}</h3>
                  <p className="text-xs text-gray-500 mt-1">{kpis.totalKgs.toLocaleString()} kgs total</p>
                </div>
                <div className="bg-[#10B981] p-3 rounded-lg">
                  <Package size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Season Analytics */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-[#1B4332]" />
              Season Performance Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Long Season */}
              <div className="border-2 border-[#1B4332] rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-[#1B4332]">Long Season</h3>
                  <span className="px-3 py-1 bg-[#1B4332] text-white text-xs rounded-full font-medium">ACTIVE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Kgs:</span>
                    <span className="font-bold">{seasonAnalytics.long.totalKgs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries:</span>
                    <span className="font-bold">{seasonAnalytics.long.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Farmers:</span>
                    <span className="font-bold">{seasonAnalytics.long.farmers}</span>
                  </div>
                </div>
              </div>

              {/* Short Season */}
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Short Season</h3>
                  <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-medium">INACTIVE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Kgs:</span>
                    <span className="font-bold">{seasonAnalytics.short.totalKgs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries:</span>
                    <span className="font-bold">{seasonAnalytics.short.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Farmers:</span>
                    <span className="font-bold">{seasonAnalytics.short.farmers}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance indicator */}
            <div className="mt-4 p-4 bg-[#F3F4F6] rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Season Performance:</strong> Long season is {
                  seasonAnalytics.long.totalKgs > seasonAnalytics.short.totalKgs 
                    ? `outperforming by ${((seasonAnalytics.long.totalKgs / Math.max(seasonAnalytics.short.totalKgs, 1) - 1) * 100).toFixed(1)}%`
                    : `underperforming by ${((1 - seasonAnalytics.long.totalKgs / Math.max(seasonAnalytics.short.totalKgs, 1)) * 100).toFixed(1)}%`
                } compared to short season.
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Regional Distribution - Doughnut */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Budget Distribution</h2>
              <p className="text-xs text-gray-600 mb-4">Which region consumes the most budget</p>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={regionalData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: { size: 11 },
                          color: '#374151'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Deliveries & Payouts Timeline - Line Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume vs Payout Trend</h2>
              <p className="text-xs text-gray-600 mb-4">Compare volume coming in and money going out over time</p>
              <div className="h-64">
                <Line
                  data={timelineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#374151',
                          usePointStyle: true
                        }
                      }
                    },
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Kgs Delivered',
                          color: '#1B4332'
                        },
                        ticks: {
                          color: '#1B4332'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Payout (Ksh)',
                          color: '#D93025'
                        },
                        ticks: {
                          color: '#D93025'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Top 5 Performers - VIP Management */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-[#F59E0B]" />
                  Top 5 Performers (VIP Farmers)
                </h2>
                <p className="text-sm text-gray-600 mt-1">Farmers receiving the most payments - priority management</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1B4332] text-white">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Farmer Name</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Total Payments</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Payment Count</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Avg Payment</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((farmer, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F3F4F6] transition-colors`}>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-[#F59E0B] text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-[#D97706] text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#1B4332]">{farmer.name}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">Ksh {farmer.total.toLocaleString()}</td>
                      <td className="py-4 px-6 text-gray-700">{farmer.count}</td>
                      <td className="py-4 px-6 text-gray-700">Ksh {(farmer.total / farmer.count).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">VIP</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#1B4332] text-[#1B4332] rounded-lg hover:bg-[#1B4332] hover:text-white transition-all font-semibold"
            >
              <FileText size={16} />
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#D93025] text-[#D93025] rounded-lg hover:bg-[#D93025] hover:text-white transition-all font-semibold"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
