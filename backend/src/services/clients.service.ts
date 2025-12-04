import prisma from '../prisma/client';


type Address = {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
}

type Client = {
    phone?: string;
    company?: string;
    cpf?: string;
    birthDate?: Date 
    tags?: string[];
    notes?: string;
    preferences?: any; 
    userId: string;
    address?: Address;
}

export async function list() {
    return prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true, address: true } 
    });
}

export async function getById(id: string) {
    return prisma.client.findUnique({
        where: { id },
        include: { user: true, address: true, appointments: true }
    });
}

export async function getByUserId(userId: string) {
    return prisma.client.findUnique({
        where: { userId },
        include: { address: true }
    });
}

export async function create(data: Client) {
    const { address, ...clientData } = data;

    return prisma.client.create({
        data: {
            ...clientData,
            address: address ? {
                create: address
            } : undefined
        },
        include: { address: true }
    });
}

export async function update(id: string, data: Partial<Client>) {
    const { address, ...clientData } = data;

    return prisma.client.update({
        where: { id },
        data: {
            ...clientData,
            address: address ? {
                upsert: {                   // cria ou atualiza o endereço 
                    create: address,
                    update: address
                }
            } : undefined
        },
        include: { address: true }
    });
}

export async function remove(id: string) {
    return prisma.client.delete({ where: { id } });
}