import { api } from './api'
import type { Client, ClientStats, ClientPreferences } from '@/types/clients'

export interface CreateClientInput {
  name: string
  email: string
  phone?: string
  address?: string
  addressNumber?: string
  city?: string
  state?: string
  zipCode?: string
  company?: string
  cpf?: string
  birthDate?: string
  tags?: string[]
  notes?: string
  preferences?: ClientPreferences
}

export type UpdateClientInput = Partial<CreateClientInput>

export interface ClientFilters {
  search?: string
  tags?: string[]
  isActive?: boolean
}

export const clientsApi = {
  async list(filters?: ClientFilters): Promise<Client[]> {
    const response = await api.get('/clients', { params: filters })
    return response.data
  },

  // ADICIONE este método novo
  async listSimple(): Promise<Client[]> {
    const response = await api.get('/clients')
    const data = response.data
    return Array.isArray(data) ? data : (data.clients || [])
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  async getStats(id: string): Promise<ClientStats> {
    const response = await api.get(`/clients/${id}/stats`)
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

  async exportCSV(clientIds?: string[]): Promise<Blob> {
    const response = await api.post(
      '/clients/export',
      { clientIds },
      { responseType: 'blob' }
    )
    return response.data
  },
}
