import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicesService } from './services.service'
import { createServiceSchema, updateServiceSchema } from './services.schemas'

export class ServicesController {
  private service: ServicesService

  constructor() {
    this.service = new ServicesService()
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { professionalId } = request.query as { professionalId?: string }
      const services = await this.service.list(professionalId)
      return reply.status(200).send(services)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar serviços'
      return reply.status(400).send({ message })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const service = await this.service.getById(id)
      return reply.status(200).send(service)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar serviço'
      return reply.status(404).send({ message })
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createServiceSchema.parse(request.body)
      const service = await this.service.create(data)
      return reply.status(201).send(service)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar serviço'
      return reply.status(400).send({ message })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateServiceSchema.parse(request.body)
      const service = await this.service.update(id, data)
      return reply.status(200).send(service)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar serviço'
      return reply.status(400).send({ message })
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await this.service.remove(id)
      return reply.status(200).send({ message: 'Serviço removido com sucesso' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao remover serviço'
      return reply.status(400).send({ message })
    }
  }
}
