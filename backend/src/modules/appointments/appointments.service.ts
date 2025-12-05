import { prisma } from '../../utils/prisma'
import { 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  ListAppointmentsQuery,
  AvailableSlotsQuery 
} from './appointments.schemas'

export class AppointmentsService {
  // ==================== LISTAR AGENDAMENTOS ====================
  async list(query: ListAppointmentsQuery) {
    const { page, limit, status, professionalId, clientId, serviceId, date, startDate, endDate, search } = query
    
    const skip = (page - 1) * limit

    // Construir filtros dinâmicos
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (professionalId) {
      where.professionalId = professionalId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (serviceId) {
      where.serviceId = serviceId
    }

    // Filtro por data específica
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      where.dateTime = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    // Filtro por range de datas
    if (startDate && endDate) {
      where.dateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Busca por nome do cliente (agora em Client.name)
    if (search) {
      where.client = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
          professional: {
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
          },
          service: true,
        },
        orderBy: {
          dateTime: 'asc',
        },
      }),
      prisma.appointment.count({ where }),
    ])

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // ==================== BUSCAR POR ID ====================
  async getById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    return appointment
  }

  // ==================== CRIAR AGENDAMENTO ====================
  async create(data: CreateAppointmentInput) {
    const { clientId, professionalId, serviceId, date, startTime, notes } = data

    // 1. Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    // 2. Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    // 3. Verificar se o profissional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    })

    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    // 4. Calcular endTime baseado na duração do serviço
    const endTime = this.calculateEndTime(startTime, service.duration)

    // 5. Validar conflito de horários
    await this.validateTimeConflict(professionalId, new Date(date), startTime, endTime)

    // 6. Criar o agendamento
    const dateTime = new Date(`${date.split('T')[0]}T${startTime}:00`)

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        professionalId,
        serviceId,
        dateTime,
        startTime,
        endTime,
        duration: service.duration,
        status: 'SCHEDULED',
        notes: notes || '',
        price: service.price,
      },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    })

    return appointment
  }

  // ==================== ATUALIZAR AGENDAMENTO ====================
  async update(id: string, data: UpdateAppointmentInput) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Se está mudando horário, validar conflito
    if (data.date || data.startTime) {
      const newDate = data.date ? new Date(data.date) : appointment.dateTime
      const newStartTime = data.startTime || appointment.startTime
      
      // Calcular novo endTime e duration se mudou startTime ou serviceId
      let newEndTime = appointment.endTime
      let newDuration = appointment.duration
      
      if (data.serviceId) {
        const newService = await prisma.service.findUnique({
          where: { id: data.serviceId },
        })
        if (newService) {
          newEndTime = this.calculateEndTime(newStartTime, newService.duration)
          newDuration = newService.duration
        }
      } else if (data.startTime) {
        newEndTime = this.calculateEndTime(newStartTime, appointment.duration)
      }

      const professionalId = data.professionalId || appointment.professionalId
      
      await this.validateTimeConflict(professionalId, newDate, newStartTime, newEndTime, id)
      
      // Adicionar campos calculados ao data
      data = { 
        ...data, 
        endTime: newEndTime,
        duration: newDuration,
      } as any
    }

    // Atualizar dateTime se mudou a data
    let updateData: any = { ...data }
    
    if (data.date) {
      const dateStr = data.date.split('T')[0]
      const timeStr = data.startTime || appointment.startTime
      updateData.dateTime = new Date(`${dateStr}T${timeStr}:00`)
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    })

    return updatedAppointment
  }

  // ==================== ATUALIZAR STATUS ====================
  async updateStatus(id: string, status: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    return prisma.appointment.update({
      where: { id },
      data: { status: status as any },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    })
  }

  // ==================== DELETAR (CANCELAR) ====================
  async delete(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Marcar como cancelado
    return prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
      },
    })
  }

  // ==================== HORÁRIOS DISPONÍVEIS ====================
  async getAvailableSlots(query: AvailableSlotsQuery) {
    console.log('📥 Query recebida:', query)
    console.log('📥 Tipo da query:', typeof query)
    console.log('📥 professionalId:', query.professionalId, typeof query.professionalId)
    console.log('📥 serviceId:', query.serviceId, typeof query.serviceId)
    console.log('📥 date:', query.date, typeof query.date)

    const { professionalId, serviceId, date } = query

    // 1. Buscar o serviço para saber a duração
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    // 2. Buscar agendamentos existentes do profissional neste dia
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // 3. Gerar slots disponíveis
    const availableSlots = this.generateAvailableSlots(
      existingAppointments,
      service.duration,
      '08:00', // Horário de início (pode ser configurável)
      '18:00', // Horário de fim (pode ser configurável)
    )

    return availableSlots
  }

  // ==================== CALENDÁRIO MENSAL ====================
  async getCalendar(year: number, month: number, professionalId?: string) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const where: any = {
      dateTime: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (professionalId) {
      where.professionalId = professionalId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
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
    })

    return appointments
  }

  // ==================== FUNÇÕES AUXILIARES ====================

  // Calcular horário de término
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  // Validar conflito de horários (CRÍTICO!)
  private async validateTimeConflict(
    professionalId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const where: any = {
      professionalId,
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    }

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId }
    }

    const existingAppointments = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    })

    // Verificar sobreposição de horários
    for (const apt of existingAppointments) {
      const hasConflict = 
        (startTime >= apt.startTime && startTime < apt.endTime) ||
        (endTime > apt.startTime && endTime <= apt.endTime) ||
        (startTime <= apt.startTime && endTime >= apt.endTime)

      if (hasConflict) {
        throw new Error(
          `Conflito de horários: profissional já possui agendamento entre ${apt.startTime} e ${apt.endTime}`
        )
      }
    }
  }

  // Gerar slots disponíveis
  private generateAvailableSlots(
    existingAppointments: { startTime: string; endTime: string }[],
    durationMinutes: number,
    workStartTime: string,
    workEndTime: string,
  ): string[] {
    const slots: string[] = []
    
    const [startHour, startMinute] = workStartTime.split(':').map(Number)
    const [endHour, endMinute] = workEndTime.split(':').map(Number)
    
    let currentMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    // Gerar slots de 30 em 30 minutos
    const slotInterval = 30

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotHour = Math.floor(currentMinutes / 60)
      const slotMinute = currentMinutes % 60
      const slotTime = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`
      const slotEndTime = this.calculateEndTime(slotTime, durationMinutes)

      // Verificar se não conflita com agendamentos existentes
      const hasConflict = existingAppointments.some(apt => {
        return (
          (slotTime >= apt.startTime && slotTime < apt.endTime) ||
          (slotEndTime > apt.startTime && slotEndTime <= apt.endTime) ||
          (slotTime <= apt.startTime && slotEndTime >= apt.endTime)
        )
      })

      if (!hasConflict) {
        slots.push(slotTime)
      }

      currentMinutes += slotInterval
    }

    return slots
  }
}
