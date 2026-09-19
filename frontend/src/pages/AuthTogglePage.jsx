import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, User, Coffee } from 'lucide-react';

const inputClasses = "w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-dark-text-tertiary";
const passwordInputClasses = "w-full pl-10 pr-12 py-3 bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-dark-text-tertiary";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2";
const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary";
const submitButtonClasses = "w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md";

const AuthTogglePage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans bg-gradient-to-br from-gray-50 via-green-50/30 to-amber-50/20 dark:from-dark-bg-primary dark:via-dark-green-subtle dark:to-dark-bg-secondary">
      <div className="absolute top-10 -left-20 w-72 h-72 bg-[#1B4332]/5 dark:bg-dark-green-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-amber-500/10 dark:bg-dark-gold-primary/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-4xl">
        <div className="grid md:grid-cols-2 rounded-3xl shadow-xl border border-gray-100 dark:border-dark-border-primary overflow-hidden bg-white dark:bg-dark-bg-secondary">

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

          <div className="auth-form-panel p-8 sm:p-10">
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              <Coffee className="text-[#1B4332] dark:text-dark-green-primary" size={24} />
              <span className="text-xl font-bold text-[#1B4332] dark:text-dark-green-primary">OCMS</span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
              <p className="text-sm font-medium">
                Sign in to continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-username" className={labelClasses}>
                  Username or email
                </label>
                <div className="relative">
                  <User className={iconClasses} size={20} />
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="auth-inline-link text-sm hover:underline font-medium transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className={submitButtonClasses}>
                Login
              </button>

              <p className="text-center text-sm">
                Accounts are created by an administrator. Contact your admin if you need access.
              </p>
            </form>
          </div>
        </div>

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
