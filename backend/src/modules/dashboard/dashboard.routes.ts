import type { FastifyInstance } from 'fastify'
import { DashboardController } from './dashboard.controller'

const dashboardController = new DashboardController()

export async function dashboardRoutes(fastify: FastifyInstance) {
  // Todas as rotas protegidas
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  fastify.get('/metrics', dashboardController.getMetrics.bind(dashboardController))
  fastify.get('/appointments-chart', dashboardController.getAppointmentsChart.bind(dashboardController))
  fastify.get('/services-chart', dashboardController.getServicesChart.bind(dashboardController))
  fastify.get('/upcoming', dashboardController.getUpcoming.bind(dashboardController))
  fastify.get('/calendar/:month/:year', dashboardController.getCalendar.bind(dashboardController))
}
