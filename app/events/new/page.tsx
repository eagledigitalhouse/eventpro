"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MultiStepForm, useMultiStepForm } from "@/components/multi-step-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Calendar, MapPin, Settings, Edit, Check, X, Clock } from "lucide-react"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/format"

type EventFormData = {
  // Etapa 1: Informações Básicas
  name: string
  description: string
  date: string
  time: string
  endDate: string
  endTime: string
  location: string
  category: string
  bannerUrl?: string

  // Etapa 2: Ingressos
  tickets: Array<{
    name: string
    price: number
    quantityTotal: number
    description?: string
    saleStartDate?: string // Data início vendas
    saleEndDate?: string // Data fim vendas
    maxPerPurchase?: number // Limite por compra
    visibility: "publico" | "privado" // Visibilidade
    checkinTimeRestriction?: {
      // Restrição horário credenciamento
      enabled: boolean
      startTime?: string
      endTime?: string
    }
    isActive: boolean
  }>

  paymentSettings: {
    methods: {
      creditCard: boolean
      bankSlip: boolean
      pix: boolean
    }
    serviceFee: {
      percentage: number
      paidBy: "organizador" | "participante"
    }
  }

  // Etapa 4: Configurações Avançadas
  settings: {
    allowTransfers: boolean
    requireApproval: boolean
    showRemainingTickets: boolean
    enableWaitlist: boolean
  }
  status: "rascunho" | "publicado"
}

