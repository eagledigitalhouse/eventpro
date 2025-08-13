"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, CheckCircle, XCircle, QrCode, Clock, Edit, Save, X, Send } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import type { Order } from "@/lib/types"

interface ParticipantData {
  id: string
  name: string
  email: string
  phone?: string
  ticketTypeName: string
  checkedIn: boolean
  checkedInAt?: number
  code: string
  qrCode?: string
  orderNumber?: string
  customFields?: Record<string, any>
  order?: Order
  unitPrice?: number
  addedAt?: number
  isManual?: boolean
}

interface ParticipantDetailsModalProps {
  participant: ParticipantData | null
  isOpen: boolean
  onClose: () => void
  onCheckIn?: (participantId: string) => void
  onGenerateTicket?: (participantId: string) => void
  onUpdateParticipant?: (participantId: string, updates: Partial<ParticipantData>) => void // Adicionada função de atualização
  onResendTicket?: (participantId: string) => void // Adicionada função de reenvio
}

export function ParticipantDetailsModal({
  participant,
  isOpen,
  onClose,
  onCheckIn,
  onGenerateTicket,
  onUpdateParticipant, // Nova prop
  onResendTicket, // Nova prop
}: ParticipantDetailsModalProps) {
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Estado de edição
  const [isResending, setIsResending] = useState(false) // Estado de reenvio
  const [editData, setEditData] = useState<Partial<ParticipantData>>({}) // Dados de edição

  if (!participant) return null

  const handleCheckIn = () => {
    if (onCheckIn && !participant.checkedIn) {
      onCheckIn(participant.id)
    }
  }

  const handleGenerateTicket = async () => {
    if (onGenerateTicket) {
      setIsGeneratingTicket(true)
      try {
        await onGenerateTicket(participant.id)
      } finally {
        setIsGeneratingTicket(false)
      }
    }
  }

  const handleResendTicket = async () => {
    if (onResendTicket) {
      setIsResending(true)
      try {
        await onResendTicket(participant.id)
      } finally {
        setIsResending(false)
      }
    }
  }

  const handleStartEdit = () => {
    setEditData({
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      ticketTypeName: participant.ticketTypeName,
    })
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (onUpdateParticipant) {
      onUpdateParticipant(participant.id, editData)
    }
    setIsEditing(false)
    setEditData({})
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(participant.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{participant.name}</div>
                <div className="text-sm text-muted-foreground">
                  {participant.isManual ? "Participante Manual" : "Compra Online"}
                </div>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status do Credenciamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {participant.checkedIn ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Status do Credenciamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                    {participant.checkedIn ? "Credenciado" : "Pendente"}
                  </Badge>
                  {participant.checkedInAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Credenciado em: {formatDate(participant.checkedInAt)}
                    </p>
                  )}
                </div>
                {!participant.checkedIn && onCheckIn && (
                  <Button onClick={handleCheckIn} size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Credenciar Agora
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editData.phone || ""}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ticket">Tipo de Ingresso</Label>
                    <Input
                      id="edit-ticket"
                      value={editData.ticketTypeName || ""}
                      onChange={(e) => setEditData({ ...editData, ticketTypeName: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{participant.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{participant.email}</span>
                  </div>
                  {participant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{participant.phone}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Informações do Ingresso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informações do Ingresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo de Ingresso:</span>
                <Badge variant="outline">{participant.ticketTypeName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Código:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">{participant.code}</code>
              </div>
              {participant.qrCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">QR Code:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{participant.qrCode}</code>
                </div>
              )}
              {participant.orderNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nº do Pedido:</span>
                  <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                    {participant.orderNumber}
                  </code>
                </div>
              )}
              {participant.unitPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(participant.unitPrice)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {participant.customFields && Object.keys(participant.customFields).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(participant.customFields)
                  .filter(([key]) => !["name", "email", "phone"].includes(key.toLowerCase()))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-4">
                      <span className="text-sm text-muted-foreground capitalize min-w-0 flex-shrink-0">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/_/g, " ")
                          .trim()}
                        :
                      </span>
                      <span className="text-sm text-right break-words">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Informações da Compra (se aplicável) */}
          {participant.order && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pedido:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{participant.order.id}</code>
                </div>
                {participant.order.orderNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nº do Pedido:</span>
                    <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                      {participant.order.orderNumber}
                    </code>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data da Compra:</span>
                  <span className="text-sm">{formatDate(participant.order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status do Pagamento:</span>
                  <Badge variant={participant.order.paymentStatus === "pago" ? "default" : "secondary"}>
                    {participant.order.paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total do Pedido:</span>
                  <span className="font-medium">{formatCurrency(participant.order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data de Adição (para participantes manuais) */}
          {participant.isManual && participant.addedAt && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações de Cadastro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Adicionado em: {formatDate(participant.addedAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            {onResendTicket && (
              <Button
                onClick={handleResendTicket}
                disabled={isResending}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Reenviar Ingresso
                  </>
                )}
              </Button>
            )}
            {onGenerateTicket && (
              <Button onClick={handleGenerateTicket} disabled={isGeneratingTicket} className="flex-1">
                {isGeneratingTicket ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar Ingresso
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
