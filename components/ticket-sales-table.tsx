"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { EventItem, FinancialSummary } from "@/lib/types"

interface TicketSalesTableProps {
  event: EventItem
  summary: FinancialSummary
}

export function TicketSalesTable({ event, summary }: TicketSalesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Vendas por Ingresso</CardTitle>
        <CardDescription>Performance de vendas de cada tipo de ingresso</CardDescription>
      </CardHeader>
      <CardContent>
        {event.tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum tipo de ingresso configurado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {event.tickets.map((ticket) => {
              const ticketSummary = summary.ticketSales.byTicketType.find((t) => t.ticketTypeId === ticket.id)
              const soldQuantity = ticketSummary?.quantitySold || 0
              const totalRevenue = ticketSummary?.totalAmount || 0
              const conversionRate = ticket.quantityTotal > 0 ? (soldQuantity / ticket.quantityTotal) * 100 : 0
              const remaining = ticket.quantityTotal - soldQuantity

              return (
                <div key={ticket.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{ticket.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        R$ {ticket.price.toLocaleString("pt-BR")} por ingresso
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">R$ {totalRevenue.toLocaleString("pt-BR")}</div>
                      <div className="text-sm text-muted-foreground">receita total</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-2xl font-bold">{soldQuantity}</div>
                      <div className="text-xs text-muted-foreground">vendidos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{remaining}</div>
                      <div className="text-xs text-muted-foreground">restantes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{ticket.quantityTotal}</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">conversão</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso de vendas</span>
                      <span>
                        {soldQuantity} de {ticket.quantityTotal}
                      </span>
                    </div>
                    <Progress value={conversionRate} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={ticket.isActive ? "default" : "secondary"}>
                      {ticket.isActive ? "ativo" : "inativo"}
                    </Badge>
                    <Badge variant="outline">{ticket.visibility}</Badge>
                    {remaining === 0 && <Badge variant="destructive">esgotado</Badge>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
