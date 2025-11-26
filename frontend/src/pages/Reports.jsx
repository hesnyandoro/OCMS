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
    outstandingCherry: 0,
    outstandingParchment: 0,
    avgCostPerKg: 0,
    totalDeliveries: 0,
    totalFarmers: 0
  });

  // New analytics states
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [farmerPerformance, setFarmerPerformance] = useState(null);
  const [comparativeAnalytics, setComparativeAnalytics] = useState(null);
  const [deliveryTypeAnalytics, setDeliveryTypeAnalytics] = useState(null);
  const [operationalMetrics, setOperationalMetrics] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAllData();
    fetchAdvancedAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

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
    
    // Calculate average price per kg for each delivery type
    const cherryPayments = paymentsData.filter(p => p.status === 'Completed' && p.deliveryType === 'Cherry');
    const parchmentPayments = paymentsData.filter(p => p.status === 'Completed' && p.deliveryType === 'Parchment');
    
    const cherryKgs = cherryPayments.reduce((sum, p) => sum + (p.kgsDelivered || 0), 0);
    const parchmentKgs = parchmentPayments.reduce((sum, p) => sum + (p.kgsDelivered || 0), 0);
    
    const cherryTotalPaid = cherryPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const parchmentTotalPaid = parchmentPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    
    const avgCostPerKgCherry = cherryKgs > 0 ? (cherryTotalPaid / cherryKgs) : avgCostPerKg;
    const avgCostPerKgParchment = parchmentKgs > 0 ? (parchmentTotalPaid / parchmentKgs) : avgCostPerKg;
    
    // Calculate outstanding by delivery type: unpaid deliveries + voided payments not yet repaid
    // 1. Pending Cherry deliveries
    const pendingCherry = deliveriesData.filter(d => d.paymentStatus === 'Pending' && d.type === 'Cherry');
    const outstandingCherry = pendingCherry.reduce((sum, d) => {
      return sum + (d.kgsDelivered || 0) * avgCostPerKgCherry;
    }, 0);
    
    // 2. Pending Parchment deliveries
    const pendingParchment = deliveriesData.filter(d => d.paymentStatus === 'Pending' && d.type === 'Parchment');
    const outstandingParchment = pendingParchment.reduce((sum, d) => {
      return sum + (d.kgsDelivered || 0) * avgCostPerKgParchment;
    }, 0);
    
    const outstanding = outstandingCherry + outstandingParchment;
    
    // Daily average (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentDeliveries = deliveriesData.filter(d => new Date(d.date || d.createdAt) >= thirtyDaysAgo);
    const dailyAvg = Math.round(recentDeliveries.reduce((sum, d) => sum + (d.kgsDelivered || 0), 0) / 30);

    setKpis({
      totalKgs,
      totalPaid,
      outstanding,
      outstandingCherry,
      outstandingParchment,
      avgCostPerKg,
      dailyAvg,
      totalDeliveries,
      totalFarmers: farmersData.length
    });
  }

  async function fetchAdvancedAnalytics() {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const queryString = params.toString();
      
      const [
        paymentRes,
        farmerPerfRes,
        comparativeRes,
        deliveryTypeRes,
        operationalRes
      ] = await Promise.all([
        api.get(`/reports/payment-analytics?${queryString}`),
        api.get('/reports/farmer-performance?limit=20'),
        api.get('/reports/comparative-analytics'),
        api.get('/reports/delivery-type-analytics'),
        api.get('/reports/operational-metrics')
      ]);

      setPaymentAnalytics(paymentRes.data);
      setFarmerPerformance(farmerPerfRes.data);
      setComparativeAnalytics(comparativeRes.data);
      setDeliveryTypeAnalytics(deliveryTypeRes.data);
      setOperationalMetrics(operationalRes.data);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    }
  }



  // Season Analytics (Long: Oct-Mar, Short: Apr-Sep)
  const seasonAnalytics = useMemo(() => {
    const longSeason = deliveries.filter(d => {
      const month = new Date(d.date || d.createdAt).getMonth();
      // Long season: October (9) to March (2)
      return month >= 9 || month <= 2;
    });
    
    const shortSeason = deliveries.filter(d => {
      const month = new Date(d.date || d.createdAt).getMonth();
      // Short season: April (3) to September (8)
      return month >= 3 && month <= 8;
    });
    
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
    if (!deliveries.length && !payments.length) {
      // Return empty chart data structure
      return {
        labels: [],
        datasets: [
          {
            label: 'Kgs Delivered',
            data: [],
            borderColor: '#1B4332',
            backgroundColor: 'rgba(27, 67, 50, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Payout (KES)',
            data: [],
            borderColor: '#D93025',
            backgroundColor: 'rgba(217, 48, 37, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      };
    }

    // Group by month with proper date handling
    const monthlyDataMap = new Map();
    
    deliveries.forEach(d => {
      if (!d.date && !d.createdAt) return;
      const date = new Date(d.date || d.createdAt);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyDataMap.has(yearMonth)) {
        monthlyDataMap.set(yearMonth, { label, kgs: 0, payout: 0, date });
      }
      monthlyDataMap.get(yearMonth).kgs += d.kgsDelivered || 0;
    });
    
    payments.filter(p => p.status === 'Completed').forEach(p => {
      if (!p.date && !p.createdAt) return;
      const date = new Date(p.date || p.createdAt);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyDataMap.has(yearMonth)) {
        monthlyDataMap.set(yearMonth, { label, kgs: 0, payout: 0, date });
      }
      monthlyDataMap.get(yearMonth).payout += p.amountPaid || 0;
    });
    
    // Sort by date and extract data
    const sortedEntries = Array.from(monthlyDataMap.entries())
      .sort((a, b) => a[1].date - b[1].date);
    
    const labels = sortedEntries.map(([, data]) => data.label);
    const kgsData = sortedEntries.map(([, data]) => data.kgs);
    const payoutData = sortedEntries.map(([, data]) => data.payout);
    
    return {
      labels,
      datasets: [
        {
          label: 'Kgs Delivered',
          data: kgsData,
          borderColor: '#1B4332',
          backgroundColor: 'rgba(27, 67, 50, 0.1)',
          tension: 0.4,
          yAxisID: 'y',
          fill: false
        },
        {
          label: 'Payout (KES)',
          data: payoutData,
          borderColor: '#D93025',
          backgroundColor: 'rgba(217, 48, 37, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          fill: false
        }
      ]
    };
  }, [deliveries, payments]);

  function downloadCSV() {
    const timestamp = new Date().toISOString().split('T')[0];
    const csvData = [];

    // 1. KPIs Summary
    csvData.push(['FINANCIAL INTELLIGENCE REPORT']);
    csvData.push([`Generated: ${new Date().toLocaleString()}`]);
    csvData.push([]);
    csvData.push(['KEY PERFORMANCE INDICATORS']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Outstanding', `KES ${kpis.outstanding.toLocaleString()}`]);
    csvData.push(['Outstanding Cherry', `KES ${kpis.outstandingCherry.toLocaleString()}`]);
    csvData.push(['Outstanding Parchment', `KES ${kpis.outstandingParchment.toLocaleString()}`]);
    csvData.push(['Average Cost Per Kg', `KES ${kpis.avgCostPerKg.toFixed(2)}`]);
    csvData.push(['Total Paid Out', `KES ${kpis.totalPaid.toLocaleString()}`]);
    csvData.push(['Total Deliveries', kpis.totalDeliveries.toLocaleString()]);
    csvData.push(['Total Kgs', `${kpis.totalKgs.toLocaleString()} kgs`]);
    csvData.push(['Daily Average', `${kpis.dailyAvg.toLocaleString()} kgs`]);
    csvData.push(['Total Farmers', kpis.totalFarmers]);
    csvData.push([]);

    // 2. Season Performance
    csvData.push(['SEASON PERFORMANCE COMPARISON']);
    csvData.push(['Season', 'Total Kgs', 'Deliveries', 'Active Farmers']);
    csvData.push(['Long Season', seasonAnalytics.long.totalKgs.toLocaleString(), seasonAnalytics.long.deliveries, seasonAnalytics.long.farmers]);
    csvData.push(['Short Season', seasonAnalytics.short.totalKgs.toLocaleString(), seasonAnalytics.short.deliveries, seasonAnalytics.short.farmers]);
    csvData.push([]);

    // 3. Payment Analytics
    if (paymentAnalytics) {
      csvData.push(['PAYMENT STATUS ANALYTICS']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Success Rate', `${paymentAnalytics.successRate}%`]);
      csvData.push(['Payment Velocity', `${paymentAnalytics.paymentVelocity} per day`]);
      csvData.push(['Total Payments', paymentAnalytics.totalPayments]);
      csvData.push(['Voided Payments', paymentAnalytics.voidedPayments.total]);
      csvData.push(['Voided Amount', `KES ${paymentAnalytics.voidedPayments.totalAmount.toLocaleString()}`]);
      csvData.push([]);
      csvData.push(['Payment Aging']);
      csvData.push(['0-30 days', paymentAnalytics.agingBuckets['0-30']]);
      csvData.push(['31-60 days', paymentAnalytics.agingBuckets['31-60']]);
      csvData.push(['60+ days', paymentAnalytics.agingBuckets['60+']]);
      csvData.push([]);
    }

    // 4. Comparative Analytics
    if (comparativeAnalytics) {
      csvData.push(['COMPARATIVE GROWTH ANALYTICS']);
      csvData.push(['Month-over-Month']);
      csvData.push(['Metric', 'Current', 'Previous', 'Growth %']);
      csvData.push([
        'Deliveries (Kgs)',
        comparativeAnalytics.monthOverMonth.deliveries.current.totalKgs.toLocaleString(),
        comparativeAnalytics.monthOverMonth.deliveries.previous.totalKgs.toLocaleString(),
        comparativeAnalytics.monthOverMonth.deliveries.growth
      ]);
      csvData.push([
        'Payments (KES)',
        comparativeAnalytics.monthOverMonth.payments.current.totalAmount.toLocaleString(),
        comparativeAnalytics.monthOverMonth.payments.previous.totalAmount.toLocaleString(),
        comparativeAnalytics.monthOverMonth.payments.growth
      ]);
      csvData.push([]);
      csvData.push(['Year-over-Year']);
      csvData.push(['Metric', 'Current', 'Previous', 'Growth %']);
      csvData.push([
        'Deliveries (Kgs)',
        comparativeAnalytics.yearOverYear.deliveries.current.totalKgs.toLocaleString(),
        comparativeAnalytics.yearOverYear.deliveries.previous.totalKgs.toLocaleString(),
        comparativeAnalytics.yearOverYear.deliveries.growth
      ]);
      csvData.push([
        'Payments (KES)',
        comparativeAnalytics.yearOverYear.payments.current.totalAmount.toLocaleString(),
        comparativeAnalytics.yearOverYear.payments.previous.totalAmount.toLocaleString(),
        comparativeAnalytics.yearOverYear.payments.growth
      ]);
      csvData.push([]);
    }

    // 5. Farmer Performance
    if (farmerPerformance) {
      csvData.push(['FARMER PERFORMANCE & VIP MANAGEMENT']);
      csvData.push(['Summary']);
      csvData.push(['Active Farmers', farmerPerformance.summary.active]);
      csvData.push(['Inactive Farmers', farmerPerformance.summary.inactive]);
      csvData.push(['VIP Farmers', farmerPerformance.summary.vip]);
      csvData.push(['Total Tracked', farmerPerformance.summary.total]);
      csvData.push([]);
      csvData.push(['Rank', 'Farmer Name', 'Total Paid (KES)', 'Total Kgs', 'Deliveries', 'Reliability Score', 'Days Since Last', 'Status']);
      farmerPerformance.farmerPerformance.slice(0, 10).forEach((farmer, index) => {
        const status = farmer.totalPaid > 100000 ? 'VIP' : farmer.daysSinceLastDelivery <= 30 ? 'Active' : 'Inactive';
        csvData.push([
          index + 1,
          farmer.farmerName,
          farmer.totalPaid.toLocaleString(),
          farmer.totalKgs.toLocaleString(),
          farmer.totalDeliveries,
          farmer.reliabilityScore.toFixed(1),
          Math.round(farmer.daysSinceLastDelivery),
          status
        ]);
      });
      csvData.push([]);
    }

    // 6. Delivery Type Analytics
    if (deliveryTypeAnalytics) {
      csvData.push(['DELIVERY TYPE ANALYTICS']);
      csvData.push(['Type', 'Total Kgs', 'Deliveries', 'Avg Per Delivery', 'Avg Price/Kg']);
      deliveryTypeAnalytics.typeComparison.forEach(type => {
        const pricing = deliveryTypeAnalytics.pricingByType.find(p => p._id === type._id);
        csvData.push([
          type._id,
          type.totalKgs.toLocaleString(),
          type.deliveries,
          type.avgKgsPerDelivery.toFixed(2),
          pricing ? `KES ${pricing.avgPricePerKg.toFixed(2)}` : 'N/A'
        ]);
      });
      csvData.push([]);
    }

    // 7. Operational Metrics
    if (operationalMetrics) {
      csvData.push(['OPERATIONAL EFFICIENCY METRICS']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Avg Payment Cycle Time', `${operationalMetrics.avgPaymentCycleTime} days`]);
      csvData.push(['Avg Transaction Size', `KES ${parseFloat(operationalMetrics.avgTransactionSize).toLocaleString()}`]);
      csvData.push([]);
      csvData.push(['Last 30 Days Activity']);
      csvData.push(['Deliveries', operationalMetrics.systemUsage.last30Days.deliveries]);
      csvData.push(['Payments', operationalMetrics.systemUsage.last30Days.payments]);
      csvData.push(['New Farmers', operationalMetrics.systemUsage.last30Days.newFarmers]);
      csvData.push([]);
    }

    // 8. Detailed Deliveries
    csvData.push(['DETAILED DELIVERIES DATA']);
    csvData.push(['Date', 'Farmer', 'National ID', 'Region', 'Type', 'Kgs Delivered', 'Driver', 'Payment Status']);
    deliveries.forEach(d => {
      csvData.push([
        d.date ? new Date(d.date).toLocaleDateString() : '',
        d.farmer?.name || '',
        d.farmer?.nationalId || '',
        d.region || '',
        d.type || '',
        d.kgsDelivered || 0,
        d.driver || '',
        d.paymentStatus || 'Pending'
      ]);
    });
    csvData.push([]);

    // 9. Detailed Payments
    csvData.push(['DETAILED PAYMENTS DATA']);
    csvData.push(['Date', 'Farmer', 'Amount Paid (KES)', 'Delivery Type', 'Kgs', 'Price/Kg', 'Status', 'Void Reason']);
    payments.forEach(p => {
      csvData.push([
        p.date ? new Date(p.date).toLocaleDateString() : '',
        p.farmer?.name || '',
        p.amountPaid || 0,
        p.deliveryType || '',
        p.kgsDelivered || 0,
        p.pricePerKg || 0,
        p.status || '',
        p.voidReason || ''
      ]);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_report_${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    let yPosition = 20;
    const timestamp = new Date().toISOString().split('T')[0];

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Intelligence Report', 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
    yPosition += 10;

    // 1. KPIs Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Key Performance Indicators', 14, yPosition);
    yPosition += 7;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: [
        ['Total Outstanding', `KES ${kpis.outstanding.toLocaleString()}`],
        ['Outstanding Cherry', `KES ${kpis.outstandingCherry.toLocaleString()}`],
        ['Outstanding Parchment', `KES ${kpis.outstandingParchment.toLocaleString()}`],
        ['Avg Cost Per Kg', `KES ${kpis.avgCostPerKg.toFixed(2)}`],
        ['Total Paid Out', `KES ${kpis.totalPaid.toLocaleString()}`],
        ['Total Deliveries', kpis.totalDeliveries.toLocaleString()],
        ['Total Kgs', `${kpis.totalKgs.toLocaleString()} kgs`],
        ['Total Farmers', kpis.totalFarmers]
      ],
      theme: 'striped',
      headStyles: { fillColor: [27, 67, 50] },
      margin: { left: 14 }
    });
    yPosition = doc.lastAutoTable.finalY + 10;

    // 2. Season Performance
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Season Performance Comparison', 14, yPosition);
    yPosition += 7;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Season', 'Total Kgs', 'Deliveries', 'Farmers']],
      body: [
        ['Long Season', seasonAnalytics.long.totalKgs.toLocaleString(), seasonAnalytics.long.deliveries, seasonAnalytics.long.farmers],
        ['Short Season', seasonAnalytics.short.totalKgs.toLocaleString(), seasonAnalytics.short.deliveries, seasonAnalytics.short.farmers]
      ],
      theme: 'striped',
      headStyles: { fillColor: [27, 67, 50] },
      margin: { left: 14 }
    });
    yPosition = doc.lastAutoTable.finalY + 10;

    // 3. Farmer Performance (Top 10)
    if (farmerPerformance) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Top 10 Farmer Performance', 14, yPosition);
      yPosition += 7;
      
      const farmerData = farmerPerformance.farmerPerformance.slice(0, 10).map((farmer, index) => {
        const status = farmer.totalPaid > 100000 ? 'VIP' : farmer.daysSinceLastDelivery <= 30 ? 'Active' : 'Inactive';
        return [
          index + 1,
          farmer.farmerName,
          `KES ${farmer.totalPaid.toLocaleString()}`,
          farmer.totalKgs.toLocaleString(),
          farmer.totalDeliveries,
          status
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Farmer', 'Total Paid', 'Kgs', 'Deliveries', 'Status']],
        body: farmerData,
        theme: 'striped',
        headStyles: { fillColor: [27, 67, 50] },
        margin: { left: 14 },
        styles: { fontSize: 8 }
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // 4. Delivery Type Analytics
    if (deliveryTypeAnalytics) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Delivery Type Analytics', 14, yPosition);
      yPosition += 7;
      
      const typeData = deliveryTypeAnalytics.typeComparison.map(type => {
        const pricing = deliveryTypeAnalytics.pricingByType.find(p => p._id === type._id);
        return [
          type._id,
          type.totalKgs.toLocaleString(),
          type.deliveries,
          pricing ? `KES ${pricing.avgPricePerKg.toFixed(2)}` : 'N/A'
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Total Kgs', 'Deliveries', 'Avg Price/Kg']],
        body: typeData,
        theme: 'striped',
        headStyles: { fillColor: [27, 67, 50] },
        margin: { left: 14 }
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // 5. Detailed Deliveries
    doc.addPage();
    yPosition = 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Deliveries', 14, yPosition);
    yPosition += 7;
    
    const deliveryData = deliveries.map(d => [
      d.date ? new Date(d.date).toLocaleDateString() : '',
      d.farmer?.name || '',
      d.region || '',
      d.type || '',
      String(d.kgsDelivered || 0),
      d.paymentStatus || 'Pending'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Farmer', 'Region', 'Type', 'Kgs', 'Status']],
      body: deliveryData,
      theme: 'striped',
      headStyles: { fillColor: [27, 67, 50] },
      margin: { left: 14 },
      styles: { fontSize: 8 }
    });

    doc.save(`comprehensive_report_${timestamp}.pdf`);
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mb-2">Financial Intelligence & Reports</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive analytics and insights into deliveries, payments, and farmer performance</p>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-3 items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
              />
            </div>
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="mt-5 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 dark:text-dark-text-tertiary">Loading analytics...</div>
        </div>
      ) : (
        <>
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Outstanding by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-[#D93025] dark:border-red-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Total Outstanding</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">KES {kpis.outstanding.toLocaleString()}</h3>
                </div>
                <div className="bg-[#D93025] dark:bg-red-600 p-2 rounded-lg">
                  <DollarSign size={18} className="text-white" />
                </div>
              </div>
              
              {/* Cherry Outstanding */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mb-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Cherry</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    KES {kpis.outstandingCherry.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Parchment Outstanding */}
              <div className="pt-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Parchment</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    KES {kpis.outstandingParchment.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-[#1B4332] dark:border-dark-green-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Total Paid Out</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">KES {kpis.totalPaid.toLocaleString()}</h3>
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <TrendingDown size={10} />
                    Completed payments
                  </p>
                </div>
                <div className="bg-[#1B4332] dark:bg-dark-green-secondary p-2 rounded-lg">
                  <DollarSign size={18} className="text-white" />
                </div>
              </div>
            </div>

            {/* Total Deliveries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-[#10B981] dark:border-emerald-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">Total Deliveries</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpis.totalDeliveries.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-dark-text-tertiary mt-1">{kpis.totalKgs.toLocaleString()} kgs total</p>
                </div>
                <div className="bg-[#10B981] dark:bg-emerald-600 p-2 rounded-lg">
                  <Package size={18} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Season Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-[#1B4332] dark:text-dark-green-primary" />
              Season Performance Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Long Season */}
              <div className="border-2 border-[#1B4332] dark:border-dark-green-primary rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-[#1B4332] dark:text-dark-green-primary">Long Season</h3>
                  <span className="px-3 py-1 bg-[#1B4332] dark:bg-dark-green-primary text-white text-xs rounded-full font-medium">ACTIVE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Kgs:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.long.totalKgs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deliveries:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.long.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Farmers:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.long.farmers}</span>
                  </div>
                </div>
              </div>

              {/* Short Season */}
              <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">Short Season</h3>
                  <span className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-400 text-xs rounded-full font-medium">INACTIVE</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Kgs:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.short.totalKgs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deliveries:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.short.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Farmers:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{seasonAnalytics.short.farmers}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance indicator */}
            <div className="mt-4 p-4 bg-[#F3F4F6] dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-400">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Regional Budget Distribution</h2>
              <p className="text-xs text-gray-600 dark:text-dark-text-tertiary mb-4">Which region consumes the most budget</p>
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
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Volume vs Payout Trend</h2>
              <p className="text-xs text-gray-600 dark:text-dark-text-tertiary mb-4">Compare volume coming in and money going out over time</p>
              <div className="h-64">
                {timelineData.labels.length > 0 ? (
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
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        x: {
                          display: true,
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#6B7280'
                          }
                        },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Kgs Delivered',
                            color: '#1B4332'
                          },
                          ticks: {
                            color: '#1B4332'
                          },
                          grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Payout (KES)',
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Package size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No delivery or payment data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* Payment Analytics Section */}
          {paymentAnalytics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-[#10B981]" />
                Payment Status Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{paymentAnalytics.successRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{paymentAnalytics.totalPayments} total payments</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Velocity</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{paymentAnalytics.paymentVelocity}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">payments per day</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Voided Payments</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{paymentAnalytics.voidedPayments.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">KES {paymentAnalytics.voidedPayments.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Outstanding Payment Aging</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{paymentAnalytics.agingBuckets['0-30']}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">0-30 days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{paymentAnalytics.agingBuckets['31-60']}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">31-60 days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{paymentAnalytics.agingBuckets['60+']}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">60+ days</p>
                  </div>
                </div>
              </div>

              {Object.keys(paymentAnalytics.voidedPayments.reasons).length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Void Reasons Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(paymentAnalytics.voidedPayments.reasons).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{reason}</span>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full text-xs font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Comparative Analytics (YoY/MoM) */}
          {comparativeAnalytics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Comparative Growth Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Month-over-Month</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deliveries Growth</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {comparativeAnalytics.monthOverMonth.deliveries.growth}%
                        </span>
                        {parseFloat(comparativeAnalytics.monthOverMonth.deliveries.growth) > 0 ? (
                          <TrendingUp className="text-green-500" size={24} />
                        ) : (
                          <TrendingDown className="text-red-500" size={24} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparativeAnalytics.monthOverMonth.deliveries.current.totalKgs.toLocaleString()} kgs vs {comparativeAnalytics.monthOverMonth.deliveries.previous.totalKgs.toLocaleString()} kgs
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payments Growth</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {comparativeAnalytics.monthOverMonth.payments.growth}%
                        </span>
                        {parseFloat(comparativeAnalytics.monthOverMonth.payments.growth) > 0 ? (
                          <TrendingUp className="text-green-500" size={24} />
                        ) : (
                          <TrendingDown className="text-red-500" size={24} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        KES {comparativeAnalytics.monthOverMonth.payments.current.totalAmount.toLocaleString()} vs KES {comparativeAnalytics.monthOverMonth.payments.previous.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">Year-over-Year</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deliveries Growth</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {comparativeAnalytics.yearOverYear.deliveries.growth}%
                        </span>
                        {parseFloat(comparativeAnalytics.yearOverYear.deliveries.growth) > 0 ? (
                          <TrendingUp className="text-green-500" size={24} />
                        ) : (
                          <TrendingDown className="text-red-500" size={24} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparativeAnalytics.yearOverYear.deliveries.current.totalKgs.toLocaleString()} kgs vs {comparativeAnalytics.yearOverYear.deliveries.previous.totalKgs.toLocaleString()} kgs
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payments Growth</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {comparativeAnalytics.yearOverYear.payments.growth}%
                        </span>
                        {parseFloat(comparativeAnalytics.yearOverYear.payments.growth) > 0 ? (
                          <TrendingUp className="text-green-500" size={24} />
                        ) : (
                          <TrendingDown className="text-red-500" size={24} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        KES {comparativeAnalytics.yearOverYear.payments.current.totalAmount.toLocaleString()} vs KES {comparativeAnalytics.yearOverYear.payments.previous.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Farmer Performance & VIP Management */}
          {farmerPerformance && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#F59E0B]" />
                Farmer Performance & VIP Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Top performers and comprehensive farmer scorecards - priority management</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Farmers</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{farmerPerformance.summary.active}</p>
                </div>
                <div className="bg-red-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive Farmers</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{farmerPerformance.summary.inactive}</p>
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">VIP Farmers</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{farmerPerformance.summary.vip}</p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tracked</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{farmerPerformance.summary.total}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1B4332] dark:bg-dark-green-secondary text-white">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Farmer</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Total Paid</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Total Kgs</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Deliveries</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Reliability</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Days Since Last</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerPerformance.farmerPerformance.slice(0, 10).map((farmer, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors`}>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index === 0 ? 'bg-[#F59E0B] text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-[#D97706] text-white' :
                            'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1B4332] dark:text-dark-green-primary">{farmer.farmerName}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">KES {farmer.totalPaid.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-400">{farmer.totalKgs.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-400">{farmer.totalDeliveries}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            farmer.reliabilityScore > 5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            farmer.reliabilityScore > 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {farmer.reliabilityScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-400">{Math.round(farmer.daysSinceLastDelivery)} days</td>
                        <td className="py-3 px-4">
                          {farmer.totalPaid > 100000 ? (
                            <span className="px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">VIP</span>
                          ) : farmer.daysSinceLastDelivery <= 30 ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs rounded-full font-medium">Active</span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full font-medium">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Delivery Type Analytics */}
          {deliveryTypeAnalytics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Delivery Type Analytics (Cherry vs Parchment)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deliveryTypeAnalytics.typeComparison.map((type) => (
                  <div key={type._id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#1B4332] dark:text-dark-green-primary mb-4">{type._id}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Kgs:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{type.totalKgs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deliveries:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{type.deliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg per Delivery:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{type.avgKgsPerDelivery.toFixed(2)} kgs</span>
                      </div>
                      {deliveryTypeAnalytics.pricingByType.find(p => p._id === type._id) && (
                        <div className="flex justify-between border-t dark:border-gray-700 pt-2">
                          <span className="text-gray-600 dark:text-gray-400">Avg Price/Kg:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            KES {deliveryTypeAnalytics.pricingByType.find(p => p._id === type._id).avgPricePerKg.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Metrics */}
          {operationalMetrics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Operational Efficiency</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Payment Cycle</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{operationalMetrics.avgPaymentCycleTime} days</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From delivery to payment</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Transaction Size</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">KES {parseFloat(operationalMetrics.avgTransactionSize).toLocaleString()}</p>
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Last 30 Days Activity</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{operationalMetrics.systemUsage.last30Days.deliveries}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Deliveries</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{operationalMetrics.systemUsage.last30Days.payments}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payments</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{operationalMetrics.systemUsage.last30Days.newFarmers}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New Farmers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary rounded-lg hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white transition-all font-semibold"
            >
              <FileText size={16} />
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#D93025] dark:border-red-500 text-[#D93025] dark:text-red-400 rounded-lg hover:bg-[#D93025] dark:hover:bg-red-600 hover:text-white transition-all font-semibold"
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
