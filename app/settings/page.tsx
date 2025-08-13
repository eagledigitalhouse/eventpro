"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Trash2, AlertTriangle, Save } from "lucide-react"
import { useEventStore } from "@/lib/store"

export default function SettingsPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)

  const [settings, setSettings] = useState({
    organizationName: "Minha Empresa",
    organizationEmail: "contato@minhaempresa.com",
    organizationPhone: "(11) 99999-9999",
    defaultEventSettings: {
      allowTransfers: true,
      requireApproval: false,
      showRemainingTickets: true,
      enableWaitlist: false,
      autoConfirmPayment: true,
    },
    emailNotifications: {
      newOrder: true,
      checkinReminder: true,
      eventReminder: true,
      lowStock: true,
    },
    appearance: {
      theme: "system",
      compactMode: false,
      showAdvancedFeatures: true,
    },
  })

  const saveSettings = () => {
    // In a real app, this would save to backend/localStorage
    toast({ title: "Configurações salvas com sucesso!" })
  }

  const exportData = () => {
    const data = {
      events,
      orders,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `backup-eventos-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({ title: "Backup exportado com sucesso!" })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // In a real app, this would validate and import the data
        toast({ title: "Dados importados com sucesso!" })
      } catch (error) {
        toast({ title: "Erro ao importar dados", variant: "destructive" })
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      // In a real app, this would clear the store
      toast({ title: "Todos os dados foram removidos", variant: "destructive" })
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta e aplicação</p>
      </div>

      <div className="space-y-6">
        {/* Informações da Organização */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Organização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome da Empresa</Label>
                <Input
                  id="org-name"
                  value={settings.organizationName}
                  onChange={(e) => setSettings((s) => ({ ...s, organizationName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">E-mail</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={settings.organizationEmail}
                  onChange={(e) => setSettings((s) => ({ ...s, organizationEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Telefone</Label>
                <Input
                  id="org-phone"
                  value={settings.organizationPhone}
                  onChange={(e) => setSettings((s) => ({ ...s, organizationPhone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Padrão de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Padrão de Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Permitir transferência de ingressos</div>
                  <div className="text-sm text-muted-foreground">Participantes podem transferir ingressos</div>
                </div>
                <Switch
                  checked={settings.defaultEventSettings.allowTransfers}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      defaultEventSettings: { ...s.defaultEventSettings, allowTransfers: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mostrar ingressos restantes</div>
                  <div className="text-sm text-muted-foreground">Exibir quantidade disponível na página do evento</div>
                </div>
                <Switch
                  checked={settings.defaultEventSettings.showRemainingTickets}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      defaultEventSettings: { ...s.defaultEventSettings, showRemainingTickets: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Lista de espera</div>
                  <div className="text-sm text-muted-foreground">Permitir inscrição quando esgotado</div>
                </div>
                <Switch
                  checked={settings.defaultEventSettings.enableWaitlist}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      defaultEventSettings: { ...s.defaultEventSettings, enableWaitlist: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações por E-mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Novos pedidos</div>
                  <div className="text-sm text-muted-foreground">Receber notificação a cada venda</div>
                </div>
                <Switch
                  checked={settings.emailNotifications.newOrder}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      emailNotifications: { ...s.emailNotifications, newOrder: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Lembrete de check-in</div>
                  <div className="text-sm text-muted-foreground">Lembrar participantes 1 dia antes</div>
                </div>
                <Switch
                  checked={settings.emailNotifications.checkinReminder}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      emailNotifications: { ...s.emailNotifications, checkinReminder: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Estoque baixo</div>
                  <div className="text-sm text-muted-foreground">Alertar quando restarem poucos ingressos</div>
                </div>
                <Switch
                  checked={settings.emailNotifications.lowStock}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({
                      ...s,
                      emailNotifications: { ...s.emailNotifications, lowStock: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup e Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Backup e Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button onClick={exportData} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>

              <div>
                <input type="file" accept=".json" onChange={importData} className="hidden" id="import-file" />
                <Button asChild variant="outline" className="gap-2 w-full bg-transparent">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Importar Dados
                  </label>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-destructive">Zona de Perigo</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Esta ação irá remover permanentemente todos os eventos, pedidos e dados da aplicação.
                  </div>
                  <Button onClick={clearAllData} variant="destructive" size="sm" className="mt-3 gap-2">
                    <Trash2 className="h-4 w-4" />
                    Apagar Todos os Dados
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-muted-foreground">Eventos criados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-muted-foreground">Pedidos realizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Ingressos vendidos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </main>
  )
}
