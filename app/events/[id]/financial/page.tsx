"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/store"
import { DollarSign, TrendingUp, TrendingDown, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { FinancialSummaryCards } from "@/components/financial-summary-cards"
import { TicketSalesTable } from "@/components/ticket-sales-table"

export default function EventFinancialPage() {
  const params = useParams()
  const eventId = params.id as string

  const events = useEventStore((s) => s.events)
  const getFinancialSummary = useEventStore((s) => s.getFinancialSummary)
  const getEventTransactions = useEventStore((s) => s.getEventTransactions)

  const event = events.find((e) => e.id === eventId)
  const summary = getFinancialSummary(eventId)
  const transactions = getEventTransactions(eventId)

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Evento não encontrado</h1>
          <p className="text-muted-foreground mb-4">O evento solicitado não existe ou foi removido.</p>
          <Link href="/events">
            <Button>Voltar aos Eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Financeiro</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/events/${eventId}/financial/transactions`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Ver Transações
            </Button>
          </Link>
          <Link href={`/events/${eventId}/financial/transactions?new=true`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <FinancialSummaryCards summary={summary} />

      {/* Tabela de Vendas por Ingresso */}
      <TicketSalesTable event={event} summary={summary} />

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações financeiras do evento</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">As transações aparecerão aqui conforme as vendas e movimentações</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "receita" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "receita" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.type === "receita" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "receita" ? "+" : "-"}R$ {transaction.amount.toLocaleString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={transaction.status === "pago" ? "default" : "secondary"} className="text-xs">
                        {transaction.status}
                      </Badge>
                      {transaction.isAutomatic && (
                        <Badge variant="outline" className="text-xs">
                          automático
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length > 5 && (
                <div className="text-center pt-4">
                  <Link href={`/events/${eventId}/financial/transactions`}>
                    <Button variant="outline">Ver Todas as Transações</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
