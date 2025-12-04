import prisma from '../prisma/client';

type Professional = {
    specialty?: string;
    availability?: any; 
    specialties?: string[];
    workSchedule?: any; 
    commission?: number; 
    phone?: string;
    bio?: string;
    userId: string;
}

export async function list() {
    return prisma.professional.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });
}

export async function getById(id: string) {
    return prisma.professional.findUnique({
        where: { id },
        include: { user: true, services: true, vacations: true }
    });
}

export async function create(data: Professional) {
    return prisma.professional.create({
        data
    });
}

export async function update(id: string, data: Partial<Professional>) {
    return prisma.professional.update({
        where: { id },
        data
    });
}

export async function remove(id: string) {
    return prisma.professional.delete({ where: { id } });
}