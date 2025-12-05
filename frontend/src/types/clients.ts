export interface Client {
  id: string
  userId: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}
