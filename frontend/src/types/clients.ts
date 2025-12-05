export interface Client {
  id: string
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
  tags?: string[]
  notes?: string
  preferences?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
