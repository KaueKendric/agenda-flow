export class EmailService {
  private apiKey: string | undefined
  private from: string | undefined
  private apiUrl = 'https://api.resend.com/emails'

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY
    this.from = process.env.RESEND_FROM_EMAIL
  }

  private ensureConfigured() {
    if (!this.apiKey || !this.from) {
      console.warn(
        '⚠️ Email integration not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL). Skipping email.'
      )
      return false
    }
    return true
  }

  async sendEmail(params: {
    to: string
    subject: string
    text?: string
    html?: string
  }) {
    if (!this.ensureConfigured()) return

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: params.to,
          subject: params.subject,
          text: params.text,
          html: params.html,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(
          `❌ Failed to send email: ${res.status} ${res.statusText} - ${text}`
        )
      } else {
        console.log('✅ Email sent successfully to', params.to)
      }
    } catch (err) {
      console.error('❌ Error sending email:', err)
    }
  }

  formatAppointmentConfirmationText(data: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    startTime: string
    endTime: string
  }) {
    return [
      `Olá ${data.clientName},`,
      ``,
      `Seu agendamento foi criado com sucesso!`,
      ``,
      `Serviço: ${data.serviceName}`,
      `Profissional: ${data.professionalName}`,
      `Data: ${data.date}`,
      `Horário: ${data.startTime} - ${data.endTime}`,
      ``,
      `Obrigado por agendar com a AgendaFlow.`,
    ].join('\n')
  }

  formatAppointmentConfirmationHtml(data: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    startTime: string
    endTime: string
  }) {
    return `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <p>Olá <strong>${data.clientName}</strong>,</p>
        <p>Seu agendamento foi criado com sucesso!</p>
        <ul>
          <li><strong>Serviço:</strong> ${data.serviceName}</li>
          <li><strong>Profissional:</strong> ${data.professionalName}</li>
          <li><strong>Data:</strong> ${data.date}</li>
          <li><strong>Horário:</strong> ${data.startTime} - ${data.endTime}</li>
        </ul>
        <p>Obrigado por agendar com a <strong>AgendaFlow</strong>.</p>
      </div>
    `
  }
}

export const emailService = new EmailService()
