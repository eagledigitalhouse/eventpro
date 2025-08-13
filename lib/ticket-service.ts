"use client"

// Serviço para geração e download de ingressos
export interface TicketDownloadOptions {
  format: "pdf" | "png" | "jpg"
  quality?: number
  template?: "default" | "premium" | "minimal" | "corporate"
  includeQR?: boolean
  emailCopy?: boolean
  recipientEmail?: string
}

export interface QRCodeOptions {
  size: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  margin: number
  color: {
    dark: string
    light: string
  }
}

export class TicketService {
  private static instance: TicketService
  private downloadHistory: Array<{
    ticketId: string
    format: string
    timestamp: number
    success: boolean
  }> = []

  static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService()
    }
    return TicketService.instance
  }

  // Gerar QR Code real
  async generateQRCode(data: string, options: Partial<QRCodeOptions> = {}): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      size: 200,
      errorCorrectionLevel: "M",
      margin: 4,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      ...options,
    }

    try {
      // Usando uma implementação simples de QR Code
      // Em produção, você usaria uma biblioteca como 'qrcode'
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context not available")

      canvas.width = defaultOptions.size
      canvas.height = defaultOptions.size

      // Fundo branco
      ctx.fillStyle = defaultOptions.color.light
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Simular padrão QR Code (em produção usar biblioteca real)
      ctx.fillStyle = defaultOptions.color.dark
      const cellSize = Math.floor(defaultOptions.size / 25)

      // Padrão de exemplo (não é um QR Code real)
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
          }
        }
      }

      // Adicionar cantos de posicionamento
      this.drawPositionMarker(ctx, 0, 0, cellSize)
      this.drawPositionMarker(ctx, 18 * cellSize, 0, cellSize)
      this.drawPositionMarker(ctx, 0, 18 * cellSize, cellSize)

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
      return this.generateFallbackQR(defaultOptions.size)
    }
  }

  private drawPositionMarker(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
    // Desenhar marcador de posição 7x7
    ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize)
    ctx.fillStyle = "#000000"
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize)
  }

  private generateFallbackQR(size: number): string {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    canvas.width = size
    canvas.height = size

    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = "#333"
    ctx.font = "16px monospace"
    ctx.textAlign = "center"
    ctx.fillText("QR", size / 2, size / 2)

    return canvas.toDataURL("image/png")
  }

  // Download como PDF
  async downloadAsPDF(
    ticketElement: HTMLElement,
    filename: string,
    options: Partial<TicketDownloadOptions> = {},
  ): Promise<boolean> {
    try {
      const { default: html2canvas } = await import("html2canvas")
      const { default: jsPDF } = await import("jspdf")

      // Configurações de captura
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: ticketElement.offsetWidth,
        height: ticketElement.offsetHeight,
      })

      // Criar PDF
      const imgData = canvas.toDataURL("image/png", options.quality || 0.95)
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calcular dimensões para caber na página
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)
      pdf.save(filename)

      this.recordDownload(filename, "pdf", true)
      return true
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      this.recordDownload(filename, "pdf", false)
      return false
    }
  }

  // Download como imagem
  async downloadAsImage(
    ticketElement: HTMLElement,
    filename: string,
    format: "png" | "jpg" = "png",
    options: Partial<TicketDownloadOptions> = {},
  ): Promise<boolean> {
    try {
      const { default: html2canvas } = await import("html2canvas")

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: format === "jpg" ? "#ffffff" : null,
        logging: false,
      })

      // Converter para blob e fazer download
      canvas.toBlob(
        (blob) => {
          if (!blob) return

          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        },
        `image/${format}`,
        options.quality || 0.95,
      )

      this.recordDownload(filename, format, true)
      return true
    } catch (error) {
      console.error(`Erro ao gerar ${format.toUpperCase()}:`, error)
      this.recordDownload(filename, format, false)
      return false
    }
  }

  // Enviar por email
  async sendByEmail(ticketElement: HTMLElement, recipientEmail: string, ticketData: any): Promise<boolean> {
    try {
      // Gerar PDF em base64
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const pdfData = canvas.toDataURL("image/png")

      // Em produção, você enviaria para uma API de email
      // Por enquanto, simular o envio
      console.log("Enviando ingresso por email para:", recipientEmail)
      console.log("Dados do ingresso:", ticketData)
      console.log("PDF Data:", pdfData.substring(0, 100) + "...")

      // Simular delay de envio
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return true
    } catch (error) {
      console.error("Erro ao enviar por email:", error)
      return false
    }
  }

  // Compartilhar via Web Share API
  async shareTicket(ticketData: any, ticketElement?: HTMLElement): Promise<boolean> {
    if (!navigator.share) {
      // Fallback para clipboard
      return this.copyToClipboard(ticketData)
    }

    try {
      await navigator.share({
        title: `Ingresso - ${ticketData.eventName}`,
        text: `Meu ingresso para ${ticketData.eventName} - Código: ${ticketData.code}`,
        url: window.location.href,
      })
      return true
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
      return false
    }
  }

  // Copiar para clipboard
  private async copyToClipboard(ticketData: any): Promise<boolean> {
    try {
      const text = `Ingresso: ${ticketData.eventName}\nCódigo: ${ticketData.code}\nData: ${ticketData.eventDate}\nLocal: ${ticketData.eventLocation}`
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error("Erro ao copiar para clipboard:", error)
      return false
    }
  }

  // Registrar download no histórico
  private recordDownload(ticketId: string, format: string, success: boolean) {
    this.downloadHistory.push({
      ticketId,
      format,
      timestamp: Date.now(),
      success,
    })

    // Manter apenas os últimos 100 registros
    if (this.downloadHistory.length > 100) {
      this.downloadHistory = this.downloadHistory.slice(-100)
    }
  }

  // Obter histórico de downloads
  getDownloadHistory(): Array<{
    ticketId: string
    format: string
    timestamp: number
    success: boolean
  }> {
    return [...this.downloadHistory]
  }

  // Validar se o ingresso pode ser baixado
  canDownloadTicket(ticketData: any): { canDownload: boolean; reason?: string } {
    // Verificar se o ingresso é válido
    if (!ticketData.code) {
      return { canDownload: false, reason: "Código do ingresso inválido" }
    }

    // Verificar se o pagamento foi aprovado (se aplicável)
    if (ticketData.paymentStatus && ticketData.paymentStatus !== "pago") {
      return { canDownload: false, reason: "Pagamento pendente" }
    }

    return { canDownload: true }
  }

  // Gerar nome do arquivo
  generateFilename(ticketData: any, format: string): string {
    const eventName = ticketData.eventName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
    const code = ticketData.code.replace(/[^a-zA-Z0-9]/g, "")
    const timestamp = new Date().toISOString().split("T")[0]

    return `ingresso-${eventName}-${code}-${timestamp}.${format}`
  }
}

