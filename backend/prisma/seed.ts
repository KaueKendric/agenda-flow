import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.appointment.deleteMany()
  await prisma.vacation.deleteMany()
  await prisma.service.deleteMany()
  await prisma.address.deleteMany()
  await prisma.client.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Dados antigos removidos')

  // Admin
  const adminPassword = await bcrypt.hash('Admin@123456', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@agendaflow.com',
      name: 'Administrador',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Profissionais
  const profPassword = await bcrypt.hash('Prof@123456', 10)
  
  const prof1User = await prisma.user.create({
    data: {
      email: 'joao@agendaflow.com',
      name: 'João Silva',
      password: profPassword,
      role: UserRole.PROFESSIONAL,
      professional: {
        create: {
          specialty: 'Corte e Barba',
          specialties: ['Corte', 'Barba', 'Acabamento'],
          phone: '(11) 98765-4321',
          commission: 40,
          bio: 'Especialista em cortes modernos e barbas estilizadas',
          workSchedule: {
            mon: [{ start: '09:00', end: '18:00' }],
            tue: [{ start: '09:00', end: '18:00' }],
            wed: [{ start: '09:00', end: '18:00' }],
            thu: [{ start: '09:00', end: '18:00' }],
            fri: [{ start: '09:00', end: '18:00' }],
            sat: [{ start: '09:00', end: '14:00' }],
          },
        },
      },
    },
    include: { professional: true },
  })

  const prof2User = await prisma.user.create({
    data: {
      email: 'maria@agendaflow.com',
      name: 'Maria Santos',
      password: profPassword,
      role: UserRole.PROFESSIONAL,
      professional: {
        create: {
          specialty: 'Coloração e Esmalteria',
          specialties: ['Coloração', 'Luzes', 'Manicure', 'Pedicure'],
          phone: '(11) 98765-5678',
          commission: 45,
          bio: 'Especialista em colorimetria e nail art',
          workSchedule: {
            mon: [{ start: '10:00', end: '19:00' }],
            tue: [{ start: '10:00', end: '19:00' }],
            wed: [{ start: '10:00', end: '19:00' }],
            thu: [{ start: '10:00', end: '19:00' }],
            fri: [{ start: '10:00', end: '19:00' }],
            sat: [{ start: '10:00', end: '15:00' }],
          },
        },
      },
    },
    include: { professional: true },
  })

  console.log('✅ Profissionais criados:', prof1User.email, prof2User.email)

  // Serviços
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Corte Masculino',
        description: 'Corte masculino tradicional ou moderno',
        duration: 30,
        price: 50,
        professionalId: prof1User.professional!.id,
      },
      {
        name: 'Barba',
        description: 'Aparar e modelar barba',
        duration: 20,
        price: 30,
        professionalId: prof1User.professional!.id,
      },
      {
        name: 'Corte + Barba',
        description: 'Combo completo',
        duration: 45,
        price: 70,
        professionalId: prof1User.professional!.id,
      },
      {
        name: 'Coloração Completa',
        description: 'Coloração de todo o cabelo',
        duration: 120,
        price: 200,
        professionalId: prof2User.professional!.id,
      },
      {
        name: 'Manicure',
        description: 'Esmaltação simples',
        duration: 45,
        price: 40,
        professionalId: prof2User.professional!.id,
      },
    ],
  })

  console.log('✅ Serviços criados')

  // Clientes
  const clientPassword = await bcrypt.hash('Client@123456', 10)
  
  const client1 = await prisma.user.create({
    data: {
      email: 'pedro@email.com',
      name: 'Pedro Costa',
      password: clientPassword,
      role: UserRole.CLIENT,
      client: {
        create: {
          phone: '(11) 91234-5678',
          cpf: '123.456.789-00',
          tags: ['VIP'],
          notes: 'Cliente preferencial',
          address: {
            create: {
              zipCode: '01310-100',
              street: 'Av. Paulista',
              number: '1000',
              neighborhood: 'Bela Vista',
              city: 'São Paulo',
              state: 'SP',
            },
          },
        },
      },
    },
    include: { client: { include: { address: true } } },
  })

  console.log('✅ Clientes criados')

  // Agendamentos de exemplo
  const allServices = await prisma.service.findMany()
  
  const today = new Date()
  const appointments = []

  for (let i = 0; i < 10; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(10 + (i % 8), 0, 0, 0)

    const service = allServices[i % allServices.length]
    
    appointments.push({
      title: `${service.name} - ${client1.name}`,
      dateTime: date,
      startTime: `${String(10 + (i % 8)).padStart(2, '0')}:00`,
      endTime: `${String(10 + (i % 8) + 1).padStart(2, '0')}:00`,
      duration: service.duration,
      price: service.price,
      status: i < 3 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
      clientId: client1.client!.id,
      professionalId: service.professionalId!,
      serviceId: service.id,
    })
  }

  await prisma.appointment.createMany({ data: appointments })
  
  console.log('✅ Agendamentos criados')
  console.log('\n🎉 Seed concluído com sucesso!\n')
  console.log('📧 Credenciais:')
  console.log('   Admin: admin@agendaflow.com / Admin@123456')
  console.log('   Prof1: joao@agendaflow.com / Prof@123456')
  console.log('   Prof2: maria@agendaflow.com / Prof@123456')
  console.log('   Client: pedro@email.com / Client@123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
