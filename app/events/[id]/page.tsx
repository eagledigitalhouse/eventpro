"use client"

import { notFound, useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventStore } from "@/lib/store"
import { TicketQuantitySelector } from "@/components/ticket-quantity-selector"
import { useMemo, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/format"

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const event = useEventStore((s) => s.events.find((e) => e.id === id))
  const setCart = useEventStore((s) => s.setCart)
  const router = useRouter()

  const [qty, setQty] = useState<Record<string, number>>({})

  const items =
    event?.tickets.map((t) => {
      const remaining = t.quantityTotal - t.quantitySold
      const q = qty[t.id] ?? 0
      return { ...t, remaining, selected: q }
    }) || []

  const total = useMemo(() => items.reduce((sum, it) => sum + it.selected * it.price, 0), [items])

  const goCheckout = () => {
    const selected = items.filter((i) => i.selected > 0).map((i) => ({ ticketTypeId: i.id, quantity: i.selected }))
    if (selected.length === 0) return
    setCart({ eventId: event.id, items: selected })
    router.push("/checkout")
  }

  if (!event) return notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="overflow-hidden rounded-xl border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.bannerUrl || "/placeholder.svg?height=360&width=1200&query=banner%20evento"}
          alt={`Banner de ${event.name}`}
          className="h-60 w-full object-cover sm:h-72"
        />
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h1 className="text-2xl font-semibold">{event.name}</h1>
          <p className="mt-2 text-muted-foreground">{event.description || "Sem descrição."}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            {formatDate(event.date)} • {event.time} • {event.location}
          </div>
        </div>
        <div className="sm:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ingressos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(it.price)} • {it.remaining} restantes
                    </div>
                  </div>
                  <TicketQuantitySelector
                    value={it.selected}
                    min={0}
                    max={it.remaining}
                    onChange={(v) => setQty((q) => ({ ...q, [it.id]: v }))}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-base font-medium">{formatCurrency(total)}</div>
              </div>
              <Button className="w-full" disabled={total <= 0} onClick={goCheckout}>
                Continuar para checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
