import ScalarApiReference from '@scalar/fastify-api-reference'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import { fastify } from 'fastify'
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { authRoutes } from './modules/auth/auth.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes' 
import { prisma } from './utils/prisma'
import { appointmentsRoutes } from './modules/appointments/appointments.routes' 
import { testRoutes } from './test-routes'

// ✅ Validação de variáveis obrigatórias
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido no arquivo .env')
}

// ✅ Configurações do ambiente
const PORT = Number(process.env.PORT) || 3333
const HOST = process.env.HOST || '0.0.0.0'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV || 'development'

const app = fastify({
  logger: NODE_ENV === 'development', 
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: NODE_ENV === 'development' 
    ? true 
    : FRONTEND_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
})

app.decorate('prisma', prisma)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'AgendaFlow API',
      description: 'API for AgendaFlow - Sistema de Agendamentos',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

// Rotas
app.register(authRoutes, { prefix: '/api/auth' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })
app.register(appointmentsRoutes, { prefix: '/api/appointments' })
app.register(testRoutes, { prefix: '/api' })

// Health check
app.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  }
})

// ✅ Inicializar servidor
app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`🚀 HTTP Server Running on http://${HOST}:${PORT}`)
  console.log(`📚 Docs available at http://${HOST}:${PORT}/docs`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`)
})
