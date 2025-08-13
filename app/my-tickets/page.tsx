"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TicketComponent } from "@/components/ticket-component"
import { useEventStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"
import {
  Calendar,
  Download,
  Search,
  Ticket,
  MapPin,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  History,
} from "lucide-react"

interface UserTicket {
  id: string
  code: string
  participantName: string
  participantEmail: string
  participantPhone?: string
  ticketTypeName: string
  price: number
  checkedIn: boolean
  checkedInAt?: number
  customFields?: Record<string, any>
  isManual?: boolean
  transferredFrom?: string
  eventId: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventBanner?: string
  orderId?: string
  orderDate?: number
  paymentStatus?: string
}

export default function MyTicketsPage() {
  const { events, orders } = useEventStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past" | "used" | "unused">("all")
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)

  // Mock user data - em produção viria do sistema de autenticação
  const currentUser = {
    id: "user-123",
    name: "João Silva",
    email: "joao@exemplo.com",
    phone: "(11) 99999-9999",
  }

  // Buscar todos os ingressos do usuário atual
  const userTickets = useMemo(() => {
    const tickets: UserTicket[] = []

    // Buscar ingressos de pedidos
    orders.forEach((order) => {
      // Verificar se o pedido é do usuário atual (por email)
      if (order.buyerEmail === currentUser.email) {
        const event = events.find((e) => e.id === order.eventId)
        if (!event) return

        order.items.forEach((item) => {
          item.attendees.forEach((attendee) => {
            tickets.push({
              id: attendee.id,
              code: attendee.code,
              participantName: attendee.name,
              participantEmail: attendee.email,
              participantPhone: attendee.phone,
              ticketTypeName: item.ticketName,
              price: item.unitPrice,
              checkedIn: attendee.checkedIn,
              checkedInAt: attendee.checkedInAt,
              customFields: attendee.customFields,
              transferredFrom: attendee.transferredFrom,
              eventId: event.id,
              eventName: event.name,
              eventDate: event.date,
              eventTime: event.time,
              eventLocation: event.location,
              eventBanner: event.bannerUrl,
              orderId: order.id,
              orderDate: order.createdAt,
              paymentStatus: order.paymentStatus,
            })
          })
        })
      }
    })

    return tickets.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
  }, [orders, events, currentUser.email])

  // Filtrar ingressos
  const filteredTickets = useMemo(() => {
    return userTickets.filter((ticket) => {
      const matchesSearch =
        ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.code.toLowerCase().includes(searchTerm.toLowerCase())

      const eventDate = new Date(`${ticket.eventDate}T${ticket.eventTime}`)
      const now = new Date()

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" && eventDate > now) ||
        (statusFilter === "past" && eventDate < now) ||
        (statusFilter === "used" && ticket.checkedIn) ||
        (statusFilter === "unused" && !ticket.checkedIn)

      return matchesSearch && matchesStatus
    })
  }, [userTickets, searchTerm, statusFilter])

  // Estatísticas
  const stats = useMemo(() => {
    const total = userTickets.length
    const upcoming = userTickets.filter((t) => new Date(`${t.eventDate}T${t.eventTime}`) > new Date()).length
    const used = userTickets.filter((t) => t.checkedIn).length
    const totalSpent = userTickets.reduce((sum, ticket) => sum + ticket.price, 0)

    return { total, upcoming, used, totalSpent }
  }, [userTickets])

  const handleViewTicket = (ticket: UserTicket) => {
    setSelectedTicket(ticket)
    setShowTicketModal(true)
  }

  const handleDownloadTicket = (ticket: UserTicket) => {
    // Implementar download do ingresso
    console.log("Download ticket:", ticket.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getEventStatus = (eventDate: string, eventTime: string, checkedIn: boolean) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    const now = new Date()

    if (eventDateTime < now) {
      return checkedIn ? "Participou" : "Perdeu"
    } else {
      return "Próximo"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Participou":
        return "default"
      case "Perdeu":
        return "destructive"
      case "Próximo":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Ingressos</h1>
        <p className="text-muted-foreground">Gerencie todos os seus ingressos e eventos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ingressos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Próximos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Participados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.used}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">Meus Ingressos</TabsTrigger>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="history">Histórico de Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por evento, nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Ingressos</SelectItem>
                  <SelectItem value="upcoming">Eventos Próximos</SelectItem>
                  <SelectItem value="past">Eventos Passados</SelectItem>
                  <SelectItem value="used">Ingressos Usados</SelectItem>
                  <SelectItem value="unused">Ingressos Não Usados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tickets Grid */}
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {userTickets.length === 0 ? "Nenhum ingresso encontrado" : "Nenhum resultado encontrado"}
                  </h3>
                  <p className="text-muted-foreground">
                    {userTickets.length === 0
                      ? "Você ainda não possui ingressos. Explore eventos disponíveis e faça sua primeira compra!"
                      : "Tente ajustar os filtros para encontrar seus ingressos."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket) => {
                const status = getEventStatus(ticket.eventDate, ticket.eventTime, ticket.checkedIn)
                const event = {
                  id: ticket.eventId,
                  name: ticket.eventName,
                  date: ticket.eventDate,
                  location: ticket.eventLocation,
                }

                return (
                  <Card
                    key={ticket.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="aspect-[16/9] w-full bg-muted relative overflow-hidden">
                      <img
                        alt={`Banner de ${ticket.eventName}`}
                        src={ticket.eventBanner || "/placeholder.svg?height=360&width=640&query=banner%20evento"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-white/90 text-black">
                          {ticket.ticketTypeName}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg leading-tight">{ticket.eventName}</CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(ticket.eventDate)} às {ticket.eventTime}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{ticket.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {ticket.participantName}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold">{formatCurrency(ticket.price)}</div>
                        <div className="flex items-center gap-2">
                          {ticket.checkedIn ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Usado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Válido
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        Código: <code className="bg-muted px-1 py-0.5 rounded">{ticket.code}</code>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleViewTicket(ticket)} className="flex-1">
                          Ver Ingresso
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadTicket(ticket)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <div className="mt-1 p-3 border rounded-lg bg-muted/50">{currentUser.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="mt-1 p-3 border rounded-lg bg-muted/50 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {currentUser.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <div className="mt-1 p-3 border rounded-lg bg-muted/50 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {currentUser.phone}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Estatísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Total de Ingressos</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Eventos Participados</span>
                      <span className="font-medium">{stats.used}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Investido</span>
                      <span className="font-medium">{formatCurrency(stats.totalSpent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Agrupar ingressos por pedido */}
              {Object.entries(
                userTickets.reduce(
                  (acc, ticket) => {
                    if (!ticket.orderId) return acc
                    if (!acc[ticket.orderId]) {
                      acc[ticket.orderId] = {
                        orderId: ticket.orderId,
                        orderDate: ticket.orderDate!,
                        paymentStatus: ticket.paymentStatus!,
                        tickets: [],
                        total: 0,
                      }
                    }
                    acc[ticket.orderId].tickets.push(ticket)
                    acc[ticket.orderId].total += ticket.price
                    return acc
                  },
                  {} as Record<string, any>,
                ),
              )
                .sort(([, a], [, b]) => b.orderDate - a.orderDate)
                .map(([orderId, order]) => (
                  <div key={orderId} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">Pedido #{orderId}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(order.orderDate).toLocaleTimeString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(order.total)}</div>
                        <Badge variant={order.paymentStatus === "pago" ? "default" : "secondary"}>
                          {order.paymentStatus === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.tickets.map((ticket: UserTicket) => (
                        <div key={ticket.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">{ticket.eventName}</span>
                            <span className="text-muted-foreground"> • {ticket.ticketTypeName}</span>
                          </div>
                          <span>{formatCurrency(ticket.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${showTicketModal ? "block" : "hidden"}`}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Meu Ingresso</h2>
              <Button variant="ghost" onClick={() => setShowTicketModal(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <TicketComponent
                event={{
                  id: selectedTicket.eventId,
                  name: selectedTicket.eventName,
                  date: selectedTicket.eventDate,
                  time: selectedTicket.eventTime,
                  location: selectedTicket.eventLocation,
                  description: "",
                  bannerUrl: selectedTicket.eventBanner,
                  tickets: [],
                  createdAt: 0,
                  updatedAt: 0,
                  status: "publicado",
                  settings: {
                    allowTransfers: false,
                    requireApproval: false,
                    showRemainingTickets: false,
                    enableWaitlist: false,
                  },
                }}
                ticket={{
                  id: selectedTicket.id,
                  code: selectedTicket.code,
                  participantName: selectedTicket.participantName,
                  participantEmail: selectedTicket.participantEmail,
                  participantPhone: selectedTicket.participantPhone,
                  ticketTypeName: selectedTicket.ticketTypeName,
                  price: selectedTicket.price,
                  checkedIn: selectedTicket.checkedIn,
                  checkedInAt: selectedTicket.checkedInAt,
                  customFields: selectedTicket.customFields,
                  isManual: selectedTicket.isManual,
                  transferredFrom: selectedTicket.transferredFrom,
                }}
                template="default"
                onDownload={() => handleDownloadTicket(selectedTicket)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
