import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ProfileSetup from './ProfileSetup.jsx';
import TravelerPass from './TravelerPass.jsx';
import Dashboard from './components/Dashboard.jsx';
import Admin from './components/Admin.jsx';
import PoliceDashboard from './components/PoliceDashboard.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login.html" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register.html" element={<Register />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-setup.html" element={<ProfileSetup />} />
          <Route path="/traveler/:travelerId" element={<TravelerPass />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/police-dashboard" element={<PoliceDashboard />} />
          <Route path="/police-dashboard.html" element={<PoliceDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin.html" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
