import api from './api';

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId: string) => api.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId: string) => api.delete(`/wishlist/remove/${productId}`),
};
