import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AddPayment = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [notifyType, setNotifyType] = useState('none');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [paidDays, setPaidDays] = useState(new Set());
  const [cycleStartDay, setCycleStartDay] = useState(null);

  React.useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      // Fetch customer details
      const customersRes = await api.get('/customers/list');
      const foundCustomer = customersRes.data.find(c => c._id === customerId);
      setCustomer(foundCustomer);
      setAmount(foundCustomer?.contributionAmount || '');

      // Fetch existing payments to mark paid days
      const paymentsRes = await api.get(`/payments/customer/${customerId}`);
      const customerPayments = paymentsRes.data;

      // For daily customers, determine the cycle start day
      let startDay = null;
      if (foundCustomer.contributionFrequency === 'daily' && customerPayments.length > 0) {
        // Find the earliest payment date
        const earliestPayment = customerPayments.reduce((earliest, payment) => {
          const paymentDate = new Date(payment.createdAt);
          return !earliest || paymentDate < earliest ? paymentDate : earliest;
        }, null);
        startDay = earliestPayment ? earliestPayment.getDate() : null;
      }
      setCycleStartDay(startDay);

      // Extract payment indices from payment data
      const paidIndicesSet = new Set();
      customerPayments.forEach((payment) => {
        // Use the stored paymentIndex to track which periods have been paid
        if (payment.paymentIndex) {
          paidIndicesSet.add(payment.paymentIndex);
        }
      });
      setPaidDays(paidIndicesSet);

      // Auto-select the next available payment date
      const nextAvailableIndex = getNextAvailableIndex();
      if (nextAvailableIndex) {
        setSelectedDate(nextAvailableIndex);
      }

    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setMessage('Please select a payment date');
      return;
    }

    try {
      const actualDate = getActualDateForIndex(selectedDate);
      const paymentDate = actualDate.toISOString().split('T')[0];
      await api.post('/payments/add', {
        customerId,
        amount: parseFloat(amount),
        paymentDate,
        notifyType,
        paymentIndex: selectedDate,
      });
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add payment.');
    }
  };

  const getNextAvailableDay = () => {
    if (customer?.contributionFrequency === 'daily') {
      for (let day = 1; day <= 31; day++) {
        if (!paidDays.has(day)) {
          return day;
        }
      }
    }
    return null;
  };

  const getNextAvailableIndex = () => {
    if (!paidDays.size) {
      return 1; // First payment is always index 1
    }

    // Find the next payment number in sequence
    for (let i = 1; i <= 100; i++) { // Reasonable upper limit
      if (!paidDays.has(i)) {
        return i;
      }
    }

    return null; // All payments complete
  };

  const getWeekDays = (weekNum) => {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(weekNum * 7, 31);
    const days = [];
    for (let day = startDay; day <= endDay; day++) {
      days.push(day);
    }
    return days;
  };

  const getIntervalDays = () => {
    switch (customer?.contributionFrequency) {
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'yearly': return 365;
      default: return 1;
    }
  };

  const getActualDateForIndex = (index) => {
    const intervalDays = getIntervalDays();
    const startDate = cycleStartDay
      ? new Date(new Date().getFullYear(), new Date().getMonth(), cycleStartDay)
      : new Date();
    const actualDate = new Date(startDate);
    actualDate.setDate(startDate.getDate() + ((index - 1) * intervalDays));
    return actualDate;
  };

  const getWeekDateRange = (weekNum) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const weekDays = getWeekDays(weekNum);
    const startDate = new Date(currentYear, currentMonth, weekDays[0]);
    const endDate = new Date(currentYear, currentMonth, weekDays[weekDays.length - 1]);

    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const renderCalendar = () => {
    const frequency = customer?.contributionFrequency;
    const maxPayments = frequency === 'daily' ? 31 : frequency === 'weekly' ? 52 : frequency === 'monthly' ? 12 : 5;
    const intervalDays = getIntervalDays();
    const nextAvailableIndex = getNextAvailableIndex();
    const payments = [];

    for (let i = 1; i <= maxPayments; i++) {
      const isPaid = paidDays.has(i);
      const isSelected = selectedDate === i;
      let isAvailable = false;
      let isBlocked = true;

      if (!paidDays.size) {
        // No payments yet, any can be selected as start
        isAvailable = !isPaid;
        isBlocked = false;
      } else {
        // Only next payment in sequence is available
        isAvailable = i === nextAvailableIndex && !isPaid;
        isBlocked = !isAvailable && !isPaid;
      }

      // Calculate actual date for this payment
      const startDate = cycleStartDay
        ? new Date(new Date().getFullYear(), new Date().getMonth(), cycleStartDay)
        : new Date();
      const actualDate = new Date(startDate);
      actualDate.setDate(startDate.getDate() + ((i - 1) * intervalDays));

      const isToday = actualDate.toDateString() === new Date().toDateString();

      payments.push(
        <button
          key={i}
          onClick={() => isAvailable && setSelectedDate(i)}
          disabled={isPaid || isBlocked}
          className={`w-16 h-16 rounded-lg font-semibold transition-all duration-200 relative flex flex-col items-center justify-center ${
            isPaid
              ? 'bg-green-500 text-white shadow-lg cursor-not-allowed opacity-75'
              : isSelected
              ? 'bg-blue-500 text-white shadow-lg transform scale-110'
              : isAvailable
              ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:scale-105 cursor-pointer border-2 border-yellow-400'
              : 'bg-gray-500 bg-opacity-20 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          <span className="text-xs font-bold">
            {frequency === 'daily' ? `Day ${i}` :
             frequency === 'weekly' ? `Week ${i}` :
             frequency === 'monthly' ? `Month ${i}` :
             `Year ${i}`}
          </span>
          <span className="text-xs opacity-80">
            {frequency === 'yearly'
              ? actualDate.getFullYear()
              : actualDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: frequency === 'monthly' ? 'numeric' : undefined,
                  year: frequency === 'monthly' ? 'numeric' : undefined
                })
            }
          </span>
          {isToday && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          {isPaid && <span className="absolute -bottom-1 -right-1 text-xs">✓</span>}
          {isAvailable && !isPaid && <span className="absolute -bottom-1 -left-1 text-xs text-yellow-400">→</span>}
        </button>
      );
    }

    return payments;
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
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-200"
          >
            Back to Dashboard
          </button>
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
                <h1 className="ml-3 sm:ml-4 text-lg sm:text-2xl font-bold text-white">Add Payment</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-xl hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Customer Info */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-4 sm:mr-6 flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-2xl">
                  {customer.firstName[0]}{customer.lastName[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-white text-opacity-80 text-sm sm:text-base truncate">{customer.phone}</p>
                <p className="text-white text-opacity-60 text-sm sm:text-base">
                  Contribution: ₦{customer.contributionAmount} ({customer.contributionFrequency})
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Calendar Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6">Select Payment Date</h3>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded mr-1 sm:mr-2"></div>
                  <span className="text-white text-xs sm:text-sm">Completed ✓</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded mr-1 sm:mr-2"></div>
                  <span className="text-white text-xs sm:text-sm">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 border border-yellow-400 rounded mr-1 sm:mr-2"></div>
                  <span className="text-white text-xs sm:text-sm">Next Available →</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 bg-opacity-20 rounded mr-1 sm:mr-2"></div>
                  <span className="text-white text-xs sm:text-sm">Locked</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4">
                  <p className="text-white text-opacity-80 text-xs sm:text-sm">Payments Made</p>
                  <p className="text-white font-bold text-lg sm:text-xl">{paidDays.size}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4">
                  <p className="text-white text-opacity-80 text-xs sm:text-sm">Next Payment</p>
                  <p className="text-white font-bold text-sm sm:text-base lg:text-xl leading-tight">
                    {getNextAvailableIndex() ? `${customer?.contributionFrequency === 'daily' ? 'Day' : customer?.contributionFrequency === 'weekly' ? 'Week' : customer?.contributionFrequency === 'monthly' ? 'Month' : 'Year'} ${getNextAvailableIndex()}` : 'Any available'}
                  </p>
                </div>
              </div>

              {customer?.contributionFrequency === 'daily' ? (
                <div className="grid grid-cols-6 gap-3">
                  {renderCalendar()}
                </div>
              ) : customer?.contributionFrequency === 'weekly' ? (
                <div className="space-y-2">
                  {renderCalendar()}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-white text-opacity-60 font-medium py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                </>
              )}
              {selectedDate && (
                 <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-xl">
                   <p className="text-white font-semibold">
                     Selected Date: {getActualDateForIndex(selectedDate).toLocaleDateString('en-US', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </p>
                   {customer?.contributionFrequency === 'daily' && !cycleStartDay && (
                     <p className="text-white text-opacity-80 text-sm mt-1">
                       This will start a 31-day daily savings cycle ending on: {
                         getActualDateForIndex(31).toLocaleDateString('en-US', {
                           month: 'long',
                           day: 'numeric',
                           year: 'numeric'
                         })
                       }
                     </p>
                   )}
                   {customer?.contributionFrequency !== 'daily' && (
                     <p className="text-white text-opacity-80 text-sm mt-1">
                       Next payment due: {getActualDateForIndex(selectedDate + 1).toLocaleDateString('en-US', {
                         month: 'short',
                         day: 'numeric',
                         year: 'numeric'
                       })}
                     </p>
                   )}
                 </div>
               )}
            </div>

            {/* Payment Form */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6">Payment Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base sm:text-lg"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Notification Method</label>
                  <select
                    value={notifyType}
                    onChange={(e) => setNotifyType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-base sm:text-lg"
                  >
                    <option value="none" className="text-gray-900">No Notification</option>
                    <option value="sms" className="text-gray-900">Send SMS</option>
                    <option value="email" className="text-gray-900">Send Email</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedDate}
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-semibold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
                >
                  💰 Record Payment
                </button>
              </form>

              {message && (
                <div className="mt-4 p-3 rounded-xl text-center bg-red-500 bg-opacity-20 text-red-100 border border-red-500 border-opacity-30">
                  {message}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddPayment;