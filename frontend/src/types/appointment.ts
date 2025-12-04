// src/types/appointment.ts

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW'

export interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
}

export interface Client {
  id: string
  phone: string | null
  user: User
}

export interface Professional {
  id: string
  specialties: string[]
  user: User
}

export interface Service {
  id: string
  name: string
  description?: string | null
  duration: number
  price: string
}

export interface Appointment {
  id: string
  dateTime: string | Date
  startTime: string
  endTime: string
  duration: number
  status: AppointmentStatus
  notes: string | null
  price: string | null
  client: Client
  professional: Professional
  service: Service
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AppointmentListResponse {
  appointments: Appointment[]
  pagination: Pagination
}

export type CalendarAppointment = Appointment

export interface AvailableSlotsResponse {
  date: string
  professionalId: string
  serviceId: string
  availableSlots: string[]
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-500',
  CONFIRMED: 'bg-green-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-emerald-700',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-gray-500',
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Faltou',
}
