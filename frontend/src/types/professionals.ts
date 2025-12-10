export interface Professional {
  id: string
  specialty?: string
  specialties: string[]
  phone?: string
  bio?: string
  commission?: number
  availability?: Record<string, unknown>
  workSchedule?: WorkSchedule
  userId: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  services: ProfessionalService[]
  _count?: {
    appointments: number
    services: number
  }
  createdAt: string
  updatedAt: string
}

export interface ProfessionalService {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  professionalId?: string
  createdAt: string
  updatedAt: string
}

export interface WorkSchedule {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface DaySchedule {
  enabled: boolean
  shifts: Shift[]
}

export interface Shift {
  start: string
  end: string
}

export interface CreateProfessionalInput {
  userId: string
  specialties: string[]
  phone?: string
  bio?: string
  commission?: number
  workSchedule?: WorkSchedule
}

export interface UpdateProfessionalInput {
  specialties?: string[]
  phone?: string
  bio?: string
  commission?: number
  workSchedule?: WorkSchedule
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: 'PROFESSIONAL'
}

export const SPECIALTIES = [
  'Cabeleireiro',
  'Barbeiro',
  'Manicure',
  'Pedicure',
  'Maquiador',
  'Esteticista',
  'Massagista',
  'Designer de Sobrancelhas',
  'Colorista',
  'Trancista',
] as const

export type Specialty = typeof SPECIALTIES[number]
