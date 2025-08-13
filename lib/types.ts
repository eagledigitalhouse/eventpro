export type TicketType = {
  id: string
  name: string
  price: number
  quantityTotal: number
  quantitySold: number
  description?: string
  saleStartDate?: string // Data de início das vendas
  saleEndDate?: string // Data de término das vendas
  maxPerPurchase?: number // Limite por compra
  visibility: "publico" | "privado" // Visibilidade do ingresso
  checkinTimeRestriction?: {
    // Restrição de horário para credenciamento
    enabled: boolean
    startTime?: string // HH:mm
    endTime?: string // HH:mm
  }
  accessControl?: {
    allowMultipleEntries: boolean // Permite múltiplas entradas
    maxEntriesPerDay: number // Máximo de entradas por dia (0 = ilimitado)
    validDays: string[] // Dias válidos para entrada (ISO dates)
    accessZones: string[] // Zonas de acesso permitidas
    requiresEscort: boolean // Requer acompanhante autorizado
    specialPermissions: string[] // Permissões especiais (backstage, vip_area, etc.)
  }
  isActive: boolean
}

export type EventItem = {
  id: string
  name: string
  description: string
  date: string // ISO date
  time: string // HH:mm
  location: string
  bannerUrl?: string
  tickets: TicketType[]
  paymentSettings: PaymentSettings // Adicionando configurações de pagamento
  createdAt: number
  updatedAt: number
  status: "rascunho" | "publicado" | "cancelado" | "concluido"
  category?: string
  maxCapacity?: number
  organizerName?: string
  ticketNotes?: string
  settings: {
    allowTransfers: boolean
    requireApproval: boolean
    showRemainingTickets: boolean
    enableWaitlist: boolean
    enableAccessZones?: boolean // Toggle para habilitar/desabilitar controle de zonas
  }
  accessZones?: AccessZone[] // Zonas de acesso personalizadas do evento
}

export type AttendeeTicket = {
  id: string
  code: string
  qrCode?: string // Adicionado QR Code único
  orderNumber?: string // Adicionado referência ao número do pedido
  checkedIn: boolean
  checkedInAt?: number
  // Adicionado para consistência com os dados do comprador e formulários
  name: string
  email: string
  phone?: string
  customFields?: Record<string, any> // Para campos adicionais do formulário
  transferredFrom?: string
  transferredAt?: number
}

export type OrderItem = {
  id: string
  ticketTypeId: string
  ticketName: string
  unitPrice: number
  quantity: number
  attendees: AttendeeTicket[]
  discountApplied?: number
  couponCode?: string
}

export type Order = {
  id: string
  orderNumber: string // Adicionado número do pedido curto
  eventId: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  items: OrderItem[]
  totalAmount: number
  subtotal?: number
  discount?: number
  createdAt: number
  paymentStatus: "pago" | "pendente" | "falhou" | "reembolsado"
  paymentMethod?: string
  notes?: string
}

export type CartItem = {
  ticketTypeId: string
  quantity: number
}

export type Cart = {
  eventId: string | null
  items: CartItem[]
  couponCode?: string
  discount?: number
}

export type Coupon = {
  id: string
  code: string
  eventId: string
  type: "percentage" | "fixed"
  value: number
  maxUses?: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: number
}

export type WaitlistEntry = {
  id: string
  eventId: string
  ticketTypeId: string
  name: string
  email: string
  phone?: string
  quantity: number
  createdAt: number
  notified: boolean
}

export type CheckinLog = {
  id: string
  ticketId: string
  orderId: string
  eventId: string
  checkedInAt: number
  checkedInBy?: string
  method: "qr" | "manual" | "lote"
  location?: string
}

export type CheckinHistory = {
  id: string
  ticketId: string
  participantId: string
  eventId: string
  ticketTypeId: string
  checkedInAt: number
  checkedOutAt?: number // Para controle de saída
  entryNumber: number // Número sequencial da entrada
  accessZone?: string // Zona de acesso utilizada
  stationId?: string // Estação que fez o check-in
  operatorId?: string // Operador que fez o check-in
  method: "qr" | "manual" | "lote"
  notes?: string
}

// Tipos para formulários de evento
export interface FormField {
  id: string
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    dependsOn: string
    value: string
  }
}

export interface EventForm {
  id: string
  eventId: string
  ticketTypeId: string
  ticketTypeName: string
  fields: FormField[]
  isActive: boolean
}

