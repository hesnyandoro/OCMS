import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  Truck, 
  Wallet, 
  Menu, 
  X, 
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Coffee
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Tractor,
      title: 'Farmer Management',
      description: 'Track farmer profiles, farm locations, and acreage with comprehensive digital records',
      details: ['GPS-enabled farm mapping', 'Yield history tracking', 'Certification management']
    },
    {
      icon: Truck,
      title: 'Delivery Tracking',
      description: 'Real-time recording of cherry and parchment deliveries with full traceability',
      details: ['QR code scanning', 'Weight verification', 'Quality grading']
    },
    {
      icon: Wallet,
      title: 'Payment Tracking',
      description: 'Seamless payment processing and financial reconciliation for transparent operations',
      details: ['Instant mobile payments', 'Transaction history', 'Automated calculations']
    }
  ];

  const steps = [
    { number: '01', title: 'Register', description: 'Create farmer profiles with GPS coordinates' },
    { number: '02', title: 'Record', description: 'Log deliveries with weight & quality data' },
    { number: '03', title: 'Get Paid', description: 'Receive instant mobile payments' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Coffee className="text-[#1B4332] dark:text-dark-green-primary" size={28} />
              <h1 className="text-2xl font-bold text-[#1B4332] dark:text-dark-green-primary">OCMS</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors font-medium">
                Workflow
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors font-medium">
                About
              </a>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                {['Home', 'Features', 'How It Works', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-700 dark:text-gray-100 hover:text-[#1B4332] dark:hover:text-dark-green-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-center mt-2"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-gray-50 via-green-50/30 to-amber-50/20 dark:from-dark-bg-primary dark:via-dark-green-subtle dark:to-dark-bg-secondary py-20 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#1B4332]/5 dark:bg-dark-green-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[#1B4332]/10 dark:bg-dark-green-primary/20 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#1B4332] dark:bg-dark-green-primary rounded-full animate-pulse"></span>
                <span className="text-[#1B4332] dark:text-dark-green-primary font-medium text-sm">Transforming Coffee Supply Chains</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                Digitizing the{' '}
                <span className="bg-gradient-to-r from-[#1B4332] to-[#40916C] dark:from-dark-green-primary dark:to-dark-green-hover bg-clip-text text-transparent">
                  Coffee Supply Chain
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
                Empower farmers, streamline deliveries, and automate payments with a single integrated platform
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium text-lg flex items-center justify-center gap-2"
                >
                  Field Agent Login
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary px-8 py-4 rounded-xl hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white transition-all duration-300 font-medium text-lg"
                >
                  Admin Portal
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1B4332] to-[#40916C] dark:from-dark-green-primary dark:to-dark-green-secondary rounded-2xl blur-2xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop"
                    alt="Coffee farm dashboard"
                    className="rounded-xl object-cover w-full h-[350px] md:h-[450px]"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%231B4332"%3EDashboard Preview%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-gray-800 py-20 md:py-28">
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
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-transparent hover:border-[#1B4332]/20 dark:hover:border-dark-green-primary/30"
              >
                <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-[#1B4332] dark:bg-dark-green-primary rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-dark-bg-primary py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#1B4332] via-[#40916C] to-[#1B4332] dark:from-dark-green-primary dark:via-dark-green-hover dark:to-dark-green-primary"></div>
            
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white dark:bg-gray-800 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              About OCMS
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              The Organic Coffee Management System (OCMS) is designed to revolutionize the coffee supply chain
              by providing a comprehensive digital platform for farmers, field agents, and administrators.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Our mission is to bring transparency, efficiency, and fairness to every stakeholder in the
              coffee production process, from the farm to the final delivery point.
            </p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] dark:from-dark-green-primary dark:to-dark-green-secondary text-white px-8 py-3 rounded-full font-medium">
              <Coffee size={20} />
              Transforming Coffee Supply Chains
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#081C15] to-[#1B4332] dark:from-dark-bg-secondary dark:to-dark-green-subtle text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Column 1 - Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="text-[#52B788] dark:text-dark-green-primary" size={32} />
                <h3 className="text-2xl font-bold">OCMS</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Organic Coffee Management System - Digitizing the coffee supply chain for a sustainable future.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1B4332] transition-colors cursor-pointer">
                  <span className="text-sm font-bold">fb</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1B4332] transition-colors cursor-pointer">
                  <span className="text-sm font-bold">tw</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1B4332] transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {['Home', 'Features', 'How It Works', 'About'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`#${item.toLowerCase().replace(' ', '-')}`} 
                      className="text-gray-300 hover:text-[#52B788] dark:hover:text-dark-green-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-300 hover:text-[#52B788] dark:hover:text-dark-green-primary transition-colors"
                  >
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 - Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Mail size={18} className="text-[#52B788] dark:text-dark-green-primary" />
                  <span>support@ocms.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Phone size={18} className="text-[#52B788] dark:text-dark-green-primary" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <MapPin size={18} className="text-[#52B788] dark:text-dark-green-primary" />
                  <span>Coffee Region, Country</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} OCMS - Organic Coffee Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
