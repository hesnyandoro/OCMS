import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, DollarSign, FileText, Plus, Package, Wallet, UserPlus, Coffee, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define navigation items with role restrictions
const allNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ['admin', 'fieldagent'] },
    { name: "Farmers", icon: Users, path: "/dashboard/farmers", roles: ['admin', 'fieldagent'] },
    { name: "Deliveries", icon: Truck, path: "/dashboard/deliveries", roles: ['admin', 'fieldagent'] },
    { name: "Payments", icon: DollarSign, path: "/dashboard/payments", roles: ['admin', 'fieldagent'] },
    { name: "Reports", icon: FileText, path: "/dashboard/reports", roles: ['admin'] },
    { name: "Users", icon: UserPlus, path: "/dashboard/users", roles: ['admin'] },
];

// Quick Actions with role restrictions
const allQuickActions = [
    { name: "New Farmer", icon: Plus, path: "/dashboard/farmers/new", roles: ['admin', 'fieldagent'] },
    { name: "Record Delivery", icon: Package, path: "/dashboard/deliveries/new", roles: ['admin', 'fieldagent'] },
    { name: "Record Payment", icon: Wallet, path: "/dashboard/payments/new", roles: ['admin'] },
];



const Sidebar = ({ isCollapsed, onToggle }) => {
    const { authState } = useAuth();
    const location = useLocation();
    const userRole = authState?.role;

    // Filter navigation items and quick actions based on user role
    const navItems = userRole ? allNavItems.filter(item => item.roles?.includes(userRole)) : [];
    const quickActions = userRole ? allQuickActions.filter(action => action.roles?.includes(userRole)) : [];

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

    // Show loading state
    if (authState?.loading) {
        return (
            <div className={`h-full fixed left-0 top-0 bg-[#1B4332] shadow-xl ${sidebarWidth} transition-all duration-300 z-30 flex flex-col items-center justify-center`}>
                <div className="text-white text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className={`h-full fixed left-0 top-0 bg-[#1B4332] dark:bg-gray-800 shadow-xl ${sidebarWidth} transition-all duration-300 z-30 flex flex-col`}>
            
            {/* Header / Logo Area */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#2D6A4F] dark:border-gray-700">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-2">
                            <Coffee size={28} className="text-[#F59E0B]" />
                            <h1 className="text-xl font-bold text-white">
                                OCMS
                            </h1>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-1 rounded hover:bg-[#2D6A4F] dark:hover:bg-gray-700 transition-all duration-200"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft size={16} className="text-gray-300 dark:text-gray-400 hover:text-[#F59E0B] dark:hover:text-dark-gold-primary" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="mx-auto p-1 rounded hover:bg-[#2D6A4F] dark:hover:bg-gray-700 transition-all duration-200"
                        title="Expand sidebar"
                    >
                        <ChevronRight size={16} className="text-[#F59E0B] dark:text-dark-gold-primary" />
                    </button>
                )}
            </div>

            {/* Navigation & Quick Actions Container - Scrollable area */}
            <div className="flex-1 overflow-y-auto py-4">
                
                {/* Primary Navigation Links */}
                <nav className="px-3 space-y-1">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                title={item.name}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                                    isActive 
                                        ? 'bg-[#2D6A4F] dark:bg-dark-green-secondary text-white shadow-md' 
                                        : 'text-gray-300 dark:text-gray-400 hover:bg-[#2D6A4F] dark:hover:bg-gray-700 hover:text-white dark:hover:text-dark-text-primary'
                                }`}
                            >
                                {isActive && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] dark:bg-dark-gold-primary rounded-r-full" />
                                )}
                                <IconComponent 
                                    size={20} 
                                    className={`shrink-0 ${isActive ? 'text-[#F59E0B] dark:text-dark-gold-primary' : 'group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary'} transition-colors`}
                                />
                                {!isCollapsed && (
                                    <span className={`ml-3 font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Actions Section */}
                {quickActions.length > 0 && (
                    <>
                        {!isCollapsed && (
                            <div className="mx-6 my-6 border-t border-[#2D6A4F] dark:border-gray-700" />
                        )}

                        <div className="px-3">
                            {!isCollapsed && (
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-4">
                                    Quick Actions
                                </h3>
                            )}
                            
                            <div className="space-y-1">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon;
                                    const isActive = location.pathname === action.path;
                                    return (
                                        <Link
                                            key={action.name}
                                            to={action.path}
                                            title={action.name}
                                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                                                isActive 
                                                    ? 'bg-[#2D6A4F] dark:bg-dark-green-secondary text-white shadow-md' 
                                                    : 'text-gray-300 dark:text-gray-400 hover:bg-[#2D6A4F] dark:hover:bg-gray-700 hover:text-white dark:hover:text-dark-text-primary'
                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                        >
                                            {isActive && !isCollapsed && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] dark:bg-dark-gold-primary rounded-r-full" />
                                            )}
                                            <ActionIcon 
                                                size={20} 
                                                className={`shrink-0 ${isActive ? 'text-[#F59E0B] dark:text-dark-gold-primary' : 'group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary'} transition-colors`}
                                            />
                                            {!isCollapsed && (
                                                <span className={`ml-3 font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                                                    {action.name}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Settings Button */}
                {!isCollapsed && (
                    <div className="mx-6 my-6 border-t border-[#2D6A4F] dark:border-gray-700" />
                )}
                <div className="px-3">
                    <Link
                        to="/dashboard/settings"
                        title="Settings"
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                            location.pathname === '/dashboard/settings'
                                ? 'bg-[#2D6A4F] dark:bg-dark-green-secondary text-white shadow-md' 
                                : 'text-gray-300 dark:text-gray-400 hover:bg-[#2D6A4F] dark:hover:bg-gray-700 hover:text-white dark:hover:text-dark-text-primary'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {location.pathname === '/dashboard/settings' && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] dark:bg-dark-gold-primary rounded-r-full" />
                        )}
                        <Settings 
                            size={20} 
                            className={`shrink-0 ${location.pathname === '/dashboard/settings' ? 'text-[#F59E0B] dark:text-dark-gold-primary' : 'group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary'} transition-colors`}
                        />
                        {!isCollapsed && (
                            <span className={`ml-3 font-medium text-sm ${location.pathname === '/dashboard/settings' ? 'font-semibold' : ''}`}>
                                Settings
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* User Info Footer */}
            {!isCollapsed && authState?.user && (
                <div className="border-t border-[#2D6A4F] dark:border-gray-700 p-4">
                    <Link 
                        to="/dashboard/settings"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group"
                        title="Go to My Account Settings"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#F59E0B] dark:bg-dark-gold-primary flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform overflow-hidden">
                            {authState.user.avatar ? (
                                <img 
                                    src={authState.user.avatar.startsWith('http') 
                                        ? authState.user.avatar 
                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${authState.user.avatar}`
                                    } 
                                    alt={authState.user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                authState.user.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white dark:text-gray-100 text-sm font-medium truncate">
                                {authState.user.username}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs truncate capitalize group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary transition-colors">
                                {authState.user.role || 'User'}
                            </p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;