import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

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
                  className="h-12 sm:h-16 rounded-lg object-contain"
                />
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-white animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-cyan-400 via-white-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
                Owode Agent
              </span>
            </h2>
            <p className="mt-3 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white text-opacity-90 leading-relaxed px-2">
              Transform your business with intelligent agent management, seamless customer tracking, and automated payment processing.
            </p>
            <div className="mt-8 sm:mt-10 max-w-xs sm:max-w-md mx-auto">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-center sm:space-x-3">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
                >
                  🚀 Start Your Journey
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white border-opacity-30 text-base sm:text-lg font-semibold rounded-xl text-white bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 sm:mt-20">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-3 sm:mb-4">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Smart Agent Management</h3>
                  <p className="text-white text-opacity-80 text-sm sm:text-base">
                    Streamlined registration and approval with instant email notifications to keep your team connected.
                  </p>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mx-auto mb-3 sm:mb-4">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Customer Insights</h3>
                  <p className="text-white text-opacity-80 text-sm sm:text-base">
                    Comprehensive customer profiles with payment history and contribution tracking for better relationships.
                  </p>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-pink-400 to-red-500 mx-auto mb-3 sm:mb-4">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Instant Payments</h3>
                  <p className="text-white text-opacity-80 text-sm sm:text-base">
                    Lightning-fast payment processing with automatic SMS and email confirmations to customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-white text-opacity-80">
                &copy; 2025 Owode Agent Management. Built with ❤️ for modern businesses.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
