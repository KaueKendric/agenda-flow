export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  professionalId?: string
  professional?: {
    id: string
    user: {
      name: string
      email: string
    }
  }
  category?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceInput {
  name: string
  description?: string
  duration: number
  price: number
  professionalId?: string | null
  category?: string
}

export interface UpdateServiceInput {
  name?: string
  description?: string
  duration?: number
  price?: number
  professionalId?: string | null
  category?: string
  isActive?: boolean
}

export interface ServicesListResponse {
  services: Service[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Categorias sugeridas
export const SERVICE_CATEGORIES = [
  'Corte',
  'Coloração',
  'Barba',
  'Manicure',
  'Pedicure',
  'Hidratação',
  'Luzes',
  'Alisamento',
  'Depilação',
  'Maquiagem',
  'Design de Sobrancelhas',
  'Massagem',
  'Outro',
] as const
