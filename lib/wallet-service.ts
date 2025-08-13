export interface WalletPassData {
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  participantName: string
  participantEmail: string
  ticketType: string
  ticketCode: string
  qrCode: string
  price?: number
  seatNumber?: string
  gateInfo?: string
  organizerName?: string
  organizerContact?: string
  backgroundColor?: string
  foregroundColor?: string
  labelColor?: string
  logoUrl?: string
  stripUrl?: string
  thumbnailUrl?: string
}

export interface ApplePassData {
  formatVersion: number
  passTypeIdentifier: string
  serialNumber: string
  teamIdentifier: string
  organizationName: string
  description: string
  logoText: string
  backgroundColor: string
  foregroundColor: string
  labelColor: string
  eventTicket: {
    primaryFields: Array<{
      key: string
      label: string
      value: string
    }>
    secondaryFields: Array<{
      key: string
      label: string
      value: string
    }>
    auxiliaryFields: Array<{
      key: string
      label: string
      value: string
    }>
    backFields: Array<{
      key: string
      label: string
      value: string
    }>
  }
  barcode: {
    message: string
    format: string
    messageEncoding: string
  }
  locations?: Array<{
    latitude: number
    longitude: number
    relevantText: string
  }>
  relevantDate?: string
}

export interface GooglePassData {
  iss: string
  aud: string
  typ: string
  iat: number
  payload: {
    eventTicketObjects: Array<{
      id: string
      classId: string
      state: string
      barcode: {
        type: string
        value: string
        alternateText: string
      }
      eventName: {
        defaultValue: {
          language: string
          value: string
        }
      }
      eventId: string
      seatInfo?: {
        seat: {
          defaultValue: {
            language: string
            value: string
          }
        }
        row: {
          defaultValue: {
            language: string
            value: string
          }
        }
        section: {
          defaultValue: {
            language: string
            value: string
          }
        }
        gate: {
          defaultValue: {
            language: string
            value: string
          }
        }
      }
      ticketHolderName: string
      ticketNumber: string
      ticketType: {
        defaultValue: {
          language: string
          value: string
        }
      }
      validTimeInterval: {
        start: {
          date: string
        }
        end: {
          date: string
        }
      }
    }>
  }
}

export class WalletService {
  // Detecta o tipo de dispositivo
  static detectDevice(): "ios" | "android" | "desktop" {
    if (typeof window === "undefined") return "desktop"

    const userAgent = window.navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "ios"
    }

    if (/android/.test(userAgent)) {
      return "android"
    }

