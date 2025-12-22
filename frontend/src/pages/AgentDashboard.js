import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
  }, [agentId]);

  const fetchAgentData = async () => {
    try {
      // Determine API URL based on environment
      const getApiUrl = () => {
        if (window.location.hostname === 'owode.xyz' || window.location.hostname === 'www.owode.xyz') {
          return 'https://owode-agent.onrender.com';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5000';
      };

      const baseURL = getApiUrl();

      // Fetch agent details and customers
      const [agentRes, customersRes] = await Promise.all([
        fetch(`${baseURL}/auth/agent/${agentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()),
        fetch(`${baseURL}/customers/agent/${agentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
      ]);

      setAgent(agentRes);
      setCustomers(Array.isArray(customersRes) ? customersRes : []);
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
      setAgent(null);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDashboard = (customerId) => {
    navigate(`/customer/${customerId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading Agent Dashboard...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Agent not found</div>
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
                  className="h-12 sm:h-16 rounded-2xl shadow-2xl object-contain"
                />
                <h1 className="ml-3 sm:ml-4 text-lg sm:text-2xl font-bold text-white">
                  Agent Dashboard - {agent.firstName} {agent.lastName}
                </h1>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="bg-red-500 bg-opacity-20 text-white px-6 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-red-500 border-opacity-30 transition-all duration-200"
              >
                ← Back to Admin
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Agent Details */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Agent Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Basic Info</h3>
                <div className="space-y-2">
                  <p className="text-white text-opacity-80"><strong>Name:</strong> {agent.firstName} {agent.lastName}</p>
                  <p className="text-white text-opacity-80"><strong>Email:</strong> {agent.email}</p>
                  <p className="text-white text-opacity-80"><strong>Phone:</strong> {agent.phone}</p>
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                <div className="space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    agent.status === 'approved'
                      ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-500 border-opacity-30'
                      : agent.status === 'pending'
                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-100 border border-yellow-500 border-opacity-30'
                      : 'bg-red-500 bg-opacity-20 text-red-100 border border-red-500 border-opacity-30'
                  }`}>
                    {agent.status}
                  </span>
                  <p className="text-white text-opacity-80"><strong>Role:</strong> {agent.role || 'agent'}</p>
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Registration</h3>
                <div className="space-y-2">
                  <p className="text-white text-opacity-80"><strong>Joined:</strong> {new Date(agent.createdAt).toLocaleDateString()}</p>
                  {agent.approvedAt && (
                    <p className="text-white text-opacity-80"><strong>Approved:</strong> {new Date(agent.approvedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agent's Customers */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Agent's Customers ({customers.length})</h2>

            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white text-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xl text-white text-opacity-80">No customers yet</p>
                <p className="text-white text-opacity-60 mt-2">This agent hasn't added any customers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                  <div
                    key={customer._id}
                    className="bg-white bg-opacity-20 rounded-xl p-6 border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                    onClick={() => viewCustomerDashboard(customer._id)}
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{customer.firstName} {customer.lastName}</h3>

                    <div className="space-y-2 mb-4">
                      <p className="text-white text-opacity-80 text-sm"><strong>Email:</strong> {customer.email || 'N/A'}</p>
                      <p className="text-white text-opacity-80 text-sm"><strong>Phone:</strong> {customer.phone}</p>
                      <p className="text-white text-opacity-80 text-sm"><strong>Balance:</strong> ₦{customer.balance || 0}</p>
                      <p className="text-white text-opacity-80 text-sm"><strong>Contribution:</strong> ₦{customer.contributionAmount} {customer.contributionFrequency}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewCustomerDashboard(customer._id);
                      }}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
                    >
                      View Customer Details
                    </button>
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

export default AgentDashboard;