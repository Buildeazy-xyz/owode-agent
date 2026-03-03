import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAgents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingAgents: 0
  });
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Test backend connectivity first
      console.log('Testing backend connectivity...');
      const testResponse = await api.get('/auth/test');
      console.log('Backend test response:', testResponse.data);
      
      // Fetch all data using admin routes
      const [customersRes, agentsRes, paymentsRes] = await Promise.all([
        api.get('/customers/admin/all'),
        api.get('/auth/all-agents'),
        api.get('/payments/admin/all')
      ]);

      console.log('API Response - Agents:', agentsRes.data);
      console.log('API Response - Customers:', customersRes.data);
      console.log('API Response - Payments:', paymentsRes.data);

      const customers = customersRes.data;
      const agents = agentsRes.data;
      const payments = paymentsRes.data;

      setCustomers(customers);
      setAgents(agents);
      setPayments(payments);

      // Calculate statistics
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const pendingAgents = agents.filter(agent => agent.status === 'pending').length;

      console.log('Calculated Stats:', {
        totalCustomers: customers.length,
        totalAgents: agents.length,
        totalPayments: payments.length,
        totalRevenue: totalRevenue,
        pendingAgents: pendingAgents
      });

      setStats({
        totalCustomers: customers.length,
        totalAgents: agents.length,
        totalPayments: payments.length,
        totalRevenue: totalRevenue,
        pendingAgents: pendingAgents
      });

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center">
                <img
                  src="/owodelogo.jpeg"
                  alt="Owode Admin"
                  className="h-10 sm:h-14 rounded-2xl shadow-2xl object-contain"
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-white text-opacity-80 text-sm">System Overview & Management</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 bg-opacity-20 text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm">Total Customers</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
                </div>
                <div className="text-4xl text-white text-opacity-60">👥</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm">Total Agents</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAgents}</p>
                </div>
                <div className="text-4xl text-white text-opacity-60">👤</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm">Total Payments</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPayments}</p>
                </div>
                <div className="text-4xl text-white text-opacity-60">💰</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-white text-opacity-60">💵</div>
              </div>
            </div>

            {stats.pendingAgents > 0 && (
              <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-500 border-opacity-30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm">Pending Approvals</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingAgents}</p>
                  </div>
                  <div className="text-4xl text-white text-opacity-60">⏰</div>
                </div>
              </div>
            )}
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Customers */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Customers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 5).map(customer => (
                      <tr key={customer._id} className="border-b border-white border-opacity-10">
                        <td className="py-2">{customer.firstName} {customer.lastName}</td>
                        <td className="py-2">{customer.email || '-'}</td>
                        <td className="py-2">Agent {customer.agentId?.lastName || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Agents */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Agents</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 5).map(agent => (
                      <tr key={agent._id} className="border-b border-white border-opacity-10">
                        <td className="py-2">{agent.firstName} {agent.lastName}</td>
                        <td className="py-2">{agent.email}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agent.status === 'approved' ? 'bg-green-500' : 
                            agent.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white border-opacity-20">
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Agent</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 10).map(payment => (
                    <tr key={payment._id} className="border-b border-white border-opacity-10">
                      <td className="py-2">{payment.customerName}</td>
                      <td className="py-2">{payment.agentName}</td>
                      <td className="py-2">${payment.amount}</td>
                      <td className="py-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
