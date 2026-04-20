import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (import.meta.env.MODE === 'development') {
      console.log('[API Request]', config.method, config.url, 'Token present:', !!token);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.log('[API Request Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === 'development') {
      console.log('[API Response]', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.log('[API Response Error]', error.response?.status || 'No response', error.config?.url);
      if (error.response) {
        console.log('[API Response Error Data]', error.response.data);
      }
    }
    if (error.response?.status === 401) {
      // Clear both localStorage and any stale auth state
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login with a full page reload to reset all state.
      // Return a never-resolving promise to prevent downstream .catch()
      // handlers from executing on a page that's about to navigate away.
      globalThis.window.location.replace('/login');
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

export default api;
