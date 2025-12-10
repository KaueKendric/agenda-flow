import { api } from './api'

export interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<UserProfile> {
    const response = await api.put('/users/me', data)
    return response.data
  },

  async uploadAvatar(file: File): Promise<{ user: UserProfile; success: boolean; message: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
