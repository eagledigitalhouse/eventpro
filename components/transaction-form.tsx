"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface TransactionFormProps {
  eventId: string
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionForm({ eventId, onSuccess, onCancel }: TransactionFormProps) {
  const addFinancialTransaction = useEventStore((s) => s.addFinancialTransaction)
  const getFinancialCategories = useEventStore((s) => s.getFinancialCategories)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    type: "receita" as "receita" | "despesa",
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "dinheiro",
    isPaid: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const revenueCategories = getFinancialCategories("receita")
  const expenseCategories = getFinancialCategories("despesa")
  const categories = formData.type === "receita" ? revenueCategories : expenseCategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.description || !formData.amount || !formData.category) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const amount = Number.parseFloat(formData.amount.replace(",", "."))
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Erro",
          description: "Valor deve ser um número positivo",
          variant: "destructive",
        })
        return
      }

      addFinancialTransaction({
        eventId,
        type: formData.type,
        description: formData.description,
        amount,
        category: formData.category,
        date: formData.date,
        status: formData.isPaid ? "pago" : "pendente",
        isAutomatic: false,
        paymentMethod: formData.paymentMethod,
        createdBy: "user",
      })

      toast({
        title: "Sucesso",
        description: "Movimentação adicionada com sucesso",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar movimentação",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Tipo *</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: "receita" | "despesa") => {
            setFormData((prev) => ({ ...prev, type: value, category: "" }))
          }}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="receita" id="receita" />
            <Label htmlFor="receita">Receita</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="despesa" id="despesa" />
            <Label htmlFor="despesa">Despesa</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Venda de ingressos, Aluguel do local..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="0,00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-method">Forma de Pagamento</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-paid"
          checked={formData.isPaid}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPaid: !!checked }))}
        />
        <Label htmlFor="is-paid">Pago</Label>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Cadastrar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
