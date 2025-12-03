import '@fastify/jwt'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    jwt: {
      sign: (payload: object) => string
      verify: (token: string) => object
    }
    prisma: PrismaClient 
  }
  
  interface FastifyRequest {
    jwtVerify: () => Promise<void>
    user: {
      userId: string
      role: string
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      userId: string
      role: string
    }
  }
}
