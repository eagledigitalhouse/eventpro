"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  value?: number
  onChange?: (v: number) => void
  min?: number
  max?: number
}

export function TicketQuantitySelector({ value = 0, onChange = () => {}, min = 0, max = 99 }: Props) {
  const set = (v: number) => {
    const nv = Math.max(min, Math.min(max, v))
    onChange(nv)
  }

  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => set(value - 1)}
        aria-label="Diminuir quantidade"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="w-10 text-center tabular-nums">{value}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => set(value + 1)}
        aria-label="Aumentar quantidade"
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
