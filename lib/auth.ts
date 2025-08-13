import type { User, UserRole, Permission, UserSession } from "./types"

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "events.create",
    "events.edit",
    "events.delete",
    "events.view",
    "checkin.perform",
    "checkin.manage_stations",
    "reports.view",
    "reports.export",
    "users.manage",
    "settings.manage",
    "orders.view",
    "orders.refund",
    "coupons.manage",
    "forms.manage",
  ],
  producer: [
    "events.create",
    "events.edit",
    "events.view",
    "checkin.perform",
    "checkin.manage_stations",
    "reports.view",
    "reports.export",
    "orders.view",
    "orders.refund",
    "coupons.manage",
    "forms.manage",
  ],
  checkin_operator: ["events.view", "checkin.perform", "reports.view"],
  customer: ["events.view", "orders.view"],
}

export class AuthService {
  private static instance: AuthService
  private currentSession: UserSession | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession
  }

  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser()
    if (!user || !user.isActive) return false

    return user.permissions.includes(permission)
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  canAccessEvent(eventId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Admins and producers can access all events
    if (user.role === "admin" || user.role === "producer") {
      return true
    }

    // Check-in operators can only access assigned events
    if (user.role === "checkin_operator") {
      return user.assignedEvents?.includes(eventId) || false
    }

    return false
  }

  canAccessStation(stationId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Admins and producers can access all stations
    if (user.role === "admin" || user.role === "producer") {
      return true
    }

    // Check-in operators can only access assigned stations
    if (user.role === "checkin_operator") {
      return user.assignedStations?.includes(stationId) || false
    }

    return false
  }

  login(email: string, password: string): Promise<UserSession> {
    // Mock implementation - replace with real authentication
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock user data
        const mockUser: User = {
          id: "user-1",
          name: "João Silva",
          email: email,
          role: "producer",
          permissions: ROLE_PERMISSIONS.producer,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLoginAt: Date.now(),
        }

        const session: UserSession = {
          userId: mockUser.id,
          user: mockUser,
          token: `token-${Date.now()}`,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }

        this.currentSession = session
        localStorage.setItem("user-session", JSON.stringify(session))
        resolve(session)
      }, 1000)
    })
  }

  logout(): void {
    this.currentSession = null
    localStorage.removeItem("user-session")
  }

  restoreSession(): UserSession | null {
    try {
      const stored = localStorage.getItem("user-session")
      if (!stored) return null

      const session: UserSession = JSON.parse(stored)

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        this.logout()
        return null
      }

      this.currentSession = session
      return session
    } catch {
      return null
    }
  }
}

export const auth = AuthService.getInstance()
