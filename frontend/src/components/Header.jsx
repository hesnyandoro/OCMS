import React, { useState, useEffect } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Bell, Moon, Sun, Package, DollarSign, Users, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Header = ({ toggleSidebar, userName }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    
    const unreadCount = notifications.filter(n => n.unread).length;

    // Fetch notifications
    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const [deliveriesRes, paymentsRes, farmersRes] = await Promise.all([
                api.get('/deliveries?limit=5'),
                api.get('/payments?limit=5'),
                api.get('/farmers?limit=5')
            ]);

            const notificationsList = [];
            
            // Recent deliveries notifications
            if (deliveriesRes.data && deliveriesRes.data.length > 0) {
                deliveriesRes.data.slice(0, 3).forEach((delivery) => {
                    const timeAgo = getTimeAgo(new Date(delivery.date || delivery.createdAt));
                    notificationsList.push({
                        id: `delivery-${delivery._id}`,
                        type: 'delivery',
                        title: 'New Delivery Recorded',
                        message: `${delivery.kgsDelivered} kgs of ${delivery.type} from ${delivery.farmer?.name || 'Unknown'}`,
                        time: timeAgo,
                        unread: isRecent(delivery.date || delivery.createdAt),
                        icon: Package,
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                        actionUrl: `/dashboard/deliveries`,
                        data: delivery
                    });
                });
            }

            // Recent payments notifications
            if (paymentsRes.data && paymentsRes.data.length > 0) {
                paymentsRes.data.slice(0, 2).forEach((payment) => {
                    const timeAgo = getTimeAgo(new Date(payment.date || payment.createdAt));
                    const isPending = payment.status === 'Pending';
                    const isFailed = payment.status === 'Failed';
                    
                    notificationsList.push({
                        id: `payment-${payment._id}`,
                        type: 'payment',
                        title: isPending ? 'Pending Payment' : isFailed ? 'Failed Payment' : 'Payment Processed',
                        message: `KES ${Number(payment.amountPaid).toLocaleString()} - ${payment.farmer?.name || 'Unknown'}`,
                        time: timeAgo,
                        unread: isRecent(payment.date || payment.createdAt),
                        icon: isPending ? AlertTriangle : isFailed ? X : DollarSign,
                        color: isPending ? 'text-amber-600 dark:text-amber-400' : isFailed ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400',
                        bgColor: isPending ? 'bg-amber-50 dark:bg-amber-900/20' : isFailed ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
                        actionUrl: `/dashboard/payments`,
                        data: payment
                    });
                });
            }

            // Recent farmers notifications
            if (farmersRes.data && farmersRes.data.length > 0) {
                const recentFarmer = farmersRes.data[0];
                const timeAgo = getTimeAgo(new Date(recentFarmer.createdAt));
                if (isRecent(recentFarmer.createdAt)) {
                    notificationsList.push({
                        id: `farmer-${recentFarmer._id}`,
                        type: 'farmer',
                        title: 'New Farmer Registered',
                        message: `${recentFarmer.name} - ${recentFarmer.region}`,
                        time: timeAgo,
                        unread: true,
                        icon: Users,
                        color: 'text-purple-600 dark:text-purple-400',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                        actionUrl: `/dashboard/farmers`,
                        data: recentFarmer
                    });
                }
            }

            // Sort by most recent
            notificationsList.sort((a, b) => {
                const dateA = new Date(a.data.date || a.data.createdAt);
                const dateB = new Date(b.data.date || b.data.createdAt);
                return dateB - dateA;
            });

            setNotifications(notificationsList.slice(0, 10));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Helper function to check if item is recent (within last 24 hours)
    const isRecent = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        return diffHours <= 24;
    };

    // Helper function to get time ago
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Fetch notifications on component mount and when dropdown opens
    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 2 minutes
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    // Handle notification click
    const handleNotificationClick = (notification) => {
        // Mark as read
        setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
        );
        
        // Navigate to the relevant page
        navigate(notification.actionUrl);
        setShowNotifications(false);
        
        toast.success(`Navigating to ${notification.type}...`);
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast.success('All notifications marked as read');
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
        toast.success('All notifications cleared');
    };

    const handleLogout = async () => {
        // Optimistic UI - clear immediately
        toast.loading('Logging out...', { id: 'logout' });
        
        // Clear client-side data immediately
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Attempt to invalidate on server
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.error('Server logout failed, but client cleared:', err);
        }
        
        // Call context logout
        logout();
        
        toast.success('Logged out successfully', { id: 'logout' });
        navigate('/login');
    };

    return (
        <header className="fixed top-0 right-0 z-20 h-16 bg-white dark:bg-gray-800 shadow-md dark:shadow-dark-border-primary p-4 flex items-center justify-between w-full transition-theme duration-200">
            {/* Left side: Collapse Button */}
            <button 
                onClick={toggleSidebar} 
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-green-hover transition-colors duration-200 focus:outline-none"
                aria-label="Toggle Sidebar"
            >
                <FaBars className="text-xl" />
            </button>

            {/* Right side: Theme Toggle, Notifications & User Menu */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-hover transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
                </button>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-hover transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Notifications"
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 transition-theme duration-200">
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{unreadCount} unread</p>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAllAsRead();
                                                }}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                title="Mark all as read"
                                            >
                                                Mark all read
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearAllNotifications();
                                                }}
                                                className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                                title="Clear all notifications"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {isLoadingNotifications ? (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-sm">Loading notifications...</p>
                                        </div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((notification) => {
                                            const IconComponent = notification.icon;
                                            return (
                                                <div
                                                    key={notification.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotificationClick(notification);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                                                        notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${notification.bgColor} flex-shrink-0`}>
                                                            <IconComponent className={`w-4 h-4 ${notification.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                    {notification.title}
                                                                </p>
                                                                {notification.unread && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                    {notification.time}
                                                                </p>
                                                                <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                                    View →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fetchNotifications();
                                            }}
                                            className="text-sm text-[#1B4332] dark:text-dark-green-primary hover:underline w-full text-center py-1 font-medium"
                                        >
                                            Refresh notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            isDropdownOpen ? 'bg-white dark:bg-gray-700 shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <div className={`rounded-full transition-colors ${isDropdownOpen ? 'bg-white dark:bg-gray-700' : ''}`}>
                            <FaUserCircle className="text-2xl text-primary dark:text-dark-green-primary" />
                        </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20 transition-theme duration-200">
                                <div className="py-2">
                                    <Link 
                                        to="/dashboard/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FaCog className="mr-2"/> My Account
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <FaSignOutAlt className="mr-2"/> Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;