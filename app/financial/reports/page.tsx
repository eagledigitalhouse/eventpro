"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEventStore } from "@/lib/store"
import { Download, FileText, Calendar, TrendingUp, DollarSign, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function FinancialReportsPage() {
  const events = useEventStore((s) => s.events)
  const getFinancialSummary = useEventStore((s) => s.getFinancialSummary)
  const getEventTransactions = useEventStore((s) => s.getEventTransactions)

  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [reportType, setReportType] = useState<string>("resumo")
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  })

  const generateReport = () => {
    const reportData = {
      type: reportType,
      eventId: selectedEvent,
      dateRange,
      generatedAt: new Date().toISOString(),
    }

    if (selectedEvent === "all") {
      // Relatório consolidado de todos os eventos
      const consolidatedData = events.map((event) => ({
        event,
        summary: getFinancialSummary(event.id),
        transactions: getEventTransactions(event.id).filter((t) => {
          const transactionDate = new Date(t.date)
          const startDate = new Date(dateRange.start)
          const endDate = new Date(dateRange.end)
          return transactionDate >= startDate && transactionDate <= endDate
        }),
      }))

      console.log("Relatório Consolidado:", consolidatedData)
      // Aqui você integraria com um serviço de geração de PDF/Excel
    } else {
      // Relatório específico do evento
      const event = events.find((e) => e.id === selectedEvent)
      if (event) {
        const eventData = {
          event,
          summary: getFinancialSummary(event.id),
          transactions: getEventTransactions(event.id).filter((t) => {
            const transactionDate = new Date(t.date)
            const startDate = new Date(dateRange.start)
            const endDate = new Date(dateRange.end)
            return transactionDate >= startDate && transactionDate <= endDate
          }),
        }

        console.log("Relatório do Evento:", eventData)
        // Aqui você integraria com um serviço de geração de PDF/Excel
      }
    }

    // Simular download
    alert(`Relatório ${reportType} gerado com sucesso! O download iniciará em breve.`)
  }

  const getReportPreview = () => {
    if (selectedEvent === "all") {
      const totalSummary = events.reduce(
        (acc, event) => {
          const summary = getFinancialSummary(event.id)
          return {
            totalRevenue: acc.totalRevenue + summary.totalRevenue,
            totalExpenses: acc.totalExpenses + summary.totalExpenses,
            netProfit: acc.netProfit + summary.netProfit,
            transactionCount: acc.transactionCount + getEventTransactions(event.id).length,
          }
        },
        { totalRevenue: 0, totalExpenses: 0, netProfit: 0, transactionCount: 0 },
      )

      return {
        title: "Relatório Consolidado - Todos os Eventos",
        data: totalSummary,
        eventCount: events.length,
      }
    } else {
      const event = events.find((e) => e.id === selectedEvent)
      if (event) {
        const summary = getFinancialSummary(event.id)
        const transactions = getEventTransactions(event.id)

        return {
          title: `Relatório - ${event.name}`,
          data: {
            ...summary,
            transactionCount: transactions.length,
          },
          eventCount: 1,
        }
      }
    }

    return null
  }

  const preview = getReportPreview()

  const reportTypes = [
    { value: "resumo", label: "Resumo Executivo", description: "Visão geral com principais métricas" },
    { value: "detalhado", label: "Relatório Detalhado", description: "Todas as transações e análises" },
    { value: "fluxo_caixa", label: "Fluxo de Caixa", description: "Entradas e saídas por período" },
    { value: "vendas_periodo", label: "Vendas por Período", description: "Análise de vendas e conversão" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Gere relatórios detalhados sobre a performance financeira</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>Configure os parâmetros do seu relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {reportTypes.find((t) => t.value === reportType)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={generateReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview do Relatório */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preview do Relatório
              </CardTitle>
              <CardDescription>Visualização prévia dos dados que serão incluídos</CardDescription>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{preview.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(dateRange.start), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(new Date(dateRange.end), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <Badge variant="secondary">{preview.eventCount} evento(s)</Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Receitas</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {preview.data.totalRevenue.toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        <span className="text-sm font-medium">Despesas</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        R$ {preview.data.totalExpenses.toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Lucro Líquido</span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${preview.data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {preview.data.netProfit >= 0 ? "+" : ""}R$ {preview.data.netProfit.toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Transações</span>
                      </div>
                      <div className="text-2xl font-bold">{preview.data.transactionCount}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Conteúdo do Relatório:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Resumo executivo com principais métricas</li>
                      <li>• Análise de receitas e despesas por categoria</li>
                      <li>• Gráficos de performance financeira</li>
                      <li>• Detalhamento de transações por período</li>
                      <li>• Comparativo com períodos anteriores</li>
                      <li>• Recomendações e insights</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um evento para visualizar o preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Histórico de relatórios gerados anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum relatório gerado ainda</p>
            <p className="text-sm">Os relatórios gerados aparecerão aqui para download posterior</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
