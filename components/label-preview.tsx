import React from "react"
import { QRCode } from "qrcode.react"
import { formatCurrency, formatDate } from "@/lib/format"
import type { EventItem } from "@/lib/types"

interface LabelPreviewProps {
  participant: {
    ticketId: string
    code: string
    checkedIn: boolean
    checkedInAt?: number
    purchaseDate: number
    orderTotal: number
    orderId: string
    ticketType: string
    buyerName: string
    buyerEmail: string
    buyerPhone?: string
    customFields?: Record<string, string | number | boolean>
  }
  event: EventItem
  selectedFields: string[]
}

const fieldMap: {
  [key: string]: (participant: LabelPreviewProps["participant"], event: EventItem) => React.ReactNode
} = {
  eventName: (p, e) => <p className="text-lg font-bold">{e.name}</p>,
  eventDate: (p, e) => (
    <p className="text-sm">
      {formatDate(e.date)} às {e.time}
    </p>
  ),
  eventLocation: (p, e) => <p className="text-sm">{e.location}</p>,
  participantName: (p) => <p className="text-xl font-semibold mt-2">{p.buyerName}</p>,
  participantEmail: (p) => <p className="text-sm text-gray-600">{p.buyerEmail}</p>,
  participantPhone: (p) => p.buyerPhone && <p className="text-sm text-gray-600">{p.buyerPhone}</p>,
  ticketType: (p) => <p className="text-md font-medium mt-1">Tipo: {p.ticketType}</p>,
  ticketCode: (p) => <p className="text-sm font-mono mt-1">Código: {p.code}</p>,
  qrCode: (p) => (
    <div className="mt-2 flex justify-center">
      <QRCode value={p.code} size={80} level="H" />
    </div>
  ),
  checkinStatus: (p) => (
    <p className={`text-sm font-medium mt-1 ${p.checkedIn ? "text-green-600" : "text-orange-600"}`}>
      Status: {p.checkedIn ? "Credenciado" : "Pendente"}
    </p>
  ),
  purchaseDate: (p) => (
    <p className="text-xs text-gray-500 mt-1">Compra: {new Date(p.purchaseDate).toLocaleDateString("pt-BR")}</p>
  ),
  orderTotal: (p) => <p className="text-xs text-gray-500">Valor: {formatCurrency(p.orderTotal)}</p>,
  orderId: (p) => <p className="text-xs text-gray-500">Pedido: {p.orderId}</p>,
}

export default function LabelPreview({ participant, event, selectedFields }: LabelPreviewProps) {
  return (
    <div
      className="label-print-area p-4 border border-gray-300 rounded-lg shadow-sm bg-white text-center flex flex-col justify-between"
      style={{ width: "100mm", height: "70mm", boxSizing: "border-box" }}
    >
      <div className="flex-grow flex flex-col justify-center items-center">
        {selectedFields.map((fieldKey) => {
          const render = fieldMap[fieldKey]
          return render ? <React.Fragment key={fieldKey}>{render(participant, event)}</React.Fragment> : null
        })}
      </div>
    </div>
  )
}
