export interface ClientPreferences {
  favoriteProfessionalId?: string
  preferredTimes?: string[]
  notes?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  addressNumber?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  company?: string | null
  cpf?: string | null
  birthDate?: string | null
  tags: string[]
  notes?: string | null
  preferences?: ClientPreferences | null
  createdAt: string
  updatedAt: string
  // Campos calculados (quando vier da listagem)
  totalAppointments?: number
  lastAppointmentDate?: string | null
  totalSpent?: number
  isActive?: boolean
}

export interface UpcomingAppointment {
  id: string
  dateTime: string
  status: string
  service: {
    id: string
    name: string
  }
  professional: {
    id: string
    user: {
      name: string
    }
  }
}

export interface ClientStats {
  totalAppointments: number
  completedAppointments: number
  canceledAppointments: number
  noShowAppointments: number
  totalSpent: number
  averageTicket: number
  attendanceRate: number
  topServices: Array<{ name: string; count: number }>
  upcomingAppointments: UpcomingAppointment[]
}
