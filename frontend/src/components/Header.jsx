import React, { useState } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Bell, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const Header = ({ toggleSidebar, userName }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Mock notifications - replace with real data from API
    const notifications = [
        { id: 1, message: 'New delivery recorded by John Doe', time: '5 min ago', unread: true },
        { id: 2, message: 'Payment processed successfully', time: '1 hour ago', unread: true },
        { id: 3, message: 'New farmer registered', time: '2 hours ago', unread: false },
    ];
    
    const unreadCount = notifications.filter(n => n.unread).length;

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
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20 transition-theme duration-200">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{unreadCount} unread</p>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                    notification.unread ? 'bg-blue-50 dark:bg-dark-green-subtle' : ''
                                                }`}
                                            >
                                                <p className="text-sm text-gray-800 dark:text-gray-100">{notification.message}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-500">
                                            <Bell size={32} className="mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                    <button className="text-sm text-[#1B4332] dark:text-dark-green-primary hover:underline font-medium">
                                        View all notifications
                                    </button>
                                </div>
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
                        <span className="text-gray-700 dark:text-gray-100 font-medium hidden sm:block">{userName || 'Admin User'}</span>
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