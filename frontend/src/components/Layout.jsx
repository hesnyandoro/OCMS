import React, { useState } from 'react';
import Header from './Header'; 
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    // State to manage the sidebar's collapsed status
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Calculate dynamic margin-left for the main content
    // w-20 is ~5rem, w-64 is ~16rem. Adjust as needed if your final CSS differs.
    const sidebarOffset = isSidebarCollapsed ? '5rem' : '16rem'; 

    return (
        <div className="flex">
            {/* 1. Sidebar (Fixed to the left) */}
            <Sidebar isCollapsed={isSidebarCollapsed} />

            {/* 2. Header (Fixed to the top) */}
            {/* The right margin needs to compensate for the sidebar when the screen is wide. */}
            <div 
                className={`fixed top-0 right-0 z-20 transition-all duration-300 ease-in-out`}
                style={{ left: sidebarOffset }}
            >
                {/* We render the Header here so its width dynamically adjusts based on the sidebar's state */}
                <Header toggleSidebar={toggleSidebar} userName="Admin" />
            </div>

            {/* 3. Main Content Area */}
            {/* The style property handles the push from the left sidebar and the top header (pt-16) */}
            <main 
                className={`pt-16 transition-all duration-300 ease-in-out w-full min-h-screen`}
                style={{ marginLeft: sidebarOffset }}
            >
                <div className="p-4 md:p-8" style={{ backgroundColor: '#F3F4F6', minHeight: '100vh' }}>
                    {children} 
                </div>
            </main>
        </div>
    );
};

export default Layout;