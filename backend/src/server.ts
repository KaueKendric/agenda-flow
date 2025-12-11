import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { fastify } from 'fastify'
import path from 'path'
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
import { servicesRoutes } from './modules/services/services.routes'
import { clientsRoutes } from './modules/clients/clients.routes'
import { professionalsRoutes } from './modules/professionals/professionals.routes'
import { reportsRoutes } from './modules/reports/reports.routes'
import { usersRoutes } from './modules/users/user.routes'

interface FastifyError extends Error {
  validation?: unknown[]
  statusCode?: number
}

function isFastifyError(error: unknown): error is FastifyError {
  return error instanceof Error
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido no arquivo .env')
}

const PORT = Number(process.env.PORT) || 3333
const HOST = process.env.HOST || '0.0.0.0'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV || 'development'

const app = fastify({
  logger: NODE_ENV === 'production' 
    ? {
        level: 'info',
        transport: undefined,
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: NODE_ENV === 'development' 
    ? true 
    : [FRONTEND_URL, /\.vercel\.app$/],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
})

// Multipart
app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
  constraints: {},
})

app.decorate('prisma', prisma)

// ✅ Swagger/OpenAPI
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'AgendaFlow API',
      description: 'API completa para sistema de agendamentos - AgendaFlow',
      version: '1.0.0',
    },
    servers: [
      {
        url: NODE_ENV === 'production' 
          ? 'https://backend-production-b85c.up.railway.app' 
          : `http://localhost:${PORT}`,
        description: NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

// ✅ Documentação com Swagger UI (NOVO)
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
    displayRequestDuration: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject
  },
  theme: {
    title: 'AgendaFlow API - Documentação',
  },
})

//  Hook de logging de requisições
if (NODE_ENV === 'development') {
  app.addHook('onRequest', async (request, reply) => {
    console.log(`\n📨 [${new Date().toISOString()}]`)
    console.log(`   ${request.method} ${request.url}`)
    console.log(`   Headers:`, {
      authorization: request.headers.authorization ? '***token***' : 'none',
      contentType: request.headers['content-type'],
    })
  })

  app.addHook('onResponse', async (request, reply) => {
    console.log(`   ✓ Status: ${reply.statusCode}`)
  })
}

app.setErrorHandler((error: unknown, request, reply) => {
 
  if (!isFastifyError(error)) {
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor',
    })
  }

  // Log do erro
  request.log.error(error)

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados de entrada inválidos',
      details: error.validation,
    })
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token inválido ou expirado',
    })
  }

  const statusCode = error.statusCode || 500
  
  reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message: NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
  })
})

// Registrar rotas
app.register(authRoutes, { prefix: '/api/auth' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })
app.register(appointmentsRoutes, { prefix: '/api/appointments' })
app.register(servicesRoutes, { prefix: '/api/services' })
app.register(clientsRoutes, { prefix: '/api/clients' })
app.register(professionalsRoutes, { prefix: '/api/professionals' })
app.register(reportsRoutes, { prefix: '/api/reports' })
app.register(usersRoutes, { prefix: '/api/users' })

//  Health check
app.get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return { 
      status: 'ok',
      service: 'AgendaFlow API',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      database: 'connected',
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    
    return { 
      status: 'error',
      service: 'AgendaFlow API',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: 'disconnected',
      error: errorMessage,
    }
  }
})

// Rota raiz
app.get('/', async () => {
  return {
    message: '🚀 AgendaFlow API',
    version: '1.0.0',
    docs: `${NODE_ENV === 'production' ? 'https://agendaflow-production.up.railway.app' : `http://localhost:${PORT}`}/docs`,
    health: '/health',
  }
})

const gracefulShutdown = async () => {
  console.log('\n Iniciando shutdown...')
  
  try {
    await app.close()
    await prisma.$disconnect()
    console.log('✅ Servidor encerrado com sucesso')
    process.exit(0)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Erro no shutdown:', errorMessage)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

//  Inicializar servidor
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST })
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🚀 AgendaFlow API Server Running`)
    console.log(`${'='.repeat(60)}`)
    console.log(`📍 Address: http://${HOST}:${PORT}`)
    console.log(`📚 Docs: http://${HOST}:${PORT}/docs`)
    console.log(`💚 Health: http://${HOST}:${PORT}/health`)
    console.log(`📁 Static: ${path.join(process.cwd(), 'public')}`)
    console.log(`🌍 Environment: ${NODE_ENV}`)
    console.log(`🔗 Frontend: ${FRONTEND_URL}`)
    console.log(`🗄️  Database: Connected`)
    console.log(`${'='.repeat(60)}\n`)
  } catch (err: unknown) {
    console.error('❌ Erro ao iniciar servidor:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
