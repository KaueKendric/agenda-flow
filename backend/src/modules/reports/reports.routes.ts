import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { reportsService } from './reports.service'

const reportFilterSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  professionalId: z.string().optional(),
  serviceId: z.string().optional(),
  clientId: z.string().optional(),
})

type ReportFilters = z.infer<typeof reportFilterSchema>

export async function reportsRoutes(app: FastifyInstance) {
  // Financial Report
  app.get<{ Querystring: ReportFilters }>(
    '/financial',
    {
      schema: {
        querystring: reportFilterSchema,
        description: 'Get financial report',
      },
    },
    async (request, reply) => {
      await request.jwtVerify()

      const filters = {
        startDate: new Date(request.query.startDate),
        endDate: new Date(request.query.endDate),
        professionalId: request.query.professionalId,
        serviceId: request.query.serviceId,
      }

      const report = await reportsService.getFinancialReport(filters)
      return reply.send(report)
    }
  )

  // Operational Report
  app.get<{ Querystring: ReportFilters }>(
    '/operational',
    {
      schema: {
        querystring: reportFilterSchema,
        description: 'Get operational report',
      },
    },
    async (request, reply) => {
      await request.jwtVerify()

      const filters = {
        startDate: new Date(request.query.startDate),
        endDate: new Date(request.query.endDate),
        professionalId: request.query.professionalId,
      }

      const report = await reportsService.getOperationalReport(filters)
      return reply.send(report)
    }
  )

  // Clients Report
  app.get<{ Querystring: ReportFilters }>(
    '/clients',
    {
      schema: {
        querystring: reportFilterSchema,
        description: 'Get clients report',
      },
    },
    async (request, reply) => {
      await request.jwtVerify()

      const filters = {
        startDate: new Date(request.query.startDate),
        endDate: new Date(request.query.endDate),
      }

      const report = await reportsService.getClientsReport(filters)
      return reply.send(report)
    }
  )

  // Professionals Report
  app.get<{ Querystring: ReportFilters }>(
    '/professionals',
    {
      schema: {
        querystring: reportFilterSchema,
        description: 'Get professionals report',
      },
    },
    async (request, reply) => {
      await request.jwtVerify()

      const filters = {
        startDate: new Date(request.query.startDate),
        endDate: new Date(request.query.endDate),
      }

      const report = await reportsService.getProfessionalsReport(filters)a
      return reply.send(report)
    }
  )
}
