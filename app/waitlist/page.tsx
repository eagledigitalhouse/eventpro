"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Search, Mail, Trash2, Users, Clock, CheckCircle } from "lucide-react"

export default function WaitlistPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events)
  const waitlist = useEventStore((s) => s.waitlist)
  const removeFromWaitlist = useEventStore((s) => s.removeFromWaitlist)
  const notifyWaitlist = useEventStore((s) => s.notifyWaitlist)

  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filteredWaitlist = useMemo(() => {
    let filtered = waitlist

    if (selectedEventId !== "all") {
      filtered = filtered.filter((w) => w.eventId === selectedEventId)
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.email.toLowerCase().includes(query) ||
          w.phone?.toLowerCase().includes(query),
      )
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt)
  }, [waitlist, selectedEventId, search])

  const waitlistStats = useMemo(() => {
    const total = filteredWaitlist.length
    const notified = filteredWaitlist.filter((w) => w.notified).length
    const pending = total - notified

    const byEvent = events
      .map((event) => {
        const eventWaitlist = waitlist.filter((w) => w.eventId === event.id)
        return {
          eventId: event.id,
          eventName: event.name,
          total: eventWaitlist.length,
          notified: eventWaitlist.filter((w) => w.notified).length,
        }
      })
      .filter((e) => e.total > 0)

    return { total, notified, pending, byEvent }
  }, [filteredWaitlist, events, waitlist])

  const handleRemove = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta pessoa da lista de espera?")) {
      removeFromWaitlist(id)
      toast({ title: "Removido da lista de espera" })
    }
  }

  const handleNotifyEvent = (eventId: string, ticketTypeId: string) => {
    const count = notifyWaitlist(eventId, ticketTypeId)
    toast({
      title: `${count} pessoas notificadas`,
      description: "As pessoas na lista de espera foram notificadas sobre a disponibilidade.",
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lista de Espera</h1>
        <p className="text-muted-foreground">Gerencie pessoas interessadas em eventos esgotados</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total na Lista</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{waitlistStats.notified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{waitlistStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistStats.byEvent.length}</div>
            <p className="text-xs text-muted-foreground">com lista de espera</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-64">
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

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Espera */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pessoas na Lista de Espera</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredWaitlist.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {waitlist.length === 0 ? "Nenhuma pessoa na lista de espera" : "Nenhum resultado encontrado"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWaitlist.map((entry) => {
                    const event = events.find((e) => e.id === entry.eventId)
                    const ticketType = event?.tickets.find((t) => t.id === entry.ticketTypeId)

                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{entry.name}</div>
                            {entry.notified && (
                              <Badge variant="default" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Notificado
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.email} {entry.phone && `• ${entry.phone}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event?.name} • {ticketType?.name} • {entry.quantity} ingresso(s)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Inscrito em {new Date(entry.createdAt).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!entry.notified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNotifyEvent(entry.eventId, entry.ticketTypeId)}
                              className="gap-1"
                            >
                              <Mail className="h-4 w-4" />
                              Notificar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleRemove(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo por Evento */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Evento</CardTitle>
            </CardHeader>
            <CardContent>
              {waitlistStats.byEvent.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhum evento com lista de espera</div>
              ) : (
                <div className="space-y-4">
                  {waitlistStats.byEvent.map((eventStat) => (
                    <div key={eventStat.eventId} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-2">{eventStat.eventName}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">{eventStat.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Notificados:</span>
                        <span className="font-medium text-green-600">{eventStat.notified}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pendentes:</span>
                        <span className="font-medium text-orange-600">{eventStat.total - eventStat.notified}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
