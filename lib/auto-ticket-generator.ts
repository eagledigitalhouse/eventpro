import { QRCodeService, type QRCodeData } from "./qr-service"
import { TicketTemplateService, type TicketTemplate } from "./ticket-templates"
import type { EventItem, Order } from "./types"

export interface AutoTicketConfig {
  eventId: string
  templateId?: string
  customTemplate?: TicketTemplate
  autoEmail: boolean
  emailTemplate?: string
  generateOnPurchase: boolean
  generateOnCheckIn: boolean
}

export interface GeneratedTicket {
  participantId: string
  ticketId: string
  qrCode: string
  qrData: QRCodeData
  pdfUrl?: string
  emailSent: boolean
  generatedAt: number
}

export class AutoTicketGenerator {
  // Gera ingressos automaticamente após finalização da compra
  static async generateTicketsForOrder(
    order: Order,
    event: EventItem,
    config: AutoTicketConfig,
  ): Promise<GeneratedTicket[]> {
    if (!config.generateOnPurchase) {
      return []
    }

    const generatedTickets: GeneratedTicket[] = []

    try {
      // Obter template do evento
      const template = config.customTemplate || TicketTemplateService.getTemplate(config.templateId || "default")
      if (!template) {
        throw new Error("Template não encontrado")
      }

      // Gerar ingresso para cada participante
      for (const item of order.items) {
        for (const attendee of item.attendees) {
          const participant = {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            phone: attendee.phone,
            ticketType: item.ticketName,
            customFields: attendee.customFields,
          }

          // Gerar QR Code único
          const qrData = QRCodeService.createQRData(participant, event.id)
          const qrCodeString = QRCodeService.encodeQRData(qrData)

          // Criar dados do ingresso
          const ticketData = {
            id: attendee.id,
            code: attendee.code,
            participantName: attendee.name,
            participantEmail: attendee.email,
            participantPhone: attendee.phone,
            ticketTypeName: item.ticketName,
            price: item.unitPrice,
            checkedIn: false,
            customFields: attendee.customFields,
          }

          // Gerar PDF do ingresso (simulado - em produção usaria biblioteca real)
          const pdfUrl = await this.generateTicketPDF(event, ticketData, template, qrCodeString)

          // Enviar por email se configurado
          let emailSent = false
          if (config.autoEmail) {
            emailSent = await this.sendTicketByEmail(attendee.email, attendee.name, event, pdfUrl, config.emailTemplate)
          }

          generatedTickets.push({
            participantId: attendee.id,
            ticketId: attendee.code,
            qrCode: qrCodeString,
            qrData,
            pdfUrl,
            emailSent,
            generatedAt: Date.now(),
          })
        }
      }

      return generatedTickets
    } catch (error) {
      console.error("Erro ao gerar ingressos automaticamente:", error)
      throw error
    }
  }

  // Gera PDF do ingresso (simulado)
  private static async generateTicketPDF(
    event: EventItem,
    ticketData: any,
    template: TicketTemplate,
    qrCode: string,
  ): Promise<string> {
    // Em produção, aqui seria usado uma biblioteca como jsPDF ou Puppeteer
    // Por enquanto, retornamos uma URL simulada
    const filename = `ticket-${ticketData.code}-${Date.now()}.pdf`

    // Simular geração de PDF
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return `/generated-tickets/${filename}`
  }

  // Envia ingresso por email (simulado)
  private static async sendTicketByEmail(
    email: string,
    name: string,
    event: EventItem,
    pdfUrl: string,
    emailTemplate?: string,
  ): Promise<boolean> {
    try {
      // Em produção, aqui seria integrado com serviço de email (SendGrid, etc.)
      console.log(`Enviando ingresso para ${email}:`, {
        to: email,
        subject: `Seu ingresso para ${event.name}`,
        template: emailTemplate || "default",
        attachments: [pdfUrl],
      })

      // Simular envio de email
      await new Promise((resolve) => setTimeout(resolve, 500))

      return true
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      return false
    }
  }

  // Configura geração automática para um evento
  static setAutoTicketConfig(eventId: string, config: Partial<AutoTicketConfig>): AutoTicketConfig {
    const defaultConfig: AutoTicketConfig = {
      eventId,
      templateId: "default",
      autoEmail: true,
      generateOnPurchase: true,
      generateOnCheckIn: false,
    }

    return { ...defaultConfig, ...config }
  }

  // Gera ingresso individual (para casos específicos)
  static async generateSingleTicket(
    participantId: string,
    eventId: string,
    config: AutoTicketConfig,
  ): Promise<GeneratedTicket | null> {
    try {
      // Aqui seria integrado com o store para buscar dados do participante
      // Por enquanto, retornamos null para implementação futura
      return null
    } catch (error) {
      console.error("Erro ao gerar ingresso individual:", error)
      return null
    }
  }

  // Reenviar ingresso por email
  static async resendTicket(participantId: string, eventId: string, email?: string): Promise<boolean> {
    try {
      // Implementação futura para reenvio de ingressos
      return true
    } catch (error) {
      console.error("Erro ao reenviar ingresso:", error)
      return false
    }
  }
}
