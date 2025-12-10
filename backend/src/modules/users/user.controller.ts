import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from './user.service'
import { updateProfileSchema } from './user.schemas'

export class UserController {
  private service: UserService

  constructor() {
    this.service = new UserService()
  }

  // ==================== BUSCAR PERFIL ====================
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.userId // ✅ Agora funciona!

      if (!userId) {
        return reply.status(401).send({
          message: 'Usuário não autenticado',
        })
      }

      const user = await this.service.getProfile(userId)

      return reply.status(200).send(user)
    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil:', error)
      return reply.status(404).send({
        message: error.message || 'Usuário não encontrado',
      })
    }
  }

  // ==================== ATUALIZAR PERFIL ====================
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.userId // ✅ Agora funciona!

      if (!userId) {
        return reply.status(401).send({
          message: 'Usuário não autenticado',
        })
      }

      const data = updateProfileSchema.parse(request.body)
      const user = await this.service.updateProfile(userId, data)

      return reply.status(200).send(user)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error)
      return reply.status(400).send({
        message: error.message || 'Erro ao atualizar perfil',
      })
    }
  }

  // ==================== UPLOAD DE AVATAR ====================
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.userId // ✅ Agora funciona!

      if (!userId) {
        return reply.status(401).send({
          message: 'Usuário não autenticado',
        })
      }

      // Usar multipart para receber arquivo
      const data = await request.file()

      if (!data) {
        return reply.status(400).send({
          message: 'Nenhum arquivo foi enviado',
        })
      }

      const buffer = await data.toBuffer()
      const filename = data.filename
      const mimetype = data.mimetype

      const result = await this.service.uploadAvatar(userId, buffer, filename, mimetype)

      return reply.status(200).send(result)
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload:', error)
      return reply.status(400).send({
        message: error.message || 'Erro ao fazer upload do avatar',
      })
    }
  }

  // ==================== BUSCAR USUÁRIO POR ID ====================
  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      const user = await this.service.getUserById(id)

      return reply.status(200).send(user)
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário:', error)
      return reply.status(404).send({
        message: error.message || 'Usuário não encontrado',
      })
    }
  }
}
