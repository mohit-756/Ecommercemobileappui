import api from './api';

export const productService = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
  }) => api.get('/products', { params }),

  getProductById: (id: string) =>
    api.get(`/products/${id}`),

  createProduct: (data: any) =>
    api.post('/products', data),

  updateProduct: (id: string, data: any) =>
    api.put(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),
};
