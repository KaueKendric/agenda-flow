import { api } from './api'
import type {
  Professional,
  CreateProfessionalInput,
  UpdateProfessionalInput,
  CreateUserInput,
  ProfessionalService,
  WorkSchedule,
} from '@/types/professionals'
import type { User, UpdateUserInput, UpdatePasswordInput } from '@/types/users'

export type { Professional, CreateProfessionalInput, UpdateProfessionalInput, CreateUserInput, ProfessionalService, WorkSchedule }

export const professionalsApi = {
  async list(): Promise<Professional[]> {
    const response = await api.get('/professionals')
    return response.data
  },

  async getById(id: string): Promise<Professional> {
    const response = await api.get(`/professionals/${id}`)
    return response.data
  },

  async create(data: CreateProfessionalInput): Promise<Professional> {
    const response = await api.post('/professionals', data)
    return response.data
  },

  async update(id: string, data: UpdateProfessionalInput): Promise<Professional> {
    const response = await api.put(`/professionals/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/professionals/${id}`)
  },

  async createUser(data: CreateUserInput): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async linkService(professionalId: string, serviceId: string, customPrice?: number): Promise<ProfessionalService> {
    const response = await api.post(`/professionals/${professionalId}/services`, {
      serviceId,
      customPrice,
    })
    return response.data
  },

  async unlinkService(professionalId: string, serviceId: string): Promise<void> {
    await api.delete(`/professionals/${professionalId}/services/${serviceId}`)
  },

  async updateServicePrice(professionalId: string, serviceId: string, price: number): Promise<ProfessionalService> {
    const response = await api.patch(
      `/professionals/${professionalId}/services/${serviceId}/price`,
      {
        price,
      }
    )
    return response.data
  },

  async updateWorkSchedule(professionalId: string, workSchedule: WorkSchedule): Promise<Professional> {
    const response = await api.patch(`/professionals/${professionalId}/schedule`, {
      workSchedule,
    })
    return response.data
  },
}

export const usersApi = {
  async getMe(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateProfile(data: UpdateUserInput): Promise<User> {
    const response = await api.put('/users/me', data)
    return response.data
  },

  async updatePassword(data: UpdatePasswordInput): Promise<{ message: string }> {
    const response = await api.put('/users/me/password', data)
    return response.data
  },

  async uploadAvatar(file: File): Promise<{ image: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export const servicesApi = {
  async list(professionalId?: string): Promise<ProfessionalService[]> {
    const params = professionalId ? { professionalId } : {}
    const response = await api.get('/services', { params })
    return response.data
  },

  async getById(id: string): Promise<ProfessionalService> {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  async create(data: {
    name: string
    description?: string
    duration: number
    price: number
    professionalId?: string
  }): Promise<ProfessionalService> {
    const response = await api.post('/services', data)
    return response.data
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      duration?: number
      price?: number
    }
  ): Promise<ProfessionalService> {
    const response = await api.put(`/services/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`)
  },

  async getAvailable(): Promise<ProfessionalService[]> {
    const response = await api.get('/services')
    return response.data
  },
}
