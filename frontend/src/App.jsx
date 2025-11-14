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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/farmers" element={<PrivateRoute><Farmers /></PrivateRoute>} />
          <Route path="/deliveries" element={<PrivateRoute><Deliveries /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
