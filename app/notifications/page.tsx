"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, MessageSquare, Send, Clock, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type NotificationTemplate = {
  id: string
  name: string
  type: "email" | "sms" | "push"
  trigger: "purchase" | "reminder" | "checkin" | "custom"
  subject: string
  content: string
  isActive: boolean
  createdAt: number
}

type NotificationCampaign = {
  id: string
  name: string
  eventId: string
  templateId: string
  targetAudience: "all" | "purchased" | "checkedin" | "not_checkedin"
  scheduledFor?: number
  sentAt?: number
  status: "rascunho" | "agendado" | "enviado" | "falhou"
  recipientCount: number
  openRate?: number
  clickRate?: number
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events)
  const orders = useEventStore((s) => s.orders)
  const notificationTemplates = useEventStore((s) => s.notificationTemplates || [])
  const notificationCampaigns = useEventStore((s) => s.notificationCampaigns || [])
  const addNotificationTemplate = useEventStore((s) => s.addNotificationTemplate)
  const updateNotificationTemplate = useEventStore((s) => s.updateNotificationTemplate)
  const deleteNotificationTemplate = useEventStore((s) => s.deleteNotificationTemplate)
  const addNotificationCampaign = useEventStore((s) => s.addNotificationCampaign)
  const updateNotificationCampaign = useEventStore((s) => s.updateNotificationCampaign)
  const deleteNotificationCampaign = useEventStore((s) => s.deleteNotificationCampaign)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null)

  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "email" as "email" | "sms" | "push",
    trigger: "custom" as "purchase" | "reminder" | "checkin" | "custom",
    subject: "",
    content: "",
    isActive: true,
  })

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    eventId: "",
    templateId: "",
    targetAudience: "all" as "all" | "purchased" | "checkedin" | "not_checkedin",
    scheduledFor: "",
  })

  const stats = useMemo(() => {
    const totalSent = notificationCampaigns
      .filter((c) => c.status === "enviado")
      .reduce((sum, c) => sum + c.recipientCount, 0)
    const totalScheduled = notificationCampaigns.filter((c) => c.status === "agendado").length
    const avgOpenRate =
      notificationCampaigns.filter((c) => c.openRate).reduce((sum, c) => sum + (c.openRate || 0), 0) /
        notificationCampaigns.filter((c) => c.openRate).length || 0
    const avgClickRate =
      notificationCampaigns.filter((c) => c.clickRate).reduce((sum, c) => sum + (c.clickRate || 0), 0) /
        notificationCampaigns.filter((c) => c.clickRate).length || 0

    return {
      totalSent,
      totalScheduled,
      avgOpenRate,
      avgClickRate,
      activeTemplates: notificationTemplates.filter((t) => t.isActive).length,
    }
  }, [notificationCampaigns, notificationTemplates])

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      type: "email",
      trigger: "custom",
      subject: "",
      content: "",
      isActive: true,
    })
    setEditingTemplate(null)
  }

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      eventId: "",
      templateId: "",
      targetAudience: "all",
      scheduledFor: "",
    })
    setEditingCampaign(null)
  }

  const openTemplateDialog = (template?: NotificationTemplate) => {
    if (template) {
      setTemplateForm({
        name: template.name,
        type: template.type,
        trigger: template.trigger,
        subject: template.subject,
        content: template.content,
        isActive: template.isActive,
      })
      setEditingTemplate(template.id)
    } else {
      resetTemplateForm()
    }
    setDialogOpen(true)
  }

  const openCampaignDialog = (campaign?: NotificationCampaign) => {
    if (campaign) {
      setCampaignForm({
        name: campaign.name,
        eventId: campaign.eventId,
        templateId: campaign.templateId,
        targetAudience: campaign.targetAudience,
        scheduledFor: campaign.scheduledFor ? new Date(campaign.scheduledFor).toISOString().slice(0, 16) : "",
      })
      setEditingCampaign(campaign.id)
    } else {
      resetCampaignForm()
    }
    setCampaignDialogOpen(true)
  }

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.content) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    if (editingTemplate && updateNotificationTemplate) {
      updateNotificationTemplate(editingTemplate, templateForm)
      toast({ title: "Template atualizado com sucesso!" })
    } else if (addNotificationTemplate) {
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        createdAt: Date.now(),
      }
      addNotificationTemplate(newTemplate)
      toast({ title: "Template criado com sucesso!" })
    }

    setDialogOpen(false)
    resetTemplateForm()
  }

  const saveCampaign = () => {
    if (!campaignForm.name || !campaignForm.eventId || !campaignForm.templateId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    const event = events.find((e) => e.id === campaignForm.eventId)
    if (!event) {
      toast({ title: "Evento não encontrado", variant: "destructive" })
      return
    }

    const eventOrders = orders.filter((o) => o.eventId === campaignForm.eventId)
    let recipientCount = 0

    switch (campaignForm.targetAudience) {
      case "all":
        recipientCount = eventOrders.reduce(
          (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0,
        )
        break
      case "purchased":
        recipientCount = eventOrders.length
        break
      case "checkedin":
        recipientCount = eventOrders.reduce(
          (sum, o) =>
            sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => a.checkedIn).length, 0),
          0,
        )
        break
      case "not_checkedin":
        recipientCount = eventOrders.reduce(
          (sum, o) =>
            sum + o.items.reduce((itemSum, item) => itemSum + item.attendees.filter((a) => !a.checkedIn).length, 0),
          0,
        )
        break
    }

    const campaignData = {
      ...campaignForm,
      scheduledFor: campaignForm.scheduledFor ? new Date(campaignForm.scheduledFor).getTime() : undefined,
      recipientCount,
      status: (campaignForm.scheduledFor ? "agendado" : "rascunho") as const,
      openRate: Math.random() * 30 + 15,
      clickRate: Math.random() * 10 + 2,
    }

    if (editingCampaign && updateNotificationCampaign) {
      updateNotificationCampaign(editingCampaign, campaignData)
      toast({ title: "Campanha atualizada com sucesso!" })
    } else if (addNotificationCampaign) {
      const newCampaign: NotificationCampaign = {
        id: Date.now().toString(),
        ...campaignData,
      }
      addNotificationCampaign(newCampaign)
      toast({ title: "Campanha criada com sucesso!" })
    }

    setCampaignDialogOpen(false)
    resetCampaignForm()
  }

  const sendCampaign = (campaignId: string) => {
    if (updateNotificationCampaign) {
      updateNotificationCampaign(campaignId, {
        status: "enviado",
        sentAt: Date.now(),
      })
      toast({ title: "Campanha enviada com sucesso!" })
    }
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este template?") && deleteNotificationTemplate) {
      deleteNotificationTemplate(id)
      toast({ title: "Template excluído com sucesso!" })
    }
  }

  const handleDeleteCampaign = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta campanha?") && deleteNotificationCampaign) {
      deleteNotificationCampaign(id)
      toast({ title: "Campanha excluída com sucesso!" })
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Notificações</h1>
          <p className="text-muted-foreground">Gerencie templates e campanhas de comunicação</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openTemplateDialog()} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Template</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Confirmação de Compra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value: any) => setTemplateForm((f) => ({ ...f, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gatilho</Label>
                  <Select
                    value={templateForm.trigger}
                    onValueChange={(value: any) => setTemplateForm((f) => ({ ...f, trigger: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Após Compra</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                      <SelectItem value="checkin">Check-in</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {templateForm.type === "email" && (
                  <div className="space-y-2">
                    <Label>Assunto</Label>
                    <Input
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Assunto do e-mail"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Use {{name}}, {{event_name}}, {{event_date}}, {{event_time}}, {{event_location}} para personalizar"
                    rows={6}
                  />
                  <div className="text-xs text-muted-foreground">
                    Variáveis disponíveis:{" "}
                    {`{{name}}, {{event_name}}, {{event_date}}, {{event_time}}, {{event_location}}`}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Template ativo</Label>
                  <Switch
                    checked={templateForm.isActive}
                    onCheckedChange={(checked) => setTemplateForm((f) => ({ ...f, isActive: checked }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveTemplate}>{editingTemplate ? "Atualizar" : "Criar"} Template</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openCampaignDialog()} className="gap-2">
                <Send className="h-4 w-4" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCampaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Campanha</Label>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Lembrete Evento Tech"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Evento</Label>
                    <Select
                      value={campaignForm.eventId}
                      onValueChange={(value) => setCampaignForm((f) => ({ ...f, eventId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select
                      value={campaignForm.templateId}
                      onValueChange={(value) => setCampaignForm((f) => ({ ...f, templateId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTemplates
                          .filter((t) => t.isActive)
                          .map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Público-alvo</Label>
                  <Select
                    value={campaignForm.targetAudience}
                    onValueChange={(value: any) => setCampaignForm((f) => ({ ...f, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os participantes</SelectItem>
                      <SelectItem value="purchased">Apenas compradores</SelectItem>
                      <SelectItem value="checkedin">Apenas credenciados</SelectItem>
                      <SelectItem value="not_checkedin">Não credenciados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Agendar para (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduledFor}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, scheduledFor: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveCampaign}>{editingCampaign ? "Atualizar" : "Criar"} Campanha</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">Notificações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScheduled}</div>
            <p className="text-xs text-muted-foreground">Campanhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgClickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Ativos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTemplates}</div>
            <p className="text-xs text-muted-foreground">De {notificationTemplates.length} total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Templates de Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationTemplates.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum template criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie templates de notificação para automatizar sua comunicação.
                </p>
                <Button onClick={() => openTemplateDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{template.name}</div>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {template.type === "email" ? template.subject : template.content}
                      </div>
                      <div className="text-xs text-muted-foreground">Gatilho: {template.trigger}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openTemplateDialog(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanhas de Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma campanha criada</h3>
                <p className="text-muted-foreground mb-4">Crie campanhas para enviar notificações aos participantes.</p>
                <Button onClick={() => openCampaignDialog()}>
                  <Send className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationCampaigns.map((campaign) => {
                  const event = events.find((e) => e.id === campaign.eventId)
                  const template = notificationTemplates.find((t) => t.id === campaign.templateId)

                  return (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{campaign.name}</div>
                          <Badge
                            variant={
                              campaign.status === "enviado"
                                ? "default"
                                : campaign.status === "agendado"
                                  ? "secondary"
                                  : campaign.status === "falhou"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {campaign.status === "enviado"
                              ? "Enviada"
                              : campaign.status === "agendado"
                                ? "Agendada"
                                : campaign.status === "falhou"
                                  ? "Falhou"
                                  : "Rascunho"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event?.name} • {template?.name} • {campaign.recipientCount} destinatários
                        </div>
                        {campaign.scheduledFor && (
                          <div className="text-xs text-muted-foreground">
                            Agendada para: {new Date(campaign.scheduledFor).toLocaleString("pt-BR")}
                          </div>
                        )}
                        {campaign.status === "enviado" && campaign.openRate && (
                          <div className="text-xs text-muted-foreground">
                            Abertura: {campaign.openRate.toFixed(1)}% • Clique: {campaign.clickRate?.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === "rascunho" && (
                          <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openCampaignDialog(campaign)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
