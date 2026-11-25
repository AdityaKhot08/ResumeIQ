import api from './client.js';

/** Register a new account. Returns { success, token, user }. */
export function register({ name, email, password }) {
  return api.post('/auth/register', { name, email, password }).then((res) => res.data);
}

/** Log in with email + password. Returns { success, token, user }. */
export function login({ email, password }) {
  return api.post('/auth/login', { email, password }).then((res) => res.data);
}

/** Fetch the currently authenticated user. Returns { success, user }. */
export function me() {
  return api.get('/auth/me').then((res) => res.data);
}

/** Update the current user's profile. Returns { success, user }. */
export function updateProfile(payload) {
  return api.put('/auth/profile', payload).then((res) => res.data);
}
