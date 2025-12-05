import { prisma } from '../../utils/prisma'
import { Prisma } from '@prisma/client'

export class ClientsService {
  async list() {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return clients
  }

  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return client
  }

  async create(data: Prisma.ClientUncheckedCreateInput) {
    return prisma.client.create({
      data,
      include: {
        user: true,
      },
    })
  }

  async update(id: string, data: Prisma.ClientUncheckedUpdateInput) {
    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return prisma.client.update({
      where: { id },
      data,
      include: {
        user: true,
      },
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
