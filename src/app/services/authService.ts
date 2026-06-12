import api from './api';

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  loginWithGoogle: (idToken: string) =>
    api.post('/auth/google', { idToken }),

  sendOtp: (data: { email: string }) =>
    api.post('/auth/send-otp', data),

  verifyOtp: (data: { email: string; otp: string; name?: string; password?: string }) =>
    api.post('/auth/verify-otp', data),

  getProfile: () =>
    api.get('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
};
