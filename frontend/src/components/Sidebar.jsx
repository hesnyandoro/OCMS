import React from 'react';
import { Link } from 'react-router-dom';
// Using Lucide React icons for stability and functionality
import { LayoutDashboard, Users, Truck, DollarSign, FileText, Plus, Scale, Wallet } from 'lucide-react';

// Define navigation items using Lucide icons
const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Farmers Management", icon: Users, path: "/farmers" },
    { name: "Deliveries Tracking", icon: Truck, path: "/deliveries" },
    { name: "Payments Module", icon: DollarSign, path: "/payments" },
    { name: "Reports Generator", icon: FileText, path: "/reports" },
];

// --- Quick Actions Definition ---
// The 'color' property is used to generate the correct outline button styles.
const quickActions = [
    { name: "New Farmer Registration", icon: Plus, path: "/farmers/new", color: "blue" },
    { name: "Record Delivery (Kgs)", icon: Scale, path: "/deliveries/record", color: "green" },
    { name: "Record Payment Entry", icon: Wallet, path: "/payments/new", color: "indigo" },
];

/**
 * Custom component to generate the outline button style (like DaisyUI's btn-outline).
 */
const OutlineButton = ({ color, to, children, className = '' }) => {
    let baseClasses = 'w-full text-sm font-medium rounded-lg transition-colors duration-200 border py-1.5 px-3 text-center shadow-sm whitespace-nowrap'; // Added whitespace-nowrap
    let colorClasses = '';

    switch (color) {
        case 'blue':
            // Replicating btn-outline-primary
            colorClasses = 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white';
            break;
        case 'green':
            // Replicating btn-outline-success
            colorClasses = 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white';
            break;
        case 'indigo':
        default:
            // Replicating btn-outline-info
            colorClasses = 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white';
            break;
    }

    // IMPORTANT FIX: Ensure buttons do not contain unnecessary flex properties that would cause them to wrap
    // The w-full ensures they take the full width of the parent flex-col container.
    return (
        <Link to={to} className={`${baseClasses} ${colorClasses} ${className}`}>
            {children}
        </Link>
    );
};

const Sidebar = ({ isCollapsed }) => {
    // Determine the width of the sidebar and transition class
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'; 
    const transitionClass = 'transition-all duration-300 ease-in-out';
    const CollapsedLogo = LayoutDashboard;

    return (
        <div className={`h-full fixed left-0 top-0 bg-white shadow-2xl ${sidebarWidth} ${transitionClass} z-30 flex flex-col`}>
            
            {/* Header / Logo Area */}
            <div className={`h-16 flex items-center justify-center p-4 border-b border-gray-200 shrink-0`}>
                <h1 className={`text-xl font-bold text-gray-800 whitespace-nowrap overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
                    OCMS
                </h1>
                <CollapsedLogo className={`text-2xl text-blue-600 ${isCollapsed ? 'block' : 'hidden'}`} />
            </div>

            {/* Navigation & Quick Actions Container - Scrollable area */}
            <div className="flex-1 overflow-y-auto">
                
                {/* 1. Primary Navigation Links */}
                <nav className="p-2 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = item.path === window.location.pathname;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                title={item.name}
                                className={`
                                    flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 
                                    ${isActive ? 'bg-gray-100 text-blue-600 font-semibold' : ''}
                                    ${transitionClass}
                                `}
                            >
                                <IconComponent className="text-xl shrink-0" />
                                <span className={`ml-3 whitespace-nowrap overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* --- Quick Actions Section --- */}
                {/* Add a divider for separation */}
                {!isCollapsed && (
                    <div className="mx-4 my-4 border-t border-gray-200"></div>
                )}

                <div className={`mt-2 p-2 pt-0 ${isCollapsed ? 'py-4' : 'pt-0 pb-8'}`}>
                    
                    {isCollapsed ? (
                        // Collapsed view: Simple icons for quick actions
                        <div className="space-y-2 flex flex-col items-center">
                            {quickActions.map((action) => {
                                const ActionIcon = action.icon;
                                return (
                                    <Link
                                        key={action.name}
                                        to={action.path}
                                        title={action.name}
                                        className={`
                                            p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200
                                            flex items-center justify-center w-full
                                        `}
                                    >
                                        <ActionIcon className={`text-lg shrink-0 text-blue-600`} />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        // Expanded view: Buttons retain their outline styling, structured as a vertical list.
                        <div className="px-2"> 
                            
                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 ml-1">
                                Quick Actions
                            </h3>
                            
                            {/* FIX: Ensure buttons are explicitly stacked vertically and have spacing */}
                            <div className="flex flex-col space-y-2">
                                <OutlineButton to={quickActions[0].path} color={quickActions[0].color}>
                                    {quickActions[0].name}
                                </OutlineButton>
                                <OutlineButton to={quickActions[1].path} color={quickActions[1].color}>
                                    {quickActions[1].name}
                                </OutlineButton>
                                <OutlineButton to={quickActions[2].path} color={quickActions[2].color}>
                                    {quickActions[2].name}
                                </OutlineButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;