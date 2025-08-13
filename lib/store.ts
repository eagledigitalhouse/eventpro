import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  EventItem,
  Order,
  TicketType,
  FormDefinition,
  ManualParticipant,
  CheckinStation,
  LabelTemplate,
  PrintJob,
  Notification,
  AutoTicketConfig,
  GeneratedTicket,
  EventPageSettings,
  FinancialTransaction,
  FinancialSummary,
  FinancialCategory,
  CheckinHistory,
  AccessZone,
} from "@/lib/types"
import { OrderService } from "./order-service"
import { QRCodeService } from "./qr-service"
import { FinancialService } from "./financial-service"

interface EventStoreState {
  events: EventItem[]
  orders: Order[]
  manualParticipants: ManualParticipant[]
  forms: FormDefinition[]
  stations: CheckinStation[]
  labelTemplates: LabelTemplate[]
  printJobs: PrintJob[]
  notifications: Notification[]
  downloadHistory: Array<{
    ticketId: string
    format: string
    timestamp: number
    success: boolean
    userId?: string
  }>
  autoTicketConfigs: Record<string, AutoTicketConfig>
  generatedTickets: GeneratedTicket[]
  cart: {
    eventId: string | null
    items: Array<{
      ticketTypeId: string
      quantity: number
    }>
  }
  eventPageSettings: Record<string, EventPageSettings>
  financialTransactions: FinancialTransaction[]
  financialCategories: FinancialCategory[]
  checkinHistory: CheckinHistory[]
  accessZones: AccessZone[]

