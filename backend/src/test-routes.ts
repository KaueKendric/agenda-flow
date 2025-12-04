import { FastifyInstance } from 'fastify'
import { prisma } from './utils/prisma'

export async function testRoutes(fastify: FastifyInstance) {
  // Listar todos os clientes
  fastify.get('/test/clients', async (request, reply) => {
    const clients = await prisma.client.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      take: 10
    })
    return reply.send(clients)
  })

  // Listar todos os profissionais
  fastify.get('/test/professionals', async (request, reply) => {
    const professionals = await prisma.professional.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      take: 10
    })
    return reply.send(professionals)
  })

  // Listar todos os serviços
  fastify.get('/test/services', async (request, reply) => {
    const services = await prisma.service.findMany({
      take: 10
    })
    return reply.send(services)
  })
}
