import { api } from '../../../services/api';
import type { Goal, CreateGoalDTO, UpdateGoalDTO } from '../../../types/entities';

export const goalService = {
  async getAll(): Promise<Goal[]> {
    const res = await api.get<Goal[]>('/goals');
    return res.data;
  },

  async getById(financialItemId: string): Promise<Goal> {
    const res = await api.get<Goal>(`/goals/${financialItemId}`);
    return res.data;
  },

  async create(data: CreateGoalDTO): Promise<Goal> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const finRes = await api.post('/financial-items', {
      amount: data.amount,
      type: 'GOAL',
      userId: user.id,
    });

    const res = await api.post<Goal>('/goals', {
      financialItemId: finRes.data.id,
      title: data.title,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
    });
    return res.data;
  },

  async update(financialItemId: string, data: UpdateGoalDTO): Promise<Goal> {
    if (data.amount !== undefined) {
      await api.put(`/financial-items/${financialItemId}`, {
        amount: data.amount,
      });
    }

    const res = await api.put<Goal>(`/goals/${financialItemId}`, {
      title: data.title,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
    });
    return res.data;
  },

  async remove(financialItemId: string): Promise<void> {
    await api.delete(`/goals/${financialItemId}`);
  },
};
