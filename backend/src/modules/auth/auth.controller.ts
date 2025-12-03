import type { FastifyReply, FastifyRequest } from 'fastify'
import { loginSchema, registerSchema } from './auth.schemas'
import { AuthService } from './auth.service'


const authService = new AuthService()

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body)
      const user = await authService.register(data)
      
      const token = request.server.jwt.sign({ 
        userId: user.id, 
        role: user.role 
      })

      return reply.status(201).send({ user, token })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(400).send({ error: message })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body)
      const user = await authService.login(data)
      
      const token = request.server.jwt.sign({ 
        userId: user.id, 
        role: user.role 
      })

      return reply.send({ user, token })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return reply.status(401).send({ error: message })
    }
  }
}
