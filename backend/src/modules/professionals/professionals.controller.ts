import { FastifyRequest, FastifyReply } from 'fastify'
import { ProfessionalsService } from './professionals.service'
import { createProfessionalSchema, updateProfessionalSchema } from './professionals.schemas'

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
      const data = createProfessionalSchema.parse(request.body)
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
      const data = updateProfessionalSchema.parse(request.body)
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

  // ========== NOVOS ENDPOINTS PARA GERENCIAR SERVIÇOS ==========

  async linkService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { professionalId } = request.params as { professionalId: string }
      const { serviceId, customPrice } = request.body as { serviceId: string; customPrice?: number }

      const service = await this.service.linkService(professionalId, serviceId, customPrice)
      return reply.status(201).send(service)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao vincular serviço'
      return reply.status(400).send({ message })
    }
  }

  async unlinkService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { professionalId, serviceId } = request.params as { professionalId: string; serviceId: string }

      const result = await this.service.unlinkService(professionalId, serviceId)
      return reply.status(200).send(result)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao desvincular serviço'
      return reply.status(400).send({ message })
    }
  }

  async updateServicePrice(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { professionalId, serviceId } = request.params as { professionalId: string; serviceId: string }
      const { price } = request.body as { price: number }

      const service = await this.service.updateServicePrice(professionalId, serviceId, price)
      return reply.status(200).send(service)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar preço do serviço'
      return reply.status(400).send({ message })
    }
  }
}
