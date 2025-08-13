"use client"

import { useEffect, useCallback } from "react"
import { useRouter, useParams, notFound } from "next/navigation"
import { MultiStepForm, useMultiStepForm } from "@/components/multi-step-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, MapPin, AlertTriangle, Ticket } from "lucide-react"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"

type EventEditData = {
  // Etapa 1: Informações Básicas
  name: string
  description: string
  date: string
  time: string
  location: string
  category: string
  status: "rascunho" | "publicado" | "cancelado" | "concluido"
  bannerUrl?: string
  organizerName?: string // Adicionado nome do produtor
  ticketNotes?: string // Adicionado observações do ingresso

  // Etapa 2: Ingressos
  tickets: Array<{
    id?: string
    name: string
    price: number
    quantityTotal: number
    description?: string
    isActive: boolean
    quantitySold?: number
  }>

  // Etapa 3: Configurações
  settings: {
    allowTransfers: boolean
    requireApproval: boolean
    showRemainingTickets: boolean
    enableWaitlist: boolean
  }
}

export default function EditEventPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const event = useEventStore((s) => s.events.find((e) => e.id === params?.id))
  const updateEvent = useEventStore((s) => s.updateEvent)

  const { data, updateData, setData } = useMultiStepForm<EventEditData>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    status: "publicado",
    bannerUrl: undefined,
    organizerName: "", // Inicializado nome do produtor
    ticketNotes: "", // Inicializado observações do ingresso
    tickets: [],
    settings: {
      allowTransfers: true,
      requireApproval: false,
      showRemainingTickets: true,
      enableWaitlist: false,
    },
  })

  const memoizedSetData = useCallback(setData, [setData])

  useEffect(() => {
    if (!event) return

    const eventData = {
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category || "",
      status: event.status,
      bannerUrl: event.bannerUrl,
      organizerName: event.organizerName || "", // Carregado nome do produtor
      ticketNotes: event.ticketNotes || "", // Carregado observações do ingresso
      tickets: event.tickets.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        quantityTotal: t.quantityTotal,
        description: t.description,
        isActive: t.isActive,
        quantitySold: t.quantitySold,
      })),
      settings: {
        ...event.settings,
      },
    }

    // Only update if data actually changed
    memoizedSetData(eventData)
  }, [event])

  if (!event) return notFound()

  const onBannerChange = (file?: File) => {
    if (!file) return updateData({ bannerUrl: undefined })
    const reader = new FileReader()
    reader.onload = (e) => updateData({ bannerUrl: String(e.target?.result) })
    reader.readAsDataURL(file)
  }

  const addTicket = () => {
    updateData({
      tickets: [
        ...data.tickets,
        {
          name: `Novo Lote ${data.tickets.length + 1}`,
          price: 100,
          quantityTotal: 50,
          isActive: true,
          quantitySold: 0,
        },
      ],
    })
  }

  const removeTicket = (index: number) => {
    const ticket = data.tickets[index]
    const soldCount = ticket.quantitySold || 0

    if (soldCount > 0) {
      toast({
        title: "Não é possível remover",
        description: `Este lote já tem ${soldCount} ingressos vendidos.`,
        variant: "destructive",
      })
      return
    }

    updateData({
      tickets: data.tickets.filter((_, i) => i !== index),
    })
  }

  const updateTicket = (index: number, updates: Partial<(typeof data.tickets)[0]>) => {
    const newTickets = [...data.tickets]
    newTickets[index] = { ...newTickets[index], ...updates }
    updateData({ tickets: newTickets })
  }

  const handleComplete = () => {
    // Validações finais
    if (!data.name || !data.date || !data.time || !data.location) {
      toast({ title: "Preencha todos os campos obrigatórios.", variant: "destructive" })
      return
    }

    if (data.tickets.length === 0) {
      toast({ title: "Adicione ao menos um tipo de ingresso.", variant: "destructive" })
      return
    }

    const updatedTickets = data.tickets.map((t) => {
      if (t.id) {
        const existingTicket = event.tickets.find((et) => et.id === t.id)
        return {
          ...t,
          id: t.id,
          quantitySold: existingTicket?.quantitySold || 0,
          accessControl: existingTicket?.accessControl,
        }
      }
      return {
        ...t,
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantitySold: 0,
      }
    })

    const success = updateEvent(event.id, {
      name: data.name,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      category: data.category,
      status: data.status,
      bannerUrl: data.bannerUrl,
      organizerName: data.organizerName, // Salvando nome do produtor
      ticketNotes: data.ticketNotes, // Salvando observações do ingresso
      tickets: updatedTickets,
      settings: data.settings,
    })

    if (success) {
      toast({ title: "Evento atualizado com sucesso!" })
      router.push(`/events/${event.id}`)
    }
  }

  const steps = [
    {
      id: "basic-info",
      title: "Informações Básicas",
      description: "Atualize as informações principais do evento",
      isValid: !!(data.name && data.date && data.time && data.location),
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
                placeholder="Descreva seu evento..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={data.date} onChange={(e) => updateData({ date: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input id="time" type="time" value={data.time} onChange={(e) => updateData({ time: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={data.category} onValueChange={(value) => updateData({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="negocios">Negócios</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="arte">Arte & Cultura</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={data.status} onValueChange={(value: any) => updateData({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Finalizado</SelectItem>
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
              <Label htmlFor="organizerName">Nome do Produtor/Organizador</Label>
              <Input
                id="organizerName"
                value={data.organizerName || ""}
                onChange={(e) => updateData({ organizerName: e.target.value })}
                placeholder="Nome da empresa ou pessoa responsável pelo evento"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="banner">Banner do Evento</Label>
              <Input id="banner" type="file" accept="image/*" onChange={(e) => onBannerChange(e.target.files?.[0])} />
              {data.bannerUrl && (
                <img
                  src={data.bannerUrl || "/placeholder.svg"}
                  alt="Banner do evento"
                  className="mt-2 h-40 w-full rounded-md object-cover"
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tickets",
      title: "Gerenciar Ingressos",
      description: "Configure os lotes e preços dos ingressos",
      isValid: data.tickets.length > 0 && data.tickets.every((t) => t.name && t.quantityTotal > 0),
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Lotes de Ingressos</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie os tipos de ingressos. Lotes com vendas não podem ser removidos.
              </p>
            </div>
            <Button onClick={addTicket} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Lote
            </Button>
          </div>

          <div className="space-y-4">
            {data.tickets.map((ticket, index) => {
              const soldCount = ticket.quantitySold || 0
              const hasRestrictions = soldCount > 0

              return (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Lote {index + 1}</h4>
                      {hasRestrictions && (
                        <Badge variant="secondary" className="text-xs">
                          {soldCount} vendidos
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTicket(index)}
                      disabled={hasRestrictions}
                      className="text-destructive hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {hasRestrictions && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Este lote tem {soldCount} ingressos vendidos. A quantidade não pode ser reduzida abaixo deste
                        valor.
                      </span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Nome do Lote *</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) => updateTicket(index, { name: e.target.value })}
                        placeholder="Ex: Lote Promocional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicket(index, { price: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        min={soldCount}
                        value={ticket.quantityTotal}
                        onChange={(e) => updateTicket(index, { quantityTotal: Number(e.target.value) || 0 })}
                      />
                      {hasRestrictions && (
                        <p className="text-xs text-muted-foreground">Mínimo: {soldCount} (já vendidos)</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Input
                      value={ticket.description || ""}
                      onChange={(e) => updateTicket(index, { description: e.target.value })}
                      placeholder="Descrição do lote..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={ticket.isActive}
                      onCheckedChange={(checked) => updateTicket(index, { isActive: checked })}
                    />
                    <Label>Lote ativo para vendas</Label>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border rounded-lg p-4 bg-blue-50/50">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Observações do Ingresso</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketNotes">Observações que aparecerão no ingresso</Label>
              <Textarea
                id="ticketNotes"
                value={data.ticketNotes || ""}
                onChange={(e) => updateData({ ticketNotes: e.target.value })}
                placeholder="Ex: Apresentar documento com foto na entrada. Evento sujeito a cancelamento por condições climáticas."
                rows={3}
                className="bg-white"
              />
              <p className="text-xs text-muted-foreground">
                Estas observações aparecerão destacadas no ingresso PDF de todos os participantes.
              </p>
            </div>
          </div>

          {/* Resumo dos ingressos */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Resumo Atual</h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between">
                <span>Total de ingressos:</span>
                <span>{data.tickets.reduce((sum, t) => sum + t.quantityTotal, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Já vendidos:</span>
                <span>{data.tickets.reduce((sum, t) => sum + (t.quantitySold || 0), 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Receita atual:</span>
                <span>{formatCurrency(data.tickets.reduce((sum, t) => sum + t.price * (t.quantitySold || 0), 0))}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Receita potencial:</span>
                <span>{formatCurrency(data.tickets.reduce((sum, t) => sum + t.price * t.quantityTotal, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Configurações Básicas",
      description: "Configure opções básicas para seu evento",
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
      title: "Revisão das Alterações",
      description: "Revise todas as modificações antes de salvar",
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
                <span className="text-muted-foreground">Data:</span>
                <span>
                  {new Date(data.date).toLocaleDateString("pt-BR")} às {data.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local:</span>
                <span>{data.location}</span>
              </div>
              {data.organizerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organizador:</span>
                  <span>{data.organizerName}</span>
                </div>
              )}
              {data.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="capitalize">{data.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={data.status === "publicado" ? "default" : "secondary"}>
                  {data.status === "rascunho"
                    ? "Rascunho"
                    : data.status === "publicado"
                      ? "Publicado"
                      : data.status === "cancelado"
                        ? "Cancelado"
                        : "Finalizado"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ingressos */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Ingressos ({data.tickets.length} lotes)</h3>
            </div>
            <div className="space-y-2">
              {data.tickets.map((ticket, index) => {
                const soldCount = ticket.quantitySold || 0
                return (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ticket.name}</span>
                      {soldCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {soldCount} vendidos
                        </Badge>
                      )}
                      {!ticket.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(ticket.price)}</div>
                      <div className="text-sm text-muted-foreground">{ticket.quantityTotal} unidades</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {data.ticketNotes && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm font-medium text-amber-800 mb-1">Observações do Ingresso:</p>
                <p className="text-sm text-amber-700">{data.ticketNotes}</p>
              </div>
            )}
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
      <div className="mb-6 flex items-center gap-4 max-w-4xl mx-auto">
        <Link href={`/events/${event.id}`}>
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Editar Evento</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>
      </div>

      <MultiStepForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={() => router.push(`/events/${event.id}`)}
        showProgress={true}
      />
    </main>
  )
}
