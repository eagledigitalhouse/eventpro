"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Eye, Globe, Settings, Users, Calendar, Palette, Layout, Share2, ExternalLink } from "lucide-react"
import { EventPageEditor } from "@/components/event-page-editor"
import { SpeakersManager } from "@/components/speakers-manager"
import { ScheduleManager } from "@/components/schedule-manager"
import { SponsorsManager } from "@/components/sponsors-manager"
import { useEventStore } from "@/lib/store"
import type { EventPageSettings, EventItem } from "@/lib/types"

export default function EventPageBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const { events, eventPageSettings, updateEventPageSettings } = useEventStore()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [settings, setSettings] = useState<EventPageSettings | null>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const foundEvent = events.find((e) => e.id === eventId)
    if (!foundEvent) {
      router.push("/events")
      return
    }

    setEvent(foundEvent)

    // Buscar ou criar configurações da página
    let pageSettings = eventPageSettings[eventId]
    if (!pageSettings) {
      // Criar configurações padrão
      pageSettings = {
        eventId,
        components: [
          {
            id: `banner-${Date.now()}`,
            type: "banner",
            isActive: true,
            order: 0,
            settings: {
              height: "500px",
              showDescription: true,
              showCTA: true,
              ctaText: "Inscrever-se Agora",
            },
          },
          {
            id: `description-${Date.now()}`,
            type: "description",
            isActive: true,
            order: 1,
            settings: {
              title: "Sobre o Evento",
            },
          },
          {
            id: `tickets-${Date.now()}`,
            type: "tickets",
            isActive: true,
            order: 2,
            settings: {
              title: "Ingressos",
            },
          },
          {
            id: `location-${Date.now()}`,
            type: "location",
            isActive: true,
            order: 3,
            settings: {
              title: "Localização",
              showMap: true,
            },
          },
          {
            id: `contact-${Date.now()}`,
            type: "contact",
            isActive: true,
            order: 4,
            settings: {
              title: "Contato",
              description: "Entre em contato conosco para mais informações",
            },
          },
          {
            id: `speakers-${Date.now()}`,
            type: "speakers",
            isActive: false,
            order: 5,
            settings: {
              title: "Palestrantes",
            },
          },
          {
            id: `schedule-${Date.now()}`,
            type: "schedule",
            isActive: false,
            order: 6,
            settings: {
              title: "Programação",
            },
          },
          {
            id: `sponsors-${Date.now()}`,
            type: "sponsors",
            isActive: false,
            order: 7,
            settings: {
              title: "Patrocinadores",
            },
          },
        ],
        theme: {
          primaryColor: "#3b82f6",
          secondaryColor: "#1e40af",
          backgroundColor: "#ffffff",
          textColor: "#1f2937",
          fontFamily: "Inter",
        },
        seo: {
          title: foundEvent.name,
          description: foundEvent.description,
          keywords: [foundEvent.category, "evento", "ingresso"].filter(Boolean),
        },
        content: {
          speakers: [],
          schedule: [],
          sponsors: [],
        },
        isPublished: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }

    setSettings(pageSettings)
    setIsLoading(false)
  }, [eventId, events, eventPageSettings, router])

  const handleSaveSettings = async (newSettings: EventPageSettings) => {
    setIsSaving(true)
    try {
      const updatedSettings = {
        ...newSettings,
        updatedAt: Date.now(),
      }

      updateEventPageSettings(eventId, updatedSettings)
      setSettings(updatedSettings)

      toast({
        title: "Configurações salvas",
        description: "As configurações da página foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!settings) return

    const updatedSettings = {
      ...settings,
      isPublished: !settings.isPublished,
      updatedAt: Date.now(),
    }

    await handleSaveSettings(updatedSettings)

    toast({
      title: settings.isPublished ? "Página despublicada" : "Página publicada",
      description: settings.isPublished
        ? "A página do evento foi despublicada."
        : "A página do evento está agora disponível publicamente.",
    })
  }

  const getEventSlug = (eventName: string) => {
    return eventName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  const getPublicUrl = () => {
    if (!event) return ""
    const slug = getEventSlug(event.name)
    return `${window.location.origin}/event/${slug}`
  }

  if (isLoading || !event || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Página do Evento</h1>
                <p className="text-sm text-gray-600">{event.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={settings.isPublished ? "default" : "secondary"}>
                {settings.isPublished ? "Publicado" : "Rascunho"}
              </Badge>

              {settings.isPublished && (
                <Button variant="outline" size="sm" onClick={() => window.open(getPublicUrl(), "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Página
                </Button>
              )}

              <Button onClick={handlePublishToggle} disabled={isSaving}>
                <Globe className="w-4 h-4 mr-2" />
                {settings.isPublished ? "Despublicar" : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="speakers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Palestrantes
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Programação
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Patrocinadores
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-0">
            <EventPageEditor event={event} settings={settings} onSave={handleSaveSettings} />
          </TabsContent>

          <TabsContent value="speakers" className="space-y-6">
            <SpeakersManager
              speakers={settings.content.speakers}
              onUpdate={(speakers) => {
                const updatedSettings = {
                  ...settings,
                  content: { ...settings.content, speakers },
                }
                handleSaveSettings(updatedSettings)
              }}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleManager
              schedule={settings.content.schedule}
              speakers={settings.content.speakers}
              onUpdate={(schedule) => {
                const updatedSettings = {
                  ...settings,
                  content: { ...settings.content, schedule },
                }
                handleSaveSettings(updatedSettings)
              }}
            />
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-6">
            <SponsorsManager
              sponsors={settings.content.sponsors}
              onUpdate={(sponsors) => {
                const updatedSettings = {
                  ...settings,
                  content: { ...settings.content, sponsors },
                }
                handleSaveSettings(updatedSettings)
              }}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOSettings
              seo={settings.seo}
              onUpdate={(seo) => {
                const updatedSettings = { ...settings, seo }
                handleSaveSettings(updatedSettings)
              }}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <PreviewSettings event={event} settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Componente para configurações de SEO
function SEOSettings({
  seo,
  onUpdate,
}: {
  seo: EventPageSettings["seo"]
  onUpdate: (seo: EventPageSettings["seo"]) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="seo-title">Título da Página</Label>
          <Input
            id="seo-title"
            value={seo.title || ""}
            onChange={(e) => onUpdate({ ...seo, title: e.target.value })}
            placeholder="Título que aparecerá no Google"
          />
        </div>

        <div>
          <Label htmlFor="seo-description">Descrição</Label>
          <Textarea
            id="seo-description"
            value={seo.description || ""}
            onChange={(e) => onUpdate({ ...seo, description: e.target.value })}
            placeholder="Descrição que aparecerá no Google"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="seo-keywords">Palavras-chave</Label>
          <Input
            id="seo-keywords"
            value={seo.keywords?.join(", ") || ""}
            onChange={(e) =>
              onUpdate({
                ...seo,
                keywords: e.target.value.split(",").map((k) => k.trim()),
              })
            }
            placeholder="evento, congresso, tecnologia"
          />
        </div>

        <div>
          <Label htmlFor="seo-og-image">Imagem de Compartilhamento</Label>
          <Input
            id="seo-og-image"
            type="url"
            value={seo.ogImage || ""}
            onChange={(e) => onUpdate({ ...seo, ogImage: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para preview e configurações finais
function PreviewSettings({ event, settings }: { event: EventItem; settings: EventPageSettings }) {
  const getEventSlug = (eventName: string) => {
    return eventName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  const publicUrl = `${window.location.origin}/event/${getEventSlug(event.name)}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "URL copiada",
      description: "A URL da página foi copiada para a área de transferência.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: publicUrl,
        })
      } catch (err) {
        console.log("Erro ao compartilhar:", err)
      }
    } else {
      handleCopyUrl()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview da Página</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">URL da página pública:</p>
            <div className="flex items-center gap-2">
              <Input value={publicUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                Copiar
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => window.open(publicUrl, "_blank")} disabled={!settings.isPublished}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Página
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={!settings.isPublished}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          {!settings.isPublished && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> A página ainda não foi publicada. Publique-a para que fique disponível
                publicamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {settings.components.filter((c) => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Componentes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{settings.content.speakers.length}</div>
              <div className="text-sm text-gray-600">Palestrantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{settings.content.schedule.length}</div>
              <div className="text-sm text-gray-600">Atividades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{settings.content.sponsors.length}</div>
              <div className="text-sm text-gray-600">Patrocinadores</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
