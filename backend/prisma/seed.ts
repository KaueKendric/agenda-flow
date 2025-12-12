import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.appointment.deleteMany()
  await prisma.vacation.deleteMany()
  await prisma.service.deleteMany()
  await prisma.client.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Dados antigos removidos')

  // ==================== ADMIN ====================
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

  // ==================== PROFISSIONAIS ====================
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
          bio: 'Especialista em cortes modernos e barbas estilizadas com 10 anos de experiência',
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
          specialties: ['Coloração', 'Luzes', 'Manicure', 'Pedicure', 'Nail Art'],
          phone: '(11) 98765-5678',
          commission: 45,
          bio: 'Especialista em colorimetria e nail art com certificação internacional',
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

  // ==================== SERVIÇOS ====================
  const servicesData = [
    {
      name: 'Corte Masculino',
      description: 'Corte masculino tradicional ou moderno',
      duration: 30,
      price: 50,
      professionalId: prof1User.professional!.id,
    },
    {
      name: 'Barba',
      description: 'Aparar e modelar barba com navalha',
      duration: 20,
      price: 30,
      professionalId: prof1User.professional!.id,
    },
    {
      name: 'Corte + Barba',
      description: 'Combo completo de corte e barba',
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
      name: 'Luzes',
      description: 'Mechas e luzes californianas',
      duration: 150,
      price: 250,
      professionalId: prof2User.professional!.id,
    },
    {
      name: 'Manicure',
      description: 'Esmaltação simples',
      duration: 45,
      price: 40,
      professionalId: prof2User.professional!.id,
    },
    {
      name: 'Pedicure',
      description: 'Cuidados com os pés e esmaltação',
      duration: 60,
      price: 50,
      professionalId: prof2User.professional!.id,
    },
  ]

  await prisma.service.createMany({ data: servicesData })
  console.log('✅ Serviços criados')

  // ==================== CLIENTES ====================
  const clientsData = [
    {
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      phone: '(11) 91234-5678',
      cpf: '123.456.789-00',
      birthDate: new Date('1990-05-15'),
      tags: ['VIP'],
      notes: 'Cliente preferencial, sempre pontual',
      address: 'Av. Paulista',
      addressNumber: '1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    {
      name: 'Ana Silva',
      email: 'ana@email.com',
      phone: '(11) 98765-1234',
      cpf: '234.567.890-11',
      birthDate: new Date('1985-08-20'),
      tags: ['Regular'],
      notes: 'Prefere atendimento pela manhã',
      address: 'Rua Augusta',
      addressNumber: '500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos@email.com',
      phone: '(11) 97654-3210',
      cpf: '345.678.901-22',
      birthDate: new Date('1988-11-30'),
      tags: ['Novo'],
      address: 'Av. Brigadeiro Faria Lima',
      addressNumber: '2000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01451-000',
    },
    {
      name: 'Mariana Santos',
      email: 'mariana@email.com',
      phone: '(11) 96543-2109',
      cpf: '456.789.012-33',
      birthDate: new Date('1992-03-10'),
      tags: ['VIP', 'Regular'],
      notes: 'Alérgica a determinados produtos - verificar antes',
      address: 'Rua Oscar Freire',
      addressNumber: '800',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-000',
    },
    {
      name: 'Roberto Alves',
      email: 'roberto@email.com',
      phone: '(11) 95432-1098',
      cpf: '567.890.123-44',
      birthDate: new Date('1980-07-25'),
      tags: ['Regular'],
      address: 'Av. Rebouças',
      addressNumber: '1500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05402-000',
    },
  ]

  await prisma.client.createMany({ data: clientsData })
  console.log('✅ Clientes criados')

  // ==================== AGENDAMENTOS ====================
  const allServices = await prisma.service.findMany()
  const allClients = await prisma.client.findMany()
  
  const today = new Date()
  const appointments = []

  // Criar 15 agendamentos variados
  for (let i = 0; i < 15; i++) {
    const date = new Date(today)
    // Distribui entre ontem, hoje e próximos dias
    date.setDate(date.getDate() + (i - 2))
    
    const hour = 9 + (i % 9) // Horários entre 9h e 18h
    date.setHours(hour, 0, 0, 0)

    const service = allServices[i % allServices.length]
    const client = allClients[i % allClients.length]
    
    const startHour = hour
    const endHour = hour + Math.ceil(service.duration / 60)
    
    // Variar status dos agendamentos
    let status: AppointmentStatus
    if (i < 2) {
      status = AppointmentStatus.COMPLETED // Passou
    } else if (i < 5) {
      status = AppointmentStatus.CONFIRMED // Próximos confirmados
    } else if (i === 5) {
      status = AppointmentStatus.IN_PROGRESS // Um em andamento
    } else if (i === 6) {
      status = AppointmentStatus.CANCELLED // Um cancelado
    } else {
      status = AppointmentStatus.SCHEDULED // Resto agendado
    }

    appointments.push({
      title: `${service.name} - ${client.name}`,
      dateTime: date,
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
      duration: service.duration,
      price: service.price,
      status: status,
      notes: i % 3 === 0 ? 'Cliente solicitou atendimento especial' : null,
      clientId: client.id,
      professionalId: service.professionalId!,
      serviceId: service.id,
    })
  }

  await prisma.appointment.createMany({ data: appointments })
  console.log('✅ Agendamentos criados')

  // ==================== FÉRIAS (EXEMPLO) ====================
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  await prisma.vacation.create({
    data: {
      professionalId: prof1User.professional!.id,
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      reason: 'Férias programadas',
    },
  })
  console.log('✅ Férias de exemplo criadas')

  console.log('\n🎉 Seed concluído com sucesso!\n')
  console.log('📧 Credenciais de acesso:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 Admin:')
  console.log('   Email: admin@agendaflow.com')
  console.log('   Senha: Admin@123456')
  console.log('')
  console.log('💈 Profissional 1 (João):')
  console.log('   Email: joao@agendaflow.com')
  console.log('   Senha: Prof@123456')
  console.log('')
  console.log('💅 Profissional 2 (Maria):')
  console.log('   Email: maria@agendaflow.com')
  console.log('   Senha: Prof@123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📊 Dados criados:')
  console.log(`   • ${allServices.length} serviços`)
  console.log(`   • ${allClients.length} clientes`)
  console.log(`   • ${appointments.length} agendamentos`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
