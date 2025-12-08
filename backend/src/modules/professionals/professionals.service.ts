import { prisma } from '../../utils/prisma'
import { CreateProfessionalInput, UpdateProfessionalInput } from './professionals.schemas'

export class ProfessionalsService {
  // Listar com serviços incluídos
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
        services: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            appointments: true,
            services: true,
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
        services: {
          orderBy: { name: 'asc' },
        },
        vacations: {
          orderBy: { startDate: 'desc' },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    return professional
  }

  async create(data: CreateProfessionalInput) {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se já existe profissional para este usuário
    const existing = await prisma.professional.findUnique({
      where: { userId: data.userId },
    })

    if (existing) {
      throw new Error('Já existe um profissional cadastrado para este usuário')
    }

    return prisma.professional.create({
      data: {
        userId: data.userId,
        specialty: data.specialty,
        specialties: data.specialties || [],
        phone: data.phone,
        bio: data.bio,
        commission: data.commission,
        availability: data.availability,
        workSchedule: data.workSchedule,
      },
      include: {
        user: true,
        services: true,
      },
    })
  }

  async update(id: string, data: UpdateProfessionalInput) {
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
        services: true,
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

    // Verificar se há agendamentos futuros
    const futureAppointments = await prisma.appointment.count({
      where: {
        professionalId: id,
        dateTime: {
          gte: new Date(),
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
    })

    if (futureAppointments > 0) {
      throw new Error(
        `Não é possível remover este profissional pois existem ${futureAppointments} agendamentos futuros.`
      )
    }

    return prisma.professional.delete({
      where: { id },
    })
  }

  // ========== NOVOS MÉTODOS PARA GERENCIAR SERVIÇOS ==========

  // Clonar um serviço global para o profissional com preço customizado
  async linkService(professionalId: string, serviceId: string, customPrice?: number) {
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    const originalService = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!originalService) {
      throw new Error('Serviço não encontrado')
    }

    // Verificar se já existe serviço com mesmo nome para este profissional
    const existing = await prisma.service.findFirst({
      where: {
        professionalId,
        name: originalService.name,
      },
    })

    if (existing) {
      throw new Error('Este profissional já possui um serviço com este nome')
    }

    // Clonar o serviço para o profissional
    const newService = await prisma.service.create({
      data: {
        name: originalService.name,
        description: originalService.description,
        duration: originalService.duration,
        price: customPrice !== undefined ? customPrice : originalService.price,
        professionalId,
      },
    })

    return newService
  }

  // Desvincular serviço (remover serviço específico do profissional)
  async unlinkService(professionalId: string, serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    if (service.professionalId !== professionalId) {
      throw new Error('Este serviço não pertence a este profissional')
    }

    // Verificar se há agendamentos usando este serviço
    const appointmentsCount = await prisma.appointment.count({
      where: { serviceId },
    })

    if (appointmentsCount > 0) {
      throw new Error(
        `Não é possível remover este serviço pois existem ${appointmentsCount} agendamentos vinculados.`
      )
    }

    await prisma.service.delete({
      where: { id: serviceId },
    })

    return { message: 'Serviço desvinculado com sucesso' }
  }

  // Atualizar preço de um serviço específico do profissional
  async updateServicePrice(professionalId: string, serviceId: string, newPrice: number) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    if (service.professionalId !== professionalId) {
      throw new Error('Este serviço não pertence a este profissional')
    }

    return prisma.service.update({
      where: { id: serviceId },
      data: { price: newPrice },
    })
  }
}
