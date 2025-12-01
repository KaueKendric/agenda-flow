import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import type { LoginInput, RegisterInput } from './auth.schemas'

export class AuthService  {
  async register(data: RegisterInput) {
   
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      throw new Error('Email já cadastrado')
    }

 
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return user
  }

  async login(data: LoginInput) {
  
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
}