    return "desktop"
  }

  // Verifica se o dispositivo suporta carteira digital
  static supportsWallet(): boolean {
    const device = this.detectDevice()
    return device === "ios" || device === "android"
  }

  // Gera dados do Apple Wallet Pass
  static generateApplePassData(passData: WalletPassData): ApplePassData {
    const eventDate = new Date(`${passData.eventDate} ${passData.eventTime}`)

    return {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.eventpass.ticket",
      serialNumber: passData.ticketCode,
      teamIdentifier: "EVENTPASS",
      organizationName: passData.organizerName || "EventPass",
      description: `Ingresso para ${passData.eventName}`,
      logoText: "EventPass",
      backgroundColor: passData.backgroundColor || "rgb(59, 130, 246)",
      foregroundColor: passData.foregroundColor || "rgb(255, 255, 255)",
      labelColor: passData.labelColor || "rgb(255, 255, 255)",
      eventTicket: {
        primaryFields: [
          {
            key: "event",
            label: "EVENTO",
            value: passData.eventName,
          },
        ],
        secondaryFields: [
          {
            key: "date",
            label: "DATA",
            value: eventDate.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            }),
          },
          {
            key: "time",
            label: "HORÁRIO",
            value: passData.eventTime,
          },
        ],
        auxiliaryFields: [
          {
            key: "location",
            label: "LOCAL",
            value: passData.eventLocation,
          },
          {
            key: "ticket-type",
            label: "TIPO",
            value: passData.ticketType,
          },
        ],
        backFields: [
          {
            key: "holder-name",
            label: "Nome do Participante",
            value: passData.participantName,
          },
          {
            key: "holder-email",
            label: "Email",
            value: passData.participantEmail,
          },
          {
            key: "ticket-code",
            label: "Código do Ingresso",
            value: passData.ticketCode,
          },
          {
            key: "organizer",
            label: "Organizador",
            value: passData.organizerName || "EventPass",
          },
          {
            key: "contact",
            label: "Contato",
            value: passData.organizerContact || "suporte@eventpass.com",
          },
          {
            key: "terms",
            label: "Termos",
            value: "Este ingresso é válido apenas para o evento especificado. Apresente na entrada.",
          },
        ],
      },
      barcode: {
        message: passData.qrCode,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
      relevantDate: eventDate.toISOString(),
    }
  }

  // Gera dados do Google Pay Pass
  static generateGooglePassData(passData: WalletPassData): GooglePassData {
    const eventDate = new Date(`${passData.eventDate} ${passData.eventTime}`)
    const eventEndDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000) // +4 horas

    return {
      iss: "eventpass@eventpass-service-account.iam.gserviceaccount.com",
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        eventTicketObjects: [
          {
            id: `${passData.ticketCode}-${Date.now()}`,
            classId: "eventpass.ticket.class",
            state: "ACTIVE",
            barcode: {
              type: "QR_CODE",
              value: passData.qrCode,
              alternateText: passData.ticketCode,
            },
            eventName: {
              defaultValue: {
                language: "pt-BR",
                value: passData.eventName,
              },
            },
            eventId: passData.ticketCode,
            ticketHolderName: passData.participantName,
            ticketNumber: passData.ticketCode,
            ticketType: {
              defaultValue: {
                language: "pt-BR",
                value: passData.ticketType,
              },
            },
            validTimeInterval: {
              start: {
                date: eventDate.toISOString().split("T")[0],
              },
              end: {
                date: eventEndDate.toISOString().split("T")[0],
              },
            },
          },
        ],
      },
    }
  }

  // Gera URL para adicionar ao Apple Wallet
  static async generateAppleWalletUrl(passData: WalletPassData): Promise<string> {
    try {
      const applePassData = this.generateApplePassData(passData)

      // Em produção, isso seria enviado para um servidor que gera o arquivo .pkpass
      // Por enquanto, simulamos a geração
      const response = await fetch("/api/generate-apple-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applePassData),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar passe do Apple Wallet")
      }

      const { passUrl } = await response.json()
      return passUrl
    } catch (error) {
      console.error("Erro ao gerar Apple Wallet URL:", error)
      // Fallback: retorna uma URL simulada
      return `data:application/vnd.apple.pkpass;base64,${btoa(JSON.stringify(passData))}`
    }
  }

  // Gera URL para adicionar ao Google Pay
  static async generateGooglePayUrl(passData: WalletPassData): Promise<string> {
    try {
      const googlePassData = this.generateGooglePassData(passData)

      // Em produção, isso seria assinado com JWT e enviado para Google Pay API
      const jwt = btoa(JSON.stringify(googlePassData))

      return `https://pay.google.com/gp/v/save/${jwt}`
    } catch (error) {
      console.error("Erro ao gerar Google Pay URL:", error)
      throw error
    }
  }

  // Adiciona ingresso à carteira digital
  static async addToWallet(passData: WalletPassData): Promise<{ success: boolean; error?: string }> {
    try {
      const device = this.detectDevice()

      if (device === "ios") {
        const passUrl = await this.generateAppleWalletUrl(passData)
        window.location.href = passUrl
        return { success: true }
      } else if (device === "android") {
        const passUrl = await this.generateGooglePayUrl(passData)
        window.open(passUrl, "_blank")
        return { success: true }
      } else {
        return {
          success: false,
          error: "Carteira digital não suportada neste dispositivo. Use um dispositivo móvel (iOS ou Android).",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido ao adicionar à carteira",
      }
    }
  }

  // Verifica se o ingresso já está na carteira (simulado)
  static async isInWallet(ticketCode: string): Promise<boolean> {
    // Em produção, isso verificaria se o passe já existe na carteira
    // Por enquanto, sempre retorna false
    return false
  }

  // Remove ingresso da carteira (simulado)
  static async removeFromWallet(ticketCode: string): Promise<boolean> {
    // Em produção, isso removeria o passe da carteira
    // Por enquanto, sempre retorna true
    return true
  }

  // Atualiza ingresso na carteira (para mudanças de horário, local, etc.)
  static async updateWalletPass(passData: WalletPassData): Promise<{ success: boolean; error?: string }> {
    try {
      // Em produção, isso enviaria uma atualização push para o passe
      console.log("Atualizando passe na carteira:", passData.ticketCode)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar passe na carteira",
      }
    }
  }
}
