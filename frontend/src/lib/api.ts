import axios from 'axios';

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000; // Increased to 30s for slow backend operations

/**
 * Axios instance with base URL, timeout, and authorization interceptor
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
