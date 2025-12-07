import { prisma } from '../../utils/prisma'
import { 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  ListAppointmentsQuery,
  AvailableSlotsQuery 
} from './appointments.schemas'
import { whatsappService } from '../../integrations/whatsapp/whatsapp.service'
import { emailService } from '../../integrations/email/email.service'

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
      const [year, month, day] = date.split('-').map(Number)
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

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

    // Busca por nome do cliente
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
      include: { user: true },
    })
    if (!professional) {
      throw new Error('Profissional não encontrado')
    }

    // 4. Calcular endTime baseado na duração do serviço
    const endTime = this.calculateEndTime(startTime, service.duration)

    // 5. Validar conflito de horários
    const [year, month, day] = date.split('-').map(Number)
    const appointmentDate = new Date(year, month - 1, day)
    
    await this.validateTimeConflict(
      professionalId, 
      appointmentDate, 
      startTime, 
      endTime, 
      service.duration
    )

    // 6. Criar o agendamento
    const dateTime = new Date(year, month - 1, day)
    const [hours, minutes] = startTime.split(':').map(Number)
    dateTime.setHours(hours, minutes, 0, 0)

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

    // 7. Disparar WhatsApp (se configurado)
    if (appointment.client.phone) {
      const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR')

      const waMessage = whatsappService.formatAppointmentConfirmation({
        clientName: appointment.client.name || 'Cliente',
        serviceName: appointment.service?.name || 'Serviço',
        professionalName: appointment.professional.user?.name || 'Profissional',
        date: dateStr,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })

      whatsappService
        .sendMessage(appointment.client.phone, waMessage)
        .catch((err) => console.error('WhatsApp send error (create):', err))
    }

    // 8. Disparar e-mail (Resend)
    if (appointment.client.email) {
      const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR')

      const emailText = emailService.formatAppointmentConfirmationText({
        clientName: appointment.client.name || 'Cliente',
        serviceName: appointment.service?.name || 'Serviço',
        professionalName: appointment.professional.user?.name || 'Profissional',
        date: dateStr,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })

      const emailHtml = emailService.formatAppointmentConfirmationHtml({
        clientName: appointment.client.name || 'Cliente',
        serviceName: appointment.service?.name || 'Serviço',
        professionalName: appointment.professional.user?.name || 'Profissional',
        date: dateStr,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })

      emailService
        .sendEmail({
          to: appointment.client.email,
          subject: 'Confirmação de agendamento - AgendaFlow',
          text: emailText,
          html: emailHtml,
        })
        .catch((err) => console.error('Email send error (create):', err))
    }

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
      
      await this.validateTimeConflict(
        professionalId, 
        newDate, 
        newStartTime, 
        newEndTime, 
        newDuration, 
        id
      )
      
      data = { 
        ...data, 
        endTime: newEndTime,
        duration: newDuration,
      } as any
    }

    // Atualizar dateTime se mudou a data
    let updateData: any = { ...data }
    
    if (data.date) {
      const [year, month, day] = data.date.split('-').map(Number)
      const timeStr = data.startTime || appointment.startTime
      const [hours, minutes] = timeStr.split(':').map(Number)
      
      const dateTime = new Date(year, month - 1, day)
      dateTime.setHours(hours, minutes, 0, 0)
      
      updateData.dateTime = dateTime
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

    return prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
      },
    })
  }

  // ==================== HORÁRIOS DISPONÍVEIS (CORRIGIDO) ====================
  async getAvailableSlots(query: AvailableSlotsQuery) {
    console.log('📥 Buscando slots disponíveis:', query)

    const { professionalId, serviceId, date } = query

    // 1. Buscar o serviço para saber a duração
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error('Serviço não encontrado')
    }

    console.log(`🎯 Serviço: ${service.name} (${service.duration} min)`)

    // 2. Buscar agendamentos existentes do profissional neste dia (CORRIGIDO)
    const [year, month, day] = date.split('-').map(Number)
    
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

    console.log('📅 Range de busca:', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      startOfDayLocal: startOfDay.toLocaleString('pt-BR'),
      endOfDayLocal: endOfDay.toLocaleString('pt-BR'),
    })

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
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        dateTime: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    console.log(`📅 Agendamentos existentes: ${existingAppointments.length}`)
    
    if (existingAppointments.length > 0) {
      console.log('📋 Detalhes dos agendamentos:')
      existingAppointments.forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt.startTime} - ${apt.endTime} (${apt.duration} min) | dateTime: ${apt.dateTime.toISOString()}`)
      })
    }

    // 3. Gerar slots disponíveis
    const availableSlots = this.generateAvailableSlots(
      existingAppointments,
      service.duration,
      '08:00',
      '20:00',
    )

    console.log(`✅ Slots disponíveis: ${availableSlots.length}`)
    if (availableSlots.length > 0) {
      console.log('🕐 Alguns slots disponíveis:', availableSlots.slice(0, 5).join(', '))
    }

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

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  // VALIDAÇÃO MELHORADA - Considera a duração completa dos agendamentos
  private async validateTimeConflict(
    professionalId: string,
    date: Date,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999)

    console.log('🔍 Validando conflito:', {
      professionalId,
      date: date.toLocaleDateString('pt-BR'),
      startTime,
      endTime,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    })

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
        duration: true,
        dateTime: true,
      },
    })

    console.log(`📅 Encontrados ${existingAppointments.length} agendamentos para validar`)

    const newStartMinutes = this.timeToMinutes(startTime)
    const newEndMinutes = this.timeToMinutes(endTime)

    for (const apt of existingAppointments) {
      const aptStartMinutes = this.timeToMinutes(apt.startTime)
      const aptEndMinutes = this.timeToMinutes(apt.endTime)

      const hasConflict = 
        (newStartMinutes >= aptStartMinutes && newStartMinutes < aptEndMinutes) ||
        (newEndMinutes > aptStartMinutes && newEndMinutes <= aptEndMinutes) ||
        (newStartMinutes <= aptStartMinutes && newEndMinutes >= aptEndMinutes)

      if (hasConflict) {
        throw new Error(
          `❌ Conflito de horários: já existe agendamento entre ${apt.startTime} e ${apt.endTime}`
        )
      }
    }

    console.log('✅ Sem conflitos!')
  }

  // GERAÇÃO DE SLOTS MELHORADA
  private generateAvailableSlots(
    existingAppointments: { startTime: string; endTime: string; duration: number }[],
    serviceDurationMinutes: number,
    workStartTime: string,
    workEndTime: string,
  ): string[] {
    const slots: string[] = []
    
    const workStartMinutes = this.timeToMinutes(workStartTime)
    const workEndMinutes = this.timeToMinutes(workEndTime)
    
    const slotInterval = 30

    for (let currentMinutes = workStartMinutes; currentMinutes < workEndMinutes; currentMinutes += slotInterval) {
      const slotTime = this.minutesToTime(currentMinutes)
      const slotEndMinutes = currentMinutes + serviceDurationMinutes

      if (slotEndMinutes > workEndMinutes) {
        continue
      }

      const slotEndTime = this.minutesToTime(slotEndMinutes)

      const hasConflict = existingAppointments.some(apt => {
        const aptStartMinutes = this.timeToMinutes(apt.startTime)
        const aptEndMinutes = this.timeToMinutes(apt.endTime)

        return (
          (currentMinutes >= aptStartMinutes && currentMinutes < aptEndMinutes) ||
          (slotEndMinutes > aptStartMinutes && slotEndMinutes <= aptEndMinutes) ||
          (currentMinutes <= aptStartMinutes && slotEndMinutes >= aptEndMinutes)
        )
      })

      if (!hasConflict) {
        slots.push(slotTime)
      } else {
        console.log(`   ❌ Slot ${slotTime} - ${slotEndTime} bloqueado (conflito)`)
      }
    }

    return slots
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }
}
