import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import AuthTogglePage from './pages/AuthTogglePage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Farmers from './pages/Farmers.jsx';
import Deliveries from './pages/Deliveries.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import FarmerForm from './components/FarmerForm.jsx';
import NewFarmer from './pages/NewFarmer.jsx';
import NewDelivery from './pages/NewDelivery.jsx';
import NewPayment from './pages/NewPayment.jsx';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthTogglePage />} />
          <Route path="/auth" element={<AuthTogglePage />} />
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
                    <Route path="payments" element={<Payments />} />
                    <Route path="payments/new" element={<NewPayment />} />
                    <Route path="reports" element={<Reports />} />
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
      </Router>
    </AuthProvider>
  );
};

export default App;