import type { EventItem, Station, Order, User } from "./types"

// DADOS TEMPORÁRIOS PARA VISUALIZAÇÃO - REMOVER EM PRODUÇÃO
export const TEMP_MOCK_DATA = {
  // Usuário operador mockado
  currentUser: {
    id: "op-001",
    name: "João Silva",
    email: "joao@eventpass.com",
    role: "operador" as const,
    permissions: ["checkin"],
    createdAt: Date.now() - 86400000, // 1 dia atrás
  } as User,

  // Estação mockada
  station: {
    id: "station-001",
    name: "Estação Principal - Entrada A",
    eventId: "event-001",
    operatorId: "op-001",
    isActive: true,
    location: "Entrada Principal",
    checkedInCount: 45,
    lastActivity: Date.now() - 300000, // 5 minutos atrás
    settings: {
      soundEnabled: true,
      autoprint: false,
      requireConfirmation: false,
      advancedMode: true,
    },
    createdAt: Date.now() - 86400000,
  } as Station,

  // Evento mockado
  event: {
    id: "event-001",
    name: "Congresso de Tecnologia 2024",
    description: "O maior evento de tecnologia do Brasil",
    category: "Conferência",
    type: "presencial" as const,
    status: "publicado" as const,
    startDate: Date.now() + 86400000, // Amanhã
    endDate: Date.now() + 172800000, // Depois de amanhã
    startTime: "09:00",
    endTime: "18:00",
    location: "Centro de Convenções",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    organizerName: "TechEvents Brasil",
    ticketNotes: "Apresentar documento com foto na entrada. Evento sujeito a revista de segurança.",
    maxCapacity: 500,
    currentCapacity: 0,
    ticketTypes: [
      {
        id: "ticket-001",
        name: "Ingresso VIP",
        description: "Acesso completo + coffee break premium + networking",
        price: 299.99,
        quantity: 50,
        sold: 35,
        isVisible: true,
        salesStart: Date.now() - 2592000000, // 30 dias atrás
        salesEnd: Date.now() + 86400000, // Amanhã
        maxPerPurchase: 2,
        accessConfig: {
          allowMultipleEntries: true,
          maxEntriesPerDay: 5,
          allowedZones: ["vip", "geral", "networking"],
          timeRestrictions: {
            startTime: "08:00",
            endTime: "20:00",
          },
          specialPermissions: ["early_access", "premium_area"],
        },
      },
      {
        id: "ticket-002",
        name: "Ingresso Geral",
        description: "Acesso às palestras principais",
        price: 149.99,
        quantity: 300,
        sold: 180,
        isVisible: true,
        salesStart: Date.now() - 2592000000,
        salesEnd: Date.now() + 86400000,
        maxPerPurchase: 4,
        accessConfig: {
          allowMultipleEntries: true,
          maxEntriesPerDay: 3,
          allowedZones: ["geral"],
          timeRestrictions: {
            startTime: "09:00",
            endTime: "18:00",
          },
          specialPermissions: [],
        },
      },
      {
        id: "ticket-003",
        name: "Ingresso Estudante",
        description: "Meia-entrada para estudantes",
        price: 74.99,
        quantity: 150,
        sold: 89,
        isVisible: true,
        salesStart: Date.now() - 2592000000,
        salesEnd: Date.now() + 86400000,
        maxPerPurchase: 1,
        accessConfig: {
          allowMultipleEntries: false,
          maxEntriesPerDay: 1,
          allowedZones: ["geral"],
          timeRestrictions: {
            startTime: "09:00",
            endTime: "18:00",
          },
          specialPermissions: [],
        },
      },
    ],
    createdAt: Date.now() - 2592000000,
    updatedAt: Date.now() - 86400000,
  } as EventItem,

  // Pedidos mockados com participantes
  orders: [
    {
      id: "order-001",
      eventId: "event-001",
      buyerName: "Maria Santos",
      buyerEmail: "maria@email.com",
      buyerPhone: "(11) 99999-1111",
      status: "pago" as const,
      paymentMethod: "cartao",
      total: 299.99,
      serviceFee: 29.99,
      orderNumber: "EP-12345",
      items: [
        {
          ticketName: "Ingresso VIP",
          quantity: 1,
          price: 299.99,
          attendees: [
            {
              id: "att-001",
              name: "Maria Santos",
              email: "maria@email.com",
              phone: "(11) 99999-1111",
              code: "TECH-A1B2C",
              checkedIn: true,
              checkedInAt: Date.now() - 3600000, // 1 hora atrás
              checkInCount: 2,
              lastZone: "vip",
              customFields: {
                empresa: "Tech Solutions",
                cargo: "Desenvolvedora Senior",
              },
            },
          ],
        },
      ],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: "order-002",
      eventId: "event-001",
      buyerName: "Carlos Oliveira",
      buyerEmail: "carlos@email.com",
      buyerPhone: "(11) 88888-2222",
      status: "pago" as const,
      paymentMethod: "pix",
      total: 149.99,
      serviceFee: 14.99,
      orderNumber: "EP-12346",
      items: [
        {
          ticketName: "Ingresso Geral",
          quantity: 1,
          price: 149.99,
          attendees: [
            {
              id: "att-002",
              name: "Carlos Oliveira",
              email: "carlos@email.com",
              phone: "(11) 88888-2222",
              code: "TECH-D3E4F",
              checkedIn: false,
              customFields: {
                empresa: "StartupXYZ",
                cargo: "CTO",
              },
            },
          ],
        },
      ],
      createdAt: Date.now() - 172800000, // 2 dias atrás
      updatedAt: Date.now() - 172800000,
    },
    {
      id: "order-003",
      eventId: "event-001",
      buyerName: "Ana Costa",
      buyerEmail: "ana@email.com",
      buyerPhone: "(11) 77777-3333",
      status: "pago" as const,
      paymentMethod: "cartao",
      total: 74.99,
      serviceFee: 7.49,
      orderNumber: "EP-12347",
      items: [
        {
          ticketName: "Ingresso Estudante",
          quantity: 1,
          price: 74.99,
          attendees: [
            {
              id: "att-003",
              name: "Ana Costa",
              email: "ana@email.com",
              phone: "(11) 77777-3333",
              code: "TECH-G5H6I",
              checkedIn: true,
              checkedInAt: Date.now() - 1800000, // 30 minutos atrás
              checkInCount: 1,
              lastZone: "geral",
              customFields: {
                universidade: "USP",
                curso: "Ciência da Computação",
              },
            },
          ],
        },
      ],
      createdAt: Date.now() - 259200000, // 3 dias atrás
      updatedAt: Date.now() - 1800000,
    },
    {
      id: "order-004",
      eventId: "event-001",
      buyerName: "Pedro Silva",
      buyerEmail: "pedro@email.com",
      buyerPhone: "(11) 66666-4444",
      status: "pago" as const,
      paymentMethod: "boleto",
      total: 599.98,
      serviceFee: 59.99,
      orderNumber: "EP-12348",
      items: [
        {
          ticketName: "Ingresso VIP",
          quantity: 2,
          price: 299.99,
          attendees: [
            {
              id: "att-004",
              name: "Pedro Silva",
              email: "pedro@email.com",
              phone: "(11) 66666-4444",
              code: "TECH-J7K8L",
              checkedIn: false,
              customFields: {
                empresa: "MegaCorp",
                cargo: "Diretor de TI",
              },
            },
            {
              id: "att-005",
              name: "Lucia Silva",
              email: "lucia@email.com",
              phone: "(11) 66666-5555",
              code: "TECH-M9N0O",
              checkedIn: true,
              checkedInAt: Date.now() - 7200000, // 2 horas atrás
              checkInCount: 1,
              lastZone: "vip",
              customFields: {
                empresa: "MegaCorp",
                cargo: "Gerente de Projetos",
              },
            },
          ],
        },
      ],
      createdAt: Date.now() - 345600000, // 4 dias atrás
      updatedAt: Date.now() - 7200000,
    },
    {
      id: "order-005",
      eventId: "event-001",
      buyerName: "Roberto Mendes",
      buyerEmail: "roberto@email.com",
      buyerPhone: "(11) 55555-6666",
      status: "pago" as const,
      paymentMethod: "pix",
      total: 449.97,
      serviceFee: 44.99,
      orderNumber: "EP-12349",
      items: [
        {
          ticketName: "Ingresso Geral",
          quantity: 3,
          price: 149.99,
          attendees: [
            {
              id: "att-006",
              name: "Roberto Mendes",
              email: "roberto@email.com",
              phone: "(11) 55555-6666",
              code: "TECH-P1Q2R",
              checkedIn: false,
              customFields: {
                empresa: "DevTeam",
                cargo: "Tech Lead",
              },
            },
            {
              id: "att-007",
              name: "Fernanda Lima",
              email: "fernanda@email.com",
              phone: "(11) 55555-7777",
              code: "TECH-S3T4U",
              checkedIn: true,
              checkedInAt: Date.now() - 5400000, // 1.5 horas atrás
              checkInCount: 1,
              lastZone: "geral",
              customFields: {
                empresa: "DevTeam",
                cargo: "UX Designer",
              },
            },
            {
              id: "att-008",
              name: "Marcos Pereira",
              email: "marcos@email.com",
              phone: "(11) 55555-8888",
              code: "TECH-V5W6X",
              checkedIn: false,
              customFields: {
                empresa: "DevTeam",
                cargo: "Backend Developer",
              },
            },
          ],
        },
      ],
      createdAt: Date.now() - 432000000, // 5 dias atrás
      updatedAt: Date.now() - 5400000,
    },
  ] as Order[],

  // Zonas de acesso mockadas
  accessZones: [
    {
      id: "vip",
      name: "Área VIP",
      description: "Área exclusiva para ingressos VIP",
      eventId: "event-001",
      color: "#FFD700",
      isActive: true,
    },
    {
      id: "geral",
      name: "Área Geral",
      description: "Área principal do evento",
      eventId: "event-001",
      color: "#4F46E5",
      isActive: true,
    },
    {
      id: "networking",
      name: "Área de Networking",
      description: "Espaço para networking e coffee break",
      eventId: "event-001",
      color: "#10B981",
      isActive: true,
    },
  ],
}
