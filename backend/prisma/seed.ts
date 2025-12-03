import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123456', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agendaflow.com' },
    update: {},
    create: {
      email: 'admin@agendaflow.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin criado:', admin.email)
  console.log('📧 Email: admin@agendaflow.com')
  console.log('🔑 Senha: Admin@123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
