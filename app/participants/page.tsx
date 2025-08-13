"use client"

import { useState, useMemo } from "react"
import { Search, Users, Grid, List, Table, Eye, Mail, Edit, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ParticipantDetailsModal } from "@/components/participant-details-modal"
import { useEventStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"

type ViewMode = "cards" | "list" | "table"

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
  order?: any
  unitPrice?: number
  addedAt?: number
  isManual?: boolean
  eventId: string
  eventName: string
}

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [selectedTicketType, setSelectedTicketType] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { events, orders, manualParticipants, checkInByCode, generateTicketForParticipant } = useEventStore()

  // Combinar participantes de pedidos e manuais
  const allParticipants = useMemo(() => {
    const participants: ParticipantData[] = []

    // Participantes de pedidos
    orders.forEach((order) => {
      const event = events.find((e) => e.id === order.eventId)
      if (!event) return

      order.items.forEach((item) => {
        item.attendees.forEach((attendee) => {
          participants.push({
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            phone: attendee.phone,
            ticketTypeName: item.ticketName,
            checkedIn: attendee.checkedIn,
            checkedInAt: attendee.checkedInAt,
            code: attendee.code,
            qrCode: attendee.qrCode,
            orderNumber: attendee.orderNumber || order.orderNumber,
            customFields: attendee.customFields,
            order: order,
            unitPrice: item.unitPrice,
            isManual: false,
            eventId: order.eventId,
            eventName: event.name,
          })
        })
      })
    })

    // Participantes manuais
    manualParticipants.forEach((participant) => {
      const event = events.find((e) => e.id === participant.eventId)
      const ticketType = event?.tickets.find((t) => t.id === participant.ticketTypeId)
      if (!event || !ticketType) return

      participants.push({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        ticketTypeName: ticketType.name,
        checkedIn: participant.checkedIn,
        checkedInAt: participant.checkedInAt,
        code: participant.code,
        qrCode: participant.qrCode,
        customFields: participant.customFields,
        unitPrice: ticketType.price,
        addedAt: participant.addedAt,
        isManual: true,
        eventId: participant.eventId,
        eventName: event.name,
      })
    })

    return participants
  }, [orders, manualParticipants, events])

  // Filtrar participantes
  const filteredParticipants = useMemo(() => {
    return allParticipants.filter((participant) => {
      const matchesSearch =
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEvent = selectedEvent === "all" || participant.eventId === selectedEvent

      const matchesTicketType = selectedTicketType === "all" || participant.ticketTypeName === selectedTicketType

      return matchesSearch && matchesEvent && matchesTicketType
    })
  }, [allParticipants, searchTerm, selectedEvent, selectedTicketType])

  // Obter tipos de ingresso únicos para o evento selecionado
  const availableTicketTypes = useMemo(() => {
    if (selectedEvent === "all") {
      return [...new Set(allParticipants.map((p) => p.ticketTypeName))]
    }
    return [...new Set(allParticipants.filter((p) => p.eventId === selectedEvent).map((p) => p.ticketTypeName))]
  }, [allParticipants, selectedEvent])

  const handleViewParticipant = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setIsModalOpen(true)
  }

  const handleCheckIn = (participantId: string) => {
    const participant = allParticipants.find((p) => p.id === participantId)
    if (participant) {
      checkInByCode(participant.code, participant.eventId)
    }
  }

  const handleGenerateTicket = (participantId: string) => {
    const participant = allParticipants.find((p) => p.id === participantId)
    if (participant) {
      generateTicketForParticipant(participantId, participant.eventId)
    }
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
    return new Date(timestamp).toLocaleDateString("pt-BR")
  }

  const stats = {
    total: filteredParticipants.length,
    checkedIn: filteredParticipants.filter((p) => p.checkedIn).length,
    pending: filteredParticipants.filter((p) => !p.checkedIn).length,
    manual: filteredParticipants.filter((p) => p.isManual).length,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Participantes</h1>
          <p className="text-muted-foreground">Gerencie todos os participantes dos seus eventos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credenciados</CardTitle>
            <Badge variant="default" className="h-4 w-4 rounded-full p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manuais</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.manual}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTicketType} onValueChange={setSelectedTicketType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo de ingresso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {availableTicketTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParticipants.map((participant) => (
            <Card key={participant.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">{participant.email}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewParticipant(participant)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Reenviar ingresso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Evento:</span>
                  <span className="text-sm font-medium">{participant.eventName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ingresso:</span>
                  <Badge variant="outline">{participant.ticketTypeName}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                    {participant.checkedIn ? "Credenciado" : "Pendente"}
                  </Badge>
                </div>
                {participant.orderNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pedido:</span>
                    <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {participant.orderNumber}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredParticipants.map((participant) => (
                <div key={participant.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{participant.name}</div>
                        <div className="text-sm text-muted-foreground">{participant.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.eventName} • {participant.ticketTypeName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                        {participant.checkedIn ? "Credenciado" : "Pendente"}
                      </Badge>
                      {participant.orderNumber && (
                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {participant.orderNumber}
                        </code>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewParticipant(participant)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Reenviar ingresso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <TableComponent>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Ingresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.name}</div>
                          <div className="text-sm text-muted-foreground">{participant.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{participant.eventName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.ticketTypeName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                        {participant.checkedIn ? "Credenciado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {participant.orderNumber && (
                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {participant.orderNumber}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.unitPrice !== undefined && formatCurrency(participant.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewParticipant(participant)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Reenviar ingresso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
      )}

      {filteredParticipants.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum participante encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou aguarde novas inscrições.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <ParticipantDetailsModal
        participant={selectedParticipant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCheckIn={handleCheckIn}
        onGenerateTicket={handleGenerateTicket}
      />
    </div>
  )
}
