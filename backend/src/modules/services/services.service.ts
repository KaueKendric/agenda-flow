import { prisma } from '../../utils/prisma'
import { Prisma } from '@prisma/client'

export class ServicesService {
  async list() {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
    })

    return services
  }

  async getById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    return service
  }

  async create(data: Prisma.ServiceUncheckedCreateInput) {
    return prisma.service.create({
      data,
    })
  }

  async update(id: string, data: Prisma.ServiceUncheckedUpdateInput) {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    return prisma.service.update({
      where: { id },
      data,
    })
  }

  async remove(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    return prisma.service.delete({
      where: { id },
    })
  }
}
