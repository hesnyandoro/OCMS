import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa'; 

const PrivateRoute = ({ children }) => {
    //  CHANGE 1: Destructure the comprehensive authState object 
    const { authState } = useContext(AuthContext);

    //  CHANGE 2: Check the loading state first 
    if (authState.loading) {
        // Render a loading spinner or message while checking the token in localStorage
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-xl">
                    <FaSpinner className="animate-spin text-primary text-4xl mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-700">Verifying Session...</p>
                </div>
            </div>
        );
    }

    //  CHANGE 3: Check isAuthenticated state 
    if (!authState.isAuthenticated) {
        // Check complete, no token found or token invalid, redirect to login
        return <Navigate to="/login" replace />;
    }

    // Check complete and authenticated, render the requested page
    return children;
};

export default PrivateRoute;