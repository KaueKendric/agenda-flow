export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
  createdAt: string
  updatedAt: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  image?: string
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
