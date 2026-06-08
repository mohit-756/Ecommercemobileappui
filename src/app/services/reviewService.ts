import api from './api';

export const reviewService = {
  getProductReviews: (productId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/reviews/product/${productId}`, { params }),
  createReview: (productId: string, data: { rating: number; title?: string; comment: string; images?: string[] }) =>
    api.post(`/reviews/product/${productId}`, data),
  checkUserReview: (productId: string) =>
    api.get(`/reviews/product/${productId}/check`),
};
