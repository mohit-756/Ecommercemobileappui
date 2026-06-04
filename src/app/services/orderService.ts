import api from './api';

export const orderService = {
  createOrder: (data: {
    shippingAddress: any;
    paymentMethod: 'razorpay' | 'cod';
    notes?: string;
  }) => api.post('/orders', data),

  verifyPayment: (data: {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post('/orders/verify-payment', data),

  getUserOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),

  getOrderById: (id: string) =>
    api.get(`/orders/${id}`),

  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders/all', { params }),

  updateOrderStatus: (id: string, status: string, description?: string) =>
    api.put(`/orders/${id}/status`, { status, description }),
};
