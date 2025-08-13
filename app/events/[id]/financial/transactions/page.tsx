"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEventStore } from "@/lib/store"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsTable } from "@/components/transactions-table"

export default function EventTransactionsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string
  const showNewForm = searchParams.get("new") === "true"

  const events = useEventStore((s) => s.events)
  const getEventTransactions = useEventStore((s) => s.getEventTransactions)
  const getFinancialSummary = useEventStore((s) => s.getFinancialSummary)

  const [showForm, setShowForm] = useState(showNewForm)

  const event = events.find((e) => e.id === eventId)
  const transactions = getEventTransactions(eventId)
  const summary = getFinancialSummary(eventId)

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
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}/financial`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Receitas & Despesas</h1>
            <p className="text-muted-foreground">{event.name}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {summary.confirmedRevenue.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              +R$ {summary.pendingRevenue.toLocaleString("pt-BR")} pendente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {summary.confirmedExpenses.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              +R$ {summary.pendingExpenses.toLocaleString("pt-BR")} pendente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.netProfit >= 0 ? "+" : ""}R$ {summary.netProfit.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">lucro líquido</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Nova Transação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Movimentação</CardTitle>
            <CardDescription>Adicione uma receita ou despesa manual ao evento</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm
              eventId={eventId}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabela de Transações */}
      <TransactionsTable transactions={transactions} eventId={eventId} />
    </div>
  )
}
