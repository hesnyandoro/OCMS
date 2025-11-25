import React, { useState, useEffect } from 'react';
import { Users, Filter, List, Loader2, BarChart3, TrendingUp, Package, DollarSign, Calendar, MapPin } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const Dashboard = () => {
    const { authState } = useAuth();
    const { theme } = useTheme();
    const user = authState?.user;
    const isDark = theme === 'dark';
    
    // --- State Hooks ---
    const [filterDate, setFilterDate] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    const [filterDelivery, setFilterDelivery] = useState('');
    
    const [dashboardData, setDashboardData] = useState({
        totalFarmers: 0,
        kgsDelivered: 0,
        totalPayments: 0,
        pendingReports: 0,
        recentActivities: [],
        monthlyKgs: { labels: [], values: [] },
        paymentsStatus: { Pending: 0, Completed: 0, Failed: 0 }
    });
    
    const [loading, setLoading] = useState(true);

    // Fetch Dashboard Data 
    const fetchDashboardData = async (params = {}) => {
        setLoading(true);
        try {
            const response = await api.get('/dashboard/summary', { params });
            const fetchedData = response.data || {};

            // Support both the new flat shape and older nested shape (defensive)
            const totalFarmers = fetchedData.totalFarmers ?? (fetchedData.farmers?.total) ?? 0;
            const kgsDelivered = fetchedData.kgsDelivered ?? (fetchedData.deliveries?.kgsMonth) ?? 0;
            const totalPayments = fetchedData.totalPayments ?? (fetchedData.payments?.totalMonth) ?? 0;
            const pendingReports = fetchedData.pendingReports ?? (fetchedData.reports?.pendingCount) ?? 0;
            const recentActivities = fetchedData.recentActivities ?? fetchedData.activity ?? [];
            const monthlyKgs = fetchedData.monthlyKgs ?? { labels: [], values: [] };
            const paymentsStatus = fetchedData.paymentsStatus ?? { Pending: 0, Completed: 0, Failed: 0 };

            setDashboardData({
                totalFarmers,
                kgsDelivered,
                totalPayments,
                pendingReports,
                recentActivities,
                monthlyKgs,
                paymentsStatus,
            });

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        
    }, []);

    // --- KPI Data Configuration ---
    const kpiData = [
        { 
            title: "Total Farmers", 
            value: dashboardData.totalFarmers.toLocaleString(), 
            icon: <Users size={24} />,
            color: "#1B4332", 
            bgColor: "bg-[#1B4332] dark:bg-dark-green-primary", 
            change: "Registered in system",
            link: "/dashboard/farmers"
        },
        { 
            title: "Kgs Delivered", 
            value: dashboardData.kgsDelivered.toLocaleString(), 
            icon: <Package size={24} />,
            color: "#D93025", 
            bgColor: "bg-[#D93025] dark:bg-red-600", 
            change: "This month",
            link: "/dashboard/deliveries"
        },
        { 
            title: "Total Payments", 
            value: `Ksh ${dashboardData.totalPayments.toLocaleString()}`, 
            icon: <DollarSign size={24} />,
            color: "#F59E0B", 
            bgColor: "bg-[#F59E0B] dark:bg-dark-gold-primary", 
            change: "Current month",
            link: "/dashboard/payments"
        },
        { 
            title: "Pending Reports", 
            value: dashboardData.pendingReports.toString(), 
            icon: <List size={24} />,
            color: "#6B7280", 
            bgColor: "bg-gray-600 dark:bg-gray-500", 
            change: "Action required",
            link: "/dashboard/reports"
        },
    ];

    // --- Filter Card Component ---
    const FilterCard = () => (
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="text-[#1B4332] dark:text-emerald-400" size={20} />
                <h3 className="text-lg text-gray-900 dark:text-gray-100 font-semibold">Filter Dashboard Data</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Date Input */}
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Date</label>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 focus:border-transparent transition" 
                    />
                </div>

                {/* Region Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Region</label>
                    <select 
                        value={filterRegion} 
                        onChange={(e) => setFilterRegion(e.target.value)} 
                        className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 focus:border-transparent transition"
                    >
                        <option value="">All Regions</option>
                        <option>North</option>
                        <option>South</option>
                        <option>East</option>
                    </select>
                </div>
                
                {/* Driver Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Delivery Driver</label>
                    <select 
                        value={filterDriver} 
                        onChange={(e) => setFilterDriver(e.target.value)} 
                        className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 focus:border-transparent transition"
                    >
                        <option value="">All Drivers</option>
                        <option>Driver A</option>
                        <option>Driver B</option>
                        <option>Driver C</option>
                    </select>
                </div>
                
                {/* Delivery Type Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Delivery Type</label>
                    <select 
                        value={filterDelivery} 
                        onChange={(e) => setFilterDelivery(e.target.value)} 
                        className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 focus:border-transparent transition"
                    >
                        <option value="">All Types</option>
                        <option value="Cherry">Cherry</option>
                        <option value="Parchment">Parchment</option>
                    </select>
                </div>
                
                {/* Apply Button */}
                <div>
                    <button 
                        onClick={() => {
                            const params = {};
                            if (filterRegion) params.region = filterRegion;
                            if (filterDriver) params.driver = filterDriver;
                            if (filterDelivery) params.type = filterDelivery;
                            fetchDashboardData(params);
                        }} 
                        className="w-full bg-[#1B4332] dark:bg-emerald-600 hover:bg-[#2D5F4D] dark:hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md dark:shadow-none transition-all duration-200"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );

    // Main Render Function
    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <p className="text-sm">
                        Welcome back, <span className="font-semibold text-[#1B4332] dark:text-emerald-400">{user?.username || 'User'}</span>
                        {user?.assignedRegion && (
                            <>
                                <span className="mx-2">•</span>
                                <MapPin size={14} className="inline" />
                                <span className="ml-1">{user?.assignedRegion} Region</span>
                            </>
                        )}
                    </p>
                </div>
            </div>
            
            {loading && (
                <div className="text-center p-16">
                    <Loader2 className="animate-spin text-[#1B4332] dark:text-emerald-400 text-4xl mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Dashboard Data...</p>
                </div>
            )}
            
            {!loading && (
                <div className="space-y-8">
                    
                    {/* 1. FULL WIDTH FILTER BAR */}
                    <FilterCard />

                    {/* 2. MAIN CONTENT AREA (Now full width) */}
                    <div className="space-y-8"> 
                        
                        {/* KPI STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {kpiData.map((kpi, index) => (
                                <Link 
                                    key={index} 
                                    to={kpi.link}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none border dark:border-gray-700 hover:shadow-xl dark:hover:border-gray-600 transition-all duration-300 p-6 border-l-4 group cursor-pointer ${
                                        index === 0 ? 'border-l-[#1B4332] dark:border-l-emerald-500' :
                                        index === 1 ? 'border-l-[#D93025] dark:border-l-red-500' :
                                        index === 2 ? 'border-l-[#F59E0B] dark:border-l-amber-500' :
                                        'border-l-gray-600 dark:border-l-gray-500'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{kpi.title}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{kpi.change}</p>
                                        </div>
                                        <div 
                                            className={`${kpi.bgColor} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            {kpi.icon}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* CHARTS / DATA VISUALIZATION SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* Delivery Chart (2/3 Width) */}
                            <div className="xl:col-span-2 bg-white dark:bg-gray-800 shadow-lg dark:shadow-none border dark:border-gray-700 rounded-xl p-6 transition-all duration-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 size={20} className="text-[#1B4332] dark:text-emerald-400" />
                                <div className="h-72 rounded-lg">
                                    <Bar
                                        key={`bar-chart-${theme}`}
                                        data={{
                                            labels: dashboardData.monthlyKgs.labels,
                                            datasets: [
                                                {
                                                    label: 'Kgs Delivered',
                                                    data: dashboardData.monthlyKgs.values,
                                                    backgroundColor: isDark ? '#10b981' : '#1B4332',
                                                    borderRadius: 8,
                                                    borderSkipped: false,
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { 
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: isDark ? '#1F2937' : '#1B4332',
                                                    padding: 12,
                                                    titleFont: { size: 14 },
                                                    bodyFont: { size: 13 },
                                                    borderColor: isDark ? '#374151' : 'transparent',
                                                    borderWidth: 1
                                                }
                                            },
                                            scales: { 
                                                y: { 
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: isDark ? '#374151' : '#F3F4F6',
                                                        drawBorder: false
                                                    },
                                                    ticks: {
                                                        color: isDark ? '#9CA3AF' : '#6B7280'
                                                    },
                                                    border: {
                                                        display: false
                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: isDark ? '#9CA3AF' : '#6B7280'
                                                    },
                                                    border: {
                                                        display: false
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Payments Snapshot Chart (1/3 Width) */}
                            <div className="xl:col-span-1 bg-white dark:bg-gray-800 shadow-lg dark:shadow-none border dark:border-gray-700 rounded-xl p-6 transition-all duration-200">
                                <div className="h-72 flex items-center justify-center">
                                    <Doughnut
                                        key={`doughnut-chart-${theme}`}
                                        data={{
                                            labels: ['Completed', 'Pending', 'Failed'],
                                            datasets: [
                                                {
                                                    data: [
                                                        dashboardData.paymentsStatus.Completed || 0,
                                                        dashboardData.paymentsStatus.Pending || 0,
                                                        dashboardData.paymentsStatus.Failed || 0
                                                    ],
                                                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                                                    borderWidth: isDark ? 2 : 0,
                                                    borderColor: isDark ? '#1F2937' : 'transparent',
                                                    hoverOffset: 4
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { 
                                                legend: { 
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        font: {
                                                            size: 12
                                                        },
                                                        color: isDark ? '#D1D5DB' : '#374151'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                                    titleColor: isDark ? '#F9FAFB' : '#111827',
                                                    bodyColor: isDark ? '#D1D5DB' : '#374151',
                                                    borderColor: isDark ? '#374151' : '#E5E7EB',
                                                    borderWidth: 1,
                                                    padding: 12,
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY TABLE */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none border dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <List size={20} className="text-[#1B4332] dark:text-emerald-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#1B4332] dark:bg-gray-700 text-white">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Farmer</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Metric</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.recentActivities.length > 0 ? (
                                            dashboardData.recentActivities.map((activity, idx) => (
                                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700`}> 
                                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                                                            {new Date(activity.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm">{activity.farmer}</td>
                                                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm">{activity.metric}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                            {activity.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            activity.status.includes('Paid') || activity.status.includes('Completed') 
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                        }`}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
                                                            <List size={48} className="text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Recent Activity</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                                                            Start recording deliveries or payments to see your activity feed populate with recent transactions.
                                                        </p>
                                                        <div className="flex gap-3">
                                                            <Link 
                                                                to="/dashboard/deliveries/new" 
                                                                className="bg-[#1B4332] dark:bg-emerald-600 hover:bg-[#2D5F4D] dark:hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md dark:shadow-none transition-all duration-200"
                                                            >
                                                                Record Delivery
                                                            </Link>
                                                            <Link 
                                                                to="/dashboard/payments/new" 
                                                                className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-[#1B4332] dark:text-emerald-400 border-2 border-[#1B4332] dark:border-emerald-500 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                                                            >
                                                                Record Payment
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;