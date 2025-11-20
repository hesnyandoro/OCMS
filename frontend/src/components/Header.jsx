import React from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar, userName }) => {
    return (
        <header className="fixed top-0 right-0 z-20 h-16 bg-white shadow-md p-4 flex items-center justify-between w-full">
            {/* Left side: Collapse Button */}
            <button 
                onClick={toggleSidebar} 
                className="text-gray-600 hover:text-primary transition-colors duration-200 focus:outline-none"
                aria-label="Toggle Sidebar"
            >
                <FaBars className="text-xl" />
            </button>

            {/* Right side: User Menu */}
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                    <span className="mr-2 text-gray-700 font-medium hidden sm:block">{userName || 'Admin User'}</span>
                    <FaUserCircle className="text-2xl text-primary" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
                    <li>
                        <Link to="/account">
                            <FaCog className="mr-2"/> My Account
                        </Link>
                    </li>
                    <li>
                        {/* Replace this with your actual logout function */}
                        <a onClick={() => console.log('Logging out...')} className="text-error">
                            <FaSignOutAlt className="mr-2"/> Logout
                        </a>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;