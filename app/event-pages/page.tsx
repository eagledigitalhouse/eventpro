"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Layout, Eye, EyeOff, ExternalLink, Settings } from "lucide-react"
import { useEventStore } from "@/lib/store"

export default function EventPagesPage() {
  const { events, eventPageSettings } = useEventStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  const getEventSlug = (eventName: string) => {
    return eventName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const settings = eventPageSettings[event.id]

    if (statusFilter === "published") {
      return matchesSearch && settings?.isPublished
    } else if (statusFilter === "draft") {
      return matchesSearch && (!settings || !settings.isPublished)
    }

    return matchesSearch
  })

  const publishedCount = Object.values(eventPageSettings).filter((settings) => settings.isPublished).length
  const draftCount = events.length - publishedCount

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Páginas de Evento</h1>
          <p className="text-gray-600">Gerencie as páginas públicas dos seus eventos</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Layout className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Páginas Publicadas</p>
                <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-orange-600">{draftCount}</p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const settings = eventPageSettings[event.id]
          const isPublished = settings?.isPublished || false
          const slug = getEventSlug(event.name)
          const publicUrl = `/event/${slug}`
          const activeComponents = settings?.components?.filter((c) => c.isActive).length || 0

          return (
            <Card key={event.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {event.bannerUrl ? (
                  <img
                    src={event.bannerUrl || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layout className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString("pt-BR")}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Componentes ativos:</span>
                    <span className="font-medium">{activeComponents}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/events/${event.id}/page-builder`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>

                    {isPublished && (
                      <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, "_blank")}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Crie seu primeiro evento para começar a construir páginas."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button asChild>
              <Link href="/events/new">Criar Primeiro Evento</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
