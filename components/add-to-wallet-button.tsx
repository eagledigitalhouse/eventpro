"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { WalletService, type WalletPassData } from "@/lib/wallet-service"
import { Wallet, Smartphone, Loader2, Plus } from "lucide-react"

interface AddToWalletButtonProps {
  passData: WalletPassData
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export function AddToWalletButton({
  passData,
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
  showText = true,
}: AddToWalletButtonProps) {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [isInWallet, setIsInWallet] = useState(false)

  const device = WalletService.detectDevice()
  const supportsWallet = WalletService.supportsWallet()

  // Não renderizar se não suporta carteira digital
  if (!supportsWallet) {
    return null
  }

  const handleAddToWallet = async () => {
    setIsAdding(true)

    try {
      const result = await WalletService.addToWallet(passData)

      if (result.success) {
        setIsInWallet(true)
        toast({
          title: "Ingresso adicionado!",
          description: `Ingresso adicionado à ${device === "ios" ? "Apple Wallet" : "Google Pay"} com sucesso.`,
        })
      } else {
        toast({
          title: "Erro ao adicionar à carteira",
          description: result.error || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar à carteira",
        description: "Não foi possível adicionar o ingresso à carteira digital.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (!showText) return ""

    if (isInWallet) {
      return "Na Carteira"
    }

    if (device === "ios") {
      return "Adicionar à Apple Wallet"
    }

    if (device === "android") {
      return "Adicionar ao Google Pay"
    }

    return "Adicionar à Carteira"
  }

  const getButtonIcon = () => {
    if (!showIcon) return null

    if (isAdding) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    if (isInWallet) {
      return <Wallet className="h-4 w-4" />
    }

    if (device === "ios") {
      return <Wallet className="h-4 w-4" />
    }

    if (device === "android") {
      return <Smartphone className="h-4 w-4" />
    }

    return <Plus className="h-4 w-4" />
  }

  return (
    <Button
      onClick={handleAddToWallet}
      disabled={isAdding || isInWallet}
      variant={variant}
      size={size}
      className={`${className} ${device === "ios" ? "bg-black hover:bg-gray-800" : ""} ${
        device === "android" ? "bg-blue-600 hover:bg-blue-700" : ""
      }`}
    >
      {getButtonIcon()}
      {showText && showIcon && <span className="ml-2">{getButtonText()}</span>}
      {showText && !showIcon && getButtonText()}
    </Button>
  )
}

// Componente específico para Apple Wallet
export function AddToAppleWalletButton(props: Omit<AddToWalletButtonProps, "variant" | "className">) {
  const device = WalletService.detectDevice()

  if (device !== "ios") {
    return null
  }

  return (
    <AddToWalletButton {...props} variant="default" className="bg-black hover:bg-gray-800 text-white border-black" />
  )
}

// Componente específico para Google Pay
export function AddToGooglePayButton(props: Omit<AddToWalletButtonProps, "variant" | "className">) {
  const device = WalletService.detectDevice()

  if (device !== "android") {
    return null
  }

  return (
    <AddToWalletButton
      {...props}
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
    />
  )
}
