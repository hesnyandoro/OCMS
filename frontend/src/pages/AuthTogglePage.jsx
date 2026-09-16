import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, UserCircle, Lock, Mail, User, Coffee } from 'lucide-react';
import api from '../services/api';

const inputClasses = "w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-dark-text-tertiary";
const passwordInputClasses = "w-full pl-10 pr-12 py-3 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-dark-text-tertiary";
const plainInputClasses = "w-full px-4 py-3 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-dark-text-tertiary";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2";
const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary";
const submitButtonClasses = "w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md";
const requiredMark = <span className="text-harvest-gold-600 dark:text-harvest-gold-400">*</span>;

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans bg-gradient-to-br from-gray-50 via-green-50/30 to-amber-50/20 dark:from-dark-bg-primary dark:via-dark-green-subtle dark:to-dark-bg-secondary">
      {/* Decorative background elements */}
      <div className="absolute top-10 -left-20 w-72 h-72 bg-[#1B4332]/5 dark:bg-dark-green-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-amber-500/10 dark:bg-dark-gold-primary/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-4xl">
        {/* Card */}
        <div className="grid md:grid-cols-2 rounded-3xl shadow-xl border border-gray-100 dark:border-dark-border-primary overflow-hidden bg-white dark:bg-dark-bg-secondary">

          {/* Brand Panel - visible on md and up */}
          <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-subtle dark:to-dark-bg-tertiary text-white">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-12">
                <Coffee size={28} />
                <span className="text-2xl font-bold">OCMS</span>
              </div>
              <h2 className="text-3xl font-bold leading-snug mb-4">
                Empowering Organic Coffee Cooperatives
              </h2>
              <p className="text-white/80 leading-relaxed">
                Track farmer profiles, record deliveries, and process payments — all from one clean dashboard.
              </p>
            </div>

            <p className="relative text-white/60 text-sm">
              © {new Date().getFullYear()} OCMS. All rights reserved.
            </p>
          </div>

          {/* Form Panel */}
          <div className="p-8 sm:p-10">

            {/* Mobile-only compact logo (brand panel is hidden below md) */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              <Coffee className="text-[#1B4332] dark:text-dark-green-primary" size={24} />
              <span className="text-xl font-bold text-[#1B4332] dark:text-dark-green-primary">OCMS</span>
            </div>

            {/* Pill Toggle */}
            <div className="relative flex bg-gray-100 dark:bg-dark-bg-tertiary rounded-full p-1 mb-8">
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#1B4332] dark:bg-dark-green-primary shadow-md transition-transform duration-300 ease-out ${
                  view === 'register' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                onClick={() => setView('login')}
                className={`relative z-10 flex-1 py-2.5 text-center font-semibold text-sm rounded-full transition-colors duration-300 ${
                  view === 'login'
                    ? 'text-white'
                    : 'text-gray-500 dark:text-dark-text-tertiary hover:text-[#1B4332] dark:hover:text-dark-green-primary'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setView('register')}
                className={`relative z-10 flex-1 py-2.5 text-center font-semibold text-sm rounded-full transition-colors duration-300 ${
                  view === 'register'
                    ? 'text-white'
                    : 'text-gray-500 dark:text-dark-text-tertiary hover:text-[#1B4332] dark:hover:text-dark-green-primary'
                }`}
              >
                Register
              </button>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-gray-700 dark:text-dark-text-secondary text-sm font-medium">
                {view === 'login' ? 'Sign in to continue to your dashboard' : 'Fill in your details to get started'}
              </p>
            </div>

            {/* LOGIN FORM */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">

                {/* Username */}
                <div>
                  <label htmlFor="login-username" className={labelClasses}>
                    Username
                  </label>
                  <div className="relative">
                    <User className={iconClasses} size={20} />
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className={labelClasses}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClasses} size={20} />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={passwordInputClasses}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-primary"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="login-role" className={labelClasses}>
                    Role
                  </label>
                  <div className="relative">
                    <UserCircle className={iconClasses} size={20} />
                    <select
                      id="login-role"
                      name="role"
                      value={loginData.role}
                      onChange={handleLoginChange}
                      className={`${inputClasses} appearance-none`}
                    >
                      <option value="fieldagent">Field Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-[#1B4332] dark:text-dark-green-primary hover:text-[#2D6A4F] dark:hover:text-dark-green-secondary hover:underline font-medium transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button type="submit" className={submitButtonClasses}>
                  Login
                </button>

                {/* Toggle to Register */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 dark:text-dark-text-tertiary">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('register')}
                      className="text-harvest-gold-600 dark:text-harvest-gold-400 font-semibold hover:underline"
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
                    <label htmlFor="register-firstName" className={labelClasses}>
                      First Name {requiredMark}
                    </label>
                    <input
                      id="register-firstName"
                      name="firstName"
                      type="text"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="John"
                      autoComplete="given-name"
                      className={plainInputClasses}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="register-lastName" className={labelClasses}>
                      Last Name {requiredMark}
                    </label>
                    <input
                      id="register-lastName"
                      name="lastName"
                      type="text"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="Doe"
                      autoComplete="family-name"
                      className={plainInputClasses}
                      required
                    />
                  </div>
                </div>

                {/* Second Name (Optional) */}
                <div>
                  <label htmlFor="register-secondName" className={labelClasses}>
                    Second Name <span className="text-gray-400 dark:text-dark-text-tertiary text-xs">(Optional)</span>
                  </label>
                  <input
                    id="register-secondName"
                    name="secondName"
                    type="text"
                    value={registerData.secondName}
                    onChange={handleRegisterChange}
                    placeholder="Middle name"
                    autoComplete="additional-name"
                    className={plainInputClasses}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="register-email" className={labelClasses}>
                    Email {requiredMark}
                  </label>
                  <div className="relative">
                    <Mail className={iconClasses} size={20} />
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="register-username" className={labelClasses}>
                    Username {requiredMark}
                  </label>
                  <div className="relative">
                    <User className={iconClasses} size={20} />
                    <input
                      id="register-username"
                      name="username"
                      type="text"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="Choose a username"
                      autoComplete="username"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="register-role" className={labelClasses}>
                    Role {requiredMark}
                  </label>
                  <div className="relative">
                    <UserCircle className={iconClasses} size={20} />
                    <select
                      id="register-role"
                      name="role"
                      value={registerData.role}
                      onChange={handleRegisterChange}
                      className={`${inputClasses} appearance-none`}
                    >
                      <option value="fieldagent">Field Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Region - Only for Field Agents */}
                {registerData.role === 'fieldagent' && (
                  <div>
                    <label htmlFor="register-assignedRegion" className={labelClasses}>
                      Assigned Region <span className="text-gray-400 dark:text-dark-text-tertiary text-xs">(Optional)</span>
                    </label>
                    <input
                      id="register-assignedRegion"
                      name="assignedRegion"
                      type="text"
                      value={registerData.assignedRegion}
                      onChange={handleRegisterChange}
                      placeholder="e.g., Kiambu, Nyeri, Murang'a"
                      className={plainInputClasses}
                    />
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                      Leave blank if region will be assigned later
                    </p>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="register-password" className={labelClasses}>
                    Password {requiredMark}
                  </label>
                  <div className="relative">
                    <Lock className={iconClasses} size={20} />
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Create a password (min 6 characters)"
                      autoComplete="new-password"
                      className={passwordInputClasses}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-primary"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="register-confirmPassword" className={labelClasses}>
                    Confirm Password {requiredMark}
                  </label>
                  <div className="relative">
                    <Lock className={iconClasses} size={20} />
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={passwordInputClasses}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-primary"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className={submitButtonClasses}>
                  Create Account
                </button>

                {/* Toggle to Login */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 dark:text-dark-text-tertiary">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-harvest-gold-600 dark:text-harvest-gold-400 font-semibold hover:underline"
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
            className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthTogglePage;
