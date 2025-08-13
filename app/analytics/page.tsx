"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Clock,
  MapPin,
  Percent,
  BarChart3,
  PieChartIcon as RechartsPieChart,
  Download,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)
  const checkinLogs = useEventStore((s) => s.checkinLogs)
  const coupons = useEventStore((s) => s.coupons)

  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [selectedEventId, setSelectedEventId] = useState("all")

  const analytics = useMemo(() => {
    const now = Date.now()
    const periodMs = Number.parseInt(selectedPeriod) * 24 * 60 * 60 * 1000
    const startDate = now - periodMs

    let filteredOrders = orders.filter((o) => o.createdAt >= startDate)
    let filteredEvents = events

    if (selectedEventId !== "all") {
      filteredOrders = filteredOrders.filter((o) => o.eventId === selectedEventId)
      filteredEvents = events.filter((e) => e.id === selectedEventId)
    }

    // Métricas básicas
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
    const totalTickets = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const totalCheckins = filteredOrders.reduce(
      (sum, o) =>
        sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
      0,
    )
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0
    const checkinRate = totalTickets > 0 ? (totalCheckins / totalTickets) * 100 : 0

    // Vendas por dia
    const salesByDay = filteredOrders.reduce(
      (acc, order) => {
        const date = new Date(order.createdAt).toISOString().slice(0, 10)
        if (!acc[date]) acc[date] = { date, revenue: 0, tickets: 0, orders: 0 }
        acc[date].revenue += order.total
        acc[date].tickets += order.items.reduce((sum, item) => sum + item.quantity, 0)
        acc[date].orders += 1
        return acc
      },
      {} as Record<string, { date: string; revenue: number; tickets: number; orders: number }>,
    )

    const salesData = Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date))

    // Check-ins por hora
    const checkinsByHour = checkinLogs
      .filter((log) => log.checkedInAt >= startDate)
      .reduce(
        (acc, log) => {
          const hour = new Date(log.checkedInAt).getHours()
          acc[hour] = (acc[hour] || 0) + 1
          return acc
        },
        {} as Record<number, number>,
      )

    const checkinHourData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      checkins: checkinsByHour[hour] || 0,
    }))

    // Performance por evento
    const eventPerformance = filteredEvents
      .map((event) => {
        const eventOrders = filteredOrders.filter((o) => o.eventId === event.id)
        const revenue = eventOrders.reduce((sum, o) => sum + o.total, 0)
        const tickets = eventOrders.reduce(
          (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0,
        )
        const capacity = event.tickets.reduce((sum, t) => sum + t.quantityTotal, 0)
        const checkins = eventOrders.reduce(
          (sum, o) =>
            sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
          0,
        )

        return {
          ...event,
          revenue,
          tickets,
          capacity,
          checkins,
          conversionRate: capacity > 0 ? (tickets / capacity) * 100 : 0,
          checkinRate: tickets > 0 ? (checkins / tickets) * 100 : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

    // Vendas por tipo de ingresso
    const ticketTypeData = filteredEvents
      .flatMap((event) =>
        event.tickets.map((ticket) => {
          const revenue = filteredOrders.reduce((sum, order) => {
            const items = order.items.filter((item) => item.ticketTypeId === ticket.id)
            return sum + items.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity, 0)
          }, 0)
          return {
            name: `${event.name} - ${ticket.name}`,
            value: revenue,
            tickets: ticket.quantitySold,
          }
        }),
      )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Análise de cupons
    const couponAnalysis = coupons
      .map((coupon) => {
        const event = events.find((e) => e.id === coupon.eventId)
        const usage = filteredOrders.filter((o) => o.items.some((item) => item.couponCode === coupon.code)).length
        const discount = filteredOrders.reduce((sum, o) => {
          if (o.items.some((item) => item.couponCode === coupon.code)) {
            return sum + o.discount
          }
          return sum
        }, 0)

        return {
          ...coupon,
          eventName: event?.name || "Evento não encontrado",
          actualUsage: usage,
          totalDiscount: discount,
          conversionRate: coupon.maxUses ? (usage / coupon.maxUses) * 100 : 0,
        }
      })
      .filter((c) => c.actualUsage > 0)

    // Análise geográfica (simulada baseada no local dos eventos)
    const locationAnalysis = filteredEvents.reduce(
      (acc, event) => {
        const eventOrders = filteredOrders.filter((o) => o.eventId === event.id)
        const revenue = eventOrders.reduce((sum, o) => sum + o.total, 0)
        const tickets = eventOrders.reduce(
          (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0,
        )

        const city = event.location.split(",").pop()?.trim() || event.location
        if (!acc[city]) acc[city] = { city, revenue: 0, tickets: 0, events: 0 }
        acc[city].revenue += revenue
        acc[city].tickets += tickets
        acc[city].events += 1
        return acc
      },
      {} as Record<string, { city: string; revenue: number; tickets: number; events: number }>,
    )

    const locationData = Object.values(locationAnalysis).sort((a, b) => b.revenue - a.revenue)

    return {
      totalRevenue,
      totalTickets,
      totalCheckins,
      avgOrderValue,
      checkinRate,
      salesData,
      checkinHourData,
      eventPerformance,
      ticketTypeData,
      couponAnalysis,
      locationData,
      totalOrders: filteredOrders.length,
      totalEvents: filteredEvents.length,
    }
  }, [events, orders, checkinLogs, coupons, selectedPeriod, selectedEventId])

  const exportAnalytics = () => {
    const data = {
      period: selectedPeriod,
      eventId: selectedEventId,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalRevenue: analytics.totalRevenue,
        totalTickets: analytics.totalTickets,
        totalCheckins: analytics.totalCheckins,
        avgOrderValue: analytics.avgOrderValue,
        checkinRate: analytics.checkinRate,
      },
      salesData: analytics.salesData,
      eventPerformance: analytics.eventPerformance,
      couponAnalysis: analytics.couponAnalysis,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Avançado</h1>
          <p className="text-muted-foreground">Análise detalhada de performance e insights</p>
        </div>
        <Button onClick={exportAnalytics} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-64">
            <SelectValue />
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
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{analytics.totalOrders} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTickets}</div>
            <p className="text-xs text-muted-foreground">{analytics.totalCheckins} check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Check-in</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.checkinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Participação efetiva</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">No período</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vendas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vendas por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")} />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")}
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(value as number) : value,
                    name === "revenue" ? "Receita" : name === "tickets" ? "Ingressos" : "Pedidos",
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="revenue" />
                <Line type="monotone" dataKey="tickets" stroke="#82ca9d" name="tickets" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Check-ins por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-ins por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.checkinHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="checkins" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Evento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance por Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.eventPerformance.slice(0, 5).map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <div className="font-medium truncate">{event.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.tickets}/{event.capacity} ingressos • {event.conversionRate.toFixed(1)}% conversão
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Check-in: {event.checkinRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(event.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendas por Tipo de Ingresso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RechartsPieChart className="h-5 w-5" />
              Top Tipos de Ingresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.ticketTypeData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${formatCurrency(value)}`}
                >
                  {analytics.ticketTypeData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análise de Cupons */}
        <Card>
          <CardHeader>
            <CardTitle>Performance de Cupons</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.couponAnalysis.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhum cupom utilizado</div>
            ) : (
              <div className="space-y-3">
                {analytics.couponAnalysis.slice(0, 5).map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium font-mono">{coupon.code}</div>
                      <div className="text-sm text-muted-foreground">{coupon.eventName}</div>
                      <div className="text-xs text-muted-foreground">
                        {coupon.actualUsage} usos • {coupon.conversionRate.toFixed(1)}% da capacidade
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">-{formatCurrency(coupon.totalDiscount)}</div>
                      <div className="text-xs text-muted-foreground">Desconto total</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise Geográfica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Performance por Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.locationData.slice(0, 5).map((location, index) => (
                <div key={location.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{location.city}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.events} eventos • {location.tickets} ingressos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(location.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
