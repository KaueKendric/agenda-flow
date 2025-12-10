import { prisma } from '../../utils/prisma'
import { UpdateProfileInput } from './user.schemas'
import * as fs from 'fs/promises'
import * as path from 'path'

export class UserService {
  private readonly uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')

  constructor() {
    this.ensureUploadsDir()
  }

  private async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true })
    } catch (error) {
      console.error('❌ Erro ao criar diretório de uploads:', error)
    }
  }

  // ==================== BUSCAR PERFIL ====================
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return user
  }

  // ==================== ATUALIZAR PERFIL ====================
  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Validar se email já existe (se está atualizando)
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email já está em uso')
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }

  // ==================== UPLOAD DE AVATAR ====================
  async uploadAvatar(userId: string, file: Buffer, originalFilename: string, mimetype: string) {
    // Validações
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedMimes.includes(mimetype)) {
      throw new Error('Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.length > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB')
    }

    try {
      // Buscar usuário atual
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Deletar avatar anterior se existir
      if (user.image) {
        const oldImagePath = path.join(process.cwd(), 'public', user.image)
        try {
          await fs.unlink(oldImagePath)
          console.log('✅ Imagem anterior deletada')
        } catch (error) {
          console.log('⚠️ Erro ao deletar imagem anterior:', error)
        }
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const cleanedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/\s+/g, '-')
      const filename = `${userId}-${timestamp}-${cleanedFilename}`
      const filepath = path.join(this.uploadsDir, filename)

      // Salvar arquivo
      await fs.writeFile(filepath, file)
      console.log(`✅ Arquivo salvo em: ${filepath}`)

      // Atualizar usuário com caminho da imagem
      const imageUrl = `/uploads/avatars/${filename}`
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          image: imageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        message: 'Avatar atualizado com sucesso',
        user: updatedUser,
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      throw new Error(`Erro ao fazer upload: ${msg}`)
    }
  }

  // ==================== BUSCAR USUÁRIO POR ID ====================
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return user
  }

  // ==================== ATUALIZAR IMAGEM (deprecated - use uploadAvatar) ====================
  async updateImage(userId: string, imageUrl: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        image: imageUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    return updatedUser
  }
}