export type FormDefinition = EventForm

// Tipo para participantes adicionados manualmente
export interface ManualParticipant {
  id: string
  eventId: string
  ticketTypeId: string
  ticketTypeName: string
  formData: Record<string, any> // Contém todos os campos do formulário, incluindo nome, email, etc.
  addedAt: number
  checkedIn: boolean
  checkedInAt?: number
  code: string
  qrCode?: string // Adicionado QR Code único para participantes manuais
}

export interface Participant {
  id: string
  name: string
  email: string
  phone?: string
  ticketType: string
  code: string
  qrCode?: string // Adicionado QR Code único
  orderNumber?: string // Adicionado número do pedido
  checkedIn: boolean
  checkedInAt?: number
  customFields?: Record<string, any>
  isManual?: boolean
  eventId?: string
}

export type UserRole = "admin" | "produtor" | "operador_checkin" | "cliente"

export type Permission =
  | "eventos.criar"
  | "eventos.editar"
  | "eventos.excluir"
  | "eventos.visualizar"
  | "checkin.executar"
  | "checkin.gerenciar_estacoes"
  | "relatorios.visualizar"
  | "relatorios.exportar"
  | "usuarios.gerenciar"
  | "configuracoes.gerenciar"
  | "pedidos.visualizar"
  | "pedidos.reembolsar"
  | "cupons.gerenciar"
  | "formularios.gerenciar"

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  createdAt: number
  updatedAt: number
  lastLoginAt?: number
  createdBy?: string
  assignedEvents?: string[] // Para operadores de check-in
  assignedStations?: string[] // Para operadores de check-in
}

export type UserSession = {
  userId: string
  user: User
  token: string
  expiresAt: number
}

export type CheckinStation = {
  id: string
  name: string
  location: string
  description?: string
  isActive: boolean
  eventId: string
  operatorId?: string
  operatorName?: string
  checkedInCount: number
  lastActivity?: number
  settings: {
    autoprint: boolean
    soundEnabled: boolean
    requireConfirmation: boolean
    labelTemplateId?: string
    printerName?: string
  }
  createdAt: number
  updatedAt: number
}

export interface Station {
  id: string
  name: string
  location: string
  description?: string
  isActive: boolean
  eventId: string
  operatorId?: string
  operatorName?: string
  checkedInCount: number
  lastActivity?: number
  settings: {
    autoprint: boolean
    soundEnabled: boolean
    requireConfirmation: boolean
    advancedMode?: boolean
    labelTemplateId?: string
    printerName?: string
  }
  createdAt: number
  updatedAt: number
}

export type AccessZone = {
  id: string
  eventId: string
  name: string
  description?: string
  color: string
  isActive: boolean
  requiredTicketTypes: string[] // Tipos de ingresso que podem acessar
  capacity?: number // Capacidade máxima da zona
  currentOccupancy: number // Ocupação atual
  timeRestrictions?: {
    startTime: string // HH:mm
    endTime: string // HH:mm
  }
  createdAt: number
  updatedAt: number
}

export type LabelTemplate = {
  id: string
  name: string
  description?: string
  template: string // HTML template
  variables: string[] // Available variables like {{participantName}}, {{eventName}}
  dimensions: {
    width: number // in mm
    height: number // in mm
  }
  isDefault: boolean
  isActive: boolean
  createdAt: number
  updatedAt: number
  createdBy: string
}

export type PrintJob = {
  id: string
  type: "individual" | "lote"
  status: "pendente" | "imprimindo" | "concluido" | "falhou"
  templateId: string
  stationId?: string
  eventId: string
  participantIds: string[]
  createdAt: number
  completedAt?: number
  errorMessage?: string
}

export type Notification = {
  id: string
  type: "checkin" | "venda" | "sistema" | "alerta" | "success" | "error"
  title: string
  message: string
  eventId?: string
  userId?: string
  isRead: boolean
  priority?: "baixa" | "media" | "alta"
  createdAt: number
  expiresAt?: number
  data?: Record<string, any>
}

export interface AutoTicketConfig {
  eventId: string
  templateId?: string
  customTemplate?: any
  autoEmail: boolean
  emailTemplate?: string
  generateOnPurchase: boolean
  generateOnCheckIn: boolean
}

export interface GeneratedTicket {
  participantId: string
  ticketId: string
  qrCode: string
  qrData: any
  pdfUrl?: string
  emailSent: boolean
  generatedAt: number
  eventId?: string
  ticketTypeId?: string
}

