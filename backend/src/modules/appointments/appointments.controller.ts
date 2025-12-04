import { FastifyRequest, FastifyReply } from 'fastify'
import { AppointmentsService } from './appointments.service'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateStatusSchema,
  listAppointmentsQuerySchema,
  availableSlotsQuerySchema,
} from './appointments.schemas'

export class AppointmentsController {
  private service: AppointmentsService

  constructor() {
    this.service = new AppointmentsService()
  }

  // ==================== LISTAR AGENDAMENTOS ====================
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = listAppointmentsQuerySchema.parse(request.query)
      const result = await this.service.list(query)
      
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao listar agendamentos',
      })
    }
  }

  // ==================== BUSCAR POR ID ====================
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const appointment = await this.service.getById(id)
      
      return reply.status(200).send(appointment)
    } catch (error: any) {
      return reply.status(404).send({
        message: error.message || 'Agendamento não encontrado',
      })
    }
  }

  // ==================== CRIAR AGENDAMENTO ====================
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createAppointmentSchema.parse(request.body)
      const appointment = await this.service.create(data)
      
      return reply.status(201).send(appointment)
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao criar agendamento',
      })
    }
  }

  // ==================== ATUALIZAR AGENDAMENTO ====================
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateAppointmentSchema.parse(request.body)
      
      const appointment = await this.service.update(id, data)
      
      return reply.status(200).send(appointment)
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao atualizar agendamento',
      })
    }
  }

  // ==================== ATUALIZAR STATUS ====================
  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { status } = updateStatusSchema.parse(request.body)
      
      const appointment = await this.service.updateStatus(id, status)
      
      return reply.status(200).send(appointment)
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao atualizar status',
      })
    }
  }

  // ==================== DELETAR (CANCELAR) ====================
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const appointment = await this.service.delete(id)
      
      return reply.status(200).send({
        message: 'Agendamento cancelado com sucesso',
        appointment,
      })
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao cancelar agendamento',
      })
    }
  }

  // ==================== HORÁRIOS DISPONÍVEIS ====================
  async getAvailableSlots(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = availableSlotsQuerySchema.parse(request.query)
      const slots = await this.service.getAvailableSlots(query)
      
      return reply.status(200).send({
        date: query.date,
        professionalId: query.professionalId,
        serviceId: query.serviceId,
        availableSlots: slots,
      })
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao buscar horários disponíveis',
      })
    }
  }

  // ==================== CALENDÁRIO MENSAL ====================
  async getCalendar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { year, month } = request.params as { year: string; month: string }
      const { professionalId } = request.query as { professionalId?: string }
      
      const appointments = await this.service.getCalendar(
        parseInt(year),
        parseInt(month),
        professionalId
      )
      
      return reply.status(200).send({
        year: parseInt(year),
        month: parseInt(month),
        appointments,
      })
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Erro ao buscar calendário',
      })
    }
  }
}
