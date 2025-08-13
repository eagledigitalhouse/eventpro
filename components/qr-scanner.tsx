"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { LabelService } from "@/lib/label-service"

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner").then((m) => m.default), {
  ssr: false,
})

interface ScanResult {
  getText(): string
}

type Props = {
  onResult?: (text: string) => void
  onScan?: (text: string) => void
  eventId?: string
  onValidScan?: (participantId: string, eventId: string) => void
  onInvalidScan?: (error: string) => void
}

function QrScanner({ onResult = () => {}, onScan = () => {}, eventId, onValidScan, onInvalidScan }: Props) {
  const [hasCam, setHasCam] = useState<boolean | null>(null)

  useEffect(() => {
    async function check() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cams = devices.filter((d) => d.kind === "videoinput")
        setHasCam(cams.length > 0)
      } catch {
        setHasCam(false)
      }
    }
    check()
  }, [])

  const constraints = useMemo(() => ({ facingMode: "environment" as const }), [])

  const handleResult = (text: string) => {
    onResult(text)
    onScan(text)

    if (eventId && (onValidScan || onInvalidScan)) {
      const validation = LabelService.validateScannedQR(text, eventId)

      if (validation.isValid && validation.participantId && onValidScan) {
        onValidScan(validation.participantId, validation.eventId!)
      } else if (!validation.isValid && onInvalidScan) {
        onInvalidScan(validation.error || "QR Code inválido")
      }
    }
  }

  if (hasCam === false) {
    return <div className="text-sm text-muted-foreground">Câmera não disponível.</div>
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <BarcodeScanner
        onUpdate={(_, result) => {
          if (result && typeof result === "object" && "getText" in result) {
            const scanResult = result as ScanResult
            handleResult(scanResult.getText())
          } else if (typeof result === "string") {
            handleResult(result)
          }
        }}
        width={480}
        height={320}
        facingMode={constraints.facingMode}
      />
    </div>
  )
}

export default QrScanner
export { QrScanner }
