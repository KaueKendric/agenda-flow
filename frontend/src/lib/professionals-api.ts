import { api } from './api';
import type { 
  Professional, 
  CreateProfessionalInput, 
  UpdateProfessionalInput,
  CreateUserInput,
  ProfessionalService 
} from '@/types/professionals';

export const professionalsApi = {
  async list(): Promise<Professional[]> {
    const response = await api.get('/professionals');
    return response.data;
  },

  async getById(id: string): Promise<Professional> {
    const response = await api.get(`/professionals/${id}`);
    return response.data;
  },

  async create(data: CreateProfessionalInput): Promise<Professional> {
    const response = await api.post('/professionals', data);
    return response.data;
  },

  async update(id: string, data: UpdateProfessionalInput): Promise<Professional> {
    const response = await api.put(`/professionals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/professionals/${id}`);
  },

  async createUser(data: CreateUserInput): Promise<{ user: { id: string; email: string; name: string }; token: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async linkService(professionalId: string, serviceId: string, customPrice?: number): Promise<ProfessionalService> {
    const response = await api.post(`/professionals/${professionalId}/services`, {
      serviceId,
      customPrice,
    });
    return response.data;
  },

  async unlinkService(professionalId: string, serviceId: string): Promise<void> {
    await api.delete(`/professionals/${professionalId}/services/${serviceId}`);
  },

  async updateServicePrice(professionalId: string, serviceId: string, price: number): Promise<ProfessionalService> {
    const response = await api.patch(`/professionals/${professionalId}/services/${serviceId}/price`, {
      price,
    });
    return response.data;
  },
};

export const servicesApi = {
  async list(professionalId?: string): Promise<ProfessionalService[]> {
    const params = professionalId ? { professionalId } : {};
    const response = await api.get('/services', { params });
    return response.data;
  },

  async getAvailable(): Promise<ProfessionalService[]> {
    const response = await api.get('/services');
    return response.data; 
  },
};
