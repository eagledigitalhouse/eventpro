export interface TicketTemplate {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  layout: {
    headerHeight: number
    qrPosition: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center"
    logoPosition: "top-left" | "top-center" | "top-right" | "hidden"
    showPerforation: boolean
    borderRadius: number
  }
  typography: {
    titleFont: string
    bodyFont: string
    titleSize: string
    bodySize: string
  }
  customFields: {
    showEventDescription: boolean
    showPrice: boolean
    showTransferInfo: boolean
    additionalText?: string
  }
}

export const DEFAULT_TEMPLATES: TicketTemplate[] = [
  {
    id: "default",
    name: "Padrão",
    description: "Template clássico com design limpo e profissional",
    preview: "/templates/default-preview.png",
    colors: {
      primary: "#3b82f6",
      secondary: "#e0f2fe",
      accent: "#ffffff",
      text: "#1f2937",
      background: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
    },
    layout: {
      headerHeight: 200,
      qrPosition: "top-right",
      logoPosition: "top-left",
      showPerforation: true,
      borderRadius: 16,
    },
    typography: {
      titleFont: "font-bold",
      bodyFont: "font-medium",
      titleSize: "text-3xl",
      bodySize: "text-base",
    },
    customFields: {
      showEventDescription: true,
      showPrice: true,
      showTransferInfo: true,
    },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Design elegante com gradientes e acabamento luxuoso",
    preview: "/templates/premium-preview.png",
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "rgba(255, 255, 255, 0.2)",
      text: "#ffffff",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    layout: {
      headerHeight: 220,
      qrPosition: "top-right",
      logoPosition: "top-left",
      showPerforation: true,
      borderRadius: 20,
    },
    typography: {
      titleFont: "font-bold",
      bodyFont: "font-medium",
      titleSize: "text-4xl",
      bodySize: "text-lg",
    },
    customFields: {
      showEventDescription: true,
      showPrice: true,
      showTransferInfo: true,
      additionalText: "Ingresso Premium - Acesso VIP",
    },
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Design clean e moderno com foco na simplicidade",
    preview: "/templates/minimal-preview.png",
    colors: {
      primary: "#000000",
      secondary: "#f8fafc",
      accent: "#f1f5f9",
      text: "#1e293b",
      background: "#ffffff",
    },
    layout: {
      headerHeight: 160,
      qrPosition: "bottom-right",
      logoPosition: "top-center",
      showPerforation: false,
      borderRadius: 8,
    },
    typography: {
      titleFont: "font-light",
      bodyFont: "font-normal",
      titleSize: "text-2xl",
      bodySize: "text-sm",
    },
    customFields: {
      showEventDescription: false,
      showPrice: false,
      showTransferInfo: false,
    },
  },
  {
    id: "corporate",
    name: "Corporativo",
    description: "Template profissional para eventos empresariais",
    preview: "/templates/corporate-preview.png",
    colors: {
      primary: "#1e3a8a",
      secondary: "#3730a3",
      accent: "rgba(255, 255, 255, 0.15)",
      text: "#ffffff",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
    },
    layout: {
      headerHeight: 180,
      qrPosition: "top-right",
      logoPosition: "top-left",
      showPerforation: true,
      borderRadius: 12,
    },
    typography: {
      titleFont: "font-semibold",
      bodyFont: "font-medium",
      titleSize: "text-3xl",
      bodySize: "text-base",
    },
    customFields: {
      showEventDescription: true,
      showPrice: false,
      showTransferInfo: true,
      additionalText: "Evento Corporativo",
    },
  },
]

export class TicketTemplateService {
  // Obter template por ID
  static getTemplate(templateId: string): TicketTemplate | null {
    return DEFAULT_TEMPLATES.find((t) => t.id === templateId) || null
  }

  // Obter todos os templates
  static getAllTemplates(): TicketTemplate[] {
    return DEFAULT_TEMPLATES
  }

  // Criar template customizado
  static createCustomTemplate(
    eventId: string,
    baseTemplate: TicketTemplate,
    customizations: Partial<TicketTemplate>,
  ): TicketTemplate {
    return {
      ...baseTemplate,
      ...customizations,
      id: `custom-${eventId}-${Date.now()}`,
      name: customizations.name || `${baseTemplate.name} Personalizado`,
    }
  }

  // Aplicar customizações do produtor
  static applyEventCustomizations(
    template: TicketTemplate,
    eventCustomizations: {
      logo?: string
      primaryColor?: string
      secondaryColor?: string
      additionalText?: string
      showFields?: string[]
    },
  ): TicketTemplate {
    const customized = { ...template }

    if (eventCustomizations.primaryColor) {
      customized.colors.primary = eventCustomizations.primaryColor
    }

    if (eventCustomizations.secondaryColor) {
      customized.colors.secondary = eventCustomizations.secondaryColor
    }

    if (eventCustomizations.additionalText) {
      customized.customFields.additionalText = eventCustomizations.additionalText
    }

    if (eventCustomizations.showFields) {
      customized.customFields.showEventDescription = eventCustomizations.showFields.includes("description")
      customized.customFields.showPrice = eventCustomizations.showFields.includes("price")
      customized.customFields.showTransferInfo = eventCustomizations.showFields.includes("transfer")
    }

    return customized
  }

  // Validar template
  static validateTemplate(template: TicketTemplate): boolean {
    return !!(
      template.id &&
      template.name &&
      template.colors &&
      template.layout &&
      template.typography &&
      template.customFields
    )
  }
}
