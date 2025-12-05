import { FastifyRequest, FastifyReply } from 'fastify'
import { ProfessionalsService } from './professionals.service'

// ✅ ADICIONAR 'export' aqui
export class ProfessionalsController {
  private service: ProfessionalsService

  constructor() {
    this.service = new ProfessionalsService()
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const professionals = await this.service.list()
      return reply.status(200).send(professionals)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar profissionais'
      return reply.status(400).send({ message })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const professional = await this.service.getById(id)
      return reply.status(200).send(professional)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar profissional'
      return reply.status(404).send({ message })
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as Parameters<ProfessionalsService['create']>[0]
      const professional = await this.service.create(data)
      return reply.status(201).send(professional)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar profissional'
      return reply.status(400).send({ message })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as Parameters<ProfessionalsService['update']>[1]
      const professional = await this.service.update(id, data)
      return reply.status(200).send(professional)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar profissional'
      return reply.status(400).send({ message })
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await this.service.remove(id)
      return reply.status(200).send({ message: 'Profissional removido com sucesso' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao remover profissional'
      return reply.status(400).send({ message })
    }
  }
}
