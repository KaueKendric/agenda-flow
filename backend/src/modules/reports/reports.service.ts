import { prisma } from '@/utils/prisma'
import type {
  ReportFilters,
  FinancialReport,
  OperationalReport,
  ClientsReport,
  ProfessionalsReport,
} from './reports.types'

export class ReportsService {
  async getFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    const { startDate, endDate, professionalId, serviceId } = filters

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['COMPLETED', 'CONFIRMED'], 
        },
        ...(professionalId && { professionalId }),
        ...(serviceId && { serviceId }),
      },
      include: {
        service: true,
        professional: {
          include: {
            user: true,
          },
        },
      },
    })

    const totalRevenue = appointments.reduce(
      (sum, apt) => sum + (apt.price?.toNumber() || 0),
      0
    )

    // Receita por dia
    const revenueByDay = new Map<string, number>()
    appointments.forEach(apt => {
      const date = apt.dateTime.toISOString().split('T')[0]
      revenueByDay.set(date, (revenueByDay.get(date) || 0) + (apt.price?.toNumber() || 0))
    })

    const revenueByPeriod = Array.from(revenueByDay.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({ date, amount }))

    // Receita por profissional
    const revenueByProfMap = new Map<string, { name: string; revenue: number; count: number }>()
    appointments.forEach(apt => {
      const key = apt.professionalId
      const current = revenueByProfMap.get(key) || {
        name: apt.professional.user.name || 'Profissional',
        revenue: 0,
        count: 0,
      }
      current.revenue += apt.price?.toNumber() || 0
      current.count += 1
      revenueByProfMap.set(key, current)
    })

    const revenueByProfessional = Array.from(revenueByProfMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(({ name, revenue, count }) => ({
        professionalId: '',
        name,
        revenue,
        appointmentCount: count,
      }))

    // Receita por serviço - ✅ CORRIGIDO para contar serviços ÚNICOS
    const revenueByServiceMap = new Map<string, { name: string; revenue: number; count: number }>()
    appointments.forEach(apt => {
      if (!apt.service) return
      const key = apt.service.id
      const current = revenueByServiceMap.get(key) || {
        name: apt.service.name || 'Serviço',
        revenue: 0,
        count: 0,
      }
      current.revenue += apt.price?.toNumber() || 0
      current.count += 1
      revenueByServiceMap.set(key, current)
    })

    const revenueByService = Array.from(revenueByServiceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(({ name, revenue, count }) => ({
        serviceId: '',
        serviceName: name,
        revenue,
        count,
      }))

    // Top serviços
    const topServices = Array.from(revenueByServiceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(({ name, revenue }) => ({
        name,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }))

    return {
      totalRevenue,
      averageTicket: appointments.length > 0 ? totalRevenue / appointments.length : 0,
      revenueByPeriod,
      revenueByProfessional,
      revenueByService,
      topServices,
    }
  }

  async getOperationalReport(filters: ReportFilters): Promise<OperationalReport> {
    const { startDate, endDate, professionalId } = filters

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
        ...(professionalId && { professionalId }),
      },
    })

    const completed = appointments.filter(a => a.status === 'COMPLETED').length
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length
    const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length
    const total = appointments.length

    // Horários de pico
    const peakHourMap = new Map<number, number>()
    appointments.forEach(apt => {
      const hour = apt.dateTime.getHours()
      peakHourMap.set(hour, (peakHourMap.get(hour) || 0) + 1)
    })

    const peakHours = Array.from(peakHourMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({ hour, count }))

    const occupancyRate = total > 0 ? (completed / total) * 100 : 0

    return {
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      occupancyRate,
      peakHours,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      averageDuration: appointments.length > 0
        ? appointments.reduce((sum: number, apt) => sum + apt.duration, 0) / appointments.length
        : 0,
      appointmentsByStatus: [
        {
          status: 'Agendado',
          count: scheduled,
          percentage: total > 0 ? (scheduled / total) * 100 : 0,
        },
        {
          status: 'Completo',
          count: completed,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        },
        {
          status: 'Cancelado',
          count: cancelled,
          percentage: total > 0 ? (cancelled / total) * 100 : 0,
        },
      ],
    }
  }

  async getClientsReport(filters: ReportFilters): Promise<ClientsReport> {
    const { startDate, endDate } = filters

    const allClients = await prisma.client.findMany()

    const appointmentsInPeriod = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const newClients = await prisma.client.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Clientes ativos (com agendamento neste período)
    const activeClientIds = new Set(appointmentsInPeriod.map(a => a.clientId))
    const activeClients = activeClientIds.size

    // Clientes frequentes
    const clientAppointmentCount = new Map<string, number>()
    appointmentsInPeriod.forEach(apt => {
      clientAppointmentCount.set(
        apt.clientId,
        (clientAppointmentCount.get(apt.clientId) || 0) + 1
      )
    })

    const frequentClients = Array.from(clientAppointmentCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([clientId, count]) => {
        const client = allClients.find(c => c.id === clientId)
        return {
          id: clientId,
          name: client?.name || 'Desconhecido',
          appointmentCount: count,
          lastAppointment: new Date(),
        }
      })

    return {
      totalClients: allClients.length,
      newClientsThisPeriod: newClients.length,
      activeClients,
      clientRetention: allClients.length > 0 ? (activeClients / allClients.length) * 100 : 0,
      frequentClients,
      clientsByFrequency: [
        {
          frequency: '1-2 vezes',
          count: Array.from(clientAppointmentCount.values()).filter(c => c <= 2).length,
        },
        {
          frequency: '3-5 vezes',
          count: Array.from(clientAppointmentCount.values()).filter(c => c > 2 && c <= 5).length,
        },
        {
          frequency: '6+ vezes',
          count: Array.from(clientAppointmentCount.values()).filter(c => c > 5).length,
        },
      ],
    }
  }

  async getProfessionalsReport(filters: ReportFilters): Promise<ProfessionalsReport> {
    const { startDate, endDate } = filters

    const professionals = await prisma.professional.findMany({
      include: {
        user: true,
      },
    })

    const appointmentsInPeriod = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const ranking = professionals
      .map(prof => {
        const profAppointments = appointmentsInPeriod.filter(
          a => a.professionalId === prof.id
        )
        const revenue = profAppointments.reduce(
          (sum, apt) => sum + (apt.price?.toNumber() || 0),
          0
        )
        const completed = profAppointments.filter(a => a.status === 'COMPLETED').length
        const occupancyRate = profAppointments.length > 0
          ? (completed / profAppointments.length) * 100
          : 0

        return {
          id: prof.id,
          name: prof.user.name || 'Profissional',
          revenue,
          appointmentCount: profAppointments.length,
          rating: 4.5,
          occupancyRate,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

    return {
      totalProfessionals: professionals.length,
      ranking,
      performanceByProfessional: ranking.map(prof => ({
        id: prof.id,
        name: prof.name,
        appointments: prof.appointmentCount,
        revenue: prof.revenue,
        completionRate: 95,
        averageRating: 4.5,
      })),
    }
  }
}

export const reportsService = new ReportsService()
