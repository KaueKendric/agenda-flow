import { api } from './api'
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/types/services'

export type { Service }
export const servicesApi = {
  async list(): Promise<Service[]> {
    const response = await api.get('/services')
    return response.data.map((service: Service) => ({
      ...service,
      price: Number(service.price),
    }))
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`)
    return {
      ...response.data,
      price: Number(response.data.price),
    }
  },

  async create(data: CreateServiceInput): Promise<Service> {
    const response = await api.post('/services', data)
    return {
      ...response.data,
      price: Number(response.data.price),
    }
  },

  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    const response = await api.put(`/services/${id}`, data)
    return {
      ...response.data,
      price: Number(response.data.price),
    }
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`)
  },

  // Buscar serviços globais
  async getGlobal(): Promise<Service[]> {
    const allServices = await this.list()
    return allServices.filter((s) => !s.professionalId)
  },

  // Buscar serviços vinculados a um profissional
  async getByProfessional(professionalId: string): Promise<Service[]> {
    const allServices = await this.list()
    return allServices.filter((s) => s.professionalId === professionalId)
  },
}
