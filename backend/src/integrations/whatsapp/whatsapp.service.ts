// backend/src/integrations/whatsapp/whatsapp.service.ts

export class WhatsappService {
  private apiUrl: string | undefined
  private apiToken: string | undefined

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL
    this.apiToken = process.env.WHATSAPP_API_TOKEN
  }

  /**
   * Envia mensagem via WhatsApp (Revolution API).
   * 
   * @param to - Número no formato E.164 (ex: 5511999999999)
   * @param message - Texto da mensagem
   */
  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.apiUrl || !this.apiToken) {
      console.warn(
        '⚠️ WhatsApp integration not configured (missing WHATSAPP_API_URL or WHATSAPP_API_TOKEN). Skipping message.'
      )
      return
    }

    try {
      console.log(`📲 Sending WhatsApp to ${to}: ${message.substring(0, 50)}...`)

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          // ⚠️ AJUSTE ESTE PAYLOAD quando tiver a doc da Revolution
          // Exemplo genérico (você vai trocar):
          to,
          message,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(
          `❌ Failed to send WhatsApp message: ${response.status} ${text}`
        )
      } else {
        console.log('✅ WhatsApp message sent successfully')
      }
    } catch (err) {
      console.error('❌ Error sending WhatsApp message:', err)
    }
  }

  /**
   * Formata uma mensagem de confirmação de agendamento.
   */
  formatAppointmentConfirmation(data: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    startTime: string
    endTime: string
  }): string {
    return [
      `Olá ${data.clientName}! 👋`,
      ``,
      `Seu agendamento foi confirmado:`,
      `🗓️ Data: ${data.date}`,
      `🕐 Horário: ${data.startTime} - ${data.endTime}`,
      `💼 Serviço: ${data.serviceName}`,
      `👤 Profissional: ${data.professionalName}`,
      ``,
      `Nos vemos em breve! 😊`,
    ].join('\n')
  }

  /**
   * Formata uma mensagem de lembrete de agendamento.
   */
  formatAppointmentReminder(data: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    startTime: string
    endTime: string
  }): string {
    return [
      `Olá ${data.clientName}! 👋`,
      ``,
      `Lembrete: você tem um agendamento amanhã!`,
      `🗓️ Data: ${data.date}`,
      `🕐 Horário: ${data.startTime} - ${data.endTime}`,
      `💼 Serviço: ${data.serviceName}`,
      `👤 Profissional: ${data.professionalName}`,
      ``,
      `Aguardamos você! 😊`,
    ].join('\n')
  }
}

export const whatsappService = new WhatsappService()
