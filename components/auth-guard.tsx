"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import type { Permission, UserRole } from "@/lib/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requiredPermission, requiredRole, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Restore session on mount
    auth.restoreSession()

    const user = auth.getCurrentUser()

    if (!user) {
      router.push("/login")
      return
    }

    let authorized = true

    if (requiredPermission && !auth.hasPermission(requiredPermission)) {
      authorized = false
    }

    if (requiredRole && !auth.hasRole(requiredRole)) {
      authorized = false
    }

    setIsAuthorized(authorized)
  }, [requiredPermission, requiredRole, router])

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
