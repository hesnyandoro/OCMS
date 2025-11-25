import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Truck, Wallet, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg-primary font-sans">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#1B4332] dark:text-dark-green-primary">OCMS</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors">
                Home
              </a>
              <a href="#features" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors">
                About
              </a>
              <button
                onClick={() => navigate('/login')}
                className="bg-[#1B4332] dark:bg-dark-green-primary text-white px-6 py-2 rounded-md hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-colors"
              >
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <a
                  href="#home"
                  className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="bg-[#1B4332] dark:bg-dark-green-primary text-white px-6 py-2 rounded-md hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-colors text-center"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gray-100 dark:bg-dark-bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                Digitizing the Coffee Supply Chain
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Empower farmers, streamline deliveries, and automate payments with a single integrated platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#1B4332] dark:bg-dark-green-primary text-white px-8 py-3 rounded-md hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-colors font-medium text-lg"
                >
                  Field Agent Login
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary px-8 py-3 rounded-md hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white transition-colors font-medium text-lg"
                >
                  Admin Portal
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 md:order-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 h-[400px] flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop"
                  alt="Coffee farm dashboard"
                  className="rounded-lg object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%231B4332"%3EDashboard Preview%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-gray-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Powerful Features for Complete Control
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your coffee supply chain efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 - Farmer Management */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-[#1B4332] dark:bg-dark-green-primary w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Tractor className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Farmer Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track farmer profiles, farm locations, and acreage with comprehensive digital records
              </p>
            </div>

            {/* Card 2 - Delivery Tracking */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-[#1B4332] dark:bg-dark-green-primary w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Delivery Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time recording of cherry and parchment deliveries with full traceability
              </p>
            </div>

            {/* Card 3 - Payment Tracking */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-[#1B4332] dark:bg-dark-green-primary w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Wallet className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seamless payment processing and financial reconciliation for transparent operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-100 dark:bg-dark-bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              About OCMS
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              The Optimal Coffee Management System (OCMS) is designed to revolutionize the coffee supply chain
              by providing a comprehensive digital platform for farmers, field agents, and administrators.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our mission is to bring transparency, efficiency, and fairness to every stakeholder in the
              coffee production process, from the farm to the final delivery point.
            </p>
            <div className="mt-10">
              <span className="inline-block bg-[#D93025] dark:bg-red-600 text-white px-6 py-2 rounded-full font-medium">
                Transforming Coffee Supply Chains
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B4332] dark:bg-dark-green-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <h3 className="text-xl font-bold mb-4">OCMS</h3>
              <p className="text-gray-300">
                Optimal Coffee Management System - Digitizing the coffee supply chain
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#home" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">
                For support and inquiries, please contact your system administrator
              </p>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-8 text-center">
            <p className="text-gray-300">
              &copy; {new Date().getFullYear()} OCMS - Optimal Coffee Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
