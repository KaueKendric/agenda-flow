import { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller'
import { prisma } from '../../utils/prisma'
import { whatsappService } from '../../integrations/whatsapp/whatsapp.service'

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

  // Buscar horários disponíveis 
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

  // ==================== ENVIAR LEMBRETE VIA WHATSAPP ====================
  fastify.post('/:id/send-reminder', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          client: true,
          professional: { include: { user: true } },
          service: true,
        },
      })

      if (!appointment) {
        return reply.status(404).send({ error: 'Agendamento não encontrado' })
      }

      if (!appointment.client.phone) {
        return reply
          .status(400)
          .send({ error: 'Cliente não possui telefone cadastrado' })
      }

      const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR')

      const message = whatsappService.formatAppointmentReminder({
        clientName: appointment.client.name || 'Cliente',
        serviceName: appointment.service?.name || 'Serviço',
        professionalName: appointment.professional.user?.name || 'Profissional',
        date: dateStr,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })

      await whatsappService.sendMessage(appointment.client.phone, message)

      return reply.send({ message: 'Lembrete enviado com sucesso' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao enviar lembrete WhatsApp:', error)
      return reply.status(500).send({ error: msg })
    }
  })
}
