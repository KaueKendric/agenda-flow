import { api } from './api'
import type { Client } from '@/types/clients'

export interface CreateClientInput {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  company?: string
  cpf?: string
  birthDate?: string
  notes?: string
}

export interface UpdateClientInput {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  company?: string
  cpf?: string
  birthDate?: string
  notes?: string
}

export const clientsApi = {
  async list(): Promise<Client[]> {
    const response = await api.get('/clients')
    return response.data
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  async create(data: CreateClientInput): Promise<Client> {
    const response = await api.post('/clients', data)
    return response.data
  },

  async update(id: string, data: UpdateClientInput): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`)
  },
}
