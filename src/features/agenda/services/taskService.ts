import { api } from '../../../services/api';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../../../types/entities';

export const taskService = {
  async getAll(): Promise<Task[]> {
    const res = await api.get<Task[]>('/tasks');
    return res.data;
  },

  async getById(agendaItemId: string): Promise<Task> {
    const res = await api.get<Task>(`/tasks/${agendaItemId}`);
    return res.data;
  },

  async getByCategoryId(categoryId: string): Promise<Task[]> {
    const res = await api.get<Task[]>(`/tasks/category/${categoryId}`);
    return res.data;
  },

  async create(data: CreateTaskDTO): Promise<Task> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const agendaRes = await api.post('/agenda-items', {
      title: data.title,
      description: data.description,
      type: 'TASK',
      userId: user.id,
    });

    const res = await api.post<Task>('/tasks', {
      agendaItemId: agendaRes.data.id,
      dueDate: data.dueDate,
      priority: data.priority,
      isCompleted: data.isCompleted || false,
      categoryId: data.categoryId,
    });
    return res.data;
  },

  async update(agendaItemId: string, data: UpdateTaskDTO): Promise<Task> {
    if (data.title !== undefined || data.description !== undefined) {
      await api.put(`/agenda-items/${agendaItemId}`, {
        title: data.title,
        description: data.description,
      });
    }

    const res = await api.put<Task>(`/tasks/${agendaItemId}`, {
      dueDate: data.dueDate,
      priority: data.priority,
      isCompleted: data.isCompleted,
      categoryId: data.categoryId,
    });
    return res.data;
  },

  async remove(agendaItemId: string): Promise<void> {
    await api.delete(`/tasks/${agendaItemId}`);
  },
};
