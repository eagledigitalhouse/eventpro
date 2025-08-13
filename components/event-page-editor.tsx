"use client"

import { useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Layout,
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
import type { EventPageComponent, EventPageSettings, EventItem } from "@/lib/types"
import { DEFAULT_COMPONENT_SETTINGS } from "@/lib/event-page-components"

interface EventPageEditorProps {
  event: EventItem
  settings: EventPageSettings
  onSave: (settings: EventPageSettings) => void
}

const COMPONENT_LABELS = {
  banner: "Banner Principal",
  description: "Descrição",
  tickets: "Ingressos",
  speakers: "Palestrantes",
  schedule: "Programação",
  sponsors: "Patrocinadores",
  location: "Localização",
  contact: "Contato",
}

const COMPONENT_DESCRIPTIONS = {
  banner: "Imagem de destaque com informações principais do evento",
  description: "Descrição detalhada sobre o evento",
  tickets: "Lista de tipos de ingressos disponíveis",
  speakers: "Palestrantes e suas informações",
  schedule: "Programação completa do evento",
  sponsors: "Patrocinadores e apoiadores",
  location: "Informações de localização e mapa",
  contact: "Informações de contato",
}

export function EventPageEditor({ event, settings, onSave }: EventPageEditorProps) {
  const [currentSettings, setCurrentSettings] = useState<EventPageSettings>(settings)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [hasChanges, setHasChanges] = useState(false)

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const items = Array.from(currentSettings.components)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)

      // Atualizar ordem dos componentes
      const updatedComponents = items.map((item, index) => ({
        ...item,
        order: index,
      }))

      setCurrentSettings({
        ...currentSettings,
        components: updatedComponents,
      })
      setHasChanges(true)
    },
    [currentSettings],
  )

  const toggleComponent = useCallback(
    (componentId: string) => {
      const updatedComponents = currentSettings.components.map((comp) =>
        comp.id === componentId ? { ...comp, isActive: !comp.isActive } : comp,
      )

      setCurrentSettings({
        ...currentSettings,
        components: updatedComponents,
      })
      setHasChanges(true)
    },
    [currentSettings],
  )

  const updateComponentSettings = useCallback(
    (componentId: string, newSettings: Record<string, any>) => {
      const updatedComponents = currentSettings.components.map((comp) =>
        comp.id === componentId ? { ...comp, settings: { ...comp.settings, ...newSettings } } : comp,
      )

      setCurrentSettings({
        ...currentSettings,
        components: updatedComponents,
      })
      setHasChanges(true)
    },
    [currentSettings],
  )

  const updateTheme = useCallback(
    (themeUpdates: Partial<EventPageSettings["theme"]>) => {
      setCurrentSettings({
        ...currentSettings,
        theme: { ...currentSettings.theme, ...themeUpdates },
      })
      setHasChanges(true)
    },
    [currentSettings],
  )

  const handleSave = useCallback(() => {
    onSave(currentSettings)
    setHasChanges(false)
  }, [currentSettings, onSave])

  const resetToDefaults = useCallback(() => {
    const defaultComponents: EventPageComponent[] = Object.keys(COMPONENT_LABELS).map((type, index) => ({
      id: `${type}-${Date.now()}`,
      type: type as EventPageComponent["type"],
      isActive: ["banner", "description", "tickets"].includes(type), // Ativar apenas componentes essenciais por padrão
      order: index,
      settings: DEFAULT_COMPONENT_SETTINGS[type as keyof typeof DEFAULT_COMPONENT_SETTINGS] || {},
    }))

    setCurrentSettings({
      ...currentSettings,
      components: defaultComponents,
    })
    setHasChanges(true)
  }, [currentSettings])

  const selectedComponentData = selectedComponent
    ? currentSettings.components.find((comp) => comp.id === selectedComponent)
    : null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de Componentes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Editor da Página</h2>
          <p className="text-sm text-gray-600">Arraste para reordenar os componentes</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="components">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {currentSettings.components
                    .sort((a, b) => a.order - b.order)
                    .map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`cursor-pointer transition-all ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            } ${selectedComponent === component.id ? "ring-2 ring-blue-500" : ""} ${
                              !component.isActive ? "opacity-60" : ""
                            }`}
                            onClick={() => setSelectedComponent(component.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-sm">
                                      {COMPONENT_LABELS[component.type as keyof typeof COMPONENT_LABELS]}
                                    </h3>
                                    <Switch
                                      checked={component.isActive}
                                      onCheckedChange={() => toggleComponent(component.id)}
                                      size="sm"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {COMPONENT_DESCRIPTIONS[component.type as keyof typeof COMPONENT_DESCRIPTIONS]}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {component.isActive ? (
                                    <Eye className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  )}
                                  <Settings className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button onClick={resetToDefaults} variant="outline" size="sm" className="w-full bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Página do Evento: {event.name}</h1>
              {hasChanges && <Badge variant="secondary">Alterações não salvas</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {/* Seletor de Preview */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === "tablet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("tablet")}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Preview */}
          <div className="flex-1 p-4">
            <div
              className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
                previewMode === "mobile" ? "max-w-sm" : previewMode === "tablet" ? "max-w-2xl" : "max-w-6xl"
              }`}
            >
              <div className="bg-gray-100 p-8 text-center">
                <p className="text-gray-500">Preview da página será renderizado aqui</p>
                <p className="text-sm text-gray-400 mt-2">
                  Componentes ativos: {currentSettings.components.filter((c) => c.isActive).length}
                </p>
              </div>
            </div>
          </div>

          {/* Painel de Configurações */}
          {selectedComponentData && (
            <div className="w-80 bg-white border-l border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold">
                  {COMPONENT_LABELS[selectedComponentData.type as keyof typeof COMPONENT_LABELS]}
                </h3>
                <p className="text-sm text-gray-600">Configurações do componente</p>
              </div>

              <div className="p-4">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">
                      <Layout className="w-4 h-4 mr-1" />
                      Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="style">
                      <Palette className="w-4 h-4 mr-1" />
                      Estilo
                    </TabsTrigger>
                    <TabsTrigger value="advanced">
                      <Settings className="w-4 h-4 mr-1" />
                      Avançado
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <ComponentSettingsForm
                      component={selectedComponentData}
                      onUpdate={(settings) => updateComponentSettings(selectedComponentData.id, settings)}
                    />
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4 mt-4">
                    <ThemeSettingsForm theme={currentSettings.theme} onUpdate={updateTheme} />
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-css">CSS Personalizado</Label>
                        <Textarea
                          id="custom-css"
                          placeholder="/* Adicione seu CSS personalizado aqui */"
                          value={currentSettings.customCss || ""}
                          onChange={(e) => setCurrentSettings({ ...currentSettings, customCss: e.target.value })}
                          className="font-mono text-sm"
                          rows={6}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para configurações específicas de cada tipo de componente
function ComponentSettingsForm({
  component,
  onUpdate,
}: {
  component: EventPageComponent
  onUpdate: (settings: Record<string, any>) => void
}) {
  const settings = component.settings || {}

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value })
  }

  // Renderizar campos específicos baseado no tipo do componente
  switch (component.type) {
    case "banner":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="background-image">Imagem de Fundo</Label>
            <Input
              id="background-image"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={settings.backgroundImage || ""}
              onChange={(e) => handleChange("backgroundImage", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Altura</Label>
            <Select value={settings.height || "500px"} onValueChange={(value) => handleChange("height", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400px">Pequeno (400px)</SelectItem>
                <SelectItem value="500px">Médio (500px)</SelectItem>
                <SelectItem value="600px">Grande (600px)</SelectItem>
                <SelectItem value="100vh">Tela Cheia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-description"
              checked={settings.showDescription ?? true}
              onCheckedChange={(checked) => handleChange("showDescription", checked)}
            />
            <Label htmlFor="show-description">Mostrar Descrição</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-cta"
              checked={settings.showCTA ?? true}
              onCheckedChange={(checked) => handleChange("showCTA", checked)}
            />
            <Label htmlFor="show-cta">Mostrar Botão de Ação</Label>
          </div>
          {settings.showCTA && (
            <div>
              <Label htmlFor="cta-text">Texto do Botão</Label>
              <Input
                id="cta-text"
                value={settings.ctaText || "Inscrever-se Agora"}
                onChange={(e) => handleChange("ctaText", e.target.value)}
              />
            </div>
          )}
        </div>
      )

    case "description":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Seção</Label>
            <Input
              id="title"
              value={settings.title || "Sobre o Evento"}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="custom-description">Descrição Personalizada</Label>
            <Textarea
              id="custom-description"
              placeholder="Deixe em branco para usar a descrição do evento"
              value={settings.customDescription || ""}
              onChange={(e) => handleChange("customDescription", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )

    case "location":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Seção</Label>
            <Input
              id="title"
              value={settings.title || "Localização"}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              placeholder="Endereço completo do evento"
              value={settings.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-map"
              checked={settings.showMap ?? true}
              onCheckedChange={(checked) => handleChange("showMap", checked)}
            />
            <Label htmlFor="show-map">Mostrar Mapa</Label>
          </div>
        </div>
      )

    case "contact":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Seção</Label>
            <Input
              id="title"
              value={settings.title || "Contato"}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="5511999999999"
              value={settings.whatsapp || ""}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
            />
          </div>
        </div>
      )

    default:
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Seção</Label>
            <Input id="title" value={settings.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
          </div>
        </div>
      )
  }
}

// Componente para configurações de tema
function ThemeSettingsForm({
  theme,
  onUpdate,
}: {
  theme: EventPageSettings["theme"]
  onUpdate: (updates: Partial<EventPageSettings["theme"]>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="primary-color">Cor Primária</Label>
        <Input
          id="primary-color"
          type="color"
          value={theme.primaryColor}
          onChange={(e) => onUpdate({ primaryColor: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="secondary-color">Cor Secundária</Label>
        <Input
          id="secondary-color"
          type="color"
          value={theme.secondaryColor}
          onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="background-color">Cor de Fundo</Label>
        <Input
          id="background-color"
          type="color"
          value={theme.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="text-color">Cor do Texto</Label>
        <Input
          id="text-color"
          type="color"
          value={theme.textColor}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="font-family">Família da Fonte</Label>
        <Select value={theme.fontFamily} onValueChange={(value) => onUpdate({ fontFamily: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
