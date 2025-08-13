"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useEventStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  MapPin,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalTicketsSold = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )

    const totalTicketsAvailable = events.reduce(
      (sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantityTotal, 0),
      0,
    )

    const totalCheckedIn = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
      0,
    )

    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(`${event.date}T${event.time}`)
      return eventDate > new Date()
    }).length

    const activeEvents = events.filter((event) => {
      const eventDate = new Date(`${event.date}T${event.time}`)
      const now = new Date()
      const dayAfter = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000)
      return eventDate <= now && now <= dayAfter
    }).length

    return {
      totalRevenue,
      totalTicketsSold,
      totalTicketsAvailable,
      totalCheckedIn,
      upcomingEvents,
      activeEvents,
      conversionRate: totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0,
      checkinRate: totalTicketsSold > 0 ? (totalCheckedIn / totalTicketsSold) * 100 : 0,
    }
  }, [events, orders])

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5).map((order) => {
      const event = events.find((e) => e.id === order.eventId)
      return { ...order, eventName: event?.name || "Evento não encontrado" }
    })
  }, [orders, events])

  const eventsWithStats = useMemo(() => {
    return events.map((event) => {
      const eventOrders = orders.filter((o) => o.eventId === event.id)
      const revenue = eventOrders.reduce((sum, o) => sum + o.total, 0)
      const ticketsSold = eventOrders.reduce(
        (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      )
      const totalTickets = event.tickets.reduce((sum, ticket) => sum + ticket.quantityTotal, 0)
      const checkedIn = eventOrders.reduce(
        (sum, o) =>
          sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
        0,
      )

      return {
        ...event,
        revenue,
        ticketsSold,
        totalTickets,
        checkedIn,
        checkinRate: ticketsSold > 0 ? (checkedIn / ticketsSold) * 100 : 0,
      }
    })
  }, [events, orders])

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-lg font-semibold">Painel</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Visão Geral</h2>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus eventos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{stats.totalTicketsSold} ingressos vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} próximos • {stats.activeEvents} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTicketsSold} de {stats.totalTicketsAvailable} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credenciamento</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkinRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCheckedIn} de {stats.totalTicketsSold} credenciados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Events Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Seus Eventos</h3>
            <Link href="/events/new">
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </Link>
          </div>

          {eventsWithStats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum evento criado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece criando seu primeiro evento para gerenciar ingressos e participantes
                </p>
                <Link href="/events/new">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Criar Primeiro Evento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventsWithStats.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={`/events/${event.id}/manage`}>
                    <div className="aspect-[16/9] w-full bg-muted relative overflow-hidden">
                      <img
                        alt={`Banner de ${event.name}`}
                        src={event.bannerUrl || "/placeholder.svg?height=360&width=640&query=banner%20evento"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Link>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2 text-lg leading-tight">{event.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">{event.ticketsSold}</div>
                        <div className="text-xs text-muted-foreground">Vendidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatCurrency(event.revenue)}</div>
                        <div className="text-xs text-muted-foreground">Receita</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ingressos</span>
                        <span>
                          {event.ticketsSold}/{event.totalTickets}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${event.totalTickets > 0 ? (event.ticketsSold / event.totalTickets) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {event.checkinRate.toFixed(0)}% credenciamento
                        </Badge>
                      </div>
                      <Link href={`/events/${event.id}/manage`}>
                        <Button size="sm" variant="outline">
                          Gerenciar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{order.eventName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.buyerName} • {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(order.total)}</div>
                      <Badge variant={order.paymentStatus === "pago" ? "default" : "secondary"} className="text-xs">
                        {order.paymentStatus === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
