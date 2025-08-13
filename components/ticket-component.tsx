"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useTicketService, type TicketDownloadOptions } from "@/lib/ticket-service"
import { AddToWalletButton } from "@/components/add-to-wallet-button"
import { QRCodeService } from "@/lib/qr-service"
import type { WalletPassData } from "@/lib/wallet-service"
import { Download, Calendar, MapPin, User, Ticket, QrCode, Share2, Printer, Send, Loader2, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import type { EventItem } from "@/lib/types"

interface TicketData {
  id: string
  code: string
  qrCode?: string // Adicionado QR Code único
  orderNumber?: string // Adicionado número do pedido
  participantName: string
  participantEmail: string
  participantPhone?: string
  ticketTypeName: string
  price?: number
  checkedIn: boolean
  checkedInAt?: number
  customFields?: Record<string, any>
  isManual?: boolean
  transferredFrom?: string
}

interface TicketComponentProps {
  event: EventItem
  ticket: TicketData
  showActions?: boolean
  onDownload?: () => void
  onShare?: () => void
  onPrint?: () => void
  className?: string
}

export function TicketComponent({
  event,
  ticket,
  showActions = true,
  onDownload,
  onShare,
  onPrint,
  className = "",
}: TicketComponentProps) {
  const { toast } = useToast()
  const ticketRef = useRef<HTMLDivElement>(null)
  const { downloadTicket, generateQRCode, shareTicket, sendByEmail } = useTicketService()

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Estados do diálogo de download
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "png" | "jpg">("pdf")
  const [downloadQuality, setDownloadQuality] = useState(0.95)

  // Estados do diálogo de email
  const [recipientEmail, setRecipientEmail] = useState("")

  useEffect(() => {
    const generateQR = async () => {
      setIsGeneratingQR(true)
      try {
        const participant = {
          id: ticket.id,
          name: ticket.participantName,
          email: ticket.participantEmail,
          phone: ticket.participantPhone,
          ticketType: ticket.ticketTypeName,
          code: ticket.code,
          qrCode: ticket.qrCode,
          orderNumber: ticket.orderNumber,
          checkedIn: ticket.checkedIn,
          checkedInAt: ticket.checkedInAt,
          customFields: ticket.customFields,
        }

        const qrData = QRCodeService.createQRData(participant, event.id, event.name, ticket.orderNumber)
        const qrCodeString = QRCodeService.encodeQRData(qrData)

        const qrUrl = await generateQRCode(qrCodeString, {
          size: 150,
          errorCorrectionLevel: "M",
          color: {
            dark: "#1e293b",
            light: "#ffffff",
          },
        })

        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error("Erro ao gerar QR Code:", error)
      } finally {
        setIsGeneratingQR(false)
      }
    }

    generateQR()
  }, [
    event.id,
    event.name,
    ticket.id,
    ticket.code,
    ticket.qrCode,
    ticket.orderNumber,
    ticket.participantName,
    ticket.ticketTypeName,
    generateQRCode,
  ])

  const walletPassData: WalletPassData = {
    eventName: event.name,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location,
    participantName: ticket.participantName,
    participantEmail: ticket.participantEmail,
    ticketType: ticket.ticketTypeName,
    ticketCode: ticket.qrCode || ticket.code, // Usa QR Code se disponível
    qrCode: qrCodeUrl,
    price: ticket.price,
    organizerName: event.organizerName || "EventPass",
    organizerContact: "suporte@eventpass.com",
    backgroundColor: "#3b82f6",
    foregroundColor: "#ffffff",
    labelColor: "#ffffff",
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const handleDownload = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    if (!ticketRef.current) {
      toast({ title: "Erro ao capturar ingresso", variant: "destructive" })
      return
    }

    setIsDownloading(true)
    try {
      const options: Partial<TicketDownloadOptions> = {
        format: downloadFormat,
        quality: downloadQuality,
        includeQR: true,
      }

      const success = await downloadTicket(ticketRef.current, ticket, options)

      if (success) {
        toast({ title: `Ingresso baixado como ${downloadFormat.toUpperCase()}!` })
        setShowDownloadDialog(false)
      } else {
        toast({ title: "Erro ao baixar ingresso", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: error.message || "Erro ao baixar ingresso", variant: "destructive" })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }

    try {
      const success = await shareTicket(ticket, ticketRef.current)
      if (success) {
        toast({ title: "Ingresso compartilhado!" })
      }
    } catch (error) {
      toast({ title: "Erro ao compartilhar ingresso", variant: "destructive" })
    }
  }

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      toast({ title: "Digite um email válido", variant: "destructive" })
      return
    }

    if (!ticketRef.current) {
      toast({ title: "Erro ao capturar ingresso", variant: "destructive" })
      return
    }

    setIsSending(true)
    try {
      const success = await sendByEmail(ticketRef.current, recipientEmail, ticket)

      if (success) {
        toast({ title: `Ingresso enviado para ${recipientEmail}!` })
        setShowEmailDialog(false)
        setRecipientEmail("")
      } else {
        toast({ title: "Erro ao enviar ingresso", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erro ao enviar ingresso", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div
        ref={ticketRef}
        className="relative bg-white shadow-2xl rounded-2xl overflow-hidden"
        style={{
          width: "210mm",
          minHeight: "297mm",
          maxWidth: "100%",
          margin: "0 auto",
          aspectRatio: "210/297",
        }}
      >
        {/* Header com gradiente elegante */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-12">
          {/* Padrão decorativo de fundo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-24 translate-y-24"></div>
          </div>

          <div className="relative z-10">
            {/* Status Badge e Códigos */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8" />
                <Badge
                  variant={ticket.checkedIn ? "default" : "secondary"}
                  className="text-sm font-semibold px-4 py-2 bg-white/20 text-white border-white/30"
                >
                  {ticket.checkedIn ? "CREDENCIADO" : "VÁLIDO"}
                </Badge>
                {ticket.isManual && (
                  <Badge variant="outline" className="text-sm bg-white/10 text-white border-white/30">
                    MANUAL
                  </Badge>
                )}
              </div>
              <div className="text-right space-y-2">
                {ticket.orderNumber && (
                  <div>
                    <p className="text-sm opacity-80">Nº do Pedido</p>
                    <p className="text-lg font-mono font-bold">{ticket.orderNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm opacity-80">Código do Ingresso</p>
                  <p className="text-xl font-mono font-bold">{ticket.qrCode || ticket.code}</p>
                </div>
              </div>
            </div>

            {/* Nome do Evento */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-4 leading-tight">{event.name}</h1>
              <p className="text-xl opacity-90 leading-relaxed">{event.description || "Evento especial"}</p>
            </div>

            {/* Informações do Evento em Grid */}
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl">
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-80 uppercase tracking-wide">Data</p>
                  <p className="text-lg font-semibold">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-80 uppercase tracking-wide">Horário</p>
                  <p className="text-lg font-semibold">{formatTime(event.time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl">
                  <MapPin className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-80 uppercase tracking-wide">Local</p>
                  <p className="text-lg font-semibold">{event.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador com efeito perfurado */}
        <div className="relative">
          <div className="h-px bg-gray-200 border-t border-dashed"></div>
          <div className="absolute left-0 top-0 w-6 h-6 bg-gray-100 rounded-full transform -translate-x-3 -translate-y-3"></div>
          <div className="absolute right-0 top-0 w-6 h-6 bg-gray-100 rounded-full transform translate-x-3 -translate-y-3"></div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-12 flex-1">
          <div className="grid grid-cols-2 gap-12 h-full">
            {/* Coluna Esquerda - Informações do Participante */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  Participante
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Nome Completo</p>
                    <p className="text-xl font-semibold text-gray-900">{ticket.participantName}</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Email</p>
                    <p className="text-lg text-gray-900">{ticket.participantEmail}</p>
                  </div>

                  {ticket.participantPhone && (
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Telefone</p>
                      <p className="text-lg text-gray-900">{ticket.participantPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de Ingresso */}
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
                <p className="text-sm text-blue-600 uppercase tracking-wide mb-2">Tipo de Ingresso</p>
                <p className="text-2xl font-bold text-blue-900">{ticket.ticketTypeName}</p>
                {ticket.price !== undefined && (
                  <p className="text-lg text-blue-700 mt-2">{formatCurrency(ticket.price)}</p>
                )}
              </div>

              {/* Observações do Produtor */}
              {event.ticketNotes && (
                <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                  <p className="text-sm text-amber-600 uppercase tracking-wide mb-2">Observações Importantes</p>
                  <p className="text-gray-900 leading-relaxed">{event.ticketNotes}</p>
                </div>
              )}
            </div>

            {/* Coluna Direita - QR Code e Detalhes */}
            <div className="flex flex-col items-center justify-center space-y-8">
              {/* QR Code Principal */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100">
                <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {isGeneratingQR ? (
                    <Loader2 className="h-16 w-16 animate-spin text-gray-400" />
                  ) : qrCodeUrl ? (
                    <img
                      src={qrCodeUrl || "/placeholder.svg"}
                      alt="QR Code do Ingresso"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Apresente este código na entrada</p>
                  <p className="text-lg font-mono font-bold text-gray-900 mt-2">{ticket.qrCode || ticket.code}</p>
                </div>
              </div>

              {/* Informações Adicionais */}
              {ticket.checkedIn && ticket.checkedInAt && (
                <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
                  <p className="text-sm text-green-600 uppercase tracking-wide mb-2">Credenciado em</p>
                  <p className="text-lg font-semibold text-green-900">
                    {new Date(ticket.checkedInAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}

              {/* Campos Personalizados */}
              {ticket.customFields && Object.keys(ticket.customFields).length > 0 && (
                <div className="w-full bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm text-gray-600 uppercase tracking-wide mb-4">Informações Adicionais</p>
                  <div className="space-y-3">
                    {Object.entries(ticket.customFields)
                      .filter(([key]) => !["name", "email", "phone"].includes(key.toLowerCase()))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/_/g, " ")
                              .trim()}
                            :
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">{event.organizerName || "EventPass"}</p>
              <p className="text-sm text-gray-600">Este ingresso é válido apenas para o evento especificado</p>
              <p className="text-sm text-gray-600">Apresente o código QR na entrada do evento</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
              <p className="text-sm text-gray-600">EventPass © 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <Button onClick={() => setShowDownloadDialog(true)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar Ingresso
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEmailDialog(true)}
            className="flex items-center gap-2 bg-transparent"
          >
            <Send className="h-4 w-4" />
            Enviar por Email
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <AddToWalletButton passData={walletPassData} variant="outline" className="bg-transparent" />
        </div>
      )}

      {/* Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar Ingresso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Formato</Label>
              <Select value={downloadFormat} onValueChange={(value: any) => setDownloadFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Recomendado para A4)</SelectItem>
                  <SelectItem value="png">PNG (Imagem)</SelectItem>
                  <SelectItem value="jpg">JPG (Imagem)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Qualidade</Label>
              <Select value={downloadQuality.toString()} onValueChange={(value) => setDownloadQuality(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.7">Baixa (menor arquivo)</SelectItem>
                  <SelectItem value="0.85">Média</SelectItem>
                  <SelectItem value="0.95">Alta (recomendado)</SelectItem>
                  <SelectItem value="1.0">Máxima</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleDownload} disabled={isDownloading} className="flex-1">
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Ingresso por Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email do destinatário</Label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSendEmail} disabled={isSending || !recipientEmail.trim()} className="flex-1">
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
