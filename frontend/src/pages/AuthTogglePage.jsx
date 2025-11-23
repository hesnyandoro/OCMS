import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, UserCircle, Lock, Mail, User } from 'lucide-react';
import api from '../services/api';

const AuthTogglePage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // View state: 'login' or 'register'
  const [view, setView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    role: 'fieldagent'
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    secondName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'fieldagent',
    assignedRegion: '',
    password: '',
    confirmPassword: ''
  });

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // Handle register form changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await login(loginData.username, loginData.password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err?.response?.data?.msg || 
                       (err?.response?.data?.errors && err.response.data.errors.map(x => x.msg).join(', '));
      const message = serverMsg || err.message || 'Login failed';
      toast.error(message);
      console.error('Login failed:', err);
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!registerData.firstName || !registerData.lastName || !registerData.email || 
        !registerData.username || !registerData.password || !registerData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Build full name (firstName + secondName + lastName)
      const fullName = [registerData.firstName, registerData.secondName, registerData.lastName]
        .filter(Boolean)
        .join(' ');

      const { data } = await api.post('/auth/register', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        name: fullName, // Send full name to backend
        assignedRegion: registerData.role === 'fieldagent' ? registerData.assignedRegion : undefined
      });

      // Store token from registration
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      toast.success('Registration successful! Redirecting to dashboard...');
      
      // Auto-login after registration
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err?.response?.data?.msg || 
                      (err?.response?.data?.errors && err.response.data.errors.map(e => e.msg).join(', ')) ||
                      err.message || 
                      'Registration failed';
      toast.error(errorMsg);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Toggle Header */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setView('login')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 ${
                view === 'login'
                  ? 'text-[#1B4332] border-b-4 border-[#1B4332] bg-[#F3F4F6]'
                  : 'text-gray-500 hover:text-[#1B4332] hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 ${
                view === 'register'
                  ? 'text-[#1B4332] border-b-4 border-[#1B4332] bg-[#F3F4F6]'
                  : 'text-gray-500 hover:text-[#1B4332] hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Container */}
          <div className="p-8">
            
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#1B4332] mb-2">OCMS</h1>
              <p className="text-gray-600">
                {view === 'login' ? 'Welcome back!' : 'Create your account'}
              </p>
            </div>

            {/* LOGIN FORM */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                
                {/* Username */}
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="login-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      id="login-role"
                      name="role"
                      value={loginData.role}
                      onChange={handleLoginChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="fieldagent">Field Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1B4332] text-white py-3 rounded-lg font-semibold hover:bg-[#2D6A4F] transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Login
                </button>

                {/* Toggle to Register */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('register')}
                      className="text-[#D93025] font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                
                {/* Name Fields Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-[#D93025]">*</span>
                    </label>
                    <input
                      id="register-firstName"
                      name="firstName"
                      type="text"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="John"
                      autoComplete="given-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-[#D93025]">*</span>
                    </label>
                    <input
                      id="register-lastName"
                      name="lastName"
                      type="text"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="Doe"
                      autoComplete="family-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Second Name (Optional) */}
                <div>
                  <label htmlFor="register-secondName" className="block text-sm font-medium text-gray-700 mb-2">
                    Second Name <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    id="register-secondName"
                    name="secondName"
                    type="text"
                    value={registerData.secondName}
                    onChange={handleRegisterChange}
                    placeholder="Middle name"
                    autoComplete="additional-name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-[#D93025]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-[#D93025]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="register-username"
                      name="username"
                      type="text"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="Choose a username"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="register-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-[#D93025]">*</span>
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      id="register-role"
                      name="role"
                      value={registerData.role}
                      onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="fieldagent">Field Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Region - Only for Field Agents */}
                {registerData.role === 'fieldagent' && (
                  <div>
                    <label htmlFor="register-assignedRegion" className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Region <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      id="register-assignedRegion"
                      name="assignedRegion"
                      type="text"
                      value={registerData.assignedRegion}
                      onChange={handleRegisterChange}
                      placeholder="e.g., Kiambu, Nyeri, Murang'a"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank if region will be assigned later
                    </p>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-[#D93025]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Create a password (min 6 characters)"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-[#D93025]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1B4332] text-white py-3 rounded-lg font-semibold hover:bg-[#2D6A4F] transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Create Account
                </button>

                {/* Toggle to Login */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-[#D93025] font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-[#1B4332] transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthTogglePage;
