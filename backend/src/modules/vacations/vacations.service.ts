import prisma from '../../prisma/client';

type Vacation = {
    startDate: Date;
    endDate: Date;
    reason?: string;
    professionalId: string;
}

export async function listByProfessional(professionalId: string) {
    return prisma.vacation.findMany({
        where: { professionalId },
        orderBy: { startDate: 'asc' }
    });
}

export async function getById(id: string) {
    return prisma.vacation.findUnique({ where: { id } });
}

export async function create(data: Vacation) {
    return prisma.vacation.create({
        data
    });
}

export async function update(id: string, data: Partial<Vacation>) {
    return prisma.vacation.update({
        where: { id },
        data
    });
}

export async function remove(id: string) {
    return prisma.vacation.delete({ where: { id } });
}