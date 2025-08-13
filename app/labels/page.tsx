"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useEventStore } from "@/lib/store"
import type { LabelTemplate } from "@/lib/types"
import {
  Tag,
  Plus,
  Printer,
  Eye,
  Edit,
  Trash2,
  Copy,
  Search,
  FileText,
  Ruler,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

interface LabelSize {
  id: string
  name: string
  width: number
  height: number
}

interface AvailableVariable {
  key: string
  label: string
  example: string
}

interface NewTemplateFormData {
  name: string
  description: string
  sizeId: string
  customWidth: number
  customHeight: number
}

const getLabelSizes = (): LabelSize[] => [
  { id: "badge-large", name: "Crachá Grande", width: 85, height: 54 },
  { id: "badge-medium", name: "Crachá Médio", width: 70, height: 45 },
  { id: "badge-small", name: "Crachá Pequeno", width: 60, height: 40 },
  { id: "wristband", name: "Pulseira", width: 254, height: 25 },
  { id: "sticker-round", name: "Adesivo Redondo", width: 50, height: 50 },
  { id: "sticker-square", name: "Adesivo Quadrado", width: 50, height: 50 },
  { id: "custom", name: "Personalizado", width: 0, height: 0 },
]

const getAvailableVariables = (): AvailableVariable[] => [
  { key: "participantName", label: "Nome do Participante", example: "João Silva" },
  { key: "participantEmail", label: "Email do Participante", example: "joao@exemplo.com" },
  { key: "eventName", label: "Nome do Evento", example: "Conferência Tech 2024" },
  { key: "eventDate", label: "Data do Evento", example: "15/03/2024" },
  { key: "eventTime", label: "Horário do Evento", example: "19:00" },
  { key: "eventLocation", label: "Local do Evento", example: "Centro de Convenções" },
  { key: "ticketType", label: "Tipo de Ingresso", example: "VIP" },
  { key: "ticketCode", label: "Código do Ingresso", example: "ABC123" },
  { key: "qrCode", label: "QR Code", example: "[QR Code]" },
  { key: "checkinDate", label: "Data do Check-in", example: "15/03/2024" },
  { key: "checkinTime", label: "Horário do Check-in", example: "18:30" },
  { key: "stationName", label: "Nome da Estação", example: "Entrada Principal" },
]

export default function LabelsPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events)
  const labelTemplates = useEventStore((s) => s.labelTemplates || [])
  const printJobs = useEventStore((s) => s.printJobs || [])
  const addLabelTemplate = useEventStore((s) => s.addLabelTemplate)
  const updateLabelTemplate = useEventStore((s) => s.updateLabelTemplate)
  const deleteLabelTemplate = useEventStore((s) => s.deleteLabelTemplate)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplate | null>(null)

  const [newTemplate, setNewTemplate] = useState<NewTemplateFormData>({
    name: "",
    description: "",
    sizeId: "badge-large",
    customWidth: 85,
    customHeight: 54,
  })

  const labelSizes = useMemo(() => getLabelSizes(), [])
  const availableVariables = useMemo(() => getAvailableVariables(), [])

  const filteredTemplates = useMemo(() => {
    return labelTemplates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && template.isActive) ||
        (filterStatus === "inactive" && !template.isActive)

      return matchesSearch && matchesStatus
    })
  }, [labelTemplates, search, filterStatus])

  const handleCreateTemplate = () => {
    if (!newTemplate.name) {
      toast({ title: "Nome do template é obrigatório", variant: "destructive" })
      return
    }

    const selectedSize = labelSizes.find((s) => s.id === newTemplate.sizeId)
    const dimensions =
      newTemplate.sizeId === "custom"
        ? { width: newTemplate.customWidth, height: newTemplate.customHeight }
        : { width: selectedSize!.width, height: selectedSize!.height }

    const template: LabelTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      template: `<div style="width: ${dimensions.width}mm; height: ${dimensions.height}mm; border: 1px solid #ccc; padding: 4mm; font-family: Arial, sans-serif;">
        <h3>{{participantName}}</h3>
        <p>{{eventName}}</p>
      </div>`,
      variables: ["participantName", "eventName"],
      dimensions,
      isDefault: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "user-1",
    }

    addLabelTemplate?.(template)
    setNewTemplate({ name: "", description: "", sizeId: "badge-large", customWidth: 85, customHeight: 54 })
    setShowCreateDialog(false)
    toast({ title: "Template criado com sucesso!" })
  }

  const handleToggleTemplate = (templateId: string) => {
    const template = labelTemplates.find((t) => t.id === templateId)
    if (template && updateLabelTemplate) {
      updateLabelTemplate(templateId, { isActive: !template.isActive, updatedAt: Date.now() })
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (deleteLabelTemplate) {
      deleteLabelTemplate(templateId)
      toast({ title: "Template removido com sucesso!" })
    }
  }

  const handleDuplicateTemplate = (template: LabelTemplate) => {
    const duplicated: LabelTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (addLabelTemplate) {
      addLabelTemplate(duplicated)
      toast({ title: "Template duplicado com sucesso!" })
    }
  }

  const renderPreview = (template: LabelTemplate): string => {
    let html = template.template
    availableVariables.forEach((variable) => {
      const regex = new RegExp(`{{${variable.key}}}`, "g")
      html = html.replace(regex, variable.example)
    })
    html = html.replace(/{{qrCode}}/g, "/placeholder.svg?height=80&width=80&text=QR")

    return html
  }

  const stats = useMemo(() => {
    const total = labelTemplates.length
    const active = labelTemplates.filter((t) => t.isActive).length
    const totalJobs = printJobs.length
    const completedJobs = printJobs.filter((j) => j.status === "concluido").length

    return { total, active, totalJobs, completedJobs }
  }, [labelTemplates, printJobs])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Etiquetas</h1>
          <p className="text-muted-foreground">Crie e gerencie templates de etiquetas para impressão</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Template *</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Crachá Conferência"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do template"
                  rows={3}
                />
              </div>
              <div>
                <Label>Tamanho da Etiqueta</Label>
                <Select
                  value={newTemplate.sizeId}
                  onValueChange={(value: string) => setNewTemplate((prev) => ({ ...prev, sizeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labelSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} {size.width > 0 && `(${size.width}x${size.height}mm)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newTemplate.sizeId === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Largura (mm)</Label>
                    <Input
                      type="number"
                      value={newTemplate.customWidth}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, customWidth: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Altura (mm)</Label>
                    <Input
                      type="number"
                      value={newTemplate.customHeight}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, customHeight: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTemplate} className="flex-1">
                  Criar Template
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Em uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabalhos de Impressão</CardTitle>
            <Printer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="print-jobs">Trabalhos de Impressão</TabsTrigger>
          <TabsTrigger value="variables">Variáveis</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar templates..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {labelTemplates.length === 0
                      ? "Comece criando seu primeiro template de etiqueta."
                      : "Nenhum template corresponde aos filtros aplicados."}
                  </p>
                  {labelTemplates.length === 0 && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Template
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{template.name}</h3>
                              {template.isDefault && <Badge variant="secondary">Padrão</Badge>}
                              <Badge variant={template.isActive ? "default" : "outline"}>
                                {template.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                {template.dimensions.width}x{template.dimensions.height}mm
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {template.variables.length} variáveis
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleTemplate(template.id)}
                            size="sm"
                          />
                        </div>

                        <div className="border rounded-lg p-2 mb-3 bg-white min-h-32 flex items-center justify-center overflow-hidden">
                          <div
                            className="transform scale-50 origin-center"
                            dangerouslySetInnerHTML={{ __html: renderPreview(template) }}
                          />
                        </div>

                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print-jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos de Impressão</CardTitle>
            </CardHeader>
            <CardContent>
              {printJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum trabalho de impressão</h3>
                  <p className="text-muted-foreground">
                    Os trabalhos de impressão aparecerão aqui quando você começar a imprimir etiquetas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {printJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {job.status === "concluido" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {job.status === "imprimindo" && <Play className="h-4 w-4 text-blue-600" />}
                          {job.status === "pendente" && <Clock className="h-4 w-4 text-yellow-600" />}
                          {job.status === "falhou" && <AlertCircle className="h-4 w-4 text-red-600" />}
                          <Badge variant={job.type === "lote" ? "default" : "secondary"}>
                            {job.type === "lote" ? "Lote" : "Individual"}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">
                            Template: {labelTemplates.find((t) => t.id === job.templateId)?.name || "Template removido"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.participantIds.length} etiqueta(s) • {new Date(job.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            job.status === "concluido"
                              ? "default"
                              : job.status === "imprimindo"
                                ? "secondary"
                                : job.status === "falhou"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {job.status === "concluido" && "Concluído"}
                          {job.status === "imprimindo" && "Imprimindo"}
                          {job.status === "pendente" && "Pendente"}
                          {job.status === "falhou" && "Falhou"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {availableVariables.map((variable) => (
                  <div key={variable.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{variable.key}</div>
                      <div className="text-sm text-muted-foreground">{variable.label}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{variable.example}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: renderPreview(previewTemplate) }} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Teste
              </Button>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}
