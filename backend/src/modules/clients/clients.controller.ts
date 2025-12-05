import { FastifyRequest, FastifyReply } from 'fastify'
import { ClientsService } from './clients.service'

export class ClientsController {
  private service: ClientsService

  constructor() {
    this.service = new ClientsService()
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clients = await this.service.list()
      return reply.status(200).send(clients)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar clientes'
      return reply.status(400).send({ message })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const client = await this.service.getById(id)
      return reply.status(200).send(client)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar cliente'
      return reply.status(404).send({ message })
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as Parameters<ClientsService['create']>[0]
      const client = await this.service.create(data)
      return reply.status(201).send(client)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar cliente'
      return reply.status(400).send({ message })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as Parameters<ClientsService['update']>[1]
      const client = await this.service.update(id, data)
      return reply.status(200).send(client)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar cliente'
      return reply.status(400).send({ message })
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await this.service.remove(id)
      return reply.status(200).send({ message: 'Cliente removido com sucesso' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao remover cliente'
      return reply.status(400).send({ message })
    }
  }
}
