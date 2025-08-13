"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEventStore } from "@/lib/store"
import EventCard from "@/components/event-card"

export default function EventsPage() {
  const events = useEventStore((s) => s.events)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Eventos</h2>
        <div className="flex gap-2">
          <Link href="/checkin">
            <Button variant="secondary">Credenciamento</Button>
          </Link>
          <Link href="/events/new">
            <Button>Novo evento</Button>
          </Link>
        </div>
      </div>
      {events.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Nenhum evento ainda.{" "}
          <Link href="/events/new" className="underline">
            Crie o primeiro
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </main>
  )
}
