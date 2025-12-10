import { z } from 'zod'

// Schema para atualizar perfil
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  bio: z.string().optional(),
})

// Schema para upload de avatar (só validação de tipo/tamanho no controller)
export const uploadAvatarSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number(),
})

// Types exportados
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>
