"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, BarChart3, UserCheck, Settings, Menu, X, Percent, Clock, Crown, Bell, Zap } from "lucide-react"
import { useState } from "react"
import { useEventStore } from "@/lib/store"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Cupons", href: "/coupons", icon: Percent },
  { name: "Lista de Espera", href: "/waitlist", icon: Clock },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Integrações", href: "/integrations", icon: Zap },
  { name: "Premium", href: "/premium", icon: Crown },
  { name: "Credenciamento", href: "/checkin", icon: UserCheck },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalTicketsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="font-semibold">EventosPro</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                const isPremium = item.href === "/premium"
                return (
                  <Link key={item.name} href={item.href}>
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                      <Icon className={`h-4 w-4 ${isPremium ? "text-yellow-500" : ""}`} />
                      {item.name}
                      {isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="secondary">{events.length} eventos</Badge>
              <Badge variant="secondary">{totalTicketsSold} ingressos</Badge>
              <Badge variant="secondary">R$ {totalRevenue.toLocaleString("pt-BR")}</Badge>
            </div>
            <Link href="/events/new">
              <Button size="sm">Novo Evento</Button>
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                const isPremium = item.href === "/premium"
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="w-full justify-start gap-2">
                      <Icon className={`h-4 w-4 ${isPremium ? "text-yellow-500" : ""}`} />
                      {item.name}
                      {isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                    </Button>
                  </Link>
                )
              })}
              <div className="mt-2 pt-2 border-t">
                <Link href="/events/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Novo Evento
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
