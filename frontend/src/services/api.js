import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  // Guard access to localStorage for environments where `window` is undefined
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    // Only auto-logout on 401 (unauthorized), not 403 (forbidden)
    // 403 means user is authenticated but lacks permission for that specific resource
    if (error.response?.status === 401) {
      console.error('Authentication failed - token invalid or expired');
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.msg || 'Insufficient permissions');
      // Don't auto-logout on 403 - it's a permission issue, not an auth issue
    }
    return Promise.reject(error);
  }
);

export default api;