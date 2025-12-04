import { api } from './api';
import type { 
  AppointmentListResponse, 
  Appointment, 
  AppointmentStatus,
  AvailableSlotsResponse 
} from '@/types/appointment';

export const appointmentsApi = {  // ✅ EXPORTAR
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    professionalId?: string;
    clientId?: string;
    serviceId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<AppointmentListResponse> {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async create(data: {
    clientId: string;
    professionalId: string;
    serviceId: string;
    date: string;
    startTime: string;
    notes?: string;
  }): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async update(id: string, data: Partial<{
    clientId: string;
    professionalId: string;
    serviceId: string;
    date: string;
    startTime: string;
    notes: string;
    status: AppointmentStatus;
  }>): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async getAvailableSlots(params: {
    professionalId: string;
    serviceId: string;
    date: string;
  }): Promise<AvailableSlotsResponse> {
    const response = await api.get('/appointments/available-slots', { params });
    return response.data;
  },

  async getCalendar(year: number, month: number, professionalId?: string): Promise<{
    year: number;
    month: number;
    appointments: Appointment[];
  }> {
    const response = await api.get(`/appointments/calendar/${year}/${month}`, {
      params: professionalId ? { professionalId } : undefined,
    });
    return response.data;
  },
};
