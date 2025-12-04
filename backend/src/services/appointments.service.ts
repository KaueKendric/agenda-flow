import prisma from '../prisma/client';
// import { AppointmentStatus } from '@prisma/client';

type Appointment = {
    title?: string;
    dateTime: Date | string;
    duration: number;
    // status?: AppointmentStatus;
    notes?: string;
    startTime: string;
    endTime: string;
    price?: number;
    clientId: string;
    professionalId: string;
    serviceId?: string;
}

// Filtros  para listagem
type ListFilters = {
    professionalId?: string;
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
}

export async function list(filters?: ListFilters) {
    const whereClause: any = {};

    if (filters?.professionalId) whereClause.professionalId = filters.professionalId;
    if (filters?.clientId) whereClause.clientId = filters.clientId;
    
    // Filtro por  data
    if (filters?.startDate && filters?.endDate) {
        whereClause.dateTime = {
            gte: filters.startDate,    // maior ou igual
            lte: filters.endDate        // menor ou igual
        };
    }

    return prisma.appointment.findMany({
        where: whereClause,
        orderBy: { dateTime: 'asc' },
        include: {
            client: { include: { user: true } },
            professional: { include: { user: true } },
            service: true
        }
    });
}

export async function getById(id: string) {
    return prisma.appointment.findUnique({
        where: { id },
        include: {
            client: true,
            professional: true,
            service: true
        }
    });
}

export async function create(data: Appointment) {
    return prisma.appointment.create({
        data
    });
}

export async function update(id: string, data: Partial<Appointment>) {
    return prisma.appointment.update({
        where: { id },
        data
    });
}

export async function updateStatus(id: string, /*status: AppointmentStatus*/) {
    return prisma.appointment.update({
        where: { id },
        //data: { status }
    });
}

export async function remove(id: string) {
    return prisma.appointment.delete({ where: { id } });
}