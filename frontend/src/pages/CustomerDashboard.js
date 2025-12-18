import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, paymentsRes] = await Promise.all([
        api.get(`/customers/${customerId}`),
        api.get(`/payments/customer/${customerId}`)
      ]);
      setCustomer(customerRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading customer dashboard...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Customer not found</div>
      </div>
    );
  }

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
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mr-4 bg-white bg-opacity-20 text-white p-2 rounded-xl hover:bg-opacity-30 transition-all duration-200"
                >
                  ← Back
                </button>
                <img
                  src="/owodelogo.jpeg"
                  alt="Owode Agent Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-2xl object-cover"
                />
                <div className="ml-3 sm:ml-4">
                  <h1 className="text-lg sm:text-2xl font-bold text-white">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <p className="text-white text-opacity-80 text-sm">Customer Dashboard</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/customer/${customerId}/add-payment`)}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  💰 Add Payment
                </button>
                <button
                  onClick={() => navigate(`/customer/${customerId}/history`)}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  📊 View History
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Customer Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Full Name</h3>
                  <p className="text-white text-opacity-80">{customer.firstName} {customer.lastName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Phone</h3>
                  <p className="text-white text-opacity-80">{customer.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Email</h3>
                  <p className="text-white text-opacity-80">{customer.email || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Current Balance</h3>
                  <p className="text-2xl font-bold text-white">₦{customer.balance?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Contribution Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white text-opacity-80">Frequency:</span>
                  <span className="text-white font-semibold capitalize">{customer.contributionFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-opacity-80">Amount:</span>
                  <span className="text-white font-semibold">₦{customer.contributionAmount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-opacity-80">Date of Birth:</span>
                  <span className="text-white font-semibold">
                    {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/customer/${customerId}/add-payment`)}
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  💰 Record New Payment
                </button>
                <button
                  onClick={() => navigate(`/customer/${customerId}/history`)}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  📊 View Payment History
                </button>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Payments</h3>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white text-opacity-80">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">₦{payment.amount.toLocaleString()}</p>
                        <p className="text-white text-opacity-60 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded-full text-xs">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length > 5 && (
                  <button
                    onClick={() => navigate(`/customer/${customerId}/history`)}
                    className="w-full bg-white bg-opacity-20 text-white py-2 px-4 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  >
                    View All Payments ({payments.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;