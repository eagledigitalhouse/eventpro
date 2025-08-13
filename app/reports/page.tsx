"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/format"
import { Download, TrendingUp, Users, DollarSign, FileText } from "lucide-react"

export default function ReportsPage() {
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)

  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("30")

  const filteredData = useMemo(() => {
    const now = Date.now()
    const rangeMs = Number.parseInt(timeRange) * 24 * 60 * 60 * 1000
    const startDate = now - rangeMs

    let filteredOrders = orders.filter((o) => o.createdAt >= startDate)
    let filteredEvents = events

    if (selectedEventId !== "all") {
      filteredOrders = filteredOrders.filter((o) => o.eventId === selectedEventId)
      filteredEvents = events.filter((e) => e.id === selectedEventId)
    }

    return { orders: filteredOrders, events: filteredEvents }
  }, [orders, events, selectedEventId, timeRange])

  const stats = useMemo(() => {
    const { orders: filteredOrders, events: filteredEvents } = filteredData

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
    const totalTicketsSold = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const totalCheckedIn = filteredOrders.reduce(
      (sum, o) =>
        sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
      0,
    )
    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0
    const checkinRate = totalTicketsSold > 0 ? (totalCheckedIn / totalTicketsSold) * 100 : 0

    // Vendas por dia
    const salesByDay = filteredOrders.reduce(
      (acc, order) => {
        const date = new Date(order.createdAt).toISOString().slice(0, 10)
        if (!acc[date]) acc[date] = { revenue: 0, tickets: 0, orders: 0 }
        acc[date].revenue += order.total
        acc[date].tickets += order.items.reduce((sum, item) => sum + item.quantity, 0)
        acc[date].orders += 1
        return acc
      },
      {} as Record<string, { revenue: number; tickets: number; orders: number }>,
    )

    // Top eventos
    const eventStats = filteredEvents
      .map((event) => {
        const eventOrders = filteredOrders.filter((o) => o.eventId === event.id)
        const revenue = eventOrders.reduce((sum, o) => sum + o.total, 0)
        const tickets = eventOrders.reduce(
          (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0,
        )
        const checkedIn = eventOrders.reduce(
          (sum, o) =>
            sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
          0,
        )
        return { ...event, revenue, tickets, checkedIn }
      })
      .sort((a, b) => b.revenue - a.revenue)

    return {
      totalRevenue,
      totalTicketsSold,
      totalCheckedIn,
      averageOrderValue,
      checkinRate,
      totalOrders: filteredOrders.length,
      totalEvents: filteredEvents.length,
      salesByDay,
      eventStats,
    }
  }, [filteredData])

  const exportCSV = () => {
    const { orders: filteredOrders } = filteredData

    const csvData = filteredOrders.flatMap((order) => {
      const event = events.find((e) => e.id === order.eventId)
      return order.items.flatMap((item) =>
        item.attendees.map((attendee) => ({
          "ID do Pedido": order.id,
          Evento: event?.name || "N/A",
          Comprador: order.buyerName,
          Email: order.buyerEmail,
          "Tipo de Ingresso": item.ticketName,
          Preço: item.unitPrice,
          "Código do Ingresso": attendee.code,
          Credenciamento: attendee.checkedIn ? "Sim" : "Não",
          "Data Credenciamento": attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString("pt-BR") : "",
          "Data da Compra": new Date(order.createdAt).toLocaleString("pt-BR"),
          "Status Pagamento":
            order.paymentStatus === "pago"
              ? "Pago"
              : order.paymentStatus === "pendente"
                ? "Pendente"
                : order.paymentStatus === "falhou"
                  ? "Falhou"
                  : "Reembolsado",
        })),
      )
    })

    if (csvData.length === 0) {
      alert("Nenhum dado para exportar")
      return
    }

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-eventos-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada de vendas e performance</p>
        </div>
        <Button onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecionar evento" />
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

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de estatísticas */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalOrders} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">{stats.totalCheckedIn} credenciados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Credenciamento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Participação efetiva</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vendas por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.salesByDay).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhuma venda no período selecionado</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.salesByDay)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 10)
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{new Date(date).toLocaleDateString("pt-BR")}</div>
                        <div className="text-xs text-muted-foreground">
                          {data.orders} pedidos • {data.tickets} ingressos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(data.revenue)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.eventStats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhum evento no período selecionado</div>
            ) : (
              <div className="space-y-4">
                {stats.eventStats.slice(0, 5).map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <div className="text-sm font-medium truncate">{event.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.tickets} ingressos • {event.checkedIn} credenciamentos
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(event.date)}
                        </Badge>
                        <Badge variant={event.status === "publicado" ? "default" : "secondary"} className="text-xs">
                          {event.status === "rascunho"
                            ? "Rascunho"
                            : event.status === "publicado"
                              ? "Publicado"
                              : event.status === "cancelado"
                                ? "Cancelado"
                                : "Concluído"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(event.revenue)}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.tickets > 0
                          ? `${((event.checkedIn / event.tickets) * 100).toFixed(1)}% credenciamento`
                          : "0% credenciamento"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
