import prisma from '../prisma/client';

type Service = {
    name: string;
    description?: string;
    duration: number; 
    price: number;
    professionalId?: string;
}

export async function list() {
    return prisma.service.findMany({
        orderBy: { name: 'asc' },
        include: { professional: { include: { user: true } } }
    });
}

export async function getById(id: string) {
    return prisma.service.findUnique({
        where: { id },
        include: { professional: true }
    });
}

export async function create(data: Service) {
    return prisma.service.create({
        data
    });
}

export async function update(id: string, data: Partial<Service>) {
    return prisma.service.update({
        where: { id },
        data
    });
}

export async function remove(id: string) {
    return prisma.service.delete({ where: { id } });
}