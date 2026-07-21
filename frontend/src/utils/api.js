import { getCookie, removeCookie } from './storage';

export const fetchWithAuth = async (url, options = {}) => {
  const token = getCookie('token');
  
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    // Auto logout on 401 Unauthorized
    if (response.status === 401) {
      removeCookie('token');
      removeCookie('user');
      // Redirect to signin if not already there
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin?expired=true';
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
