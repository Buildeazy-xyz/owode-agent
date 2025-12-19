import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [pendingAgents, setPendingAgents] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      const [agentsRes, deletionsRes] = await Promise.all([
        api.get('/auth/pending-agents'),
        api.get('/customers/pending-deletions')
      ]);

      setPendingAgents(agentsRes.data);
      setPendingDeletions(deletionsRes.data);
    } catch (error) {
      console.error('Failed to fetch pending items');
      // For demo purposes, set empty arrays if API fails
      setPendingAgents([]);
      setPendingDeletions([]);
    } finally {
      setLoading(false);
    }
  };

  const approveAgent = async (agentId) => {
    try {
      const response = await api.post('/auth/approve-agent', { agentId });
      alert('Agent approved successfully! Email and SMS notifications sent.');
      console.log('Approval response:', response.data);
      fetchPendingItems(); // Refresh the list
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve agent: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCustomerDeletion = async (customerId, approved) => {
    try {
      await api.post('/customers/approve-deletion', { customerId, approved });
      alert(approved ? 'Customer deleted successfully!' : 'Customer deletion denied');
      fetchPendingItems();
    } catch (error) {
      alert('Failed to process customer deletion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
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
                  Admin Dashboard
                </h1>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-red-500 bg-opacity-20 text-white px-6 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-red-500 border-opacity-30 transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Instructions */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Admin Instructions</h2>
            <div className="space-y-4 text-white text-opacity-80">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🔐 Agent Approval</h3>
                <p>To approve an agent, use this API call:</p>
                <code className="bg-gray-800 text-green-400 p-2 rounded block mt-2">
                  POST http://localhost:5000/auth/approve-agent<br/>
                  {"{"}<br/>
                  {"  "}"agentId": "agent_id_here"<br/>
                  {"}"}
                </code>
              </div>

              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🗑️ Customer Deletion</h3>
                <p>To approve/deny customer deletion:</p>
                <code className="bg-gray-800 text-green-400 p-2 rounded block mt-2">
                  POST http://localhost:5000/customers/approve-deletion<br/>
                  {"{"}<br/>
                  {"  "}"customerId": "customer_id_here",<br/>
                  {"  "}"approved": true/false<br/>
                  {"}"}
                </code>
              </div>
            </div>
          </div>

          {/* Pending Agents Section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Pending Agent Approvals</h2>

            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-yellow-100">
                <strong>Note:</strong> This demo shows a basic admin interface. In production, you'd implement proper authentication and database queries to show pending agents.
              </p>
            </div>

            {pendingAgents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white text-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl text-white text-opacity-80">No pending agent approvals</p>
                <p className="text-white text-opacity-60 mt-2">All agents have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAgents.map((agent) => (
                  <div key={agent._id} className="bg-white bg-opacity-20 rounded-xl p-6 border border-white border-opacity-30">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-white">{agent.firstName} {agent.lastName}</h3>
                        <p className="text-white text-opacity-80">{agent.email}</p>
                        <p className="text-white text-opacity-60">{agent.phone}</p>
                      </div>
                      <button
                        onClick={() => approveAgent(agent._id)}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
                      >
                        ✅ Approve Agent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Deletions Section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Pending Customer Deletions</h2>

            {pendingDeletions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white text-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-xl text-white text-opacity-80">No pending customer deletions</p>
                <p className="text-white text-opacity-60 mt-2">All deletion requests have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDeletions.map((deletion) => (
                  <div key={deletion._id} className="bg-white bg-opacity-20 rounded-xl p-6 border border-white border-opacity-30">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-white">{deletion.firstName} {deletion.lastName}</h3>
                        <p className="text-white text-opacity-80">Reason: {deletion.deletionReason}</p>
                        <p className="text-white text-opacity-60">Requested by: Agent {deletion.agentId?.lastName}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleCustomerDeletion(deletion._id, true)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleCustomerDeletion(deletion._id, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200"
                        >
                          ❌ Deny
                        </button>
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

export default AdminDashboard;