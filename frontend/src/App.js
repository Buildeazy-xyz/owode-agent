import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerHistory from './pages/CustomerHistory';
import AddPayment from './pages/AddPayment';
import AdminDashboard from './pages/AdminDashboard';

function App()  {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/customer/:customerId/add-payment" element={<AddPayment />} />
          <Route path="/customer/:id/history" element={<CustomerHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;