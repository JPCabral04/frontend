import { api } from '../../../services/api';
import type { Event, CreateEventDTO, UpdateEventDTO } from '../../../types/entities';

export const eventService = {
  async getAll(): Promise<Event[]> {
    const res = await api.get<Event[]>('/events');
    return res.data;
  },

  async getById(agendaItemId: string): Promise<Event> {
    const res = await api.get<Event>(`/events/${agendaItemId}`);
    return res.data;
  },

  async create(data: CreateEventDTO): Promise<Event> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const agendaRes = await api.post('/agenda-items', {
      title: data.title,
      description: data.description,
      type: 'EVENT',
      userId: user.id,
    });

    const res = await api.post<Event>('/events', {
      agendaItemId: agendaRes.data.id,
      startDate: data.startDate,
      endDate: data.endDate,
      googleEventId: data.googleEventId,
    });
    return res.data;
  },

  async update(agendaItemId: string, data: UpdateEventDTO): Promise<Event> {
    if (data.title !== undefined || data.description !== undefined) {
      await api.put(`/agenda-items/${agendaItemId}`, {
        title: data.title,
        description: data.description,
      });
    }

    const res = await api.put<Event>(`/events/${agendaItemId}`, {
      startDate: data.startDate,
      endDate: data.endDate,
      googleEventId: data.googleEventId,
    });
    return res.data;
  },

  async remove(agendaItemId: string): Promise<void> {
    await api.delete(`/events/${agendaItemId}`);
  },
};
