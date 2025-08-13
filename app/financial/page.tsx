import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Financeiro - EventPass",
  description: "Visão geral financeira de todos os eventos",
}

export default function FinancialPage() {
  redirect("/financial/overview")
}
