import { api } from '../../../services/api';
import type { AuthResponse, LoginDTO, RegisterDTO } from '../types/auth.types';

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};
