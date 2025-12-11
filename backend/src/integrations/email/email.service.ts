import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export class EmailService {
  private transporter: Transporter | null = null
  private from: string | undefined
  private configured = false

  constructor() {
    this.from = process.env.EMAIL_FROM
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const host = process.env.EMAIL_HOST
    const port = process.env.EMAIL_PORT
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    if (!host || !port || !user || !pass || !this.from) {
      console.warn(
        '⚠️ Email integration not configured (missing EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, or EMAIL_FROM). Skipping email.'
      )
      this.configured = false
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465, 
        auth: {
          user,
          pass,
        },
      })

      this.configured = true
      console.log('✅ Email service configured successfully')
    } catch (error) {
      console.error('❌ Failed to configure email service:', error)
      this.configured = false
    }
  }

  private ensureConfigured(): boolean {
    if (!this.configured || !this.transporter) {
      console.warn('⚠️ Email service not configured. Skipping email.')
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
    if (!this.ensureConfigured() || !this.transporter) return

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      })

      console.log('✅ Email sent successfully to', params.to)
      console.log('📧 Message ID:', info.messageId)
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Agendamento Confirmado</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                      Olá <strong style="color: #667eea;">${data.clientName}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
                      Seu agendamento foi criado com sucesso! 🎉
                    </p>
                    
                    <!-- Appointment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea; font-size: 14px;">📋 Serviço:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.serviceName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #667eea; font-size: 14px;">👤 Profissional:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.professionalName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #667eea; font-size: 14px;">📅 Data:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #667eea; font-size: 14px;">🕒 Horário:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.startTime} - ${data.endTime}</span>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 0;">
                      Obrigado por agendar com a <strong style="color: #667eea;">AgendaFlow</strong>. 💜
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 12px; color: #999999; margin: 0;">
                      Este é um email automático. Por favor, não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  // FUNÇÃO PARA LEMBRETES 
  formatAppointmentReminderText(data: {
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
      `⏰ Lembrete: Você tem um agendamento hoje!`,
      ``,
      `Serviço: ${data.serviceName}`,
      `Profissional: ${data.professionalName}`,
      `Data: ${data.date}`,
      `Horário: ${data.startTime} - ${data.endTime}`,
      ``,
      `Não esqueça! Nos vemos em breve.`,
      ``,
      `AgendaFlow`,
    ].join('\n')
  }

  formatAppointmentReminderHtml(data: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    startTime: string
    endTime: string
  }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Lembrete de Agendamento</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                      Olá <strong style="color: #f5576c;">${data.clientName}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
                      Este é um lembrete do seu agendamento! ⏰
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff5f5; border-radius: 8px; padding: 20px; margin: 0 0 30px 0; border-left: 4px solid #f5576c;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c; font-size: 14px;">📋 Serviço:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.serviceName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c; font-size: 14px;">👤 Profissional:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.professionalName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c; font-size: 14px;">📅 Data:</strong><br>
                          <span style="color: #333333; font-size: 16px;">${data.date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c; font-size: 14px;">🕒 Horário:</strong><br>
                          <span style="color: #333333; font-size: 18px; font-weight: bold;">${data.startTime} - ${data.endTime}</span>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 0;">
                      Não esqueça! Nos vemos em breve. 💜
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 12px; color: #999999; margin: 0;">
                      AgendaFlow - Sistema de Agendamentos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }
}

export const emailService = new EmailService()
