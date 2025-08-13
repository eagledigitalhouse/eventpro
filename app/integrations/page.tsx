"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useEventStore } from "@/lib/store"
import {
  Zap,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  Calendar,
  Users,
  Settings,
  CheckCircle,
  ExternalLink,
  Plus,
  type LucideIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type IntegrationCategory = "payment" | "email" | "analytics" | "calendar" | "crm" | "social"

interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  icon: LucideIcon
  isConnected: boolean
  config?: Record<string, string>
  features: string[]
  pricing?: string
}

interface CategoryInfo {
  id: string
  name: string
  count: number
}

const getAvailableIntegrations = (): Integration[] => [
  {
    id: "stripe",
    name: "Stripe",
    description: "Processamento de pagamentos online seguro e confiável",
    category: "payment",
    icon: CreditCard,
    isConnected: false,
    features: ["Cartão de crédito", "PIX", "Boleto", "Parcelamento", "Webhooks"],
    pricing: "2.9% + R$ 0,39 por transação",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Gateway de pagamento líder na América Latina",
    category: "payment",
    icon: CreditCard,
    isConnected: false,
    features: ["Cartão de crédito", "PIX", "Boleto", "Mercado Pago"],
    pricing: "4.99% por transação",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Plataforma de email marketing e automação",
    category: "email",
    icon: Mail,
    isConnected: false,
    features: ["Email marketing", "Automação", "Segmentação", "Analytics"],
    pricing: "Gratuito até 2.000 contatos",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Serviço de entrega de email transacional",
    category: "email",
    icon: Mail,
    isConnected: false,
    features: ["Email transacional", "Templates", "Analytics", "Webhooks"],
    pricing: "Gratuito até 100 emails/dia",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Envio de mensagens via WhatsApp Business API",
    category: "email",
    icon: MessageSquare,
    isConnected: false,
    features: ["Mensagens automáticas", "Templates", "Confirmações", "Lembretes"],
    pricing: "R$ 0,05 por mensagem",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Análise detalhada de tráfego e conversões",
    category: "analytics",
    icon: BarChart3,
    isConnected: false,
    features: ["Tracking de eventos", "Funis de conversão", "Relatórios", "Audiências"],
    pricing: "Gratuito",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincronização automática de eventos",
    category: "calendar",
    icon: Calendar,
    isConnected: false,
    features: ["Sincronização de eventos", "Lembretes", "Convites", "Calendário público"],
    pricing: "Gratuito",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM e automação de marketing",
    category: "crm",
    icon: Users,
    isConnected: false,
    features: ["Gestão de contatos", "Lead scoring", "Automação", "Relatórios"],
    pricing: "Gratuito até 1.000 contatos",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automação entre mais de 5.000 aplicativos",
    category: "crm",
    icon: Zap,
    isConnected: false,
    features: ["Automação", "Webhooks", "5.000+ integrações", "Workflows"],
    pricing: "Gratuito até 100 tarefas/mês",
  },
]

