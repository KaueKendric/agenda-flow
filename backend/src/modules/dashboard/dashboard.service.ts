import { prisma } from '../../utils/prisma'
import { AppointmentStatus } from '@prisma/client'

export class DashboardService {
  // Métricas principais
  async getMetrics() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(weekStart.getDate() - 7)

    // Agendamentos hoje
    const appointmentsToday = await prisma.appointment.count({
      where: {
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Agendamentos ontem
    const appointmentsYesterday = await prisma.appointment.count({
      where: {
        dateTime: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Agendamentos esta semana
    const appointmentsWeek = await prisma.appointment.count({
      where: {
        dateTime: {
          gte: weekStart,
        },
      },
    })

    // Agendamentos semana passada
    const appointmentsLastWeek = await prisma.appointment.count({
      where: {
        dateTime: {
          gte: lastWeekStart,
          lt: weekStart,
        },
      },
    })

    // Clientes ativos
    const activeClients = await prisma.client.count()

    // Taxa de ocupação (simplificada)
    const totalSlots = 40 // 8 horas * 5 slots por hora (exemplo)
    const occupiedSlots = appointmentsToday
    const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100)

    // Calcular variações
    const todayVariation =
      appointmentsYesterday > 0
        ? Math.round(
            ((appointmentsToday - appointmentsYesterday) /
              appointmentsYesterday) *
              100,
          )
        : 0

    const weekVariation =
      appointmentsLastWeek > 0
        ? Math.round(
            ((appointmentsWeek - appointmentsLastWeek) /
              appointmentsLastWeek) *
              100,
          )
        : 0

    return {
      appointmentsToday: {
        value: appointmentsToday,
        variation: todayVariation,
        isPositive: todayVariation >= 0,
      },
      appointmentsWeek: {
        value: appointmentsWeek,
        variation: weekVariation,
        isPositive: weekVariation >= 0,
      },
      activeClients,
      occupancyRate,
    }
  }

  // Gráfico últimos 7 dias
  async getAppointmentsChart() {
    const days: {
      date: string
      day: string
      count: number
    }[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      const count = await prisma.appointment.count({
        where: {
          dateTime: {
            gte: date,
            lt: nextDay,
          },
        },
      })

      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        count,
      })
    }

    return days
  }

  // Serviços mais agendados
  async getServicesChart() {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: {
        appointments: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    const total = services.reduce(
      (sum, s) => sum + s._count.appointments,
      0,
    )

    return services.map((service) => ({
      name: service.name,
      count: service._count.appointments,
      percentage:
        total > 0
          ? Math.round(
              (service._count.appointments / total) * 100,
            )
          : 0,
    }))
  }

  // Próximos agendamentos
  async getUpcomingAppointments() {
    const now = new Date()

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: now,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
      include: {
        client: true, // Client agora não tem relação com User
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
      take: 5,
    })

    return appointments.map((apt) => ({
      id: apt.id,
      time: apt.startTime,
      date: apt.dateTime,
      client: apt.client?.name || apt.client?.email || 'Cliente',
      service: apt.service?.name || 'Serviço',
      professional: apt.professional.user?.name || 'Profissional',
      status: apt.status,
    }))
  }

  // Calendário do mês
  async getCalendar(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const appointments = await prisma.appointment.groupBy({
      by: ['dateTime'],
      where: {
        dateTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: true,
    })

    return appointments.map((apt) => ({
      date: apt.dateTime.toISOString().split('T')[0],
      count: apt._count,
    }))
  }
}
