import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // ⭐️ CHANGE 1: Combine states into authState and initialize with localStorage check ⭐️
    const [authState, setAuthState] = useState({
        user: null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token'),
        loading: true, // Crucial for preventing PrivateRoute flash
        role: null, // 'admin' or 'fieldagent'
        assignedRegion: null // For field agents
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
                console.log('User data from /auth/me:', response.data);
                setAuthState({
                    token,
                    user: response.data,
                    isAuthenticated: true,
                    loading: false,
                    role: response.data.role,
                    assignedRegion: response.data.assignedRegion
                });
            } catch (error) {
                // Distinguish between network errors and auth errors
                const isNetworkError = error.code === 'ERR_NETWORK' || (!error.response && error.request);
                if (isNetworkError) {
                    console.error('Auth server unreachable:', error.message);
                    // Keep token; mark unauthenticated until server returns user
                    setAuthState({ token, user: null, isAuthenticated: false, loading: false, role: null, assignedRegion: null });
                    return;
                }
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    console.error('Token expired or invalid - clearing token');
                    localStorage.removeItem('token');
                    setAuthState({ token: null, user: null, isAuthenticated: false, loading: false, role: null, assignedRegion: null });
                } else {
                    console.error('Failed to verify session:', error.message, error.response?.data);
                    // Clear token on any auth error to force re-login
                    localStorage.removeItem('token');
                    setAuthState({ token: null, user: null, isAuthenticated: false, loading: false, role: null, assignedRegion: null });
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
                role: user?.role || null,
                assignedRegion: user?.assignedRegion || null
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
    
    // ⭐️ CHANGE 3: Enhanced Logout function with server invalidation ⭐️
    const logout = async () => {
        // Optimistic UI - clear client immediately
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        // Clear any PII from IndexedDB if used
        if (window.indexedDB) {
            try {
                const dbs = await window.indexedDB.databases();
                dbs.forEach(db => {
                    if (db.name?.includes('ocms') || db.name?.includes('auth')) {
                        window.indexedDB.deleteDatabase(db.name);
                    }
                });
            } catch (err) {
                console.error('Error clearing IndexedDB:', err);
            }
        }
        
        // Update state immediately
        setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            role: null,
            assignedRegion: null
        });
        
        // Attempt server-side invalidation (best effort)
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // If offline or server error, queue for later
            if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
                console.log('Offline - logout queued for when connection restored');
                // Store pending logout in localStorage to retry later
                localStorage.setItem('pendingLogout', Date.now().toString());
            } else {
                console.error('Server logout failed (client already cleared):', err);
            }
        }
    };
    
    // Handle pending logout when connection restored
    useEffect(() => {
        const handleOnline = async () => {
            const pendingLogout = localStorage.getItem('pendingLogout');
            if (pendingLogout) {
                try {
                    await api.post('/auth/logout');
                    localStorage.removeItem('pendingLogout');
                    console.log('Pending logout completed');
                } catch (err) {
                    console.error('Failed to complete pending logout:', err);
                }
            }
        };
        
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

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