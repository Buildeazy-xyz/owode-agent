import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Production URLs
  if (window.location.hostname === 'owode.xyz' || window.location.hostname === 'www.owode.xyz') {
    return 'https://owode-agent.onrender.com';
  }

  // Development fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request - Adding token to:', config.url);
    console.log('API Request - Token preview:', token.substring(0, 20) + '...');
  } else {
    console.log('API Request - No token found in localStorage for:', config.url);
  }
  return config;
});

export default api;