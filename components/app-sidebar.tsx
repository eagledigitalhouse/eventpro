"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  BarChart3,
  UserCheck,
  Settings,
  Percent,
  Clock,
  Crown,
  Bell,
  Zap,
  Plus,
  Users,
  Layout,
  DollarSign,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/store"

const mainNavigation = [
  { name: "Painel", href: "/dashboard", icon: BarChart3 },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Participantes", href: "/participants", icon: Users },
  { name: "Credenciamento", href: "/operator", icon: UserCheck },
]

const analyticsNavigation = [
  { name: "Análises", href: "/analytics", icon: BarChart3 },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Financeiro", href: "/financial", icon: DollarSign }, // Adicionado módulo financeiro na seção de análises
]

const toolsNavigation = [
  { name: "Cupons", href: "/coupons", icon: Percent },
  { name: "Lista de Espera", href: "/waitlist", icon: Clock },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Integrações", href: "/integrations", icon: Zap },
  { name: "Páginas de Evento", href: "/event-pages", icon: Layout },
]

const systemNavigation = [
  { name: "Premium", href: "/premium", icon: Crown },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)
  const eventPageSettings = useEventStore((s) => s.eventPageSettings)
  const financialTransactions = useEventStore((s) => s.financialTransactions)

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalTicketsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )
  const publishedPages = Object.values(eventPageSettings).filter((settings) => settings.isPublished).length

  const netProfit = financialTransactions.reduce((sum, transaction) => {
    if (transaction.status === "pago") {
      return transaction.type === "receita" ? sum + transaction.amount : sum - transaction.amount
    }
    return sum
  }, 0)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="h-4 w-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">EventPass</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Análises</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                const isFinancial = item.href === "/financial"
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <Icon className={`h-4 w-4 ${isFinancial ? "text-green-600" : ""}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                const isPremium = item.href === "/premium"
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <Icon className={`h-4 w-4 ${isPremium ? "text-yellow-500" : ""}`} />
                        <span>{item.name}</span>
                        {isPremium && <Crown className="h-3 w-3 text-yellow-500 ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 space-y-2">
          <Link href="/events/new">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Novo Evento</span>
            </Button>
          </Link>

          <div className="group-data-[collapsible=icon]:hidden space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Estatísticas</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {events.length} eventos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalTicketsSold} ingressos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {publishedPages} páginas
              </Badge>
              <Badge variant="secondary" className={`text-xs ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netProfit >= 0 ? "+" : ""}R$ {netProfit.toLocaleString("pt-BR")}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
