"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/format"
import { Plus, Edit, Trash2, Percent, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Coupon } from "@/lib/types"

interface CouponFormData {
  code: string
  eventId: string
  type: "percentage" | "fixed"
  value: number
  maxUses?: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

export default function CouponsPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events) || []
  const coupons = useEventStore((s) => s.coupons) || []
  const createCoupon = useEventStore((s) => s.createCoupon)
  const updateCoupon = useEventStore((s) => s.updateCoupon)
  const deleteCoupon = useEventStore((s) => s.deleteCoupon)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null)
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    eventId: "",
    type: "percentage",
    value: 0,
    maxUses: undefined,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      code: "",
      eventId: "",
      type: "percentage",
      value: 0,
      maxUses: undefined,
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      isActive: true,
    })
    setEditingCoupon(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      eventId: coupon.eventId,
      type: coupon.type,
      value: coupon.value,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
    })
    setEditingCoupon(coupon.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.code || !formData.eventId || formData.value <= 0) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon, formData)
      toast({ title: "Cupom atualizado com sucesso!" })
    } else {
      createCoupon(formData)
      toast({ title: "Cupom criado com sucesso!" })
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom?")) {
      deleteCoupon(id)
      toast({ title: "Cupom excluído com sucesso!" })
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-muted-foreground">Gerencie cupons promocionais para seus eventos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Editar Cupom" : "Criar Novo Cupom"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="Ex: DESCONTO20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Evento</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(value: string) => setFormData((f) => ({ ...f, eventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Desconto</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "percentage" | "fixed") => setFormData((f) => ({ ...f, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    max={formData.type === "percentage" ? "100" : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData((f) => ({ ...f, value: Number.parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Limite de Uso (opcional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses || ""}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      maxUses: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido de</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData((f) => ({ ...f, validFrom: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido até</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData((f) => ({ ...f, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Cupom ativo</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData((f) => ({ ...f, isActive: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>{editingCoupon ? "Atualizar" : "Criar"} Cupom</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Cupons */}
      <div className="grid gap-4">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Nenhum cupom criado</h3>
                <p className="text-muted-foreground mb-4">Crie seu primeiro cupom promocional</p>
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Cupom
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => {
            const event = events.find((e) => e.id === coupon.eventId)
            const isExpired = new Date(coupon.validUntil) < new Date()
            const isMaxUsed = coupon.maxUses && coupon.usedCount >= coupon.maxUses

            return (
              <Card key={coupon.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {coupon.type === "percentage" ? (
                          <Percent className="h-5 w-5 text-primary" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                        <p className="text-sm text-muted-foreground">{event?.name || "Evento não encontrado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={coupon.isActive && !isExpired && !isMaxUsed ? "default" : "secondary"}>
                        {!coupon.isActive ? "Inativo" : isExpired ? "Expirado" : isMaxUsed ? "Esgotado" : "Ativo"}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(coupon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Desconto</div>
                      <div className="text-lg font-semibold">
                        {coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Usos</div>
                      <div className="text-lg font-semibold">
                        {coupon.usedCount}
                        {coupon.maxUses ? `/${coupon.maxUses}` : ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Válido de</div>
                      <div className="text-sm">{new Date(coupon.validFrom).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Válido até</div>
                      <div className="text-sm">{new Date(coupon.validUntil).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </main>
  )
}
