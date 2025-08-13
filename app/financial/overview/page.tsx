"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEventStore } from "@/lib/store"
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import Link from "next/link"

export default function FinancialOverviewPage() {
  const events = useEventStore((s) => s.events)
  const getFinancialSummary = useEventStore((s) => s.getFinancialSummary)

  const overallSummary = events.reduce(
    (acc, event) => {
      const summary = getFinancialSummary(event.id)
      return {
        totalRevenue: acc.totalRevenue + summary.totalRevenue,
        totalExpenses: acc.totalExpenses + summary.totalExpenses,
        netProfit: acc.netProfit + summary.netProfit,
        confirmedRevenue: acc.confirmedRevenue + summary.confirmedRevenue,
        pendingRevenue: acc.pendingRevenue + summary.pendingRevenue,
      }
    },
    {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      confirmedRevenue: 0,
      pendingRevenue: 0,
    },
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Visão geral financeira de todos os eventos</p>
        </div>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {overallSummary.totalRevenue.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {overallSummary.confirmedRevenue.toLocaleString("pt-BR")} confirmado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {overallSummary.totalExpenses.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallSummary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {overallSummary.netProfit >= 0 ? "+" : ""}R$ {overallSummary.netProfit.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Eventos com Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Evento</CardTitle>
          <CardDescription>Situação financeira de cada evento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento encontrado</p>
                <Link href="/events/new">
                  <Button className="mt-4">Criar Primeiro Evento</Button>
                </Link>
              </div>
            ) : (
              events.map((event) => {
                const summary = getFinancialSummary(event.id)
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.name}</h3>
                        <Badge variant={event.status === "publicado" ? "default" : "secondary"}>{event.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("pt-BR")} • {event.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          +R$ {summary.totalRevenue.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-sm text-red-600">-R$ {summary.totalExpenses.toLocaleString("pt-BR")}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {summary.netProfit >= 0 ? "+" : ""}R$ {summary.netProfit.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-xs text-muted-foreground">lucro líquido</div>
                      </div>
                      <Link href={`/events/${event.id}/financial`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