  createEvent: (event: Omit<EventItem, "id" | "createdAt" | "updatedAt">) => string
  updateEvent: (id: string, updates: Partial<EventItem>) => boolean
  deleteEvent: (id: string) => void
  createTicketType: (eventId: string, ticket: Omit<TicketType, "id" | "quantitySold">) => void
  updateTicketType: (eventId: string, ticketId: string, updates: Partial<TicketType>) => void
  deleteTicketType: (eventId: string, ticketId: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt">) => string
  checkInByPayload: (payload: { ticketId: string; eventId: string }) => {
    status: "ok" | "already" | "error"
    message: string
    entryNumber?: number
  }
  bulkCheckIn: (
    ticketIds: string[],
    eventId: string,
  ) => {
    successful: number
    failed: number
    alreadyChecked: number
  }
  addForm: (form: FormDefinition) => void
  updateForm: (form: FormDefinition) => void
  getEventForms: (eventId: string) => FormDefinition[]
  addParticipant: (
    participant: Omit<ManualParticipant, "id" | "code" | "checkedIn" | "checkedInAt" | "addedAt">,
  ) => void
  validateEventData: (event: Partial<EventItem>) => { isValid: boolean; errors: string[] }
  validateTicketData: (ticket: Partial<TicketType>) => { isValid: boolean; errors: string[] }
  getEventParticipants: (eventId: string) => Array<{
    id: string
    name: string
    email: string
    phone?: string
    ticketTypeName: string
    checkedIn: boolean
    checkedInAt?: number
    code: string
    customFields?: Record<string, any>
    order?: Order
    unitPrice?: number
    addedAt?: number
    isManual?: boolean
  }>
  updateParticipant: (participantId: string, updates: Partial<any>) => void
  resendTicketEmail: (participantId: string) => Promise<{ success: boolean; message: string }>
  checkInByCode: (
    code: string,
    eventId: string,
    options?: {
      accessZone?: string
      allowMultipleEntries?: boolean
      stationId?: string
      operatorId?: string
    },
  ) => {
    status: "ok" | "already" | "error"
    message: string
    entryNumber?: number
  }
  generateTicketForParticipant: (
    participantId: string,
    eventId: string,
  ) => {
    success: boolean
    ticketData?: any
    error?: string
  }
  recordDownload: (ticketId: string, format: string, success: boolean, userId?: string) => void
  getDownloadHistory: (userId?: string) => Array<{
    ticketId: string
    format: string
    timestamp: number
    success: boolean
    userId?: string
  }>
  getUserTickets: (userEmail: string) => Array<{
    id: string
    code: string
    participantName: string
    participantEmail: string
    participantPhone?: string
    ticketTypeName: string
    price: number
    checkedIn: boolean
    checkedInAt?: number
    customFields?: Record<string, any>
    transferredFrom?: string
    eventId: string
    eventName: string
    eventDate: string
    eventTime: string
    eventLocation: string
    eventBanner?: string
    orderId?: string
    orderDate?: number
    paymentStatus?: string
    isManual?: boolean
  }>
  getStationByOperatorId: (operatorId: string) => CheckinStation | null
  updateStationActivity: (stationId: string, checkinCount: number) => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  markNotificationAsRead: (notificationId: string) => void
  getUnreadNotifications: (userId?: string) => Notification[]
  placeOrder: (buyer: { name: string; email: string }) => { ok: boolean; orderId?: string; error?: string }
  setAutoTicketConfig: (eventId: string, config: Partial<AutoTicketConfig>) => void
  getAutoTicketConfig: (eventId: string) => AutoTicketConfig | null
  getGeneratedTickets: (eventId?: string, participantId?: string) => GeneratedTicket[]
  updateEventPageSettings: (eventId: string, settings: EventPageSettings) => void
  getEventPageSettings: (eventId: string) => EventPageSettings | null
  addToCart: (eventId: string, ticketTypeId: string, quantity: number) => void
  removeFromCart: (ticketTypeId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, "id" | "createdAt" | "updatedAt">) => string
  updateFinancialTransaction: (id: string, updates: Partial<FinancialTransaction>) => boolean
  deleteFinancialTransaction: (id: string) => boolean
  getEventTransactions: (eventId: string) => FinancialTransaction[]
  getFinancialSummary: (eventId: string) => FinancialSummary
  processOrderPayment: (orderId: string, paymentStatus: "pago" | "falhou" | "reembolsado") => void
  getFinancialCategories: (type?: "receita" | "despesa") => FinancialCategory[]
  addFinancialCategory: (category: Omit<FinancialCategory, "id">) => string
  getCheckinHistory: (eventId: string, participantId?: string) => CheckinHistory[]
  getAccessZones: (eventId: string) => AccessZone[]
  addAccessZone: (zone: AccessZone) => void
  updateAccessZone: (zoneId: string, updates: Partial<AccessZone>) => void
  updateTicketAccessControl: (
    eventId: string,
    ticketId: string,
    accessControl: Partial<TicketType["accessControl"]>,
  ) => void
  addStation: (station: CheckinStation) => void
  updateStation: (stationId: string, updates: Partial<CheckinStation>) => void
  addLabelTemplate: (template: LabelTemplate) => void
  updateLabelTemplate: (templateId: string, updates: Partial<LabelTemplate>) => void
}

export const useEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      events: [],
      orders: [],
      manualParticipants: [],
      forms: [],
      stations: [],
      labelTemplates: [],
      printJobs: [],
      notifications: [],
      downloadHistory: [],
      autoTicketConfigs: {},
      generatedTickets: [],
      cart: { eventId: null, items: [] },
      eventPageSettings: {},
      financialTransactions: [],
      financialCategories: FinancialService.getDefaultCategories(),
      checkinHistory: [],
      accessZones: [],

