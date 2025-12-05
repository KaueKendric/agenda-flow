import { prisma } from '../../utils/prisma'
import { Prisma } from '@prisma/client'

export class ProfessionalsService {
  async list() {
    const professionals = await prisma.professional.findMany({
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

    return professionals
  }

  async getById(id: string) {
    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: true,
        services: true,
        vacations: true,
      },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    return professional
  }

  async create(data: Prisma.ProfessionalCreateInput) {
    return prisma.professional.create({
      data,
      include: {
        user: true,
      },
    })
  }

  async update(id: string, data: Prisma.ProfessionalUpdateInput) {
    const professional = await prisma.professional.findUnique({
      where: { id },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    return prisma.professional.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    })
  }

  async remove(id: string) {
    const professional = await prisma.professional.findUnique({
      where: { id },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    return prisma.professional.delete({
      where: { id },
    })
  }
}
