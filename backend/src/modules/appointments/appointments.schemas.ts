import { z } from 'zod'

// Schema para criar um novo agendamento
export const createAppointmentSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  professionalId: z.string().uuid('ID do profissional inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  date: z.string().datetime('Data inválida'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  notes: z.string().optional(),
})

// Schema para atualizar um agendamento
export const updateAppointmentSchema = z.object({
  clientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
})

// Schema para atualizar apenas o status
export const updateStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

// Schema para listar agendamentos (query params)
export const listAppointmentsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  status: z.string().optional(),
  professionalId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  date: z.string().optional(), // YYYY-MM-DD
  startDate: z.string().optional(), // Para range
  endDate: z.string().optional(),
  search: z.string().optional(), // Buscar por nome do cliente
})

// Schema para buscar horários disponíveis
export const availableSlotsQuerySchema = z.object({
  professionalId: z.string().uuid('ID do profissional é obrigatório'),
  serviceId: z.string().uuid('ID do serviço é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
})

// Types exportados
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>
export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>
