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
            if (!token) {
                setAuthState(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const response = await api.get('/auth/me');
                setAuthState({
                    token,
                    user: response.data,
                    isAuthenticated: true,
                    loading: false,
                });
            } catch (error) {
                // Distinguish between network errors and auth errors
                const isNetworkError = error.code === 'ERR_NETWORK' || (!error.response && error.request);
                if (isNetworkError) {
                    console.error('Auth server unreachable:', error.message);
                    // Keep token; mark unauthenticated until server returns user
                    setAuthState({ token, user: null, isAuthenticated: false, loading: false });
                    return;
                }
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    console.error('Token expired or invalid');
                    localStorage.removeItem('token');
                    setAuthState({ token: null, user: null, isAuthenticated: false, loading: false });
                } else {
                    console.error('Failed to verify session:', error.message);
                    setAuthState({ token, user: null, isAuthenticated: false, loading: false });
                }
            }
        };

        loadUser();
    }, []); // Runs once on mount

    // Login function (Updated to use setAuthState)
    const login = async (username, password) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });
            if (data.token) localStorage.setItem('token', data.token);

            let user = data.user;
            if (!user && data.token) {
                try {
                    const res = await api.get('/auth/me');
                    user = res.data;
                } catch (err) {
                    const isNetworkError = err.code === 'ERR_NETWORK' || (!err.response && err.request);
                    if (isNetworkError) {
                        console.warn('Login succeeded (token) but user fetch failed: server unreachable');
                    } else {
                        console.warn('Could not fetch user after login:', err.message);
                    }
                }
            }

            setAuthState({
                token: data.token || null,
                user: user || null,
                isAuthenticated: !!data.token,
                loading: false,
            });
            return user;
        } catch (error) {
            const isNetworkError = error.code === 'ERR_NETWORK' || (!error.response && error.request);
            if (isNetworkError) {
                console.error('Login failed: authentication server unreachable');
                throw new Error('Cannot reach server. Please check connection and try again.');
            }
            console.error('Login failed:', error);
            if (error.response?.data) {
                const errData = error.response.data;
                if (Array.isArray(errData.errors) && errData.errors.length > 0) {
                    throw new Error(errData.errors[0].msg || 'Validation Failed: Check your input.');
                }
                if (errData.msg) {
                    throw new Error(errData.msg);
                }
            }
            throw new Error('Login failed due to unexpected error.');
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