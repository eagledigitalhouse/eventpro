"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { TicketComponent } from "./ticket-component"
import { DEFAULT_TEMPLATES, TicketTemplateService, type TicketTemplate } from "@/lib/ticket-templates"
import { Palette, Layout, Type, Settings, Eye, Save, RotateCcw } from "lucide-react"
import type { EventItem } from "@/lib/types"

interface TicketTemplateEditorProps {
  event: EventItem
  currentTemplate?: TicketTemplate
  onSave: (template: TicketTemplate) => void
  onCancel: () => void
}

export function TicketTemplateEditor({ event, currentTemplate, onSave, onCancel }: TicketTemplateEditorProps) {
  const { toast } = useToast()
  const [selectedBaseTemplate, setSelectedBaseTemplate] = useState<string>(currentTemplate?.id || "default")
  const [customTemplate, setCustomTemplate] = useState<TicketTemplate>(currentTemplate || DEFAULT_TEMPLATES[0])
  const [activeTab, setActiveTab] = useState<"colors" | "layout" | "typography" | "fields">("colors")
  const [previewMode, setPreviewMode] = useState(false)

  // Dados de exemplo para preview
  const sampleTicket = {
    id: "preview-123",
    code: "PREV-2024-001",
    participantName: "João Silva",
    participantEmail: "joao@exemplo.com",
    participantPhone: "(11) 99999-9999",
    ticketTypeName: "Ingresso Geral",
    price: 50.0,
    checkedIn: false,
    customFields: {
      empresa: "Empresa Exemplo",
      cargo: "Desenvolvedor",
    },
  }

  useEffect(() => {
    const baseTemplate = DEFAULT_TEMPLATES.find((t) => t.id === selectedBaseTemplate)
    if (baseTemplate) {
      setCustomTemplate(baseTemplate)
    }
  }, [selectedBaseTemplate])

  const handleColorChange = (colorKey: keyof TicketTemplate["colors"], value: string) => {
    setCustomTemplate((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  const handleLayoutChange = (layoutKey: keyof TicketTemplate["layout"], value: any) => {
    setCustomTemplate((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [layoutKey]: value,
      },
    }))
  }

  const handleTypographyChange = (typographyKey: keyof TicketTemplate["typography"], value: string) => {
    setCustomTemplate((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [typographyKey]: value,
      },
    }))
  }

  const handleFieldChange = (fieldKey: keyof TicketTemplate["customFields"], value: any) => {
    setCustomTemplate((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldKey]: value,
      },
    }))
  }

  const handleSave = () => {
    if (!TicketTemplateService.validateTemplate(customTemplate)) {
      toast({
        title: "Erro de validação",
        description: "Template inválido. Verifique todos os campos.",
        variant: "destructive",
      })
      return
    }

    const finalTemplate = TicketTemplateService.createCustomTemplate(event.id, customTemplate, {
      name: `Template ${event.name}`,
      description: `Template personalizado para ${event.name}`,
    })

    onSave(finalTemplate)
    toast({
      title: "Template salvo!",
      description: "As configurações do template foram salvas com sucesso.",
    })
  }

  const handleReset = () => {
    const baseTemplate = DEFAULT_TEMPLATES.find((t) => t.id === selectedBaseTemplate)
    if (baseTemplate) {
      setCustomTemplate(baseTemplate)
      toast({
        title: "Template resetado",
        description: "As configurações foram restauradas para o padrão.",
      })
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Preview do Template</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Voltar à Edição
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Template
            </Button>
          </div>
        </div>

        <TicketComponent event={event} ticket={sampleTicket} template={customTemplate.id as any} showActions={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor de Template</h2>
          <p className="text-muted-foreground">Personalize o design dos ingressos do seu evento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Base Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Base</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBaseTemplate} onValueChange={setSelectedBaseTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {DEFAULT_TEMPLATES.find((t) => t.id === selectedBaseTemplate)?.description}
              </p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "colors", label: "Cores", icon: Palette },
                  { id: "layout", label: "Layout", icon: Layout },
                  { id: "typography", label: "Tipografia", icon: Type },
                  { id: "fields", label: "Campos", icon: Settings },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className="flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {/* Colors Tab */}
              {activeTab === "colors" && (
                <div className="space-y-4">
                  <div>
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={customTemplate.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={customTemplate.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={customTemplate.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={customTemplate.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        placeholder="#e0f2fe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={customTemplate.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={customTemplate.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === "layout" && (
                <div className="space-y-4">
                  <div>
                    <Label>Posição do QR Code</Label>
                    <Select
                      value={customTemplate.layout.qrPosition}
                      onValueChange={(value) => handleLayoutChange("qrPosition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-right">Superior Direita</SelectItem>
                        <SelectItem value="top-left">Superior Esquerda</SelectItem>
                        <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                        <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Posição do Logo</Label>
                    <Select
                      value={customTemplate.layout.logoPosition}
                      onValueChange={(value) => handleLayoutChange("logoPosition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Superior Esquerda</SelectItem>
                        <SelectItem value="top-center">Superior Centro</SelectItem>
                        <SelectItem value="top-right">Superior Direita</SelectItem>
                        <SelectItem value="hidden">Oculto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Perfuração</Label>
                    <Switch
                      checked={customTemplate.layout.showPerforation}
                      onCheckedChange={(checked) => handleLayoutChange("showPerforation", checked)}
                    />
                  </div>

                  <div>
                    <Label>Raio da Borda (px)</Label>
                    <Input
                      type="number"
                      value={customTemplate.layout.borderRadius}
                      onChange={(e) => handleLayoutChange("borderRadius", Number(e.target.value))}
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === "typography" && (
                <div className="space-y-4">
                  <div>
                    <Label>Peso do Título</Label>
                    <Select
                      value={customTemplate.typography.titleFont}
                      onValueChange={(value) => handleTypographyChange("titleFont", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="font-light">Leve</SelectItem>
                        <SelectItem value="font-normal">Normal</SelectItem>
                        <SelectItem value="font-medium">Médio</SelectItem>
                        <SelectItem value="font-semibold">Semi-negrito</SelectItem>
                        <SelectItem value="font-bold">Negrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tamanho do Título</Label>
                    <Select
                      value={customTemplate.typography.titleSize}
                      onValueChange={(value) => handleTypographyChange("titleSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-xl">Pequeno</SelectItem>
                        <SelectItem value="text-2xl">Médio</SelectItem>
                        <SelectItem value="text-3xl">Grande</SelectItem>
                        <SelectItem value="text-4xl">Extra Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Peso do Corpo</Label>
                    <Select
                      value={customTemplate.typography.bodyFont}
                      onValueChange={(value) => handleTypographyChange("bodyFont", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="font-light">Leve</SelectItem>
                        <SelectItem value="font-normal">Normal</SelectItem>
                        <SelectItem value="font-medium">Médio</SelectItem>
                        <SelectItem value="font-semibold">Semi-negrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Fields Tab */}
              {activeTab === "fields" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mostrar Descrição do Evento</Label>
                    <Switch
                      checked={customTemplate.customFields.showEventDescription}
                      onCheckedChange={(checked) => handleFieldChange("showEventDescription", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Preço</Label>
                    <Switch
                      checked={customTemplate.customFields.showPrice}
                      onCheckedChange={(checked) => handleFieldChange("showPrice", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Info de Transferência</Label>
                    <Switch
                      checked={customTemplate.customFields.showTransferInfo}
                      onCheckedChange={(checked) => handleFieldChange("showTransferInfo", checked)}
                    />
                  </div>

                  <div>
                    <Label>Texto Adicional</Label>
                    <Textarea
                      value={customTemplate.customFields.additionalText || ""}
                      onChange={(e) => handleFieldChange("additionalText", e.target.value)}
                      placeholder="Texto personalizado para aparecer no ingresso..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview do Ingresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="scale-75 origin-top">
                <TicketComponent
                  event={event}
                  ticket={sampleTicket}
                  template={customTemplate.id as any}
                  showActions={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Template
        </Button>
      </div>
    </div>
  )
}
