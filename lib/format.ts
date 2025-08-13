export function formatCurrency(value: number, locale = "pt-BR", currency = "BRL") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value)
}

export function formatDate(dateIso: string) {
  const d = new Date(dateIso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}
