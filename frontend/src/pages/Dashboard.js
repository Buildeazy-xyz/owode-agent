import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateCustomerModal from '../components/CreateCustomerModal';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();
  const agent = JSON.parse(localStorage.getItem('agent') || '{}');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/list');
      setCustomers(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteRequest = async (customerId) => {
    const reason = prompt('Please provide a reason for deleting this customer:');
    if (!reason) return;

    try {
      await api.post('/customers/request-deletion', { customerId, reason });
      alert('Deletion request submitted successfully. Admin approval required.');
      fetchCustomers(); // Refresh the data
    } catch (error) {
      alert('Failed to submit deletion request.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center">
                <img
                  src="/owodelogo.jpeg"
                  alt="Owode Agent Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-2xl object-cover"
                />
                <h1 className="ml-3 sm:ml-4 text-lg sm:text-2xl font-bold text-white">
                  Agent {agent.lastName || 'Dashboard'}
                </h1>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to clear ALL payment history and reset ALL customer balances? This action cannot be undone.')) {
                    try {
                      await api.delete('/payments/clear-all');
                      alert('All payment history and balances have been cleared.');
                      fetchCustomers(); // Refresh the data
                    } catch (error) {
                      alert('Failed to clear data.');
                    }
                  }
                }}
                className="bg-orange-500 bg-opacity-20 text-white px-4 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-orange-500 border-opacity-30 transition-all duration-200 mr-2"
              >
                Clear All Data
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 bg-opacity-20 text-white px-6 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-red-500 border-opacity-30 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Total Customers</h3>
                  <p className="text-xl sm:text-2xl font-bold text-white">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Total Payments</h3>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    ₦{customers.reduce((sum, customer) => sum + (customer.balance || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Active Agents</h3>
                  <p className="text-xl sm:text-2xl font-bold text-white">1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              ➕ Create New Customer
            </button>
          </div>

          {/* Customers Section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Your Customers</h2>
            {customers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white text-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-lg sm:text-xl text-white text-opacity-80">No customers yet</p>
                <p className="text-white text-opacity-60 mt-2 text-sm sm:text-base">Create your first customer to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {customers.map((customer) => (
                  <div key={customer._id} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{customer.firstName} {customer.lastName}</h3>
                        <p className="text-white text-opacity-70 text-sm sm:text-base truncate">{customer.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-white text-opacity-80">Email:</span>
                        <span className="text-white truncate ml-2">{customer.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-white text-opacity-80">Balance:</span>
                        <span className="text-white font-semibold">₦{customer.balance?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-white text-opacity-80">Frequency:</span>
                        <span className="text-white capitalize">{customer.contributionFrequency}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => navigate(`/customer/${customer._id}/add-payment`)}
                        className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                      >
                        💰 Add Payment
                      </button>
                      <button
                        onClick={() => navigate(`/customer/${customer._id}/history`)}
                        className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                      >
                        📊 View History
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(customer._id)}
                        className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                        disabled={customer.deletionRequested}
                      >
                        {customer.deletionRequested ? '🕐 Deletion Pending' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCustomers();
          }}
        />
      )}

    </div>
  );
};

export default Dashboard;