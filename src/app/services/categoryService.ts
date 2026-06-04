import api from './api';

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data: { name: string; icon?: string; image?: string }) =>
    api.post('/categories', data),
  updateCategory: (id: string, data: any) =>
    api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),
};
