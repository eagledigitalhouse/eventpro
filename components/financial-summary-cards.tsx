"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react"
import type { FinancialSummary } from "@/lib/types"

interface FinancialSummaryCardsProps {
  summary: FinancialSummary
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">R$ {summary.confirmedRevenue.toLocaleString("pt-BR")}</div>
          <p className="text-xs text-muted-foreground">+R$ {summary.pendingRevenue.toLocaleString("pt-BR")} pendente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">R$ {summary.confirmedExpenses.toLocaleString("pt-BR")}</div>
          <p className="text-xs text-muted-foreground">
            +R$ {summary.pendingExpenses.toLocaleString("pt-BR")} pendente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {summary.netProfit >= 0 ? "+" : ""}R$ {summary.netProfit.toLocaleString("pt-BR")}
          </div>
          <p className="text-xs text-muted-foreground">
            {((summary.netProfit / (summary.totalRevenue || 1)) * 100).toFixed(1)}% margem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            R$ {(summary.pendingRevenue + summary.pendingExpenses).toLocaleString("pt-BR")}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.pendingRevenue > 0 && summary.pendingExpenses > 0
              ? "receitas e despesas"
              : summary.pendingRevenue > 0
                ? "receitas"
                : "despesas"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
