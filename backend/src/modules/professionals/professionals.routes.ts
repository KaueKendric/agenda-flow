import { FastifyInstance } from 'fastify'
import { ProfessionalsController } from './professionals.controller'

export async function professionalsRoutes(fastify: FastifyInstance) {
  const controller = new ProfessionalsController()

  // Middleware de autenticação
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  // Rotas
  fastify.get('/', controller.list.bind(controller))
  fastify.get('/:id', controller.getById.bind(controller))
  fastify.post('/', controller.create.bind(controller))
  fastify.put('/:id', controller.update.bind(controller))
  fastify.delete('/:id', controller.remove.bind(controller))
}
