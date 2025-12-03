import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppointmentsService } from './appointments.service'

const appointmentsService = new AppointmentsService()

export class AppointmentsController {
  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }

    try {
      const appointment = await appointmentsService.updateStatus(id, status)
      return reply.send(appointment)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(400).send({ error: message })
    }
  }
}
