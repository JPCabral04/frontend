import { api } from '../../../services/api';
import type { Investment, CreateInvestmentDTO, UpdateInvestmentDTO } from '../../../types/entities';

export const investmentService = {
  async getAll(): Promise<Investment[]> {
    const res = await api.get<Investment[]>('/investments');
    return res.data;
  },

  async getById(financialItemId: string): Promise<Investment> {
    const res = await api.get<Investment>(`/investments/${financialItemId}`);
    return res.data;
  },

  async create(data: CreateInvestmentDTO): Promise<Investment> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const finRes = await api.post('/financial-items', {
      amount: data.amount,
      type: 'INVESTMENT',
      userId: user.id,
    });

    const res = await api.post<Investment>('/investments', {
      financialItemId: finRes.data.id,
      assetName: data.assetName,
      estimatedReturn: data.estimatedReturn,
    });
    return res.data;
  },

  async update(financialItemId: string, data: UpdateInvestmentDTO): Promise<Investment> {
    if (data.amount !== undefined) {
      await api.put(`/financial-items/${financialItemId}`, {
        amount: data.amount,
      });
    }

    const res = await api.put<Investment>(`/investments/${financialItemId}`, {
      assetName: data.assetName,
      estimatedReturn: data.estimatedReturn,
    });
    return res.data;
  },

  async remove(financialItemId: string): Promise<void> {
    await api.delete(`/investments/${financialItemId}`);
  },
};
