import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, DollarSign, FileText, UserPlus, Coffee, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const allNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ['admin', 'fieldagent'] },
    { name: "Farmers", icon: Users, path: "/dashboard/farmers", roles: ['admin', 'fieldagent'] },
    { name: "Deliveries", icon: Truck, path: "/dashboard/deliveries", roles: ['admin', 'fieldagent'] },
    { name: "Payments", icon: DollarSign, path: "/dashboard/payments", roles: ['admin', 'fieldagent'] },
    { name: "Reports", icon: FileText, path: "/dashboard/reports", roles: ['admin'] },
    { name: "Users", icon: UserPlus, path: "/dashboard/users", roles: ['admin'] },
];

const isItemActive = (pathname, path) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(`${path}/`);
};

const itemClass = (isActive, isCollapsed) => [
    'flex items-center py-2.5 rounded-lg transition-colors duration-200 group relative',
    isCollapsed ? 'justify-center px-2' : 'px-4',
    isActive
        ? 'bg-[#2D6A4F]/45 dark:bg-gray-700/70 text-[#F59E0B] dark:text-dark-gold-primary'
        : 'text-gray-300 dark:text-gray-400 hover:bg-[#2D6A4F]/60 dark:hover:bg-gray-700 hover:text-white dark:hover:text-dark-text-primary',
].join(' ');

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { authState } = useAuth();
    const location = useLocation();
    const userRole = authState?.role;

    const navItems = userRole ? allNavItems.filter(item => item.roles?.includes(userRole)) : [];
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const settingsActive = isItemActive(location.pathname, '/dashboard/settings');

    if (authState?.loading) {
        return (
            <div className={`h-full fixed left-0 top-0 bg-[#1B4332] shadow-xl ${sidebarWidth} transition-all duration-300 z-30 flex flex-col items-center justify-center`}>
                <div className="text-white text-sm">Loading...</div>
            </div>
        );
    }

    const avatarSrc = authState?.user?.avatar
        ? (authState.user.avatar.startsWith('http')
            ? authState.user.avatar
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${authState.user.avatar}`)
        : null;

    return (
        <div className={`h-full fixed left-0 top-0 bg-[#1B4332] dark:bg-gray-800 shadow-xl ${sidebarWidth} transition-all duration-300 z-30 flex flex-col`}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#2D6A4F] dark:border-gray-700 shrink-0">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-2">
                            <Coffee size={28} className="text-[#F59E0B]" />
                            <h1 className="text-xl font-bold text-white">OCMS</h1>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-1 rounded hover:bg-[#2D6A4F] dark:hover:bg-gray-700 transition-colors duration-200"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft size={16} className="text-gray-300 dark:text-gray-400 hover:text-[#F59E0B] dark:hover:text-dark-gold-primary" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="mx-auto p-1 rounded hover:bg-[#2D6A4F] dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Expand sidebar"
                    >
                        <ChevronRight size={16} className="text-[#F59E0B] dark:text-dark-gold-primary" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = isItemActive(location.pathname, item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            title={item.name}
                            className={itemClass(isActive, isCollapsed)}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F59E0B] dark:bg-dark-gold-primary rounded-r-full" />
                            )}
                            <IconComponent
                                size={20}
                                className={`shrink-0 ${isActive ? 'text-[#F59E0B] dark:text-dark-gold-primary' : 'group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary'} transition-colors`}
                            />
                            {!isCollapsed && (
                                <span className={`ml-3 text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="shrink-0 border-t border-[#2D6A4F] dark:border-gray-700 px-3 py-3 space-y-1">
                <Link
                    to="/dashboard/settings"
                    title="Settings"
                    className={itemClass(settingsActive, isCollapsed)}
                >
                    {settingsActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F59E0B] dark:bg-dark-gold-primary rounded-r-full" />
                    )}
                    <Settings
                        size={20}
                        className={`shrink-0 ${settingsActive ? 'text-[#F59E0B] dark:text-dark-gold-primary' : 'group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary'} transition-colors`}
                    />
                    {!isCollapsed && (
                        <span className={`ml-3 text-sm ${settingsActive ? 'font-semibold' : 'font-medium'}`}>
                            Settings
                        </span>
                    )}
                </Link>

                {authState?.user && (
                    <Link
                        to="/dashboard/settings"
                        className={`flex items-center rounded-lg hover:bg-[#2D6A4F]/60 dark:hover:bg-gray-700 transition-colors duration-200 group ${
                            isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'
                        }`}
                        title="Go to My Account Settings"
                    >
                        <div className="w-9 h-9 rounded-full bg-[#F59E0B] dark:bg-dark-gold-primary flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={authState.user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                authState.user.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white dark:text-gray-100 text-sm font-medium truncate">
                                    {authState.user.username}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs truncate capitalize group-hover:text-[#F59E0B] dark:group-hover:text-dark-gold-primary transition-colors">
                                    {authState.user.role || 'User'}
                                </p>
                            </div>
                        )}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
