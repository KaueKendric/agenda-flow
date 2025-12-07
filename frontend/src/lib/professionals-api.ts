import { api } from './api';

export interface Professional {
  id: string;
  user?: {
    name?: string;
  };
  name?: string;
}

export const professionalsApi = {
  async list(): Promise<Professional[]> {
    const response = await api.get('/professionals');
    const data = response.data;
    return Array.isArray(data) ? data : (data.professionals || []);
  },

  async getById(id: string): Promise<Professional> {
    const response = await api.get(`/professionals/${id}`);
    return response.data;
  },
};
