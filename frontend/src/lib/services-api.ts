import { api } from './api';

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | string;
  description?: string;
}

export const servicesApi = {
  async list(): Promise<Service[]> {
    const response = await api.get('/services');
    const data = response.data;
    return Array.isArray(data) ? data : (data.services || []);
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
};
