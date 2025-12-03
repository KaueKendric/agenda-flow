import type { FastifyReply, FastifyRequest } from 'fastify'
import { DashboardService } from './dashboard.service'

const dashboardService = new DashboardService()

export class DashboardController {
  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const metrics = await dashboardService.getMetrics()
      return reply.send(metrics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: message })
    }
  }

  async getAppointmentsChart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await dashboardService.getAppointmentsChart()
      return reply.send(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: message })
    }
  }

  async getServicesChart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await dashboardService.getServicesChart()
      return reply.send(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: message })
    }
  }

  async getUpcoming(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await dashboardService.getUpcomingAppointments()
      return reply.send(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: message })
    }
  }

  async getCalendar(request: FastifyRequest, reply: FastifyReply) {
    const { month, year } = request.params as { month: string; year: string }
    
    try {
      const data = await dashboardService.getCalendar(Number(month), Number(year))
      return reply.send(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: message })
    }
  }
}
