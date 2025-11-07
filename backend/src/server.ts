import { fastify } from 'fastify'
import { 
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider
 } from 'fastify-type-provider-zod'
 import { fastifySwagger } from '@fastify/swagger'
 import { fastifyCors } from '@fastify/cors'
 import ScalarApiReference from '@scalar/fastify-api-reference'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors,
  {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'AgendaFlow API',
      description: 'API for AgendaFlow',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server Running on http://localhost:3333')
  console.log('Docs available at http://localhost:3333/docs')
})