const initialData: EventFormData = {
  name: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  time: "09:00",
  endDate: new Date().toISOString().slice(0, 10),
  endTime: "18:00",
  location: "",
  category: "",
  bannerUrl: undefined,
  tickets: [],
  paymentSettings: {
    methods: {
      creditCard: true,
      bankSlip: false,
      pix: true,
    },
    serviceFee: {
      percentage: 10.0,
      paidBy: "participante",
    },
  },
  settings: {
    allowTransfers: true,
    requireApproval: false,
    showRemainingTickets: true,
    enableWaitlist: false,
  },
  status: "rascunho",
}

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createEvent = useEventStore((s) => s.createEvent)
  const validateEventData = useEventStore((s) => s.validateEventData)
  const { data, updateData, isLoading, setIsLoading } = useMultiStepForm(initialData)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null)
  const [ticketForm, setTicketForm] = useState({
    name: "",
    price: 0,
    quantityTotal: 0,
    description: "",
    saleStartDate: "",
    saleEndDate: "",
    maxPerPurchase: 5,
    visibility: "publico" as "publico" | "privado",
    checkinTimeRestriction: { enabled: false, startTime: "", endTime: "" },
    isActive: true,
  })

  const onBannerChange = (file?: File) => {
    if (!file) return updateData({ bannerUrl: undefined })
    const reader = new FileReader()
    reader.onload = (e) => updateData({ bannerUrl: String(e.target?.result) })
    reader.readAsDataURL(file)
  }

  const resetTicketForm = () => {
    setTicketForm({
      name: "",
      price: 0,
      quantityTotal: 0,
      description: "",
      saleStartDate: "",
      saleEndDate: "",
      maxPerPurchase: 5,
      visibility: "publico",
      checkinTimeRestriction: { enabled: false, startTime: "", endTime: "" },
      isActive: true,
    })
  }

  const startCreatingTicket = () => {
    resetTicketForm()
    setIsCreatingTicket(true)
    setEditingTicketIndex(null)
  }

  const startEditingTicket = (index: number) => {
    const ticket = data.tickets[index]
    setTicketForm({ ...ticket })
    setEditingTicketIndex(index)
    setIsCreatingTicket(true)
  }

  const saveTicket = () => {
    if (!ticketForm.name.trim()) {
      toast({ title: "Nome do ingresso é obrigatório", variant: "destructive" })
      return
    }
    if (ticketForm.quantityTotal <= 0) {
      toast({ title: "Quantidade deve ser maior que zero", variant: "destructive" })
      return
    }

    const newTickets = [...data.tickets]

    if (editingTicketIndex !== null) {
      // Editando ingresso existente
      newTickets[editingTicketIndex] = { ...ticketForm }
      toast({ title: "Ingresso atualizado com sucesso!" })
    } else {
      // Criando novo ingresso
      newTickets.push({ ...ticketForm })
      toast({ title: "Ingresso criado com sucesso!" })
    }

    updateData({ tickets: newTickets })
    setIsCreatingTicket(false)
    setEditingTicketIndex(null)
    resetTicketForm()
  }

  const cancelTicketForm = () => {
    setIsCreatingTicket(false)
    setEditingTicketIndex(null)
    resetTicketForm()
  }

  const removeTicket = (index: number) => {
    updateData({
      tickets: data.tickets.filter((_, i) => i !== index),
    })
    toast({ title: "Ingresso removido" })
  }

  const updatePaymentSettings = (updates: Partial<typeof data.paymentSettings>) => {
    updateData({
      paymentSettings: { ...data.paymentSettings, ...updates },
    })
  }

  const validateDates = () => {
    const errors: string[] = []
    const now = new Date()
    const eventStart = new Date(`${data.date}T${data.time}`)
    const eventEnd = new Date(`${data.endDate}T${data.endTime}`)

    // Validar se as datas não são passadas
    if (eventStart < now) {
      errors.push("A data de início do evento não pode ser no passado")
    }

    if (eventEnd < now) {
      errors.push("A data de fim do evento não pode ser no passado")
    }

    // Validar se data de fim é depois da data de início
    if (eventEnd <= eventStart) {
      errors.push("A data de fim deve ser posterior à data de início")
    }

    // Validar datas de vendas dos ingressos
    data.tickets.forEach((ticket, index) => {
      if (ticket.saleStartDate) {
        const saleStart = new Date(ticket.saleStartDate)
        if (saleStart < now) {
          errors.push(`Ingresso "${ticket.name}": Data de início das vendas não pode ser no passado`)
        }
        if (saleStart > eventStart) {
          errors.push(`Ingresso "${ticket.name}": Data de início das vendas não pode ser após o início do evento`)
        }
      }

      if (ticket.saleEndDate) {
        const saleEnd = new Date(ticket.saleEndDate)
        if (saleEnd < now) {
          errors.push(`Ingresso "${ticket.name}": Data de fim das vendas não pode ser no passado`)
        }
        if (saleEnd > eventStart) {
          errors.push(`Ingresso "${ticket.name}": Data de fim das vendas deve ser até o início do evento`)
        }
      }
    })

    return errors
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setValidationErrors([])

    try {
      // Adicionando validação antes de criar o evento
      const validation = validateEventData({
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        category: data.category,
        status: data.status,
        settings: data.settings,
        tickets: data.tickets.map((t) => ({
          name: t.name.trim() || "Ingresso",
          price: Number(t.price) || 0,
          quantityTotal: Math.max(0, Math.floor(Number(t.quantityTotal) || 0)),
          description: t.description,
          saleStartDate: t.saleStartDate,
          saleEndDate: t.saleEndDate,
          maxPerPurchase: t.maxPerPurchase,
          visibility: t.visibility,
          checkinTimeRestriction: t.checkinTimeRestriction,
          isActive: t.isActive,
          quantitySold: 0,
        })),
        paymentSettings: data.paymentSettings,
      })

      const dateErrors = validateDates()
      if (dateErrors.length > 0) {
        setValidationErrors(dateErrors)
        toast({ title: "Erro de validação", description: dateErrors[0], variant: "destructive" })
        setIsLoading(false)
        return
      }

      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast({ title: "Erro de validação", description: validation.errors[0], variant: "destructive" })
        return
      }

      const eventId = createEvent({
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        endDate: data.endDate,
        endTime: data.endTime,
        location: data.location,
        category: data.category,
        bannerUrl: data.bannerUrl,
        status: data.status,
        settings: data.settings,
        tickets: data.tickets.map((t) => ({
          name: t.name.trim() || "Ingresso",
          price: Number(t.price) || 0,
          quantityTotal: Math.max(0, Math.floor(Number(t.quantityTotal) || 0)),
          description: t.description,
          saleStartDate: t.saleStartDate,
          saleEndDate: t.saleEndDate,
          maxPerPurchase: t.maxPerPurchase,
          visibility: t.visibility,
          checkinTimeRestriction: t.checkinTimeRestriction,
          isActive: t.isActive,
        })),
        paymentSettings: data.paymentSettings,
      })

      toast({ title: "Evento criado com sucesso!" })
      router.push(`/events/${eventId}`)
    } catch (error) {
      toast({
        title: "Erro ao criar evento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      id: "basic-info",
      title: "Informações Básicas",
      description: "Configure as informações principais do seu evento",
      isValid: !!(data.name && data.date && data.time && data.endDate && data.endTime && data.location),
      validationErrors: validationErrors.filter(
        (err) =>
          err.includes("Nome") ||
          err.includes("Data") ||
          err.includes("Horário") ||
          err.includes("Local") ||
          err.includes("início") ||
          err.includes("fim"),
      ),
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome do Evento *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder="Ex: Meetup JavaScript 2024"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder="Descreva seu evento, o que os participantes podem esperar..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data de Início *</Label>
              <Input id="date" type="date" value={data.date} onChange={(e) => updateData({ date: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário de Início *</Label>
              <Input id="time" type="time" value={data.time} onChange={(e) => updateData({ time: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim *</Label>
              <Input
                id="endDate"
                type="date"
                value={data.endDate}
                onChange={(e) => updateData({ endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={data.endTime}
                onChange={(e) => updateData({ endTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={data.category} onValueChange={(value) => updateData({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="palestra">Palestra</SelectItem>
                  <SelectItem value="conferencia">Conferência</SelectItem>
                  <SelectItem value="seminario">Seminário</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="convencao">Convenção</SelectItem>
                  <SelectItem value="exposicao">Exposição</SelectItem>
                  <SelectItem value="feira-comercial">Feira Comercial</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="concerto">Concerto</SelectItem>
                  <SelectItem value="apresentacao">Apresentação</SelectItem>
                  <SelectItem value="competicao">Competição</SelectItem>
                  <SelectItem value="campeonato">Campeonato</SelectItem>
                  <SelectItem value="retiro">Retiro</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="lancamento-produto">Lançamento de Produto</SelectItem>
                  <SelectItem value="shows">Shows</SelectItem>
                  <SelectItem value="corrida">Corrida</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select value={data.status} onValueChange={(value: any) => updateData({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => updateData({ location: e.target.value })}
                placeholder="Endereço completo do evento"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="banner">Banner do Evento</Label>
              <Input id="banner" type="file" accept="image/*" onChange={(e) => onBannerChange(e.target.files?.[0])} />
              {data.bannerUrl ? (
                <img
                  src={data.bannerUrl || "/placeholder.svg"}
                  alt="Preview do banner"
                  className="mt-2 h-40 w-full rounded-md object-cover"
                />
              ) : (
                <div className="mt-2 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                  Nenhuma imagem selecionada. Um placeholder será usado.
                </div>
              )}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">Erros de validação:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "tickets",
      title: "Tipos de Ingresso",
      description: "Configure os lotes e preços dos ingressos",
      isValid: data.tickets.length > 0 && data.tickets.every((t) => t.name && t.quantityTotal > 0),
      validationErrors: validationErrors.filter((err) => err.includes("Lote") || err.includes("ingresso")),
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Lotes de Ingressos</h3>
              <p className="text-sm text-muted-foreground">
                Configure diferentes tipos de ingressos com preços, datas de venda e restrições
              </p>
            </div>
            {!isCreatingTicket && (
              <Button onClick={startCreatingTicket} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Lote
              </Button>
            )}
          </div>

          {isCreatingTicket && (
            <div className="border rounded-lg p-6 space-y-6 bg-card">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-lg">
                  {editingTicketIndex !== null ? "Editar Ingresso" : "Novo Ingresso"}
                </h4>
                <div className="flex gap-2">
                  <Button onClick={saveTicket} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Salvar Ingresso
                  </Button>
                  <Button onClick={cancelTicketForm} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nome do Ingresso *</Label>
                  <Input
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    placeholder="Ex: Lote Promocional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm({ ...ticketForm, price: Number(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={ticketForm.quantityTotal}
                    onChange={(e) => setTicketForm({ ...ticketForm, quantityTotal: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Período de Vendas</h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Início das Vendas</Label>
                    <Input
                      type="datetime-local"
                      value={ticketForm.saleStartDate || ""}
                      onChange={(e) => setTicketForm({ ...ticketForm, saleStartDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Término das Vendas</Label>
                    <Input
                      type="datetime-local"
                      value={ticketForm.saleEndDate || ""}
                      onChange={(e) => setTicketForm({ ...ticketForm, saleEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Configurações</h5>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Limite por Compra</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={ticketForm.maxPerPurchase || 5}
                      onChange={(e) => setTicketForm({ ...ticketForm, maxPerPurchase: Number(e.target.value) || 5 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Visibilidade *</Label>
                    <Select
                      value={ticketForm.visibility}
                      onValueChange={(value: "publico" | "privado") =>
                        setTicketForm({ ...ticketForm, visibility: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="privado">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={ticketForm.isActive}
                      onCheckedChange={(checked) => setTicketForm({ ...ticketForm, isActive: checked })}
                    />
                    <Label>Lote ativo</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ticketForm.checkinTimeRestriction?.enabled || false}
                    onCheckedChange={(checked) =>
                      setTicketForm({
                        ...ticketForm,
                        checkinTimeRestriction: {
                          ...ticketForm.checkinTimeRestriction,
                          enabled: checked,
                        },
                      })
                    }
                  />
                  <Label>Restringir horário para credenciamento neste lote</Label>
                </div>

                {ticketForm.checkinTimeRestriction?.enabled && (
                  <div className="grid gap-4 sm:grid-cols-2 pl-6">
                    <div className="space-y-2">
                      <Label>Horário Início</Label>
                      <Input
                        type="time"
                        value={ticketForm.checkinTimeRestriction?.startTime || ""}
                        onChange={(e) =>
                          setTicketForm({
                            ...ticketForm,
                            checkinTimeRestriction: {
                              ...ticketForm.checkinTimeRestriction,
                              startTime: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Horário Fim</Label>
                      <Input
                        type="time"
                        value={ticketForm.checkinTimeRestriction?.endTime || ""}
                        onChange={(e) =>
                          setTicketForm({
                            ...ticketForm,
                            checkinTimeRestriction: {
                              ...ticketForm.checkinTimeRestriction,
                              endTime: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={ticketForm.description || ""}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Descrição do lote, benefícios inclusos..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {data.tickets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-lg">Ingressos Configurados</h4>
                <div className="text-sm text-muted-foreground">
                  {data.tickets.length} {data.tickets.length === 1 ? "ingresso" : "ingressos"}
                </div>
              </div>

              <div className="grid gap-3">
                {data.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                        {/* Nome do Ingresso */}
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{ticket.name}</div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                ticket.visibility === "publico"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                              }`}
                            >
                              {ticket.visibility === "publico" ? "Público" : "Privado"}
                            </span>
                          </div>
                        </div>

                        {/* Valor */}
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-foreground">
                            {ticket.price === 0 ? (
                              <span className="text-green-600 dark:text-green-400">Gratuito</span>
                            ) : (
                              formatCurrency(ticket.price)
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Máx: {ticket.maxPerPurchase || 5} por compra
                          </div>
                        </div>

                        {/* Quantidade */}
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-foreground">{ticket.quantityTotal}</div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.quantityTotal === 1 ? "unidade" : "unidades"}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                          <div
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              ticket.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                ticket.isActive ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            {ticket.isActive ? "Ativo" : "Inativo"}
                          </div>
                          {ticket.checkinTimeRestriction?.enabled && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Check-in restrito
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingTicket(index)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicket(index)}
                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo dos ingressos */}
          {data.tickets.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Resumo</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total de ingressos:</span>
                  <span>{data.tickets.reduce((sum, t) => sum + t.quantityTotal, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço médio:</span>
                  <span>
                    {formatCurrency(data.tickets.reduce((sum, t) => sum + t.price, 0) / data.tickets.length || 0)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Receita potencial:</span>
                  <span>{formatCurrency(data.tickets.reduce((sum, t) => sum + t.price * t.quantityTotal, 0))}</span>
                </div>
              </div>
            </div>
          )}

          {data.tickets.length === 0 && !isCreatingTicket && (
            <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-12 w-12 mx-auto mb-2" />
                <p>Nenhum ingresso configurado</p>
                <p className="text-sm">Clique em "Adicionar Lote" para começar</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "payment",
      title: "Configuração de Pagamento",
      description: "Configure as formas de pagamento e taxas",
      isValid: Object.values(data.paymentSettings.methods).some((method) => method),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Formas de Pagamento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Cartão de Crédito</div>
                  <div className="text-sm text-muted-foreground">Aceitar pagamentos via cartão de crédito</div>
                </div>
                <Switch
                  checked={data.paymentSettings.methods.creditCard}
                  onCheckedChange={(checked) =>
                    updatePaymentSettings({
                      methods: { ...data.paymentSettings.methods, creditCard: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Boleto Bancário</div>
                  <div className="text-sm text-muted-foreground">Aceitar pagamentos via boleto bancário</div>
                </div>
                <Switch
                  checked={data.paymentSettings.methods.bankSlip}
                  onCheckedChange={(checked) =>
                    updatePaymentSettings({
                      methods: { ...data.paymentSettings.methods, bankSlip: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-sm text-muted-foreground">Aceitar pagamentos via PIX</div>
                </div>
                <Switch
                  checked={data.paymentSettings.methods.pix}
                  onCheckedChange={(checked) =>
                    updatePaymentSettings({
                      methods: { ...data.paymentSettings.methods, pix: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Taxa de Serviço</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Taxa de Serviço (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={data.paymentSettings.serviceFee.percentage}
                    onChange={(e) =>
                      updatePaymentSettings({
                        serviceFee: {
                          ...data.paymentSettings.serviceFee,
                          percentage: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pago por</Label>
                  <Select
                    value={data.paymentSettings.serviceFee.paidBy}
                    onValueChange={(value: "organizador" | "participante") =>
                      updatePaymentSettings({
                        serviceFee: { ...data.paymentSettings.serviceFee, paidBy: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organizador">Pago pelo Organizador</SelectItem>
                      <SelectItem value="participante">Pago pelo Participante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Resumo da Taxa</div>
                  <div className="text-blue-700">
                    Taxa de {data.paymentSettings.serviceFee.percentage}% será{" "}
                    {data.paymentSettings.serviceFee.paidBy === "organizador"
                      ? "descontada do valor recebido pelo organizador"
                      : "adicionada ao valor pago pelo participante"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Configurações Avançadas",
      description: "Configure opções adicionais para seu evento",
      isValid: true,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Configurações do Evento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Permitir transferência de ingressos</div>
                  <div className="text-sm text-muted-foreground">
                    Participantes podem transferir seus ingressos para outras pessoas
                  </div>
                </div>
                <Switch
                  checked={data.settings.allowTransfers}
                  onCheckedChange={(checked) =>
                    updateData({
                      settings: { ...data.settings, allowTransfers: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Mostrar ingressos restantes</div>
                  <div className="text-sm text-muted-foreground">
                    Exibir a quantidade de ingressos disponíveis na página do evento
                  </div>
                </div>
                <Switch
                  checked={data.settings.showRemainingTickets}
                  onCheckedChange={(checked) =>
                    updateData({
                      settings: { ...data.settings, showRemainingTickets: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Habilitar lista de espera</div>
                  <div className="text-sm text-muted-foreground">
                    Permitir inscrições quando os ingressos estiverem esgotados
                  </div>
                </div>
                <Switch
                  checked={data.settings.enableWaitlist}
                  onCheckedChange={(checked) =>
                    updateData({
                      settings: { ...data.settings, enableWaitlist: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Requer aprovação manual</div>
                  <div className="text-sm text-muted-foreground">
                    Todas as inscrições precisam ser aprovadas manualmente
                  </div>
                </div>
                <Switch
                  checked={data.settings.requireApproval}
                  onCheckedChange={(checked) =>
                    updateData({
                      settings: { ...data.settings, requireApproval: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Revisão e Confirmação",
      description: "Revise todas as informações antes de criar o evento",
      isValid: true,
      content: (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Informações Básicas</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{data.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Início:</span>
                <span>
                  {new Date(data.date).toLocaleDateString("pt-BR")} às {data.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Fim:</span>
                <span>
                  {new Date(data.endDate).toLocaleDateString("pt-BR")} às {data.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local:</span>
                <span>{data.location}</span>
              </div>
              {data.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="capitalize">{data.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{data.status === "rascunho" ? "Rascunho" : "Publicado"}</span>
              </div>
            </div>
          </div>

          {/* Ingressos */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Ingressos ({data.tickets.length} lotes)</h3>
            </div>
            <div className="space-y-3">
              {data.tickets.map((ticket, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{ticket.name}</span>
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {ticket.visibility === "publico" ? "Público" : "Privado"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(ticket.price)}</div>
                      <div className="text-sm text-muted-foreground">{ticket.quantityTotal} unidades</div>
                    </div>
                  </div>
                  {ticket.description && <div className="text-sm text-muted-foreground">{ticket.description}</div>}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {ticket.maxPerPurchase && <span>Máx: {ticket.maxPerPurchase} por compra</span>}
                    {ticket.checkinTimeRestriction?.enabled && (
                      <span>
                        Check-in: {ticket.checkinTimeRestriction.startTime} - {ticket.checkinTimeRestriction.endTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Configurações de Pagamento</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formas aceitas:</span>
                <span>
                  {[
                    data.paymentSettings.methods.creditCard && "Cartão",
                    data.paymentSettings.methods.bankSlip && "Boleto",
                    data.paymentSettings.methods.pix && "PIX",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de serviço:</span>
                <span>
                  {data.paymentSettings.serviceFee.percentage}% -{" "}
                  {data.paymentSettings.serviceFee.paidBy === "organizador" ? "Organizador" : "Participante"}
                </span>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Configurações Avançadas</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transferência de ingressos:</span>
                <span>{data.settings.allowTransfers ? "Permitida" : "Não permitida"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mostrar ingressos restantes:</span>
                <span>{data.settings.showRemainingTickets ? "Sim" : "Não"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lista de espera:</span>
                <span>{data.settings.enableWaitlist ? "Habilitada" : "Desabilitada"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aprovação manual:</span>
                <span>{data.settings.requireApproval ? "Necessária" : "Automática"}</span>
              </div>
            </div>
          </div>

          {/* Banner Preview */}
          {data.bannerUrl && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Banner do Evento</h3>
              <img
                src={data.bannerUrl || "/placeholder.svg"}
                alt="Banner do evento"
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <main className="px-4 py-8">
      <MultiStepForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={() => router.push("/dashboard")}
        showProgress={true}
        isLoading={isLoading}
      />
    </main>
  )
}
