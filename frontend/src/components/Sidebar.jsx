import React from 'react';
import { Link } from 'react-router-dom';
// Using Lucide React icons for stability and functionality
import { LayoutDashboard, Users, Truck, DollarSign, FileText, Plus, Scale, Wallet } from 'lucide-react';

// Define navigation items using Lucide icons
const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Farmers", icon: Users, path: "/farmers" },
    { name: "Deliveries", icon: Truck, path: "/deliveries" },
    { name: "Payments", icon: DollarSign, path: "/payments" },
    { name: "Reports", icon: FileText, path: "/reports" },
];

// --- Quick Actions Definition ---
// The 'color' property is used to generate the correct outline button styles.
const quickActions = [
    { name: "New Farmer", icon: Plus, path: "/farmers/new", color: "estate" },
    { name: "Record Delivery", icon: Scale, path: "/deliveries/new", color: "cherry" },
    { name: "Record Payment", icon: Wallet, path: "/payments/new", color: "estate" },
];

/**
 * Custom component to generate the outline button style (like DaisyUI's btn-outline).
 */
const OutlineButton = ({ color, to, children, className = '' }) => {
    const base = 'w-full text-sm font-medium rounded-lg transition-colors duration-200 border py-2 px-3 text-center shadow-sm whitespace-nowrap';
    const palette = {
        estate: 'border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white',
        cherry: 'border-[#D93025] text-[#D93025] hover:bg-[#D93025] hover:text-white',
        charcoal: 'border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white',
    };
    return (
        <Link to={to} className={`${base} ${palette[color] || palette.charcoal} ${className}`}>
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
        <div className={`h-full fixed left-0 top-0 shadow-2xl ${sidebarWidth} ${transitionClass} z-30 flex flex-col`} style={{ backgroundColor: '#1B4332' }}>
            
            {/* Header / Logo Area */}
            <div className={`h-16 flex items-center justify-center p-4 border-b border-[#2D6A4F] shrink-0`}>
                <h1 className={`text-xl font-bold whitespace-nowrap overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`} style={{ color: '#F9FAFB' }}>
                    OCMS
                </h1>
                <CollapsedLogo className={`text-2xl ${isCollapsed ? 'block' : 'hidden'}`} style={{ color: '#F9FAFB' }} />
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
                                className={`flex items-center p-3 rounded-lg ${isActive ? 'font-semibold' : ''} ${transitionClass}`}
                                style={{
                                    color: isActive ? '#F9FAFB' : 'rgba(249,250,251,0.8)',
                                    backgroundColor: isActive ? '#2D6A4F' : 'transparent'
                                }}
                            >
                                <IconComponent className="text-xl shrink-0" style={{ color: isActive ? '#F9FAFB' : 'rgba(249,250,251,0.9)'}} />
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
                    <div className="mx-4 my-4" style={{ borderTop: '1px solid #2D6A4F' }}></div>
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
                                        className={`p-3 rounded-lg transition-colors duration-200 flex items-center justify-center w-full`}
                                        style={{ color: '#F9FAFB', backgroundColor: '#2D6A4F' }}
                                    >
                                        <ActionIcon className={`text-lg shrink-0`} />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        // Expanded view: Buttons retain their outline styling, structured as a vertical list.
                        <div className="px-2"> 
                            
                            <h3 className="text-xs font-bold uppercase mb-3 ml-1" style={{ color: 'rgba(249,250,251,0.7)'}}>
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