import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ⭐️ CHANGE 1: Combine states into authState and initialize with localStorage check ⭐️
    const [authState, setAuthState] = useState({
        user: null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token'),
        loading: true, // Crucial for preventing PrivateRoute flash
    });

    // ⭐️ CHANGE 2: Implement loadUser to verify token on application load ⭐️
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Call backend endpoint to verify token and get user details
                    const response = await api.get('/auth/me'); 
                    
                    setAuthState({
                        token: token,
                        user: response.data,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (error) {
                    console.error("Token expired or invalid:", error);
                    localStorage.removeItem('token');
                    setAuthState({ token: null, user: null, isAuthenticated: false, loading: false });
                }
            } else {
                // No token found, finish loading
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        };

        loadUser();
    }, []); // Empty array ensures this runs only ONCE on mount

    // Login function (Updated to use setAuthState)
    const login = async (username, password) => {
        try {
            // Note: using /api/auth/login assuming your proxy handles the /api prefix
            const { data } = await api.post('/auth/login', { username, password }); 
            
            // Store the new token
            localStorage.setItem('token', data.token);
            
            // Update the state
            setAuthState({
                token: data.token,
                user: data.user, // Assuming backend sends user object
                isAuthenticated: true,
                loading: false,
            });
            
            return data.user; // Return user object if needed
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Re-throw for component to handle UI error
        }
    };
    
    // ⭐️ CHANGE 3: Add Logout function ⭐️
    const logout = () => {
        localStorage.removeItem('token');
        setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    // If still loading, render a placeholder (This is handled best in PrivateRoute.jsx)
    if (authState.loading) {
        return <div className="text-center p-20">Verifying Session...</div>; 
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};