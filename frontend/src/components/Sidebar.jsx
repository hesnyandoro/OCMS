import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, DollarSign, FileText, Plus, Package, Wallet, UserPlus, Coffee } from 'lucide-react';
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



const Sidebar = ({ isCollapsed }) => {
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
        <div className={`h-full fixed left-0 top-0 bg-[#1B4332] shadow-xl ${sidebarWidth} transition-all duration-300 z-30 flex flex-col`}>
            
            {/* Header / Logo Area */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-[#2D6A4F]">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <Coffee size={28} className="text-[#F59E0B]" />
                        <h1 className="text-xl font-bold text-white">
                            OCMS
                        </h1>
                    </div>
                ) : (
                    <Coffee size={28} className="text-[#F59E0B]" />
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
                                        ? 'bg-[#2D6A4F] text-white shadow-md' 
                                        : 'text-gray-300 hover:bg-[#2D6A4F] hover:text-white'
                                }`}
                            >
                                {isActive && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] rounded-r-full" />
                                )}
                                <IconComponent 
                                    size={20} 
                                    className={`shrink-0 ${isActive ? 'text-[#F59E0B]' : 'group-hover:text-[#F59E0B]'} transition-colors`}
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
                            <div className="mx-6 my-6 border-t border-[#2D6A4F]" />
                        )}

                        <div className="px-3">
                            {!isCollapsed && (
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-4">
                                    Quick Actions
                                </h3>
                            )}
                            
                            <div className="space-y-2">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <Link
                                            key={action.name}
                                            to={action.path}
                                            title={action.name}
                                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                                isCollapsed 
                                                    ? 'justify-center bg-[#F59E0B] hover:bg-[#D97706] text-white' 
                                                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-md hover:shadow-lg'
                                            }`}
                                        >
                                            <ActionIcon size={18} className="shrink-0" />
                                            {!isCollapsed && (
                                                <span className="ml-3 font-medium text-sm">
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
            </div>

            {/* User Info Footer */}
            {!isCollapsed && authState?.user && (
                <div className="border-t border-[#2D6A4F] p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white font-semibold">
                            {authState.user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                                {authState.user.username}
                            </p>
                            <p className="text-gray-400 text-xs truncate capitalize">
                                {authState.user.role || 'User'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;