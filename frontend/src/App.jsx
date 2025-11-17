import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Farmers from './pages/Farmers.jsx';
import Deliveries from './pages/Deliveries.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import FarmerForm from './components/FarmerForm.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/farmers/new" element={<PrivateRoute><FarmerForm /></PrivateRoute>} />
          <Route path="/farmers" element={<PrivateRoute><Farmers /></PrivateRoute>} />
          <Route path="/deliveries" element={<PrivateRoute><Deliveries /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="*" element={<div className="p-10 text-center text-xl font-semibold">404 - Page Not Found</div>} />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
