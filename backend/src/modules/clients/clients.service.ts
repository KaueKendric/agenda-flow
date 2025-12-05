import { prisma } from '../../utils/prisma'
import { Prisma } from '@prisma/client'

export class ClientsService {
  async list() {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return clients
  }

  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return client
  }

  async create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({
      data,
    })
  }

  async update(id: string, data: Prisma.ClientUpdateInput) {
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return prisma.client.update({
      where: { id },
      data,
    })
  }

  async remove(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return prisma.client.delete({
      where: { id },
    })
  }
}
