import React, { useState, useEffect } from 'react';
import { 
    Users, Filter, List, Loader2, BarChart3, TrendingUp, TrendingDown, 
    Package, DollarSign, Calendar, MapPin, ArrowRight, Plus, FileText,
    Activity, Clock, CheckCircle, AlertCircle, Zap, BarChart2, PieChart
} from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);
const Dashboard = () => {
    const { authState } = useAuth();
    const { theme } = useTheme();
    const user = authState?.user;
    const isDark = theme === 'dark';
    
    // State Hooks
    const [filterDate, setFilterDate] = useState(null);
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
    const [drivers, setDrivers] = useState([]);
    const [regions, setRegions] = useState([]);

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

    // Fetch drivers and regions for filters
    const fetchFilterOptions = async () => {
        try {
            const [driversRes, regionsRes] = await Promise.all([
                api.get('/dashboard/drivers'),
                api.get('/dashboard/regions')
            ]);
            setDrivers(driversRes.data || []);
            setRegions(regionsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchFilterOptions();
    }, []);

    // Apply filters automatically when any filter changes
    useEffect(() => {
        const params = {};
        if (filterRegion) params.region = filterRegion;
        if (filterDriver) params.driver = filterDriver;
        if (filterDelivery) params.type = filterDelivery;
        if (filterDate) params.date = filterDate.toISOString().split('T')[0];
        
        // Only fetch if at least one filter is applied
        if (Object.keys(params).length > 0 || filterDate || filterRegion || filterDriver || filterDelivery) {
            fetchDashboardData(params);
        }
    }, [filterDate, filterRegion, filterDriver, filterDelivery]);

    // Calculate Trends 
    const calculateTrend = (data) => {
        if (!data || data.length < 2) return { trend: 0, isPositive: true };
        const current = data[data.length - 1] || 0;
        const previous = data[data.length - 2] || 0;
        if (previous === 0) return { trend: 0, isPositive: true };
        const trend = ((current - previous) / previous * 100).toFixed(1);
        return { trend: Math.abs(trend), isPositive: trend >= 0 };
    };

    const deliveryTrend = calculateTrend(dashboardData.monthlyKgs.values);
    const totalPayments = dashboardData.paymentsStatus.Completed + dashboardData.paymentsStatus.Pending + dashboardData.paymentsStatus.Failed;
    const paymentSuccessRate = totalPayments > 0 ? ((dashboardData.paymentsStatus.Completed / totalPayments) * 100).toFixed(0) : 0;

    // KPI Data Configuration
    const kpiData = [
        { 
            title: "Total Farmers", 
            value: dashboardData.totalFarmers.toLocaleString(), 
            icon: <Users size={24} />,
            color: "#1B4332", 
            bgColor: "bg-[#1B4332] dark:bg-emerald-600", 
            change: "Registered in system",
            subValue: "Active farmers",
            trend: null,
            link: "/dashboard/farmers"
        },
        { 
            title: "Kgs Delivered", 
            value: dashboardData.kgsDelivered.toLocaleString(), 
            icon: <Package size={24} />,
            color: "#10B981", 
            bgColor: "bg-emerald-500 dark:bg-emerald-600", 
            change: "This month",
            subValue: deliveryTrend.trend > 0 ? `${deliveryTrend.trend}% vs last month` : "Tracking deliveries",
            trend: deliveryTrend.trend > 0 ? deliveryTrend : null,
            link: "/dashboard/deliveries"
        },
        { 
            title: "Total Paid Out", 
            value: `KES ${dashboardData.totalPayments.toLocaleString()}`, 
            icon: <DollarSign size={24} />,
            color: "#F59E0B", 
            bgColor: "bg-amber-500 dark:bg-amber-600", 
            change: "Completed payments",
            subValue: `${paymentSuccessRate}% success rate`,
            trend: { trend: paymentSuccessRate, isPositive: paymentSuccessRate >= 80 },
            link: "/dashboard/payments"
        },
        { 
            title: "Pending Actions", 
            value: dashboardData.pendingReports.toString(), 
            icon: <AlertCircle size={24} />,
            color: "#EF4444", 
            bgColor: "bg-red-500 dark:bg-red-600", 
            change: "Requires attention",
            subValue: "Outstanding payments",
            trend: null,
            link: "/dashboard/payments"
        },
    ];

    // Filter Card Component
    const FilterCard = () => {
        const hasActiveFilters = filterRegion || filterDriver || filterDelivery;
        
        return (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Filter Dashboard</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your view</p>
                        </div>
                    </div>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setFilterRegion('');
                                setFilterDriver('');
                                setFilterDelivery('');
                                setFilterDate(null);
                                fetchDashboardData();
                            }}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                            <span>Clear All</span>
                            <span className="text-xs">×</span>
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">{/* Auto-apply filters on change */}
                    {/* Date Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <Calendar size={12} />
                            Date
                        </label>
                        <ReactDatePicker
                            selected={filterDate}
                            onChange={(date) => setFilterDate(date)}
                            isClearable
                            placeholderText="Select date"
                            dateFormat="yyyy-MM-dd"
                            className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
                        />
                    </div>

                    {/* Region Select */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <MapPin size={12} />
                            Region
                        </label>
                        <select 
                            value={filterRegion} 
                            onChange={(e) => setFilterRegion(e.target.value)} 
                            className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                        >
                            <option value="">All Regions</option>
                            {regions.map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Driver Select */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <Users size={12} />
                            Driver
                        </label>
                        <select 
                            value={filterDriver} 
                            onChange={(e) => setFilterDriver(e.target.value)} 
                            className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                        >
                            <option value="">All Drivers</option>
                            {drivers.map((driver) => (
                                <option key={driver} value={driver}>{driver}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Delivery Type Select */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <Package size={12} />
                            Type
                        </label>
                        <select 
                            value={filterDelivery} 
                            onChange={(e) => setFilterDelivery(e.target.value)} 
                            className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                        >
                            <option value="">All Types</option>
                            <option value="Cherry">Cherry</option>
                            <option value="Parchment">Parchment</option>
                        </select>
                    </div>
                    
                    {/* Active Filters Indicator */}
                    <div className="flex items-end">
                        <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center justify-center gap-2">
                            <Activity size={16} />
                            {(filterDate || filterRegion || filterDriver || filterDelivery) ? 'Filters Active' : 'No Filters'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Main Render Function
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="p-4 md:p-8">
                {/* Enhanced Header with Welcome Banner */}
                <div className="mb-8 bg-gradient-to-r from-[#1B4332] to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center">
                                <Activity size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                    Welcome back, {user?.username || 'User'}! 
                                </h1>
                                <div className="flex items-center gap-3 text-white/90 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    {user?.assignedRegion && (
                                        <>
                                            <span className="text-white/50">•</span>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span>{user.assignedRegion} Region</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-white/80 text-sm max-w-2xl">
                            Here's what's happening with your coffee operations today. Track deliveries, manage payments, and monitor farmer activities.
                        </p>
                    </div>
                </div>
            
            {loading && (
                <div className="space-y-8">
                    {/* Filter Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                    
                    {/* KPI Cards Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Charts Skeleton */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                            <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                            <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-72"></div>
                        </div>
                    </div>
                </div>
            )}
            
            {!loading && (
                <div className="space-y-8">
                    
                    {/* 1. FULL WIDTH FILTER BAR */}
                    <FilterCard />

                    {/* 2. MAIN CONTENT AREA (Now full width) */}
                    <div className="space-y-8"> 
                        
                        {/* ENHANCED KPI STATS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {kpiData.map((kpi, index) => (
                                <Link 
                                    key={index} 
                                    to={kpi.link}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-gray-700 hover:shadow-2xl dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300 p-6 overflow-hidden relative"
                                >
                                    {/* Background Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                                                    {kpi.title}
                                                    {kpi.trend && (
                                                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                                            kpi.trend.isPositive 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {kpi.trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                            {kpi.trend.trend}%
                                                        </span>
                                                    )}
                                                </p>
                                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#1B4332] dark:group-hover:text-emerald-400 transition-colors">
                                                    {kpi.value}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {kpi.subValue}
                                                </p>
                                            </div>
                                            <div 
                                                className={`${kpi.bgColor} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                                            >
                                                {kpi.icon}
                                            </div>
                                        </div>
                                        
                                        {/* Progress Indicator */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">{kpi.change}</span>
                                            <ArrowRight size={14} className="text-gray-400 group-hover:text-[#1B4332] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* ENHANCED CHARTS / DATA VISUALIZATION SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* Delivery Trend Chart (2/3 Width) */}
                            <div className="xl:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4332] to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center text-white">
                                            <BarChart3 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Trends</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months performance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Active</span>
                                    </div>
                                </div>
                                <div className="h-72 rounded-lg">
                                    <Bar
                                        key={`bar-chart-${theme}`}
                                        data={{
                                            labels: dashboardData.monthlyKgs.labels,
                                            datasets: [
                                                {
                                                    label: 'Kgs Delivered',
                                                    data: dashboardData.monthlyKgs.values,
                                                    backgroundColor: (context) => {
                                                        const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
                                                        gradient.addColorStop(0, isDark ? '#10b981' : '#1B4332');
                                                        gradient.addColorStop(1, isDark ? '#059669' : '#0d2818');
                                                        return gradient;
                                                    },
                                                    borderRadius: 8,
                                                    borderSkipped: false,
                                                    hoverBackgroundColor: isDark ? '#34d399' : '#2D5F4D',
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
                                                    titleFont: { size: 14, weight: 'bold' },
                                                    bodyFont: { size: 13 },
                                                    borderColor: isDark ? '#374151' : 'transparent',
                                                    borderWidth: 1,
                                                    displayColors: false,
                                                    callbacks: {
                                                        label: (context) => `${context.parsed.y.toLocaleString()} kgs`
                                                    }
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
                                                        color: isDark ? '#9CA3AF' : '#6B7280',
                                                        callback: (value) => `${value.toLocaleString()} kg`
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
                                            },
                                            interaction: {
                                                intersect: false,
                                                mode: 'index'
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Payment Status Chart (1/3 Width) */}
                            <div className="xl:col-span-1 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center text-white">
                                            <PieChart size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Status</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Deliveries & payments</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64 flex items-center justify-center">
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
                                                    borderWidth: isDark ? 3 : 4,
                                                    borderColor: isDark ? '#1F2937' : '#FFFFFF',
                                                    hoverOffset: 8,
                                                    hoverBorderWidth: 2
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '65%',
                                            plugins: { 
                                                legend: { 
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 16,
                                                        font: {
                                                            size: 12,
                                                            weight: '600'
                                                        },
                                                        color: isDark ? '#D1D5DB' : '#374151',
                                                        usePointStyle: true,
                                                        pointStyle: 'circle'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                                    titleColor: isDark ? '#F9FAFB' : '#111827',
                                                    bodyColor: isDark ? '#D1D5DB' : '#374151',
                                                    borderColor: isDark ? '#374151' : '#E5E7EB',
                                                    borderWidth: 1,
                                                    padding: 12,
                                                    displayColors: true,
                                                    callbacks: {
                                                        label: (context) => {
                                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Payment Stats Summary */}
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <CheckCircle size={14} className="text-emerald-500" />
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Success</p>
                                        </div>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{dashboardData.paymentsStatus.Completed || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Clock size={14} className="text-amber-500" />
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pending</p>
                                        </div>
                                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{dashboardData.paymentsStatus.Pending || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <AlertCircle size={14} className="text-red-500" />
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Failed</p>
                                        </div>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{dashboardData.paymentsStatus.Failed || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ENHANCED RECENT ACTIVITY TABLE */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 flex items-center justify-center text-white">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Latest transactions and updates</p>
                                        </div>
                                    </div>
                                    {dashboardData.recentActivities.length > 0 && (
                                        <Link 
                                            to="/dashboard/deliveries"
                                            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors group"
                                        >
                                            View All
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-[#1B4332] to-emerald-700 dark:from-gray-700 dark:to-gray-750 text-white">
                                        <tr>
                                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Farmer</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Amount/Quantity</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.recentActivities.length > 0 ? (
                                            dashboardData.recentActivities.map((activity, idx) => (
                                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 group cursor-pointer`}> 
                                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                                                <Calendar size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                                            </div>
                                                            <span className="font-medium">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{activity.farmer}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-gray-900 dark:text-gray-100">{activity.metric}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                            activity.type === 'Delivery' 
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                                                                : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                        }`}>
                                                            {activity.type === 'Delivery' ? <Package size={12} /> : <DollarSign size={12} />}
                                                            {activity.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                            activity.status.includes('Paid') || activity.status.includes('Completed') || activity.status.includes('Delivered')
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                                                : activity.status.includes('Pending')
                                                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                        }`}>
                                                            {activity.status.includes('Paid') || activity.status.includes('Completed') || activity.status.includes('Delivered') ? (
                                                                <CheckCircle size={12} />
                                                            ) : activity.status.includes('Pending') ? (
                                                                <Clock size={12} />
                                                            ) : (
                                                                <AlertCircle size={12} />
                                                            )}
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-20">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-4">
                                                            <Activity size={40} className="text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Recent Activity</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-md px-4">
                                                            Start recording deliveries or payments to see your activity feed populate with recent transactions.
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 justify-center">
                                                            <Link 
                                                                to="/dashboard/deliveries/new" 
                                                                className="flex items-center gap-2 bg-gradient-to-r from-[#1B4332] to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 hover:from-[#2D5F4D] hover:to-emerald-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                                            >
                                                                <Package size={16} />
                                                                Record Delivery
                                                            </Link>
                                                            <Link 
                                                                to="/dashboard/payments/new" 
                                                                className="flex items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-[#1B4332] dark:text-emerald-400 border-2 border-[#1B4332] dark:border-emerald-500 px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                                            >
                                                                <DollarSign size={16} />
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
        </div>
    );
};

export default Dashboard;