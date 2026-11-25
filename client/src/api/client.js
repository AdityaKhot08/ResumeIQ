import axios from 'axios';

export const TOKEN_KEY = 'resumiq_token';
export const USER_KEY = 'resumiq_user';

/** Shared axios instance. All endpoints are relative to the configured API base URL. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* -------------------------------------------------------------------------- */
/* Token helpers                                                              */
/* -------------------------------------------------------------------------- */

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage unavailable (e.g. private mode) — fail silently */
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* fail silently */
  }
};

export const clearCredentials = () => {
  setToken(null);
  setStoredUser(null);
};

/* -------------------------------------------------------------------------- */
/* Request interceptor — attach bearer token                                  */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* -------------------------------------------------------------------------- */
/* Response interceptor — friendly errors + 401 handling                      */
/* -------------------------------------------------------------------------- */

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];
const PUBLIC_AUTH_ROUTES = ['/login', '/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Unable to reach the server. Please check your connection and try again.'
        : error.message) ||
      'Something went wrong. Please try again.';

    // Normalise every failure into a plain Error with a human-readable message.
    const normalised = new Error(message);
    normalised.message = message;
    normalised.status = error.response?.status;
    normalised.errors = Array.isArray(data?.errors) ? data.errors : [];
    normalised.response = error.response;
    normalised.code = error.code;

    const url = error.config?.url || '';
    const isAuthRequest = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

    if (error.response?.status === 401 && !isAuthRequest) {
      clearCredentials();
      // Hard navigate avoids React Router state living outside the axios layer.
      // Skip on the public auth pages so we never create a redirect loop.
      if (typeof window !== 'undefined' && !PUBLIC_AUTH_ROUTES.includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(normalised);
  },
);

export default api;
