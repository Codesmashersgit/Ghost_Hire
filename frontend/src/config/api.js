// API Configuration
// Single source of truth for all API calls

export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://ghost-hire-uyn2.onrender.com';

export const API_ENDPOINTS = {
  // Admin
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_INVOICES: `${API_BASE_URL}/api/admin/invoices`,
  ADMIN_SESSIONS: `${API_BASE_URL}/api/admin/sessions`,
  
  // Auth
  AUTH_SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // Sessions
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  SESSION_SAVE: `${API_BASE_URL}/api/sessions/save`,
  
  // Invoices
  INVOICES: `${API_BASE_URL}/api/invoices`,
  INVOICES_PAY: `${API_BASE_URL}/api/invoices/pay`,
  
  // Usage
  USAGE_STATUS: `${API_BASE_URL}/api/usage/status`,
  USAGE_TRACK: `${API_BASE_URL}/api/usage/track`,
  
  // AI
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  AI_CAPTURE_SCREEN: `${API_BASE_URL}/api/ai/capture-screen`,
  AI_SOLVE_SCREENSHOT: `${API_BASE_URL}/api/ai/solve-screenshot`,
};

// Helper function for authenticated requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(endpoint, {
    ...options,
    headers,
  });
};
