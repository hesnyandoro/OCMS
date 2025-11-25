import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, Lock, Monitor, LogOut, Camera, Save, Eye, EyeOff, 
  Smartphone, Chrome, AlertTriangle, Shield, Moon, Sun, X 
} from 'lucide-react';
import api from '../services/api';

const UserSettings = () => {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    name: '',
    role: '',
    assignedRegion: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Load user data on mount
  useEffect(() => {
    if (authState?.user) {
      setProfileData({
        username: authState.user.username || '',
        email: authState.user.email || '',
        name: authState.user.name || '',
        role: authState.user.role || '',
        assignedRegion: authState.user.assignedRegion || ''
      });
      
      // Set avatar preview if user has an avatar
      if (authState.user.avatar) {
        const avatarUrl = authState.user.avatar.startsWith('http') 
          ? authState.user.avatar 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${authState.user.avatar}`;
        setAvatarPreview(avatarUrl);
      }
    }
    loadActiveSessions();
  }, [authState]);

  // Load active sessions
  const loadActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data } = await api.get('/auth/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      // If endpoint doesn't exist yet, show mock data
      setSessions([
        {
          _id: '1',
          deviceInfo: 'Windows Chrome',
          ipAddress: '192.168.1.1',
          lastActive: new Date().toISOString(),
          current: true
        }
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/auth/profile', {
        username: profileData.username,
        email: profileData.email,
        name: profileData.name
      });
      
      toast.success('Profile updated successfully');
      
      // Update auth context with new user data
      if (authState.user) {
        authState.user.username = profileData.username;
        authState.user.email = profileData.email;
        authState.user.name = profileData.name;
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      const message = err?.response?.data?.msg || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully. Please login with your new password.');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Logout and redirect to login
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (err) {
      console.error('Password change failed:', err);
      const message = err?.response?.data?.msg || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    setLoading(true);
    try {
      const response = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update the user in authState with the new avatar
      if (response.data.user && authState.user) {
        authState.user.avatar = response.data.user.avatar;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(authState.user));
      }
      
      // Set the new avatar preview from server response
      const newAvatarUrl = response.data.avatar.startsWith('http') 
        ? response.data.avatar 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.data.avatar}`;
      setAvatarPreview(newAvatarUrl);
      
      toast.success('Profile picture updated successfully');
      setAvatarFile(null);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const message = err?.response?.data?.msg || 'Failed to upload profile picture';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    // Optimistic UI - clear immediately
    toast.loading('Logging out...', { id: 'logout' });
    
    // Clear client-side data immediately
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Attempt to invalidate on server
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Server logout failed, but client cleared:', err);
    }
    
    // Call context logout
    logout();
    
    toast.success('Logged out successfully', { id: 'logout' });
    navigate('/login');
  };

  // Handle logout from specific session
  const handleLogoutSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      toast.success('Session terminated successfully');
      loadActiveSessions();
    } catch (err) {
      console.error('Failed to terminate session:', err);
      toast.error('Failed to terminate session');
    }
  };

  // Handle logout from all devices
  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will log you out from all devices. Continue?')) {
      return;
    }
    
    try {
      await api.post('/auth/logout-all');
      toast.success('Logged out from all devices');
      
      // Clear local data and redirect
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (err) {
      console.error('Failed to logout all devices:', err);
      toast.error('Failed to logout from all devices');
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
    toast.success(`Switched to ${newTheme} mode`);
  };

  // Format last active time
  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#D93025] dark:bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-[#B52518] dark:hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-primary'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'security'
                ? 'border-b-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-primary'
            }`}
          >
            <Lock size={20} />
            <span>Security</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'sessions'
                ? 'border-b-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-primary'
            }`}
          >
            <Monitor size={20} />
            <span>Active Sessions</span>
          </button>
          
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'preferences'
                ? 'border-b-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-dark-green-primary'
            }`}
          >
            <Shield size={20} />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100">Profile Information</h2>
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profileData.name?.charAt(0)?.toUpperCase() || profileData.username?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <Camera size={16} className="text-[#1B4332] dark:text-dark-green-primary" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Picture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload a new profile picture (max 2MB)</p>
                {avatarFile && (
                  <button
                    onClick={handleAvatarUpload}
                    disabled={loading}
                    className="mt-3 flex items-center gap-2 bg-[#1B4332] dark:bg-dark-green-primary text-white px-4 py-2 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-all disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>Save Picture</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-control bg-gray-100"
                  value={profileData.role}
                  readOnly
                />
                <small className="text-muted">Role cannot be changed by users</small>
              </div>

              {profileData.assignedRegion && (
                <div>
                  <label className="form-label">Assigned Region</label>
                  <input
                    type="text"
                    className="form-control bg-gray-100"
                    value={profileData.assignedRegion}
                    readOnly
                  />
                  <small className="text-muted">Region can only be changed by administrators</small>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn"
                  style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100">Change Password</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-1" size={20} />
              <div>
                <p className="font-medium text-yellow-800">Security Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  After changing your password, you will be logged out and need to login again with your new password.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    className="form-control pr-10"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    className="form-control pr-10"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <small className="text-muted">Must be at least 6 characters</small>
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    className="form-control pr-10"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn"
                  style={{ backgroundColor: '#D93025', color: '#FFFFFF', borderColor: '#D93025' }}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1B4332]">Active Sessions</h2>
                <p className="text-gray-600 mt-1">Manage devices where you're currently logged in</p>
              </div>
              <button
                onClick={handleLogoutAllDevices}
                className="flex items-center gap-2 bg-[#D93025] text-white px-4 py-2 rounded-lg hover:bg-[#B52518] transition-all"
              >
                <LogOut size={18} />
                <span>Logout All Devices</span>
              </button>
            </div>

            {loadingSessions ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading sessions...</div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No active sessions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      session.current
                        ? 'border-[#1B4332] dark:border-dark-green-primary bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-dark-border-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                          {session.deviceInfo?.toLowerCase().includes('mobile') || 
                           session.deviceInfo?.toLowerCase().includes('android') ||
                           session.deviceInfo?.toLowerCase().includes('ios') ? (
                            <Smartphone size={24} className="text-[#1B4332] dark:text-dark-green-primary" />
                          ) : (
                            <Chrome size={24} className="text-[#1B4332] dark:text-dark-green-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {session.deviceInfo || 'Unknown Device'}
                            </h3>
                            {session.current && (
                              <span className="px-2 py-1 bg-[#1B4332] dark:bg-dark-green-primary text-white text-xs rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            IP: {session.ipAddress || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                            Last active: {formatLastActive(session.lastActive)}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleLogoutSession(session._id)}
                          className="p-2 text-[#D93025] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Logout this session"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B4332]">Preferences</h2>

            {/* Theme Toggle */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    {theme === 'light' ? (
                      <Sun size={24} className="text-yellow-500 dark:text-yellow-400" />
                    ) : (
                      <Moon size={24} className="text-indigo-500 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Choose between light and dark mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-indigo-600 dark:bg-dark-green-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white dark:bg-gray-100 shadow-lg transition-transform ${
                      theme === 'dark' ? 'translate-x-11' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">More Preferences Coming Soon</h3>
              <p className="text-sm text-blue-700">
                Additional customization options like notification preferences, language settings, 
                and display options will be available in future updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
