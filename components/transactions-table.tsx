"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEventStore } from "@/lib/store"
import { Search, TrendingUp, TrendingDown, Filter, FileText } from "lucide-react"
import type { FinancialTransaction } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TransactionsTableProps {
  transactions: FinancialTransaction[]
  eventId: string
}

export function TransactionsTable({ transactions, eventId }: TransactionsTableProps) {
  const getFinancialCategories = useEventStore((s) => s.getFinancialCategories)

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const categories = getFinancialCategories()

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter

    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  const automaticTransactions = filteredTransactions.filter((t) => t.isAutomatic)
  const manualTransactions = filteredTransactions.filter((t) => !t.isAutomatic)

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Opções de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setTypeFilter("all")
                setStatusFilter("all")
                setCategoryFilter("all")
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movimentações Automáticas */}
      {automaticTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Automáticas</CardTitle>
            <CardDescription>Transações geradas automaticamente pelo sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automaticTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movimentações Manuais */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Manuais</CardTitle>
          <CardDescription>Transações adicionadas manualmente</CardDescription>
        </CardHeader>
        <CardContent>
          {manualTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma movimentação manual encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {manualTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: FinancialTransaction }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            transaction.type === "receita" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {transaction.type === "receita" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <p className="font-medium">{transaction.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
            {transaction.paymentMethod && (
              <>
                <span>•</span>
                <span className="capitalize">{transaction.paymentMethod}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${transaction.type === "receita" ? "text-green-600" : "text-red-600"}`}>
          {transaction.type === "receita" ? "+" : "-"}R$ {transaction.amount.toLocaleString("pt-BR")}
        </div>
        <div className="flex items-center gap-2 justify-end">
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
  )
}
