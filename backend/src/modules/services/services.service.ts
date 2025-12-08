import { prisma } from '../../utils/prisma'
import { CreateServiceInput, UpdateServiceInput } from './services.schemas'

export class ServicesService {
  // Listar serviços (todos ou filtrados por profissional)
  async list(professionalId?: string) {
    const where: any = {}

    if (professionalId) {
      where.professionalId = professionalId
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        professional: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return services
  }

  async getById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    return service
  }

  async create(data: CreateServiceInput) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        professionalId: data.professionalId || null,
      },
      include: {
        professional: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateServiceInput) {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    return prisma.service.update({
      where: { id },
      data,
      include: {
        professional: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  }

  async remove(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    // Verificar se há agendamentos usando este serviço
    const appointmentsCount = await prisma.appointment.count({
      where: { serviceId: id },
    })

    if (appointmentsCount > 0) {
      throw new Error(
        `Não é possível remover este serviço pois existem ${appointmentsCount} agendamentos vinculados a ele.`
      )
    }

    return prisma.service.delete({
      where: { id },
    })
  }
}
