import { prisma } from '../../utils/prisma'
import { AppointmentStatus } from '@prisma/client'

export class AppointmentsService {
  async updateStatus(id: string, status: string) {
    const validStatuses = Object.values(AppointmentStatus)
    if (!validStatuses.includes(status as AppointmentStatus)) {
      throw new Error('Status inválido')
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    return prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
      include: {
        client: { include: { user: true } },
        professional: { include: { user: true } },
        service: true,
      },
    })
  }
}
