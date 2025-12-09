import { api } from './api';
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/types/services';

export const servicesApi = {
  async list(professionalId?: string): Promise<Service[]> {
    const params = professionalId ? { professionalId } : {};
    const response = await api.get('/services', { params });
    return response.data;
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async create(data: CreateServiceInput): Promise<Service> {
    const response = await api.post('/services', data);
    return response.data;
  },

  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  // Buscar serviços globais 
  async getGlobal(): Promise<Service[]> {
    const allServices = await this.list();
    return allServices.filter(s => !s.professionalId);
  },
};
