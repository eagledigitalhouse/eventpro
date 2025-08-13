"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useEventStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const { toast } = useToast()
  const router = useRouter()
  const cart = useEventStore((s) => s.cart)
  const event = useEventStore((s) => (cart.eventId ? s.events.find((e) => e.id === cart.eventId) : undefined))
  const placeOrder = useEventStore((s) => s.placeOrder)
  const applyCoupon = useEventStore((s) => s.applyCoupon)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const summary = useMemo(() => {
    if (!event) return []
    return cart.items
      .map((ci) => {
        const tt = event.tickets.find((t) => t.id === ci.ticketTypeId)
        if (!tt) return null
        return { name: tt.name, price: tt.price, quantity: ci.quantity, subtotal: tt.price * ci.quantity }
      })
      .filter(Boolean) as { name: string; price: number; quantity: number; subtotal: number }[]
  }, [cart.items, event])

  const subtotal = summary.reduce((s, i) => s + i.subtotal, 0)
  const discount = appliedCoupon
    ? appliedCoupon.discount > 1
      ? appliedCoupon.discount
      : (subtotal * appliedCoupon.discount) / 100
    : 0
  const total = subtotal - discount

  const confirm = () => {
    if (!name || !email) {
      toast({ title: "Informe nome e e-mail do comprador.", variant: "destructive" })
      return
    }
    const res = placeOrder({ name, email })
    if (!res.ok) {
      toast({ title: res.error, variant: "destructive" })
      return
    }
    router.push(`/orders/${res.orderId}`)
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    const result = applyCoupon(couponCode.trim())
    if (result.success) {
      setAppliedCoupon({ code: couponCode, discount: result.discount || 0 })
      toast({ title: result.message })
    } else {
      toast({ title: result.message, variant: "destructive" })
    }
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Carrinho vazio.</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold">Checkout</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-muted-foreground">
                    {it.quantity} × {formatCurrency(it.price)}
                  </div>
                </div>
                <div className="font-medium">{formatCurrency(it.subtotal)}</div>
              </div>
            ))}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <div>Cupom: {appliedCoupon.code}</div>
                <div>-{formatCurrency(discount)}</div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleApplyCoupon} variant="outline" size="sm">
                Aplicar
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between border-t pt-3">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-base font-semibold">{formatCurrency(total)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do comprador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-name">Nome</Label>
              <Input id="buyer-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-email">E-mail</Label>
              <Input
                id="buyer-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                type="email"
              />
            </div>
            <Button className="w-full" onClick={confirm} disabled={total <= 0}>
              Confirmar pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
