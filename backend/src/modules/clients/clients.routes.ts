import { FastifyInstance } from 'fastify'
import { ClientsController } from './clients.controller'
import { ClientsService } from './clients.service'

export async function clientsRoutes(fastify: FastifyInstance) {
  const controller = new ClientsController()
  const service = new ClientsService()

  // Middleware de autenticação
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })

  // Rotas básicas
  fastify.get('/', controller.list.bind(controller))
  fastify.get('/:id', controller.getById.bind(controller))
  fastify.post('/', controller.create.bind(controller))
  fastify.put('/:id', controller.update.bind(controller))
  fastify.delete('/:id', controller.remove.bind(controller))

  // Rota de estatísticas do cliente
  fastify.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const stats = await service.getStats(id)
      return reply.send(stats)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(404).send({ error: msg })
    }
  })

  // Rota de exportação CSV
  fastify.post('/export', async (request, reply) => {
    const { clientIds } = request.body as { clientIds?: string[] }

    try {
      const csvData = await service.exportCSV(clientIds)

      // Converter para CSV string
      if (csvData.length === 0) {
        return reply.send({ data: [] })
      }

      const headers = Object.keys(csvData[0])
      const csvRows = [
        headers.join(','),
        ...csvData.map((row) =>
          headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
        ),
      ]

      const csvString = csvRows.join('\n')

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename=clientes.csv')
        .send(csvString)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(500).send({ error: msg })
    }
  })
}
