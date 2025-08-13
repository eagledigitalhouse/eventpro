"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import Link from "next/link"
import { useEventStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TicketComponent } from "@/components/ticket-component"
import { formatCurrency } from "@/lib/format"

export default function OrderPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const order = useEventStore((s) => s.orders.find((o) => o.id === id))
  const event = useEventStore((s) => (order ? s.events.find((e) => e.id === order.eventId) : undefined))

  const tickets = useMemo(() => {
    if (!order || !event) return []
    return order.items.flatMap((item) =>
      item.attendees.map((attendee) => ({
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
        isManual: false,
      })),
    )
  }, [order, event])

  if (!order || !event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Pedido não encontrado.</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Pedido Confirmado</h2>
          <p className="text-muted-foreground">Seus ingressos estão prontos para uso</p>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button variant="outline">Voltar ao evento</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{event.name}</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(order.totalAmount)}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Comprador: {order.buyerName} • {order.buyerEmail}
            </p>
            <p>
              Pedido: #{order.id} • {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>
            <p>
              Status: <span className="font-medium text-green-600">Confirmado</span>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.ticketName}
                </span>
                <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Seus Ingressos</h3>
          <p className="text-muted-foreground">
            Apresente o QR Code na entrada para credenciamento. Você também pode adicionar à sua carteira digital.
          </p>
        </div>

        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="space-y-4">
            {tickets.length > 1 && (
              <div className="text-center">
                <h4 className="text-lg font-medium">Ingresso {index + 1}</h4>
              </div>
            )}
            <TicketComponent event={event} ticket={ticket} template="default" showActions={true} />
          </div>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Instruções Importantes</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Apresente o QR Code na entrada do evento para credenciamento</li>
            <li>• Você pode baixar o ingresso em PDF ou adicionar à carteira digital do seu celular</li>
            <li>• Cada ingresso possui um código único e não pode ser duplicado</li>
            <li>• Em caso de problemas, entre em contato com o organizador do evento</li>
            <li>• Guarde este pedido para referência futura</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
