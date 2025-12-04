import { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller'

export async function appointmentsRoutes(fastify: FastifyInstance) {
  const controller = new AppointmentsController()

  // ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================
  // Proteger todas as rotas deste módulo
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  // ==================== ROTAS ====================
  
  // Buscar horários disponíveis (ANTES de /:id para não conflitar)
  fastify.get('/available-slots', controller.getAvailableSlots.bind(controller))

  // Buscar calendário mensal
  fastify.get('/calendar/:year/:month', controller.getCalendar.bind(controller))

  // Listar agendamentos (com filtros)
  fastify.get('/', controller.list.bind(controller))

  // Buscar agendamento por ID
  fastify.get('/:id', controller.getById.bind(controller))

  // Criar novo agendamento
  fastify.post('/', controller.create.bind(controller))

  // Atualizar agendamento
  fastify.put('/:id', controller.update.bind(controller))

  // Atualizar apenas status do agendamento
  fastify.patch('/:id/status', controller.updateStatus.bind(controller))

  // Deletar/Cancelar agendamento
  fastify.delete('/:id', controller.delete.bind(controller))
}
