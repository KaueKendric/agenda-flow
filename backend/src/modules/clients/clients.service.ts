import { prisma } from '../../utils/prisma'
import { Prisma } from '@prisma/client'

interface ClientWithStats {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  totalAppointments: number
  lastAppointmentDate: Date | null
  totalSpent: number
  isActive: boolean
}

export class ClientsService {
  // Listar com estatísticas básicas
  async list(filters?: {
    search?: string
    tags?: string[]
    isActive?: boolean
  }) {
    const where: Prisma.ClientWhereInput = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        appointments: {
          select: {
            id: true,
            dateTime: true,
            price: true,
            status: true,
          },
          orderBy: { dateTime: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular estatísticas
    const clientsWithStats: ClientWithStats[] = clients.map((client) => {
      const completedAppointments = client.appointments.filter(
        (apt) => apt.status === 'COMPLETED'
      )

      const totalSpent = completedAppointments.reduce((sum, apt) => {
        return sum + (apt.price ? parseFloat(apt.price.toString()) : 0)
      }, 0)

      const lastAppointment = client.appointments[0]
      const hasRecentAppointment = lastAppointment
        ? new Date(lastAppointment.dateTime) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 dias
        : false

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        city: client.city,
        state: client.state,
        tags: client.tags,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        totalAppointments: client.appointments.length,
        lastAppointmentDate: lastAppointment?.dateTime || null,
        totalSpent,
        isActive: hasRecentAppointment || client.appointments.length === 0,
      }
    })

    // Filtrar por isActive se especificado
    if (filters?.isActive !== undefined) {
      return clientsWithStats.filter((c) => c.isActive === filters.isActive)
    }

    return clientsWithStats
  }

  // Buscar por ID com detalhes completos
  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            service: true,
            professional: {
              include: { user: true },
            },
          },
          orderBy: { dateTime: 'desc' },
        },
      },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    return client
  }

  // Estatísticas detalhadas do cliente
  async getStats(id: string) {
    const client = await this.getById(id)

    const completedAppointments = client.appointments.filter(
      (apt) => apt.status === 'COMPLETED'
    )

    const canceledAppointments = client.appointments.filter(
      (apt) => apt.status === 'CANCELLED'
    )

    const noShowAppointments = client.appointments.filter(
      (apt) => apt.status === 'NO_SHOW'
    )

    const totalSpent = completedAppointments.reduce((sum, apt) => {
      return sum + (apt.price ? parseFloat(apt.price.toString()) : 0)
    }, 0)

    const averageTicket =
      completedAppointments.length > 0
        ? totalSpent / completedAppointments.length
        : 0

    const attendanceRate =
      client.appointments.length > 0
        ? (completedAppointments.length / client.appointments.length) * 100
        : 0

    // Serviços mais utilizados
    const serviceCount: Record<string, { name: string; count: number }> = {}
    completedAppointments.forEach((apt) => {
      if (apt.service) {
        const key = apt.service.id
        if (!serviceCount[key]) {
          serviceCount[key] = { name: apt.service.name, count: 0 }
        }
        serviceCount[key].count++
      }
    })

    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Próximos agendamentos
    const upcomingAppointments = client.appointments
      .filter(
        (apt) =>
          new Date(apt.dateTime) > new Date() &&
          ['SCHEDULED', 'CONFIRMED'].includes(apt.status)
      )
      .slice(0, 5)

    return {
      totalAppointments: client.appointments.length,
      completedAppointments: completedAppointments.length,
      canceledAppointments: canceledAppointments.length,
      noShowAppointments: noShowAppointments.length,
      totalSpent,
      averageTicket,
      attendanceRate,
      topServices,
      upcomingAppointments,
    }
  }

  // Criar cliente
  async create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({
      data,
    })
  }

  // Atualizar cliente
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

  // Remover cliente
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

  // Exportar para CSV
  async exportCSV(clientIds?: string[]) {
    const where: Prisma.ClientWhereInput = clientIds
      ? { id: { in: clientIds } }
      : {}

    const clients = await prisma.client.findMany({
      where,
      include: {
        appointments: {
          select: {
            status: true,
            price: true,
          },
        },
      },
    })

    const csvData = clients.map((client) => {
      const totalAppointments = client.appointments.length
      const completedAppointments = client.appointments.filter(
        (a) => a.status === 'COMPLETED'
      )
      const totalSpent = completedAppointments.reduce(
        (sum, apt) => sum + (apt.price ? parseFloat(apt.price.toString()) : 0),
        0
      )

      return {
        Nome: client.name,
        Email: client.email,
        Telefone: client.phone || '',
        CPF: client.cpf || '',
        'Data Nascimento': client.birthDate
          ? new Date(client.birthDate).toLocaleDateString('pt-BR')
          : '',
        Endereço: client.address || '',
        Cidade: client.city || '',
        Estado: client.state || '',
        CEP: client.zipCode || '',
        Tags: client.tags.join(', '),
        'Total Agendamentos': totalAppointments,
        'Total Gasto': `R$ ${totalSpent.toFixed(2)}`,
        'Criado em': new Date(client.createdAt).toLocaleDateString('pt-BR'),
      }
    })

    return csvData
  }
}