      checkInByCode: (code, eventId, options = {}) => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)

        if (!event) {
          return { status: "error", message: "Evento não encontrado" }
        }

        // Procurar participante pelo código
        let participant = null
        let ticketType = null
        let isManual = false

        // Verificar participantes manuais
        const manualParticipant = state.manualParticipants.find((p) => p.code === code && p.eventId === eventId)
        if (manualParticipant) {
          participant = manualParticipant
          ticketType = event.tickets.find((t) => t.id === manualParticipant.ticketTypeId)
          isManual = true
        }

        // Verificar participantes de pedidos
        if (!participant) {
          for (const order of state.orders.filter((o) => o.eventId === eventId)) {
            for (const item of order.items) {
              const attendee = item.attendees.find((a) => a.code === code)
              if (attendee) {
                participant = attendee
                ticketType = event.tickets.find((t) => t.id === item.ticketTypeId)
                break
              }
            }
            if (participant) break
          }
        }

        if (!participant || !ticketType) {
          return { status: "error", message: "Código de ingresso inválido" }
        }

        // Verificar configurações de controle de acesso
        const accessControl = ticketType.accessControl
        const now = new Date()
        const today = now.toISOString().split("T")[0]

        // Verificar se permite múltiplas entradas
        const existingHistory = state.checkinHistory.filter(
          (h) => h.participantId === participant.id && h.eventId === eventId,
        )

        if (existingHistory.length > 0 && !accessControl?.allowMultipleEntries) {
          return { status: "already", message: "Participante já fez check-in" }
        }

        // Verificar limite de entradas por dia
        if (accessControl?.maxEntriesPerDay && accessControl.maxEntriesPerDay > 0) {
          const todayEntries = existingHistory.filter(
            (h) => new Date(h.checkedInAt).toISOString().split("T")[0] === today,
          )

          if (todayEntries.length >= accessControl.maxEntriesPerDay) {
            return {
              status: "error",
              message: `Limite de ${accessControl.maxEntriesPerDay} entradas por dia atingido`,
            }
          }
        }

        // Verificar dias válidos
        if (accessControl?.validDays && accessControl.validDays.length > 0) {
          if (!accessControl.validDays.includes(today)) {
            return { status: "error", message: "Ingresso não válido para hoje" }
          }
        }

        // Verificar zona de acesso
        if (options.accessZone && accessControl?.accessZones) {
          if (!accessControl.accessZones.includes(options.accessZone)) {
            return { status: "error", message: "Acesso não permitido a esta zona" }
          }
        }

        // Realizar check-in
        const entryNumber = existingHistory.length + 1
        const checkinTime = Date.now()

        const newCheckinHistory: CheckinHistory = {
          id: `CH${Math.random().toString(36).substring(2, 15)}`,
          ticketId: participant.id,
          participantId: participant.id,
          eventId,
          ticketTypeId: ticketType.id,
          checkedInAt: checkinTime,
          entryNumber,
          accessZone: options.accessZone,
          stationId: options.stationId,
          operatorId: options.operatorId,
          method: "qr",
        }

        set((state) => {
          const updatedState = { ...state }

          // Adicionar ao histórico
          updatedState.checkinHistory = [...state.checkinHistory, newCheckinHistory]

          // Atualizar participante
          if (isManual) {
            updatedState.manualParticipants = state.manualParticipants.map((p) =>
              p.id === participant.id ? { ...p, checkedIn: true, checkedInAt: checkinTime } : p,
            )
          } else {
            updatedState.orders = state.orders.map((order) => ({
              ...order,
              items: order.items.map((item) => ({
                ...item,
                attendees: item.attendees.map((attendee) =>
                  attendee.id === participant.id
                    ? { ...attendee, checkedIn: true, checkedInAt: checkinTime }
                    : attendee,
                ),
              })),
            }))
          }

          // Atualizar contagem da estação
          if (options.stationId) {
            updatedState.stations = state.stations.map((station) =>
              station.id === options.stationId
                ? {
                    ...station,
                    checkedInCount: station.checkedInCount + 1,
                    lastActivity: checkinTime,
                  }
                : station,
            )
          }

          return updatedState
        })

        const message =
          entryNumber === 1 ? `Check-in realizado com sucesso!` : `Check-in realizado! Entrada #${entryNumber}`

        return { status: "ok", message, entryNumber }
      },

      getCheckinHistory: (eventId, participantId) => {
        const state = get()
        let history = state.checkinHistory.filter((h) => h.eventId === eventId)

        if (participantId) {
          history = history.filter((h) => h.participantId === participantId)
        }

        return history.sort((a, b) => b.checkedInAt - a.checkedInAt)
      },

      getAccessZones: (eventId) => {
        const state = get()
        return state.accessZones.filter((z) => z.eventId === eventId && z.isActive)
      },

      addAccessZone: (zone) =>
        set((state) => ({
          accessZones: [...state.accessZones, zone],
        })),

      updateAccessZone: (zoneId, updates) =>
        set((state) => ({
          accessZones: state.accessZones.map((zone) =>
            zone.id === zoneId ? { ...zone, ...updates, updatedAt: Date.now() } : zone,
          ),
        })),

      updateTicketAccessControl: (eventId, ticketId, accessControl) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  tickets: event.tickets.map((ticket) =>
                    ticket.id === ticketId
                      ? {
                          ...ticket,
                          accessControl: { ...ticket.accessControl, ...accessControl },
                        }
                      : ticket,
                  ),
                }
              : event,
          ),
        })),

      addStation: (station) =>
        set((state) => ({
          stations: [...state.stations, station],
        })),

      updateStation: (stationId, updates) =>
        set((state) => ({
          stations: state.stations.map((station) => (station.id === stationId ? { ...station, ...updates } : station)),
        })),

      addLabelTemplate: (template) =>
        set((state) => ({
          labelTemplates: [...state.labelTemplates, template],
        })),

      updateLabelTemplate: (templateId, updates) =>
        set((state) => ({
          labelTemplates: state.labelTemplates.map((template) =>
            template.id === templateId ? { ...template, ...updates } : template,
          ),
        })),

      addParticipant: (newParticipant) =>
        set((state) => {
          const event = state.events.find((e) => e.id === newParticipant.eventId)
          const ticketType = event?.tickets.find((t) => t.id === newParticipant.ticketTypeId)

          if (!event || !ticketType) {
            console.error("Evento ou tipo de ingresso não encontrado para participante manual.")
            return state
          }

          const participantId = `MP${Math.random().toString(36).substring(2, 15)}`
          const code = `MANUAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          const qrCode = QRCodeService.generateCheckInCode(event.name, participantId)

          return {
            manualParticipants: [
              ...state.manualParticipants,
              {
                ...newParticipant,
                id: participantId,
                code: code,
                qrCode,
                checkedIn: false,
                checkedInAt: undefined,
                addedAt: Date.now(),
              },
            ],
            events: state.events.map((e) =>
              e.id === newParticipant.eventId
                ? {
                    ...e,
                    tickets: e.tickets.map((t) =>
                      t.id === newParticipant.ticketTypeId ? { ...t, quantitySold: t.quantitySold + 1 } : t,
                    ),
                  }
                : e,
            ),
          }
        }),

      placeOrder: (buyer) => {
        const state = get()
        const { cart } = state

        if (!cart.eventId || cart.items.length === 0) {
          return { ok: false, error: "Carrinho vazio" }
        }

        const event = state.events.find((e) => e.id === cart.eventId)
        if (!event) {
          return { ok: false, error: "Evento não encontrado" }
        }

        for (const cartItem of cart.items) {
          const ticketType = event.tickets.find((t) => t.id === cartItem.ticketTypeId)
          if (!ticketType) {
            return { ok: false, error: "Tipo de ingresso não encontrado" }
          }

          const available = ticketType.quantityTotal - ticketType.quantitySold
          if (available < cartItem.quantity) {
            return { ok: false, error: `Apenas ${available} ingressos disponíveis para ${ticketType.name}` }
          }
        }

        const orderNumber = OrderService.generateOrderNumber()
        const orderId = `ORD${Math.random().toString(36).substring(2, 15)}`

        const totalAmount = cart.items.reduce((total, item) => {
          const ticketType = event.tickets.find((t) => t.id === item.ticketTypeId)!
          return total + ticketType.price * item.quantity
        }, 0)

        const orderItems = cart.items.map((cartItem) => {
          const ticketType = event.tickets.find((t) => t.id === cartItem.ticketTypeId)!

          const attendees = Array.from({ length: cartItem.quantity }, (_, index) => {
            const participantId = `A${Math.random().toString(36).substring(2, 15)}`
            const qrCode = QRCodeService.generateCheckInCode(event.name, participantId)

            return {
              id: participantId,
              name: index === 0 ? buyer.name : `${buyer.name} - Acompanhante ${index}`,
              email: buyer.email,
              phone: "",
              code: `${event.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              qrCode,
              orderNumber,
              checkedIn: false,
              customFields: {},
            }
          })

          return {
            id: `OI${Math.random().toString(36).substring(2, 15)}`,
            ticketTypeId: cartItem.ticketTypeId,
            ticketName: ticketType.name,
            quantity: cartItem.quantity,
            unitPrice: ticketType.price,
            attendees,
          }
        })

        const newOrder: Order = {
          id: orderId,
          orderNumber,
          eventId: cart.eventId,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          items: orderItems,
          totalAmount,
          createdAt: Date.now(),
          paymentStatus: "pendente",
          paymentMethod: "cartao",
        }

        set((state) => {
          const financialTransactions = FinancialService.generateSaleTransaction(newOrder, event)

          return {
            orders: [...state.orders, newOrder],
            financialTransactions: [...state.financialTransactions, ...financialTransactions],
            events: state.events.map((e) =>
              e.id === cart.eventId
                ? {
                    ...e,
                    tickets: e.tickets.map((t) => {
                      const cartItem = cart.items.find((item) => item.ticketTypeId === t.id)
                      return cartItem ? { ...t, quantitySold: t.quantitySold + cartItem.quantity } : t
                    }),
                  }
                : e,
            ),
            cart: { eventId: null, items: [] },
          }
        })

        return { ok: true, orderId }
      },

      updateParticipant: (participantId, updates) =>
        set((state) => {
          const updatedManualParticipants = state.manualParticipants.map((participant) =>
            participant.id === participantId ? { ...participant, ...updates } : participant,
          )

          const updatedOrders = state.orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
              ...item,
              attendees: item.attendees.map((attendee) =>
                attendee.id === participantId ? { ...attendee, ...updates } : attendee,
              ),
            })),
          }))

          return {
            manualParticipants: updatedManualParticipants,
            orders: updatedOrders,
          }
        }),

      resendTicketEmail: async (participantId) => {
        try {
          const state = get()

          let participant = null
          let event = null

          const manualParticipant = state.manualParticipants.find((p) => p.id === participantId)
          if (manualParticipant) {
            participant = manualParticipant
            event = state.events.find((e) => e.id === manualParticipant.eventId)
          }

          if (!participant) {
            for (const order of state.orders) {
              for (const item of order.items) {
                const attendee = item.attendees.find((a) => a.id === participantId)
                if (attendee) {
                  participant = attendee
                  event = state.events.find((e) => e.id === order.eventId)
                  break
                }
              }
              if (participant) break
            }
          }

          if (!participant || !event) {
            return { success: false, message: "Participante ou evento não encontrado" }
          }

          console.log(`Reenviando ingresso para ${participant.email}`)

          const notification = {
            type: "info" as const,
            title: "Ingresso Reenviado",
            message: `Ingresso reenviado para ${participant.name} (${participant.email})`,
            userId: "system",
            eventId: event.id,
          }

          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: `NOTIF${Math.random().toString(36).substring(2, 15)}`,
                createdAt: Date.now(),
                read: false,
              },
            ],
          }))

          return { success: true, message: "Ingresso reenviado com sucesso!" }
        } catch (error) {
          console.error("Erro ao reenviar ingresso:", error)
          return { success: false, message: "Erro ao reenviar ingresso" }
        }
      },

      updateEventPageSettings: (eventId, settings) =>
        set((state) => ({
          eventPageSettings: {
            ...state.eventPageSettings,
            [eventId]: settings,
          },
        })),

      getEventPageSettings: (eventId) => {
        const state = get()
        return state.eventPageSettings[eventId] || null
      },

      addToCart: (eventId, ticketTypeId, quantity) =>
        set((state) => {
          const existingItemIndex = state.cart.items.findIndex((item) => item.ticketTypeId === ticketTypeId)

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.cart.items]
            updatedItems[existingItemIndex].quantity += quantity
            return {
              cart: {
                eventId,
                items: updatedItems,
              },
            }
          } else {
            return {
              cart: {
                eventId,
                items: [...state.cart.items, { ticketTypeId, quantity }],
              },
            }
          }
        }),

      removeFromCart: (ticketTypeId) =>
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.filter((item) => item.ticketTypeId !== ticketTypeId),
          },
        })),

      clearCart: () =>
        set(() => ({
          cart: { eventId: null, items: [] },
        })),

      getCartTotal: () => {
        const state = get()
        const { cart, events } = state

        if (!cart.eventId) return 0

        const event = events.find((e) => e.id === cart.eventId)
        if (!event) return 0

        return cart.items.reduce((total, item) => {
          const ticketType = event.tickets.find((t) => t.id === item.ticketTypeId)
          return total + (ticketType ? ticketType.price * item.quantity : 0)
        }, 0)
      },

      addFinancialTransaction: (transaction) => {
        const id = `FT${Math.random().toString(36).substring(2, 15)}`
        const newTransaction: FinancialTransaction = {
          ...transaction,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        set((state) => ({
          financialTransactions: [...state.financialTransactions, newTransaction],
        }))

        return id
      },

      updateFinancialTransaction: (id, updates) => {
        set((state) => ({
          financialTransactions: state.financialTransactions.map((transaction) =>
            transaction.id === id ? { ...transaction, ...updates, updatedAt: Date.now() } : transaction,
          ),
        }))
        return true
      },

      deleteFinancialTransaction: (id) => {
        set((state) => ({
          financialTransactions: state.financialTransactions.filter((t) => t.id !== id),
        }))
        return true
      },

      getEventTransactions: (eventId) => {
        const state = get()
        return state.financialTransactions.filter((t) => t.eventId === eventId)
      },

      getFinancialSummary: (eventId) => {
        const state = get()
        return FinancialService.calculateFinancialSummary(eventId, state.financialTransactions, state.orders)
      },

      processOrderPayment: (orderId, paymentStatus) => {
        set((state) => {
          const updatedOrders = state.orders.map((order) =>
            order.id === orderId ? { ...order, paymentStatus } : order,
          )

          const updatedTransactions = state.financialTransactions.map((transaction) =>
            transaction.relatedOrderId === orderId
              ? {
                  ...transaction,
                  status: paymentStatus === "pago" ? "pago" : paymentStatus === "falhou" ? "cancelado" : "pendente",
                  updatedAt: Date.now(),
                }
              : transaction,
          )

          if (paymentStatus === "reembolsado") {
            const order = state.orders.find((o) => o.id === orderId)
            if (order) {
              const refundTransaction = FinancialService.generateRefundTransaction(order)
              updatedTransactions.push(refundTransaction)
            }
          }

          return {
            orders: updatedOrders,
            financialTransactions: updatedTransactions,
          }
        })
      },

      getFinancialCategories: (type) => {
        const state = get()
        return type
          ? state.financialCategories.filter((c) => c.type === type && c.isActive)
          : state.financialCategories.filter((c) => c.isActive)
      },

      addFinancialCategory: (category) => {
        const id = `FC${Math.random().toString(36).substring(2, 15)}`
        const newCategory: FinancialCategory = {
          ...category,
          id,
          isActive: true,
        }

        set((state) => ({
          financialCategories: [...state.financialCategories, newCategory],
        }))

        return id
      },

      // Métodos existentes que faltavam implementação completa
      createEvent: (event) => {
        const id = `EVT${Math.random().toString(36).substring(2, 15)}`
        const newEvent: EventItem = {
          ...event,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        set((state) => ({
          events: [...state.events, newEvent],
        }))

        return id
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates, updatedAt: Date.now() } : event,
          ),
        }))
        return true
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }))
      },

      createTicketType: (eventId, ticket) => {
        const ticketId = `TKT${Math.random().toString(36).substring(2, 15)}`
        const newTicket: TicketType = {
          ...ticket,
          id: ticketId,
          quantitySold: 0,
        }

        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, tickets: [...event.tickets, newTicket] } : event,
          ),
        }))
      },

      updateTicketType: (eventId, ticketId, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  tickets: event.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates } : ticket)),
                }
              : event,
          ),
        }))
      },

      deleteTicketType: (eventId, ticketId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, tickets: event.tickets.filter((t) => t.id !== ticketId) } : event,
          ),
        }))
      },

      addOrder: (order) => {
        const id = `ORD${Math.random().toString(36).substring(2, 15)}`
        const newOrder: Order = {
          ...order,
          id,
          createdAt: Date.now(),
        }

        set((state) => ({
          orders: [...state.orders, newOrder],
        }))

        return id
      },

      checkInByPayload: (payload) => {
        return get().checkInByCode("", payload.eventId, { allowMultipleEntries: true })
      },

      bulkCheckIn: (ticketIds, eventId) => {
        let successful = 0
        let failed = 0
        let alreadyChecked = 0

        for (const ticketId of ticketIds) {
          const result = get().checkInByPayload({ ticketId, eventId })
          if (result.status === "ok") {
            successful++
          } else if (result.status === "already") {
            alreadyChecked++
          } else {
            failed++
          }
        }

        return { successful, failed, alreadyChecked }
      },

      addForm: (form) => {
        set((state) => ({
          forms: [...state.forms, form],
        }))
      },

      updateForm: (form) => {
        set((state) => ({
          forms: state.forms.map((f) => (f.id === form.id ? form : f)),
        }))
      },

      getEventForms: (eventId) => {
        const state = get()
        return state.forms.filter((f) => f.eventId === eventId)
      },

      validateEventData: (event) => {
        const errors: string[] = []

        if (!event.name?.trim()) errors.push("Nome do evento é obrigatório")
        if (!event.date) errors.push("Data do evento é obrigatória")
        if (!event.time) errors.push("Horário do evento é obrigatório")
        if (!event.location?.trim()) errors.push("Local do evento é obrigatório")

        return { isValid: errors.length === 0, errors }
      },

      validateTicketData: (ticket) => {
        const errors: string[] = []

        if (!ticket.name?.trim()) errors.push("Nome do ingresso é obrigatório")
        if (!ticket.price || ticket.price < 0) errors.push("Preço deve ser maior ou igual a zero")
        if (!ticket.quantityTotal || ticket.quantityTotal <= 0) errors.push("Quantidade deve ser maior que zero")

        return { isValid: errors.length === 0, errors }
      },

      getEventParticipants: (eventId) => {
        const state = get()
        const participants: any[] = []

        // Participantes manuais
        state.manualParticipants
          .filter((p) => p.eventId === eventId)
          .forEach((p) => {
            participants.push({
              id: p.id,
              name: p.formData.name || "Nome não informado",
              email: p.formData.email || "Email não informado",
              phone: p.formData.phone,
              ticketTypeName: p.ticketTypeName,
              checkedIn: p.checkedIn,
              checkedInAt: p.checkedInAt,
              code: p.code,
              customFields: p.formData,
              addedAt: p.addedAt,
              isManual: true,
            })
          })

        // Participantes de pedidos
        state.orders
          .filter((o) => o.eventId === eventId)
          .forEach((order) => {
            order.items.forEach((item) => {
              item.attendees.forEach((attendee) => {
                participants.push({
                  id: attendee.id,
                  name: attendee.name,
                  email: attendee.email,
                  phone: attendee.phone,
                  ticketTypeName: item.ticketName,
                  checkedIn: attendee.checkedIn,
                  checkedInAt: attendee.checkedInAt,
                  code: attendee.code,
                  customFields: attendee.customFields,
                  order,
                  unitPrice: item.unitPrice,
                  isManual: false,
                })
              })
            })
          })

        return participants
      },

      generateTicketForParticipant: (participantId, eventId) => {
        try {
          const state = get()
          const event = state.events.find((e) => e.id === eventId)

          if (!event) {
            return { success: false, error: "Evento não encontrado" }
          }

          // Encontrar participante
          let participant = null
          const manualParticipant = state.manualParticipants.find((p) => p.id === participantId)

          if (manualParticipant) {
            participant = manualParticipant
          } else {
            // Procurar em pedidos
            for (const order of state.orders) {
              for (const item of order.items) {
                const attendee = item.attendees.find((a) => a.id === participantId)
                if (attendee) {
                  participant = attendee
                  break
                }
              }
              if (participant) break
            }
          }

          if (!participant) {
            return { success: false, error: "Participante não encontrado" }
          }

          const ticketData = {
            participantId,
            eventId,
            participantName: participant.name || participant.formData?.name,
            eventName: event.name,
            eventDate: event.date,
            eventTime: event.time,
            qrCode: participant.qrCode,
            code: participant.code,
          }

          return { success: true, ticketData }
        } catch (error) {
          return { success: false, error: "Erro ao gerar ingresso" }
        }
      },

      recordDownload: (ticketId, format, success, userId) => {
        set((state) => ({
          downloadHistory: [
            ...state.downloadHistory,
            {
              ticketId,
              format,
              timestamp: Date.now(),
              success,
              userId,
            },
          ],
        }))
      },

      getDownloadHistory: (userId) => {
        const state = get()
        return userId ? state.downloadHistory.filter((h) => h.userId === userId) : state.downloadHistory
      },

      getUserTickets: (userEmail) => {
        const state = get()
        const tickets: any[] = []

        // Buscar em pedidos
        state.orders.forEach((order) => {
          if (order.buyerEmail === userEmail) {
            const event = state.events.find((e) => e.id === order.eventId)
            if (event) {
              order.items.forEach((item) => {
                item.attendees.forEach((attendee) => {
                  tickets.push({
                    id: attendee.id,
                    code: attendee.code,
                    participantName: attendee.name,
                    participantEmail: attendee.email,
                    participantPhone: attendee.phone,
                    ticketTypeName: item.ticketName,
                    price: item.unitPrice,
                    checkedIn: attendee.checkedIn,
                    checkedInAt: attendee.checkedInAt,
                    customFields: attendee.customFields,
                    eventId: event.id,
                    eventName: event.name,
                    eventDate: event.date,
                    eventTime: event.time,
                    eventLocation: event.location,
                    eventBanner: event.bannerUrl,
                    orderId: order.id,
                    orderDate: order.createdAt,
                    paymentStatus: order.paymentStatus,
                    isManual: false,
                  })
                })
              })
            }
          }
        })

        return tickets
      },

      getStationByOperatorId: (operatorId) => {
        const state = get()
        return state.stations.find((s) => s.operatorId === operatorId) || null
      },

      updateStationActivity: (stationId, checkinCount) => {
        set((state) => ({
          stations: state.stations.map((station) =>
            station.id === stationId ? { ...station, checkedInCount: checkinCount, lastActivity: Date.now() } : station,
          ),
        }))
      },

      addNotification: (notification) => {
        const id = `NOTIF${Math.random().toString(36).substring(2, 15)}`
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              createdAt: Date.now(),
              isRead: false,
            },
          ],
        }))
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
        }))
      },

      getUnreadNotifications: (userId) => {
        const state = get()
        return state.notifications.filter((n) => !n.isRead && (!userId || n.userId === userId))
      },

      setAutoTicketConfig: (eventId, config) => {
        set((state) => ({
          autoTicketConfigs: {
            ...state.autoTicketConfigs,
            [eventId]: { ...state.autoTicketConfigs[eventId], ...config },
          },
        }))
      },

      getAutoTicketConfig: (eventId) => {
        const state = get()
        return state.autoTicketConfigs[eventId] || null
      },

      getGeneratedTickets: (eventId, participantId) => {
        const state = get()
        let tickets = state.generatedTickets

        if (eventId) {
          tickets = tickets.filter((t) => t.eventId === eventId)
        }

        if (participantId) {
          tickets = tickets.filter((t) => t.participantId === participantId)
        }

        return tickets
      },
    }),
    {
      name: "event-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
