import type { FinancialTransaction, FinancialSummary, Order, EventItem } from "@/lib/types"

export class FinancialService {
  // Gerar transação automática para venda de ingresso
  static generateSaleTransaction(order: Order, event: EventItem): FinancialTransaction[] {
    const transactions: FinancialTransaction[] = []

    // Receita principal da venda
    const mainTransaction: FinancialTransaction = {
      id: `FT${Math.random().toString(36).substring(2, 15)}`,
      eventId: order.eventId,
      type: "receita",
      category: "Vendas de Ingressos",
      description: `Venda de ingressos - Pedido ${order.orderNumber}`,
      amount: order.totalAmount,
      date: new Date().toISOString(),
      status: order.paymentStatus === "pago" ? "pago" : "pendente",
      isAutomatic: true,
      relatedOrderId: order.id,
      paymentMethod: this.mapPaymentMethod(order.paymentMethod),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "system",
    }

    transactions.push(mainTransaction)

    // Taxa de serviço (se paga pelo organizador)
    if (event.paymentSettings?.serviceFee?.paidBy === "organizador") {
      const serviceFeeAmount = (order.totalAmount * event.paymentSettings.serviceFee.percentage) / 100

      const serviceFeeTransaction: FinancialTransaction = {
        id: `FT${Math.random().toString(36).substring(2, 15)}`,
        eventId: order.eventId,
        type: "despesa",
        category: "Taxas de Pagamento",
        description: `Taxa de serviço (${event.paymentSettings.serviceFee.percentage}%) - Pedido ${order.orderNumber}`,
        amount: serviceFeeAmount,
        date: new Date().toISOString(),
        status: order.paymentStatus === "pago" ? "pago" : "pendente",
        isAutomatic: true,
        relatedOrderId: order.id,
        paymentMethod: this.mapPaymentMethod(order.paymentMethod),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: "system",
      }

      transactions.push(serviceFeeTransaction)
    }

    return transactions
  }

  // Gerar transação para reembolso
  static generateRefundTransaction(order: Order): FinancialTransaction {
    return {
      id: `FT${Math.random().toString(36).substring(2, 15)}`,
      eventId: order.eventId,
      type: "despesa",
      category: "Reembolsos",
      description: `Reembolso - Pedido ${order.orderNumber}`,
      amount: order.totalAmount,
      date: new Date().toISOString(),
      status: "pago",
      isAutomatic: true,
      relatedOrderId: order.id,
      paymentMethod: this.mapPaymentMethod(order.paymentMethod),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "system",
    }
  }

  // Calcular resumo financeiro do evento
  static calculateFinancialSummary(
    eventId: string,
    transactions: FinancialTransaction[],
    orders: Order[],
  ): FinancialSummary {
    const eventTransactions = transactions.filter((t) => t.eventId === eventId)
    const eventOrders = orders.filter((o) => o.eventId === eventId)

    // Calcular totais
    const revenues = eventTransactions.filter((t) => t.type === "receita")
    const expenses = eventTransactions.filter((t) => t.type === "despesa")

    const totalRevenue = revenues.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const confirmedRevenue = revenues.filter((t) => t.status === "pago").reduce((sum, t) => sum + t.amount, 0)
    const confirmedExpenses = expenses.filter((t) => t.status === "pago").reduce((sum, t) => sum + t.amount, 0)
    const pendingRevenue = revenues.filter((t) => t.status === "pendente").reduce((sum, t) => sum + t.amount, 0)
    const pendingExpenses = expenses.filter((t) => t.status === "pendente").reduce((sum, t) => sum + t.amount, 0)

    // Calcular vendas por tipo de ingresso
    const ticketSalesMap = new Map<string, { name: string; quantity: number; amount: number }>()

    eventOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = ticketSalesMap.get(item.ticketTypeId) || {
          name: item.ticketName,
          quantity: 0,
          amount: 0,
        }

        existing.quantity += item.quantity
        existing.amount += item.unitPrice * item.quantity

        ticketSalesMap.set(item.ticketTypeId, existing)
      })
    })

    const ticketSales = Array.from(ticketSalesMap.entries()).map(([ticketTypeId, data]) => ({
      ticketTypeId,
      ticketTypeName: data.name,
      quantitySold: data.quantity,
      totalAmount: data.amount,
    }))

    // Calcular métodos de pagamento
    const paymentMethodsMap = new Map<string, { count: number; amount: number }>()

    eventOrders.forEach((order) => {
      if (order.paymentMethod) {
        const existing = paymentMethodsMap.get(order.paymentMethod) || { count: 0, amount: 0 }
        existing.count += 1
        existing.amount += order.totalAmount
        paymentMethodsMap.set(order.paymentMethod, existing)
      }
    })

    const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount,
    }))

    return {
      eventId,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingRevenue,
      pendingExpenses,
      confirmedRevenue,
      confirmedExpenses,
      ticketSales: {
        totalSold: ticketSales.reduce((sum, t) => sum + t.quantitySold, 0),
        totalAmount: ticketSales.reduce((sum, t) => sum + t.totalAmount, 0),
        byTicketType: ticketSales,
      },
      paymentMethods,
      lastUpdated: Date.now(),
    }
  }

  // Mapear método de pagamento
  private static mapPaymentMethod(method?: string): string {
    const methodMap: Record<string, string> = {
      credit_card: "cartao",
      bank_slip: "boleto",
      pix: "pix",
      cash: "dinheiro",
      transfer: "transferencia",
    }

    return methodMap[method || ""] || "cartao"
  }

  // Categorias padrão
  static getDefaultCategories() {
    return [
      // Receitas
      { id: "vendas", name: "Vendas de Ingressos", type: "receita" as const, color: "#10b981", isDefault: true },
      { id: "patrocinio", name: "Patrocínio", type: "receita" as const, color: "#3b82f6", isDefault: true },
      { id: "outras_receitas", name: "Outras Receitas", type: "receita" as const, color: "#8b5cf6", isDefault: true },

      // Despesas
      { id: "taxas", name: "Taxas de Pagamento", type: "despesa" as const, color: "#ef4444", isDefault: true },
      { id: "local", name: "Aluguel de Local", type: "despesa" as const, color: "#f59e0b", isDefault: true },
      { id: "marketing", name: "Marketing", type: "despesa" as const, color: "#ec4899", isDefault: true },
      { id: "alimentacao", name: "Alimentação", type: "despesa" as const, color: "#06b6d4", isDefault: true },
      { id: "equipamentos", name: "Equipamentos", type: "despesa" as const, color: "#84cc16", isDefault: true },
      { id: "pessoal", name: "Pessoal", type: "despesa" as const, color: "#f97316", isDefault: true },
      { id: "reembolsos", name: "Reembolsos", type: "despesa" as const, color: "#6b7280", isDefault: true },
      { id: "outras_despesas", name: "Outras Despesas", type: "despesa" as const, color: "#64748b", isDefault: true },
    ]
  }
}
