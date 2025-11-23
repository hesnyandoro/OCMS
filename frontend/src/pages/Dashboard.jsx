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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const Dashboard = () => {
    const { authState } = useAuth();
    const user = authState?.user;
    
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- KPI Data Configuration ---
    const kpiData = [
        { 
            title: "Total Farmers", 
            value: dashboardData.totalFarmers.toLocaleString(), 
            icon: <Users size={24} />,
            color: "#1B4332", 
            bgColor: "bg-[#1B4332]", 
            change: "Registered in system",
            link: "/dashboard/farmers"
        },
        { 
            title: "Kgs Delivered", 
            value: dashboardData.kgsDelivered.toLocaleString(), 
            icon: <Package size={24} />,
            color: "#D93025", 
            bgColor: "bg-[#D93025]", 
            change: "This month",
            link: "/dashboard/deliveries"
        },
        { 
            title: "Total Payments", 
            value: `Ksh ${dashboardData.totalPayments.toLocaleString()}`, 
            icon: <DollarSign size={24} />,
            color: "#F59E0B", 
            bgColor: "bg-[#F59E0B]", 
            change: "Current month",
            link: "/dashboard/payments"
        },
        { 
            title: "Pending Reports", 
            value: dashboardData.pendingReports.toString(), 
            icon: <List size={24} />,
            color: "#6B7280", 
            bgColor: "bg-gray-600", 
            change: "Action required",
            link: "/dashboard/reports"
        },
    ];

    // --- Filter Card Component ---
    const FilterCard = () => (
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="text-[#1B4332]" size={20} />
                <h3 className="text-lg text-gray-800 font-semibold">Filter Dashboard Data</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Date Input */}
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition" 
                    />
                </div>

                {/* Region Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Region</label>
                    <select 
                        value={filterRegion} 
                        onChange={(e) => setFilterRegion(e.target.value)} 
                        className="w-full text-sm bg-white text-gray-700 rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
                    >
                        <option value="">All Regions</option>
                        <option>North</option>
                        <option>South</option>
                        <option>East</option>
                    </select>
                </div>
                
                {/* Driver Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Delivery Driver</label>
                    <select 
                        value={filterDriver} 
                        onChange={(e) => setFilterDriver(e.target.value)} 
                        className="w-full text-sm bg-white text-gray-700 rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
                    >
                        <option value="">All Drivers</option>
                        <option>Driver A</option>
                        <option>Driver B</option>
                        <option>Driver C</option>
                    </select>
                </div>
                
                {/* Delivery Type Select */}
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Delivery Type</label>
                    <select 
                        value={filterDelivery} 
                        onChange={(e) => setFilterDelivery(e.target.value)} 
                        className="w-full text-sm bg-white text-gray-700 rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
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
                        className="w-full bg-[#1B4332] hover:bg-[#2D5F4D] text-white rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );

    // Main Render Function
    return (
        <div className="p-4 md:p-8 bg-[#F3F4F6] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <p className="text-sm">
                        Welcome back, <span className="font-semibold text-[#1B4332]">{user?.username || 'User'}</span>
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
                    <Loader2 className="animate-spin text-[#1B4332] text-4xl mx-auto" />
                    <p className="mt-4 text-gray-600">Loading Dashboard Data...</p>
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
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 group cursor-pointer" 
                                    style={{borderLeftColor: kpi.color}}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium mb-2">{kpi.title}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
                                            <p className="text-xs text-gray-500">{kpi.change}</p>
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
                            <div className="xl:col-span-2 bg-white shadow-lg rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 size={20} className="text-[#1B4332]" />
                                    <h3 className="text-lg font-semibold text-gray-800">Monthly Delivery Trend</h3>
                                </div>
                                <div className="h-72 bg-white rounded-lg">
                                    <Bar
                                        data={{
                                            labels: dashboardData.monthlyKgs.labels,
                                            datasets: [
                                                {
                                                    label: 'Kgs Delivered',
                                                    data: dashboardData.monthlyKgs.values,
                                                    backgroundColor: '#1B4332',
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
                                                    backgroundColor: '#1B4332',
                                                    padding: 12,
                                                    titleFont: { size: 14 },
                                                    bodyFont: { size: 13 },
                                                }
                                            },
                                            scales: { 
                                                y: { 
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: '#F3F4F6',
                                                    },
                                                    ticks: {
                                                        color: '#6B7280'
                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: '#6B7280'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Payments Snapshot Chart (1/3 Width) */}
                            <div className="xl:col-span-1 bg-white shadow-lg rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Payment Status</h3>
                                <div className="h-72 flex items-center justify-center">
                                    <Doughnut
                                        data={{
                                            labels: ['Completed', 'Pending', 'Failed'],
                                            datasets: [
                                                {
                                                    data: [
                                                        dashboardData.paymentsStatus.Completed || 0,
                                                        dashboardData.paymentsStatus.Pending || 0,
                                                        dashboardData.paymentsStatus.Failed || 0
                                                    ],
                                                    backgroundColor: ['#10B981', '#F59E0B', '#D93025'],
                                                    borderWidth: 0,
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
                                                        color: '#374151'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: '#1F2937',
                                                    padding: 12,
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY TABLE */}
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <List size={20} className="text-[#1B4332]" />
                                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#1B4332] text-white">
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
                                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#F3F4F6] transition-colors duration-150`}> 
                                                    <td className="py-4 px-6 text-gray-600 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            {new Date(activity.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-semibold text-gray-800 text-sm">{activity.farmer}</td>
                                                    <td className="py-4 px-6 text-gray-700 text-sm">{activity.metric}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {activity.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            activity.status.includes('Paid') || activity.status.includes('Completed') 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-yellow-100 text-yellow-700'
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
                                                        <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                            <List size={48} className="text-gray-400" />
                                                        </div>
                                                        <h4 className="text-lg font-semibold text-gray-700 mb-2">No Recent Activity</h4>
                                                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                                                            Start recording deliveries or payments to see your activity feed populate with recent transactions.
                                                        </p>
                                                        <div className="flex gap-3">
                                                            <Link 
                                                                to="/dashboard/deliveries/new" 
                                                                className="bg-[#1B4332] hover:bg-[#2D5F4D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                                            >
                                                                Record Delivery
                                                            </Link>
                                                            <Link 
                                                                to="/dashboard/payments/new" 
                                                                className="bg-white hover:bg-gray-50 text-[#1B4332] border-2 border-[#1B4332] px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
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