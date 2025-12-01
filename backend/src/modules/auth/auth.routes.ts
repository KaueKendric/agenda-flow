import type { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller'

const authController = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register.bind(authController))
  fastify.post('/login', authController.login.bind(authController))
}
