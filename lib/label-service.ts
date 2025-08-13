import { QRCodeService, type QRCodeData } from "./qr-service"
import type { LabelTemplate, Participant } from "./types"

export interface LabelPrintData {
  participantId: string
  participantName: string
  participantEmail: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketType: string
  ticketCode: string
  qrCode: string
  qrData: QRCodeData
  checkinDate?: string
  checkinTime?: string
  stationName?: string
  customFields?: Record<string, any>
}

export class LabelService {
  // Gera dados para impressão de etiqueta com QR Code único
  static generateLabelData(
    participant: Participant,
    eventId: string,
    eventData: {
      name: string
      date: string
      time: string
      location: string
    },
    stationName?: string,
  ): LabelPrintData {
    // Usar o mesmo serviço de QR Code único dos ingressos
    const qrData = QRCodeService.createQRData(participant, eventId)
    const qrCodeString = QRCodeService.encodeQRData(qrData)

    const now = new Date()
    const checkinDate = now.toLocaleDateString("pt-BR")
    const checkinTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    return {
      participantId: participant.id,
      participantName: participant.name,
      participantEmail: participant.email,
      eventName: eventData.name,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventLocation: eventData.location,
      ticketType: participant.ticketType,
      ticketCode: participant.code,
      qrCode: qrCodeString,
      qrData,
      checkinDate,
      checkinTime,
      stationName: stationName || "Entrada Principal",
      customFields: participant.customFields,
    }
  }

  // Processa template de etiqueta com dados do participante
  static processLabelTemplate(template: LabelTemplate, labelData: LabelPrintData): string {
    let processedTemplate = template.template

    // Substituir variáveis básicas
    const replacements: Record<string, string> = {
      participantName: labelData.participantName,
      participantEmail: labelData.participantEmail,
      eventName: labelData.eventName,
      eventDate: labelData.eventDate,
      eventTime: labelData.eventTime,
      eventLocation: labelData.eventLocation,
      ticketType: labelData.ticketType,
      ticketCode: labelData.ticketCode,
      checkinDate: labelData.checkinDate || "",
      checkinTime: labelData.checkinTime || "",
      stationName: labelData.stationName || "",
    }

    // Substituir variáveis no template
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      processedTemplate = processedTemplate.replace(regex, value)
    })

    // Substituir QR Code com dados reais
    processedTemplate = processedTemplate.replace(
      /{{qrCode}}/g,
      `<div class="qr-code" data-qr="${labelData.qrCode}" style="width: 80px; height: 80px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px;">QR Code</div>`,
    )

    // Substituir campos personalizados se existirem
    if (labelData.customFields) {
      Object.entries(labelData.customFields).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g")
        processedTemplate = processedTemplate.replace(regex, String(value))
      })
    }

    return processedTemplate
  }

  // Gera múltiplas etiquetas para impressão em lote
  static generateBatchLabels(
    participants: Participant[],
    eventId: string,
    eventData: {
      name: string
      date: string
      time: string
      location: string
    },
    template: LabelTemplate,
    stationName?: string,
  ): Array<{ participantId: string; html: string; qrData: QRCodeData }> {
    return participants.map((participant) => {
      const labelData = this.generateLabelData(participant, eventId, eventData, stationName)
      const processedHtml = this.processLabelTemplate(template, labelData)

      return {
        participantId: participant.id,
        html: processedHtml,
        qrData: labelData.qrData,
      }
    })
  }

  // Valida se o QR Code escaneado é válido para o evento
  static validateScannedQR(
    qrString: string,
    eventId: string,
  ): {
    isValid: boolean
    participantId?: string
    eventId?: string
    error?: string
  } {
    try {
      const qrData = QRCodeService.decodeQRData(qrString)

      if (!qrData) {
        return { isValid: false, error: "QR Code inválido ou corrompido" }
      }

      if (!QRCodeService.validateQRCode(qrData)) {
        return { isValid: false, error: "QR Code com assinatura inválida" }
      }

      if (qrData.eventId !== eventId) {
        return { isValid: false, error: "QR Code não pertence a este evento" }
      }

      if (QRCodeService.isQRCodeExpired(qrData)) {
        return { isValid: false, error: "QR Code expirado" }
      }

      return {
        isValid: true,
        participantId: qrData.participantId,
        eventId: qrData.eventId,
      }
    } catch (error) {
      return { isValid: false, error: "Erro ao processar QR Code" }
    }
  }

  // Cria template padrão com QR Code integrado
  static createDefaultTemplate(): LabelTemplate {
    return {
      id: `template-default-${Date.now()}`,
      name: "Crachá Padrão com QR Code",
      description: "Template padrão para crachás com QR Code único",
      template: `
        <div style="
          width: 85mm; 
          height: 54mm; 
          border: 2px solid #3b82f6; 
          border-radius: 8px;
          padding: 4mm; 
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <div style="text-align: center;">
            <h2 style="margin: 0; font-size: 14px; color: #1e40af; font-weight: bold;">{{eventName}}</h2>
            <p style="margin: 2px 0; font-size: 10px; color: #64748b;">{{eventDate}} • {{eventTime}}</p>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1;">
              <h3 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: bold;">{{participantName}}</h3>
              <p style="margin: 2px 0; font-size: 11px; color: #64748b;">{{ticketType}}</p>
              <p style="margin: 2px 0; font-size: 9px; color: #94a3b8;">{{ticketCode}}</p>
              <div style="margin-top: 4px;">
                <p style="margin: 0; font-size: 8px; color: #64748b;">Check-in: {{checkinTime}}</p>
                <p style="margin: 0; font-size: 8px; color: #64748b;">{{stationName}}</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              {{qrCode}}
              <p style="margin: 2px 0; font-size: 7px; color: #94a3b8;">Escaneie para validar</p>
            </div>
          </div>
          
          <div style="text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 2mm;">
            <p style="margin: 0; font-size: 8px; color: #94a3b8;">{{eventLocation}}</p>
          </div>
        </div>
      `,
      variables: [
        "participantName",
        "participantEmail",
        "eventName",
        "eventDate",
        "eventTime",
        "eventLocation",
        "ticketType",
        "ticketCode",
        "qrCode",
        "checkinDate",
        "checkinTime",
        "stationName",
      ],
      dimensions: { width: 85, height: 54 },
      isDefault: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "system",
    }
  }
}
