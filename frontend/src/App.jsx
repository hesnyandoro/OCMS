import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const AuthTogglePage = lazy(() => import('./pages/AuthTogglePage.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Farmers = lazy(() => import('./pages/Farmers.jsx'));
const NewFarmer = lazy(() => import('./pages/NewFarmer.jsx'));
const Deliveries = lazy(() => import('./pages/Deliveries.jsx'));
const NewDelivery = lazy(() => import('./pages/NewDelivery.jsx'));
const EditDelivery = lazy(() => import('./pages/EditDelivery.jsx'));
const Payments = lazy(() => import('./pages/Payments.jsx'));
const NewPayment = lazy(() => import('./pages/NewPayment.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Users = lazy(() => import('./pages/Users.jsx'));
const UserSettings = lazy(() => import('./pages/UserSettings.jsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthTogglePage />} />
            <Route path="/auth" element={<AuthTogglePage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="" element={<Dashboard />} />
                    <Route path="farmers/new" element={<NewFarmer />} />
                    <Route path="farmers" element={<Farmers />} />
                    <Route path="deliveries" element={<Deliveries />} />
                    <Route path="deliveries/new" element={<NewDelivery />} />
                    <Route path="deliveries/edit/:id" element={<EditDelivery />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="payments/new" element={<NewPayment />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="users" element={<Users />} />
                    <Route path="settings" element={<UserSettings />} />
                    <Route path="*" element={
                        <div className="p-10 text-center text-xl font-semibold">
                          404 - Page Not Found
                        </div>
                      }
                    />
          </Routes>
        </Layout>
      </PrivateRoute>
    }
  />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};export default App;