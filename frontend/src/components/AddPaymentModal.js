import React, { useState } from 'react';
import api from '../services/api';

const AddPaymentModal = ({ customer, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(customer.contributionAmount || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifyType, setNotifyType] = useState('none');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments/add', {
        customerId: customer._id,
        amount: parseFloat(amount),
        paymentDate,
        notifyType,
      });
      onSuccess();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add payment.');
    }
  };

  const updatePreview = (amt, type) => {
    if (type === 'sms' || type === 'email') {
      const newBalance = customer.balance + parseFloat(amt || 0);
      setPreview(`Dear ${customer.firstName} ${customer.lastName}, you have made a payment of ${amt}. Your new balance is ${newBalance}. Contribution frequency: ${customer.contributionFrequency}.`);
    } else {
      setPreview('');
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    updatePreview(e.target.value, notifyType);
  };

  const handleNotifyChange = (e) => {
    setNotifyType(e.target.value);
    updatePreview(amount, e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Add Payment</h2>
            <p className="text-white text-opacity-80 mt-2 text-sm sm:text-base">Record payment for {customer.firstName} {customer.lastName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <input
              type="number"
              placeholder="Payment Amount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
              required
              min="1"
            />

            <div>
              <label className="block text-white text-sm font-medium mb-2">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
                required
              />
            </div>

            <select
              value={notifyType}
              onChange={handleNotifyChange}
              className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base"
            >
              <option value="none" className="text-gray-900">No Notification</option>
              <option value="sms" className="text-gray-900">Send SMS</option>
              <option value="email" className="text-gray-900">Send Email</option>
            </select>

            {preview && (
              <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-xl border border-white border-opacity-30">
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">📱 Notification Preview:</h4>
                <p className="text-white text-opacity-90 text-sm leading-relaxed">{preview}</p>
              </div>
            )}

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
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-xl text-base"
              >
                💰 Add Payment
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

export default AddPaymentModal;