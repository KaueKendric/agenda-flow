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

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido no arquivo .env')
}

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
})

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

app.register(authRoutes, { prefix: '/api/auth' })

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server Running on http://localhost:3333')
  console.log('Docs available at http://localhost:3333/docs')
})
