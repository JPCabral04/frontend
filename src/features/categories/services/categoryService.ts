import { api } from '../../../services/api';
import type { Category, CreateCategoryDTO } from '../../../types/entities';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  async getById(id: string): Promise<Category> {
    const res = await api.get<Category>(`/categories/${id}`);
    return res.data;
  },

  async create(data: CreateCategoryDTO): Promise<Category> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await api.post<Category>('/categories', { 
      ...data, 
      userId: user.id 
    });
    return res.data;
  },

  async update(id: string, data: Partial<CreateCategoryDTO>): Promise<Category> {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
