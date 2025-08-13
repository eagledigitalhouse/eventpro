import type { Participant } from "./types"

export interface QRCodeData {
  participantId: string
  eventId: string
  ticketType: string
  checkInCode: string
  orderNumber?: string
  timestamp: number
  hash: string
}

export class QRCodeService {
  // Gera um código único para check-in baseado no evento e participante
  static generateCheckInCode(eventName: string, participantId: string): string {
    // Extrai primeiras iniciais do nome do evento (máximo 3 caracteres)
    const eventInitials = eventName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 3)
      .padEnd(3, "X") // Preenche com X se necessário

    // Gera 5 caracteres aleatórios
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()

    return `${eventInitials}${random}`
  }

  // Cria os dados completos do QR Code
  static createQRData(participant: Participant, eventId: string, eventName: string, orderNumber?: string): QRCodeData {
    const checkInCode = this.generateCheckInCode(eventName, participant.id)
    const timestamp = Date.now()

    const dataString = `${participant.id}|${eventId}|${participant.ticketType}|${checkInCode}|${orderNumber || ""}|${timestamp}`

    // Gera hash de validação
    let hash = 0
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return {
      participantId: participant.id,
      eventId,
      ticketType: participant.ticketType,
      checkInCode,
      orderNumber,
      timestamp,
      hash: Math.abs(hash).toString(36).toUpperCase(),
    }
  }

  // Converte dados do QR para string
  static encodeQRData(qrData: QRCodeData): string {
    return JSON.stringify(qrData)
  }

  // Decodifica string do QR para dados
  static decodeQRData(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString)

      // Valida estrutura dos dados
      if (!data.participantId || !data.eventId || !data.checkInCode || !data.hash) {
        return null
      }

      return data as QRCodeData
    } catch {
      return null
    }
  }

  // Valida se o QR Code é válido
  static validateQRCode(qrData: QRCodeData): boolean {
    const dataString = `${qrData.participantId}|${qrData.eventId}|${qrData.ticketType}|${qrData.checkInCode}|${qrData.orderNumber || ""}|${qrData.timestamp}`

    let hash = 0
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    const expectedHash = Math.abs(hash).toString(36).toUpperCase()
    return expectedHash === qrData.hash
  }

  // Verifica se o QR Code não expirou (opcional - 24 horas)
  static isQRCodeExpired(qrData: QRCodeData, expirationHours = 24): boolean {
    const now = Date.now()
    const expirationTime = qrData.timestamp + expirationHours * 60 * 60 * 1000
    return now > expirationTime
  }

  // Extrai informações legíveis do código de check-in
  static parseCheckInCode(checkInCode: string): {
    eventInitials: string
    randomCode: string
  } | null {
    if (checkInCode.length !== 8) return null

    return {
      eventInitials: checkInCode.substring(0, 3),
      randomCode: checkInCode.substring(3, 8),
    }
  }
}
