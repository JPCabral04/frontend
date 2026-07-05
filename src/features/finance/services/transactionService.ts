import { api } from '../../../services/api';
import type { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../../../types/entities';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const res = await api.get<Transaction[]>('/transactions');
    return res.data;
  },

  async getById(financialItemId: string): Promise<Transaction> {
    const res = await api.get<Transaction>(`/transactions/${financialItemId}`);
    return res.data;
  },

  async getByCategoryId(categoryId: string): Promise<Transaction[]> {
    const res = await api.get<Transaction[]>(`/transactions/category/${categoryId}`);
    return res.data;
  },

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const finRes = await api.post('/financial-items', {
      amount: data.amount,
      type: 'TRANSACTION',
      userId: user.id,
    });

    const res = await api.post<Transaction>('/transactions', {
      financialItemId: finRes.data.id,
      transactionType: data.transactionType,
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
    });
    return res.data;
  },

  async update(financialItemId: string, data: UpdateTransactionDTO): Promise<Transaction> {
    if (data.amount !== undefined) {
      await api.put(`/financial-items/${financialItemId}`, {
        amount: data.amount,
      });
    }

    const res = await api.put<Transaction>(`/transactions/${financialItemId}`, {
      transactionType: data.transactionType,
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
    });
    return res.data;
  },

  async remove(financialItemId: string): Promise<void> {
    await api.delete(`/transactions/${financialItemId}`);
  },
};
