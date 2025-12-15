import React, { useState } from 'react';
import api from '../services/api';

const CreateCustomerModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers/create', form);
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Failed to create customer.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Create New Customer</h2>
            <p className="text-white text-opacity-80 mt-2 text-sm sm:text-base">Add a customer to start managing their contributions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
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
                  className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
                  required
                />
              </div>
            </div>

            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number (e.g., +2348020973590)"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address (optional)"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
            />

            <input
              type="number"
              name="contributionAmount"
              placeholder="Contribution Amount (Required)"
              value={form.contributionAmount}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
              required
              min="1"
            />

            <select
              name="contributionFrequency"
              value={form.contributionFrequency}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
            >
              <option value="daily" className="text-gray-900">Daily</option>
              <option value="weekly" className="text-gray-900">Weekly</option>
              <option value="monthly" className="text-gray-900">Monthly</option>
              <option value="yearly" className="text-gray-900">Yearly</option>
            </select>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white bg-opacity-20 text-white py-3 px-4 rounded-xl font-semibold hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200 text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl text-base"
              >
                Create Customer
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-xl text-center bg-red-500 bg-opacity-20 text-red-100 border border-red-500 border-opacity-30">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;