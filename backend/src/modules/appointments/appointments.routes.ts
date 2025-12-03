import type { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller'

const appointmentsController = new AppointmentsController()

export async function appointmentsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  fastify.patch('/:id/status', appointmentsController.updateStatus.bind(appointmentsController))
}
