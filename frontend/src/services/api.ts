import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('terauth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('terauth_refresh_token');
      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        if (res.data.success) {
          localStorage.setItem('terauth_token', res.data.data.accessToken);
          localStorage.setItem('terauth_refresh_token', res.data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('terauth_token');
        localStorage.removeItem('terauth_refresh_token');
        localStorage.removeItem('terauth_user');
        // If on a protected route, redirect to login
        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/institution')) {
          window.location.href = '/login';
        }
      }
    }

    // Exponential backoff retry for transient network drops and 429 / 503 responses on GET requests
    const isIdempotent = originalRequest?.method?.toLowerCase() === 'get';
    const isTransientError = !error.response || error.response.status === 429 || error.response.status === 503;

    if (isIdempotent && isTransientError && originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      const MAX_RETRIES = 2;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        const retryAfterHeader = error.response?.headers?.['retry-after'];
        const delayMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : Math.pow(2, originalRequest._retryCount) * 750;

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
