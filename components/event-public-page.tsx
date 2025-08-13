"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Share2, Calendar, Clock, MapPin, Users, Heart } from "lucide-react"
import { COMPONENT_MAP } from "@/lib/event-page-components"
import type { EventItem, EventPageSettings, TicketType } from "@/lib/types"
import { useEventStore } from "@/lib/store"

interface EventPublicPageProps {
  event: EventItem
  settings: EventPageSettings
}

export function EventPublicPage({ event, settings }: EventPublicPageProps) {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useEventStore()

  // Aplicar tema personalizado
  const themeStyles = useMemo(
    () =>
      ({
        "--primary-color": settings.theme.primaryColor,
        "--secondary-color": settings.theme.secondaryColor,
        "--background-color": settings.theme.backgroundColor,
        "--text-color": settings.theme.textColor,
        "--font-family": settings.theme.fontFamily,
      }) as React.CSSProperties,
    [settings.theme],
  )

  // Componentes ativos ordenados
  const activeComponents = useMemo(
    () => settings.components.filter((comp) => comp.isActive).sort((a, b) => a.order - b.order),
    [settings.components],
  )

  // Calcular total do carrinho
  const cartTotal = useMemo(() => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.tickets.find((t) => t.id === ticketId)
      return total + (ticket ? ticket.price * quantity : 0)
    }, 0)
  }, [selectedTickets, event.tickets])

  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, quantity),
    }))
  }

  const handleAddToCart = () => {
    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      if (quantity > 0) {
        addToCart(event.id, ticketId, quantity)
      }
    })

    // Redirecionar para checkout ou mostrar confirmação
    window.location.href = "/checkout"
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Erro ao compartilhar:", err)
      }
    } else {
      // Fallback: copiar URL
      navigator.clipboard.writeText(window.location.href)
      // Mostrar toast de confirmação
    }
  }

  const hasSelectedTickets = Object.values(selectedTickets).some((qty) => qty > 0)

  return (
    <div className="min-h-screen bg-gray-50" style={themeStyles}>
      {/* CSS Personalizado */}
      {settings.customCss && <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />}

      {/* Renderizar componentes ativos */}
      <div className="relative">
        {activeComponents.map((component) => {
          const ComponentToRender = COMPONENT_MAP[component.type]
          if (!ComponentToRender) return null

          return (
            <div key={component.id} className="component-section">
              <ComponentToRender event={event} settings={settings} componentSettings={component.settings} />
            </div>
          )
        })}
      </div>

      {/* Carrinho Flutuante */}
      {hasSelectedTickets && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-semibold">
                    {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)} ingresso(s)
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: {cartTotal === 0 ? "Gratuito" : `R$ ${cartTotal.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <Button onClick={handleAddToCart} size="lg">
                Finalizar Inscrição
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação Flutuantes */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-40">
        <Button variant="outline" size="sm" onClick={handleShare} className="bg-white/90 backdrop-blur-sm">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`bg-white/90 backdrop-blur-sm ${isWishlisted ? "text-red-500" : ""}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Informações Rápidas (sempre visível) */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event.organizerName || "Organizador"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente customizado para seleção de ingressos (sobrescreve o padrão)
export function CustomTicketsComponent({
  event,
  selectedTickets,
  onQuantityChange,
}: {
  event: EventItem
  selectedTickets: Record<string, number>
  onQuantityChange: (ticketId: string, quantity: number) => void
}) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Ingressos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {event.tickets
            .filter((ticket) => ticket.isActive)
            .map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                quantity={selectedTickets[ticket.id] || 0}
                onQuantityChange={(qty) => onQuantityChange(ticket.id, qty)}
              />
            ))}
        </div>
      </div>
    </section>
  )
}

function TicketCard({
  ticket,
  quantity,
  onQuantityChange,
}: {
  ticket: TicketType
  quantity: number
  onQuantityChange: (quantity: number) => void
}) {
  const isAvailable = ticket.quantitySold < ticket.quantityTotal
  const remaining = ticket.quantityTotal - ticket.quantitySold

  return (
    <Card className={`relative overflow-hidden ${!isAvailable ? "opacity-60" : ""}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{ticket.name}</h3>
            <Badge variant={isAvailable ? "default" : "destructive"}>{isAvailable ? "Disponível" : "Esgotado"}</Badge>
          </div>

          {ticket.description && <p className="text-gray-600 text-sm">{ticket.description}</p>}

          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {ticket.price === 0 ? "Gratuito" : `R$ ${ticket.price.toFixed(2)}`}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{remaining} restantes</span>
            </div>
          </div>

          {isAvailable && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                disabled={quantity <= 0}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={quantity >= remaining}
              >
                +
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
