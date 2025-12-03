import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AuthController } from './auth.controller'

const authController = new AuthController()

// Middleware de autenticação
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Token inválido ou ausente' })
  }
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register.bind(authController))
  fastify.post('/login', authController.login.bind(authController))
  
  // Rota protegida
  fastify.get('/me', {
    preHandler: authenticate
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string; role: string }
    
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' })
    }

    return reply.send({ user })
  })
}