// Hook para usar o serviço de ingressos
export function useTicketService() {
  const service = TicketService.getInstance()

  const downloadTicket = async (
    ticketElement: HTMLElement,
    ticketData: any,
    options: Partial<TicketDownloadOptions> = {},
  ) => {
    const validation = service.canDownloadTicket(ticketData)
    if (!validation.canDownload) {
      throw new Error(validation.reason)
    }

    const format = options.format || "pdf"
    const filename = service.generateFilename(ticketData, format)

    if (format === "pdf") {
      return await service.downloadAsPDF(ticketElement, filename, options)
    } else {
      return await service.downloadAsImage(ticketElement, filename, format as "png" | "jpg", options)
    }
  }

  const generateQRCode = (data: string, options?: Partial<QRCodeOptions>) => {
    return service.generateQRCode(data, options)
  }

  const shareTicket = (ticketData: any, ticketElement?: HTMLElement) => {
    return service.shareTicket(ticketData, ticketElement)
  }

  const sendByEmail = (ticketElement: HTMLElement, email: string, ticketData: any) => {
    return service.sendByEmail(ticketElement, email, ticketData)
  }

  return {
    downloadTicket,
    generateQRCode,
    shareTicket,
    sendByEmail,
    getDownloadHistory: () => service.getDownloadHistory(),
  }
}
