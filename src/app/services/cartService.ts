import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: string, quantity?: number) =>
    api.post('/cart/add', { productId, quantity }),
  updateCartItem: (itemId: string, quantity: number) =>
    api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId: string) =>
    api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};
