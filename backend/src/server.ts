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
import { servicesRoutes } from './modules/services/services.routes'
import { clientsRoutes } from './modules/clients/clients.routes'
import { professionalsRoutes } from './modules/professionals/professionals.routes'
import { reportsRoutes } from '@/modules/reports/reports.routes'

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
  logger: true, 
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


// ✅ Middleware para logar todas as requisições
app.addHook('onRequest', async (request, reply) => {
  console.log(`\n📨 [${new Date().toISOString()}]`)
  console.log(`   ${request.method} ${request.url}`)
  console.log(`   Headers:`, {
    authorization: request.headers.authorization ? '***token***' : 'none',
    contentType: request.headers['content-type'],
  })
})


// ✅ Middleware para logar respostas
app.addHook('onResponse', async (request, reply) => {
  console.log(`   ✓ Status: ${reply.statusCode}`)
})


// Rotas
app.register(authRoutes, { prefix: '/api/auth' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })
app.register(appointmentsRoutes, { prefix: '/api/appointments' })
app.register(testRoutes, { prefix: '/api' })
app.register(servicesRoutes, { prefix: '/api/services' })
app.register(clientsRoutes, { prefix: '/api/clients' })
app.register(professionalsRoutes, { prefix: '/api/professionals' })
app.register(reportsRoutes, { prefix: '/api/reports' })


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
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 HTTP Server Running on http://${HOST}:${PORT}`)
  console.log(`📚 Docs available at http://${HOST}:${PORT}/docs`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`)
  console.log(`${'='.repeat(60)}\n`)
}).catch(err => {
  console.error('❌ Erro ao iniciar servidor:', err)
  process.exit(1)
})
