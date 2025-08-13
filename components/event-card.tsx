import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/format"
import type { EventItem } from "@/lib/types"

type Props = {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const sold = event.tickets.reduce((s, t) => s + t.quantitySold, 0)
  const cap = event.tickets.reduce((s, t) => s + t.quantityTotal, 0)
  const revenue = event.tickets.reduce((s, t) => s + t.quantitySold * t.price, 0)
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/9] w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Banner de ${event.name}`}
          src={event.bannerUrl || "/placeholder.svg?height=360&width=640&query=banner%20evento"}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{event.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
        <div className="text-sm text-muted-foreground">
          {formatDate(event.date)} • {event.time} • {event.location}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
            {sold}/{cap} vendidos
          </span>
          <span className="rounded bg-muted px-2 py-0.5">{formatCurrency(revenue)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/events/${event.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Ver Página
          </Button>
        </Link>
        <Link href={`/events/${event.id}/manage`}>
          <Button className="flex-1">Gerenciar</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