export default function IntegrationsPage() {
  const { toast } = useToast()
  const integrations = useEventStore((s) => s.integrations || [])
  const addIntegration = useEventStore((s) => s.addIntegration)
  const updateIntegration = useEventStore((s) => s.updateIntegration)
  const deleteIntegration = useEventStore((s) => s.deleteIntegration)

  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>(() => {
    const available = getAvailableIntegrations()
    // Merge with existing integrations from store
    return available.map((integration) => {
      const existing = integrations.find((i) => i.id === integration.id)
      return existing ? { ...integration, ...existing } : integration
    })
  })

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})

  const categories: CategoryInfo[] = [
    { id: "all", name: "Todas", count: availableIntegrations.length },
    {
      id: "payment",
      name: "Pagamentos",
      count: availableIntegrations.filter((i) => i.category === "payment").length,
    },
    {
      id: "email",
      name: "Comunicação",
      count: availableIntegrations.filter((i) => i.category === "email").length,
    },
    {
      id: "analytics",
      name: "Analytics",
      count: availableIntegrations.filter((i) => i.category === "analytics").length,
    },
    {
      id: "calendar",
      name: "Calendário",
      count: availableIntegrations.filter((i) => i.category === "calendar").length,
    },
    {
      id: "crm",
      name: "CRM & Automação",
      count: availableIntegrations.filter((i) => i.category === "crm").length,
    },
  ]

  const filteredIntegrations =
    selectedCategory === "all"
      ? availableIntegrations
      : availableIntegrations.filter((i) => i.category === selectedCategory)

  const connectedCount = availableIntegrations.filter((i) => i.isConnected).length

  const openConfigDialog = (integration: Integration) => {
    setSelectedIntegration(integration)
    setConfig(integration.config || {})
    setConfigDialogOpen(true)
  }

  const saveIntegration = () => {
    if (!selectedIntegration) return

    const updatedIntegration = { ...selectedIntegration, isConnected: true, config }

    setAvailableIntegrations((prev) => prev.map((i) => (i.id === selectedIntegration.id ? updatedIntegration : i)))

    if (updateIntegration) {
      updateIntegration(selectedIntegration.id, updatedIntegration)
    } else if (addIntegration) {
      addIntegration(updatedIntegration)
    }

    toast({
      title: `${selectedIntegration.name} conectado com sucesso!`,
      description: "A integração está ativa e funcionando.",
    })

    setConfigDialogOpen(false)
    setSelectedIntegration(null)
    setConfig({})
  }

  const disconnectIntegration = (integrationId: string) => {
    const integration = availableIntegrations.find((i) => i.id === integrationId)
    if (!integration) return

    if (confirm(`Tem certeza que deseja desconectar ${integration.name}?`)) {
      const updatedIntegration = { ...integration, isConnected: false, config: undefined }

      setAvailableIntegrations((prev) => prev.map((i) => (i.id === integrationId ? updatedIntegration : i)))

      if (deleteIntegration) {
        deleteIntegration(integrationId)
      }

      toast({
        title: `${integration.name} desconectado`,
        description: "A integração foi removida com sucesso.",
      })
    }
  }

  const testIntegration = (integrationId: string) => {
    const integration = availableIntegrations.find((i) => i.id === integrationId)
    if (!integration) return

    setTimeout(() => {
      toast({
        title: `Teste de ${integration.name} realizado`,
        description: "Conexão funcionando corretamente! ✅",
      })
    }, 1000)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte sua plataforma com ferramentas externas para potencializar seus eventos
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrações Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">De {availableIntegrations.length} disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableIntegrations.filter((i) => i.category === "payment" && i.isConnected).length}
            </div>
            <p className="text-xs text-muted-foreground">Gateways conectados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comunicação</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableIntegrations.filter((i) => i.category === "email" && i.isConnected).length}
            </div>
            <p className="text-xs text-muted-foreground">Canais ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableIntegrations.filter((i) => i.category === "crm" && i.isConnected).length}
            </div>
            <p className="text-xs text-muted-foreground">Ferramentas conectadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant={integration.isConnected ? "default" : "secondary"} className="text-xs">
                        {integration.isConnected ? "Conectado" : "Disponível"}
                      </Badge>
                    </div>
                  </div>
                  {integration.isConnected && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{integration.description}</p>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Recursos:</div>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.features.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>

                {integration.pricing && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Preço:</strong> {integration.pricing}
                  </div>
                )}

                <div className="flex gap-2">
                  {integration.isConnected ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => testIntegration(integration.id)}>
                        Testar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openConfigDialog(integration)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => disconnectIntegration(integration.id)}>
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => openConfigDialog(integration)} className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar {selectedIntegration?.name}</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedIntegration.description}</p>

              {selectedIntegration.id === "stripe" && (
                <>
                  <div className="space-y-2">
                    <Label>Chave Pública</Label>
                    <Input
                      placeholder="pk_test_..."
                      value={config.publicKey || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, publicKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave Secreta</Label>
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      value={config.secretKey || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, secretKey: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.id === "mercadopago" && (
                <>
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input
                      placeholder="APP_USR-..."
                      value={config.publicKey || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, publicKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      placeholder="APP_USR-..."
                      value={config.accessToken || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, accessToken: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.id === "mailchimp" && (
                <>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="your-api-key"
                      value={config.apiKey || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server Prefix</Label>
                    <Input
                      placeholder="us1"
                      value={config.serverPrefix || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, serverPrefix: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.id === "sendgrid" && (
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="SG...."
                    value={config.apiKey || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                  />
                </div>
              )}

              {selectedIntegration.id === "whatsapp" && (
                <>
                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <Input
                      placeholder="123456789"
                      value={config.phoneNumberId || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, phoneNumberId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      placeholder="EAAx..."
                      value={config.accessToken || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, accessToken: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.id === "google-analytics" && (
                <div className="space-y-2">
                  <Label>Tracking ID</Label>
                  <Input
                    placeholder="GA_MEASUREMENT_ID"
                    value={config.trackingId || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, trackingId: e.target.value }))}
                  />
                </div>
              )}

              {selectedIntegration.id === "google-calendar" && (
                <div className="space-y-2">
                  <Label>Calendar ID</Label>
                  <Input
                    placeholder="primary"
                    value={config.calendarId || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, calendarId: e.target.value }))}
                  />
                </div>
              )}

              {selectedIntegration.id === "hubspot" && (
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="pat-na1-..."
                    value={config.apiKey || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                  />
                </div>
              )}

              {selectedIntegration.id === "zapier" && (
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://hooks.zapier.com/..."
                    value={config.webhookUrl || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, webhookUrl: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span>Consulte a documentação oficial para obter suas credenciais</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveIntegration}>{selectedIntegration.isConnected ? "Atualizar" : "Conectar"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
