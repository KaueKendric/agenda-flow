import { FastifyInstance } from 'fastify'
import { UserController } from './user.controller'

export async function usersRoutes(fastify: FastifyInstance) {
  const controller = new UserController()

  // ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  // ==================== ROTAS ====================

  // Buscar perfil do usuário autenticado
  fastify.get('/me', controller.getProfile.bind(controller))

  // Atualizar perfil do usuário autenticado
  fastify.put('/me', controller.updateProfile.bind(controller))

  // Upload de avatar
  fastify.post('/me/avatar', controller.uploadAvatar.bind(controller))

  // Buscar usuário por ID (público)
  fastify.get('/:id', { onRequest: [] }, controller.getUserById.bind(controller))
}
