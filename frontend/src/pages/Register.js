import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register-agent', form);
      setMessage('Registration successful. Wait for approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Registration failed.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img
            src="/owodelogo.jpeg"
            alt="Owode Agent Logo"
            className="h-16 sm:h-20 rounded-2xl mx-auto mb-3 sm:mb-4 shadow-2xl object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Owode Agent</h1>
          <p className="text-white text-opacity-80 text-sm sm:text-base">Create your account to get started</p>
        </div>

        {/* Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number (e.g., +2348020973590)"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Create Account
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center ${
              message.includes('successful')
                ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-500 border-opacity-30'
                : 'bg-red-500 bg-opacity-20 text-red-100 border border-red-500 border-opacity-30'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-white text-opacity-80 hover:text-white transition-colors duration-200"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white text-opacity-60 hover:text-white transition-colors duration-200 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;