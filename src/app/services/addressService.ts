import api from './api';

export const addressService = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault?: boolean;
    label?: 'home' | 'work' | 'other';
  }) => api.post('/addresses', data),

  updateAddress: (id: string, data: any) =>
    api.put(`/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete(`/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.put(`/addresses/${id}/default`),
};