export interface AdvancedEventSettings {
  checkin: {
    allowEarlyCheckin: boolean
    earlyCheckinHours: number
    allowLateCheckin: boolean
    lateCheckinHours: number
    requirePhotoVerification: boolean
    enableGeofencing: boolean
    geofenceRadius?: number // in meters
    geofenceLatitude?: number
    geofenceLongitude?: number
  }
  notifications: {
    sendConfirmationEmail: boolean
    sendReminderEmail: boolean
    reminderHoursBefore: number
    sendCheckinNotification: boolean
    customEmailTemplate?: string
  }
  security: {
    enableTwoFactorAuth: boolean
    maxTransfersPerTicket: number
    allowRefunds: boolean
    refundDeadlineHours: number
    requireIdVerification: boolean
  }
  analytics: {
    trackUserBehavior: boolean
    enableHeatmaps: boolean
    collectFeedback: boolean
    customTrackingEvents: string[]
  }
}

export type EventItemAdvanced = EventItem & {
  organizerId: string
  collaborators: string[] // User IDs with access
  advancedSettings: AdvancedEventSettings
  stations: CheckinStation[]
  labelTemplates: string[] // Template IDs
}

export interface EventPageComponent {
  id: string
  type: "banner" | "description" | "tickets" | "speakers" | "schedule" | "sponsors" | "location" | "contact"
  isActive: boolean
  order: number
  settings: Record<string, any>
}

export interface Speaker {
  id: string
  name: string
  bio: string
  photo?: string
  role?: string
  company?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    instagram?: string
  }
}

export interface ScheduleItem {
  id: string
  time: string
  title: string
  description?: string
  speaker?: string
  speakerId?: string
  duration?: number
  location?: string
}

export interface Sponsor {
  id: string
  name: string
  logo: string
  website?: string
  tier: "ouro" | "prata" | "bronze" | "apoio"
  description?: string
}

export interface EventPageSettings {
  eventId: string
  components: EventPageComponent[]
  customCss?: string
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }
  content: {
    speakers: Speaker[]
    schedule: ScheduleItem[]
    sponsors: Sponsor[]
    customSections?: Record<string, any>
  }
  isPublished: boolean
  customDomain?: string
  createdAt: number
  updatedAt: number
}

export type PaymentSettings = {
  methods: {
    creditCard: boolean
    bankSlip: boolean // Boleto
    pix: boolean
  }
  serviceFee: {
    percentage: number // Taxa de serviço em %
    paidBy: "organizador" | "participante" // Quem paga a taxa
  }
  installments?: {
    enabled: boolean
    maxInstallments: number
    minAmountPerInstallment: number
  }
}

export interface FinancialTransaction {
  id: string
  eventId: string
  type: "receita" | "despesa"
  category: string
  description: string
  amount: number
  date: string // ISO date
  status: "pago" | "pendente" | "cancelado"
  isAutomatic: boolean // Se foi gerada automaticamente (vendas) ou manual
  relatedOrderId?: string // Para receitas automáticas de vendas
  relatedTicketTypeId?: string // Para associar com tipo de ingresso
  paymentMethod?: "dinheiro" | "cartao" | "pix" | "transferencia" | "boleto"
  attachments?: string[] // URLs de comprovantes/notas fiscais
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface FinancialCategory {
  id: string
  name: string
  type: "receita" | "despesa"
  color: string
  icon?: string
  isDefault: boolean
  isActive: boolean
}

export interface FinancialSummary {
  eventId: string
  totalRevenue: number // Total de receitas
  totalExpenses: number // Total de despesas
  netProfit: number // Lucro líquido
  pendingRevenue: number // Receitas pendentes
  pendingExpenses: number // Despesas pendentes
  confirmedRevenue: number // Receitas confirmadas
  confirmedExpenses: number // Despesas confirmadas
  ticketSales: {
    totalSold: number
    totalAmount: number
    byTicketType: Array<{
      ticketTypeId: string
      ticketTypeName: string
      quantitySold: number
      totalAmount: number
    }>
  }
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  lastUpdated: number
}

export interface FinancialReport {
  id: string
  eventId: string
  type: "resumo" | "detalhado" | "fluxo_caixa" | "vendas_por_periodo"
  title: string
  dateRange: {
    start: string
    end: string
  }
  data: any // Dados específicos do relatório
  generatedAt: number
  generatedBy: string
}
