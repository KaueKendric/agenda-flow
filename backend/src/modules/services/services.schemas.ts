import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  duration: z.number().int().min(5, 'Duração mínima é 5 minutos').max(600, 'Duração máxima é 600 minutos'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  professionalId: z.string().uuid().optional().nullable(),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  duration: z.number().int().min(5).max(600).optional(),
  price: z.number().min(0).optional(),
  professionalId: z.string().uuid().optional().nullable(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
