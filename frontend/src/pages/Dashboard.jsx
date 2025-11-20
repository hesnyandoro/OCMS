import React, { useState, useEffect } from 'react';
import { Users, Truck, Wallet, Filter, List, Loader2, BarChart3, TrendingUp } from 'lucide-react'; 
import api from '../services/api';
const Dashboard = () => {
    // --- State Hooks ---
    const [filterDate, setFilterDate] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    
    const [dashboardData, setDashboardData] = useState({
        totalFarmers: 0,
        kgsDelivered: 0,
        totalPayments: 0,
        pendingReports: 0,
        recentActivities: []
    });
    
    const [loading, setLoading] = useState(true);

    // Fetch Dashboard Data 
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/dashboard/summary');
                const fetchedData = response.data || {};

                // Support both the new flat shape and older nested shape (defensive)
                const totalFarmers = fetchedData.totalFarmers ?? (fetchedData.farmers?.total) ?? 0;
                const kgsDelivered = fetchedData.kgsDelivered ?? (fetchedData.deliveries?.kgsMonth) ?? 0;
                const totalPayments = fetchedData.totalPayments ?? (fetchedData.payments?.totalMonth) ?? 0;
                const pendingReports = fetchedData.pendingReports ?? (fetchedData.reports?.pendingCount) ?? 0;
                const recentActivities = fetchedData.recentActivities ?? fetchedData.activity ?? [];

                setDashboardData({
                    totalFarmers,
                    kgsDelivered,
                    totalPayments,
                    pendingReports,
                    recentActivities,
                });
                
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, []);

    // --- KPI Data Configuration ---
    const kpiData = [
        { 
            title: "Total Farmers", 
            value: dashboardData.totalFarmers.toLocaleString(), 
            icon: <Users size={20} />, // Lucide Icon
            color: "text-blue-600", 
            bgColor: "bg-blue-100", 
            change: "+12% MoM" 
        },
        { 
            title: "Total Kgs Delivered (Mo)", 
            value: dashboardData.kgsDelivered.toLocaleString(), 
            icon: <Truck size={20} />, // Lucide Icon
            color: "text-green-600", 
            bgColor: "bg-green-100", 
            change: "Kgs Last 30 Days"
        },
        { 
            title: "Total Payments (Mo)", 
            value: `KES. ${dashboardData.totalPayments.toLocaleString()}`, 
            icon: <Wallet size={20} />, // Lucide Icon
            color: "text-indigo-600", 
            bgColor: "bg-indigo-100", 
            change: "Current Month Total"
        },
        { 
            title: "Pending Reports", 
            value: dashboardData.pendingReports.toString(), 
            icon: <List size={20} />, // Lucide Icon
            color: "text-yellow-600", 
            bgColor: "bg-yellow-100", 
            change: "Action Required"
        },
    ];

    // --- Filter Card Component ---
    const FilterCard = () => (
        <div className="card w-full bg-white shadow-xl border border-gray-200 rounded-xl">
            <div className="card-body p-5">
                <h3 className="card-title text-lg text-gray-700 flex items-center mb-4 font-semibold">
                    <Filter className="mr-2 text-blue-500" size={20} /> Data Filters
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 items-end">
                    {/* Date Input */}
                    <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={(e) => setFilterDate(e.target.value)} 
                            className="input input-bordered w-full text-sm rounded-lg border-gray-300 p-2" 
                            placeholder="Date Range" 
                        />
                    </div>

                    {/* Region Select */}
                    <div className="col-span-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Region</label>
                        <select 
                            value={filterRegion} 
                            onChange={(e) => setFilterRegion(e.target.value)} 
                            className="select select-bordered w-full text-sm rounded-lg border-gray-300 p-2 appearance-none"
                        >
                            <option value="">All Regions</option>
                            <option>North</option>
                            <option>South</option>
                            <option>East</option>
                        </select>
                    </div>
                    
                    {/* Driver Select */}
                    <div className="col-span-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Delivery Driver</label>
                        <select 
                            value={filterDriver} 
                            onChange={(e) => setFilterDriver(e.target.value)} 
                            className="select select-bordered w-full text-sm rounded-lg border-gray-300 p-2 appearance-none"
                        >
                            <option value="">All Drivers</option>
                            <option>Driver A</option>
                            <option>Driver B</option>
                            <option>Driver C</option>
                        </select>
                    </div>
                    
                    {/* Apply Button */}
                    <div className="col-span-2 sm:col-span-1">
                        <button className="btn btn-primary rounded-lg shadow-md hover:shadow-lg transition-all duration-200 h-10 w-full text-sm font-semibold mt-4 sm:mt-0">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Main Render Function
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-inter">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Online Company Management System Overview</h1>
            <p className="text-gray-500 mb-8">System metrics and quick access for field agents and admin.</p>
            
            {loading && (
                <div className="text-center p-16">
                    <Loader2 className="animate-spin text-blue-500 text-4xl mx-auto" />
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
                                <div key={index} 
                                    className="card bg-white shadow-md hover:shadow-xl transition-shadow duration-300 p-5 rounded-xl border-b-4 border-t-4 border-opacity-75" 
                                    // Dynamic border color based on KPI type
                                    style={{borderColor: kpi.color.replace('text-', '#')}}
                                >
                                    <div className={`flex items-center justify-between`}>
                                        <div className="text-gray-500 font-semibold text-sm">{kpi.title}</div>
                                        <div className={`${kpi.bgColor} p-3 rounded-full ${kpi.color} text-xl`}>
                                            {kpi.icon}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</div>
                                    <div className="text-xs mt-1 text-gray-500 flex items-center">
                                        <TrendingUp size={12} className="mr-1 text-green-500" />
                                        {kpi.change}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* CHARTS / DATA VISUALIZATION SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* Delivery Chart (2/3 Width) */}
                            <div className="xl:col-span-2 card bg-white shadow-lg p-6 rounded-xl">
                                <h3 className="card-title text-xl text-gray-700 flex items-center mb-4 font-semibold">
                                    <BarChart3 size={20} className="mr-2 text-pink-500" /> Monthly Kgs Trend
                                </h3>
                                <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400 border border-dashed rounded-lg">
                                    [ Placeholder for Line Chart showing Kgs Delivered by Week ]
                                </div>
                            </div>

                            {/* Payments Snapshot Chart (1/3 Width) */}
                            <div className="xl:col-span-1 card bg-white shadow-lg p-6 rounded-xl">
                                <h3 className="card-title text-xl text-gray-700 mb-4 font-semibold">Payment Status</h3>
                                <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400 border border-dashed rounded-lg">
                                    [ Placeholder for Donut Chart (Completed vs Pending) ]
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY TABLE */}
                        <div className="card w-full bg-white shadow-lg rounded-xl">
                            <div className="card-body p-0">
                                <h3 className="text-xl font-bold text-gray-700 p-6 pb-4 border-b">Recent Activity Feed</h3>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100 text-left">
                                                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                                                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.recentActivities.length > 0 ? (
                                                dashboardData.recentActivities.map((activity, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150"> 
                                                        <td className="py-3 px-6 text-gray-500 text-sm">{new Date(activity.date).toLocaleDateString()}</td>
                                                        <td className="py-3 px-6 font-semibold text-gray-800 text-sm">{activity.farmer}</td>
                                                        <td className="py-3 px-6 text-sm">{activity.metric}</td>
                                                        <td className="py-3 px-6"><div className={`badge badge-ghost text-xs bg-gray-100 text-gray-700 py-1 px-3 rounded-full font-medium`}>{activity.type}</div></td>
                                                        <td className="py-3 px-6">
                                                            <span className={`badge ${activity.status.includes('Paid') || activity.status.includes('Completed') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs py-1 px-3 rounded-full font-medium`}>
                                                                {activity.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-8">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <List size={48} className="text-gray-300 mb-3" />
                                                            <div className="text-lg font-semibold text-gray-700">No Recent Activity</div>
                                                            <div className="text-sm text-gray-500 mt-2 max-w-xl">
                                                                We don't have any recent deliveries or payments to show yet. Try adding a delivery or recording a payment to populate the activity feed.
                                                            </div>
                                                            <div className="mt-4 flex gap-2">
                                                                <a href="/deliveries" className="btn btn-sm btn-primary">Add Delivery</a>
                                                                <a href="/payments" className="btn btn-sm btn-outline">Record Payment</a>
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
                </div>
            )}
        </div>
    );
};

export default Dashboard;