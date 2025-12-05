import { z } from 'zod'

export const createProfessionalSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  specialty: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.number().min(0).max(100).optional(),
  availability: z.any().optional(),
  workSchedule: z.any().optional(),
})

export const updateProfessionalSchema = z.object({
  specialty: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.number().min(0).max(100).optional(),
  availability: z.any().optional(),
  workSchedule: z.any().optional(),
})

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>
