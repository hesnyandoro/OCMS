import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';
import {Toaster} from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire application with providers */}
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);