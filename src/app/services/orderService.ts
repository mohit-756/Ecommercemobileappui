import api from './api';

export const orderService = {
  createOrder: (data: {
    items: any[];
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

  rateOrder: (id: string, rating: number) =>
    api.put(`/orders/${id}/rate`, { rating }),

  cancelOrder: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),

  updateRiderStatus: (id: string, status: string, description?: string) =>
    api.put(`/orders/${id}/rider-status`, { status, description }),

  getAllOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    fulfillmentType?: string;
    timeSlot?: string;
    startDate?: string;
    endDate?: string;
    customer?: string;
    packingStatus?: string;
    category?: string;
    sort?: string;
  }) => api.get('/orders/all', { params }),

  updateOrderStatus: (id: string, status: string, description?: string) =>
    api.put(`/orders/${id}/status`, { status, description }),

  getAdminDashboardStats: () =>
    api.get('/orders/admin/dashboard-stats'),

  getAdminAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    customer?: string;
    fulfillmentType?: string;
  }) => api.get('/orders/admin/analytics', { params }),

  adminCreateOrder: (data: {
    customerId: string;
    items: Array<{ productId: string; quantity: number; specialInstructions?: string }>;
    fulfillmentType: 'pickup' | 'delivery';
    timeSlot: string;
    shippingAddress?: any;
    paymentMethod: 'razorpay' | 'cod';
    notes?: string;
    fees?: number;
    tips?: number;
  }) => api.post('/orders/admin/create', data),

  updateItemPackingStatus: (id: string, itemId: string, packingStatus: 'packed' | 'not_packed') =>
    api.put(`/orders/${id}/items/${itemId}/packing`, { packingStatus }),

  addOrderRefund: (id: string, data: { amount: number; reason?: string }) =>
    api.put(`/orders/${id}/refund`, data),

  updateOrderNotes: (id: string, data: { notes: string }) =>
    api.put(`/orders/${id}/notes`, data),
};
