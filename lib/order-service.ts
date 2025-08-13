export class OrderService {
  // Gera um número de pedido curto no formato EP-XXXXX
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6) // Últimos 6 dígitos do timestamp
    const random = Math.random().toString(36).substring(2, 5).toUpperCase() // 3 caracteres aleatórios
    return `EP-${timestamp}${random}`.substring(0, 8) // Garante máximo 8 caracteres
  }

  // Valida formato do número do pedido
  static validateOrderNumber(orderNumber: string): boolean {
    return /^EP-[A-Z0-9]{5}$/.test(orderNumber)
  }

  // Extrai informações do número do pedido
  static parseOrderNumber(orderNumber: string): {
    prefix: string
    timestamp: string
    random: string
  } | null {
    const match = orderNumber.match(/^(EP)-([A-Z0-9]{3})([A-Z0-9]{2})$/)
    if (!match) return null

    return {
      prefix: match[1],
      timestamp: match[2],
      random: match[3],
    }
  }
}
