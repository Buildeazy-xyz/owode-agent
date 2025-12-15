import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

const CustomerHistory = () => {
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      // Fetch customer details
      const customersRes = await api.get('/customers/list');
      const foundCustomer = customersRes.data.find(c => c._id === id);
      setCustomer(foundCustomer);

      // Fetch payment history
      const paymentsRes = await api.get('/payments/list');
      const customerPayments = paymentsRes.data.filter(payment =>
        payment.customerId._id === id
      );
      setPayments(customerPayments);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Customer not found</div>
          <Link
            to="/dashboard"
            className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
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
                <img
                  src="/owodelogo.jpeg"
                  alt="Owode Agent Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-2xl object-cover"
                />
                <h1 className="ml-3 sm:ml-4 text-lg sm:text-2xl font-bold text-white">Customer History</h1>
              </div>
              <Link
                to="/dashboard"
                className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Customer Info Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-6">
                <span className="text-white font-bold text-2xl">
                  {customer.firstName[0]}{customer.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-white text-opacity-80">{customer.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-white text-opacity-80 text-sm">Email</p>
                <p className="text-white font-semibold">{customer.email || 'N/A'}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-white text-opacity-80 text-sm">Current Balance</p>
                <p className="text-white font-semibold text-xl">₦{customer.balance?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-white text-opacity-80 text-sm">Contribution Frequency</p>
                <p className="text-white font-semibold capitalize">{customer.contributionFrequency}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-white text-opacity-80 text-sm">Registered By</p>
                <p className="text-white font-semibold">Agent {customer.agentId?.lastName || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Payment History</h3>

            {payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white text-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xl text-white text-opacity-80">No payment history found</p>
                <p className="text-white text-opacity-60 mt-2">Payments will appear here once recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment._id} className="bg-white bg-opacity-20 rounded-xl p-6 border border-white border-opacity-30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl font-bold text-white mr-4">
                            ₦{payment.amount.toLocaleString()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            payment.notifyType === 'sms'
                              ? 'bg-green-500 bg-opacity-20 text-green-100'
                              : payment.notifyType === 'email'
                              ? 'bg-blue-500 bg-opacity-20 text-blue-100'
                              : 'bg-gray-500 bg-opacity-20 text-gray-100'
                          }`}>
                            {payment.notifyType === 'none' ? 'No notification' : `${payment.notifyType.toUpperCase()} sent`}
                          </span>
                        </div>
                        <div className="text-white text-opacity-80 text-sm">
                          <p className="font-medium">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs">
                            {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-white text-opacity-60 mt-1">
                            {Math.floor((new Date() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-lg">{payment.agentName}</p>
                        <p className="text-white text-opacity-60 text-sm">Payment Agent</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerHistory;