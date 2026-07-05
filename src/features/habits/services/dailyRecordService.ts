import { api } from '../../../services/api';
import type { DailyRecord, CreateDailyRecordDTO, UpdateDailyRecordDTO } from '../../../types/entities';

export const dailyRecordService = {
  async getAll(): Promise<DailyRecord[]> {
    const res = await api.get<DailyRecord[]>('/daily-records');
    return res.data;
  },

  async getByHabitId(habitId: string): Promise<DailyRecord[]> {
    const res = await api.get<DailyRecord[]>(`/daily-records/habit/${habitId}`);
    return res.data;
  },

  async getById(id: string): Promise<DailyRecord> {
    const res = await api.get<DailyRecord>(`/daily-records/${id}`);
    return res.data;
  },

  async create(data: CreateDailyRecordDTO): Promise<DailyRecord> {
    const res = await api.post<DailyRecord>('/daily-records', data);
    return res.data;
  },

  async update(id: string, data: UpdateDailyRecordDTO): Promise<DailyRecord> {
    const res = await api.put<DailyRecord>(`/daily-records/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/daily-records/${id}`);
  },
};
