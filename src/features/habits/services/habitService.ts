import { api } from '../../../services/api';
import type { HabitModule, CreateHabitDTO, UpdateHabitDTO } from '../../../types/entities';

export const habitService = {
  async getAll(): Promise<HabitModule[]> {
    const res = await api.get<HabitModule[]>('/habit-modules');
    return res.data;
  },

  async getById(activityId: string): Promise<HabitModule> {
    const res = await api.get<HabitModule>(`/habit-modules/${activityId}`);
    return res.data;
  },

  async create(data: CreateHabitDTO): Promise<HabitModule> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Backend expects activity first, then habit module
    const activityRes = await api.post('/activities', {
      name: data.name,
      description: data.description,
      type: 'HABIT',
      userId: user.id,
    });
    const activityId = activityRes.data.id;

    const res = await api.post<HabitModule>('/habit-modules', {
      activityId,
      notes: data.notes,
      currentStreak: 0,
    });
    return res.data;
  },

  async update(activityId: string, data: UpdateHabitDTO): Promise<HabitModule> {
    if (data.name !== undefined || data.description !== undefined) {
      await api.put(`/activities/${activityId}`, {
        name: data.name,
        description: data.description,
      });
    }

    const res = await api.put<HabitModule>(`/habit-modules/${activityId}`, {
      notes: data.notes,
      currentStreak: data.currentStreak,
    });
    return res.data;
  },

  async remove(activityId: string): Promise<void> {
    await api.delete(`/habit-modules/${activityId}`);
  },
};
