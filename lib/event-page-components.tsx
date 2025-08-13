import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import type { EventItem, EventPageSettings, Speaker, ScheduleItem, Sponsor } from "./types"

interface ComponentProps {
  event: EventItem
  settings: EventPageSettings
  componentSettings: Record<string, any>
}

// Componente Banner Principal
export const BannerComponent: React.FC<ComponentProps> = ({ event, componentSettings }) => {
  const bannerStyle = {
    backgroundImage: componentSettings.backgroundImage
      ? `url(${componentSettings.backgroundImage})`
      : event.bannerUrl
        ? `url(${event.bannerUrl})`
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: componentSettings.height || "500px",
  }

  return (
    <div className="relative overflow-hidden" style={bannerStyle}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-20 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-4 mb-6 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(event.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
          </div>
          {componentSettings.showDescription && (
            <p className="text-xl mb-8 opacity-90 max-w-2xl">{event.description}</p>
          )}
          {componentSettings.showCTA && (
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              {componentSettings.ctaText || "Inscrever-se Agora"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente Descrição
export const DescriptionComponent: React.FC<ComponentProps> = ({ event, componentSettings }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">{componentSettings.title || "Sobre o Evento"}</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed">{componentSettings.customDescription || event.description}</p>
            {componentSettings.additionalContent && (
              <div dangerouslySetInnerHTML={{ __html: componentSettings.additionalContent }} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Componente Ingressos
export const TicketsComponent: React.FC<ComponentProps> = ({ event, componentSettings }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Ingressos"}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {event.tickets
            .filter((ticket) => ticket.isActive)
            .map((ticket) => (
              <Card key={ticket.id} className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{ticket.name}</span>
                    <Badge variant={ticket.quantitySold >= ticket.quantityTotal ? "destructive" : "default"}>
                      {ticket.quantitySold >= ticket.quantityTotal ? "Esgotado" : "Disponível"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ticket.description && <p className="text-gray-600">{ticket.description}</p>}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {ticket.price === 0 ? "Gratuito" : `R$ ${ticket.price.toFixed(2)}`}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{ticket.quantityTotal - ticket.quantitySold} restantes</span>
                      </div>
                    </div>
                    <Button className="w-full" disabled={ticket.quantitySold >= ticket.quantityTotal}>
                      {ticket.quantitySold >= ticket.quantityTotal ? "Esgotado" : "Selecionar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </section>
  )
}

// Componente Palestrantes
export const SpeakersComponent: React.FC<ComponentProps> = ({ settings, componentSettings }) => {
  const speakers = settings.content.speakers || []

  if (speakers.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Palestrantes"}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {speakers.map((speaker: Speaker) => (
            <Card key={speaker.id} className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  {speaker.photo ? (
                    <img
                      src={speaker.photo || "/placeholder.svg"}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">{speaker.name}</h3>
                {speaker.role && <p className="text-sm text-gray-600 mb-2">{speaker.role}</p>}
                {speaker.company && <p className="text-sm text-gray-500 mb-3">{speaker.company}</p>}
                {speaker.bio && <p className="text-sm text-gray-600 line-clamp-3">{speaker.bio}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Componente Programação
export const ScheduleComponent: React.FC<ComponentProps> = ({ settings, componentSettings }) => {
  const schedule = settings.content.schedule || []

  if (schedule.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Programação"}</h2>
        <div className="max-w-4xl mx-auto space-y-4">
          {schedule.map((item: ScheduleItem) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {item.time}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    {item.description && <p className="text-gray-600 mb-2">{item.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {item.speaker && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {item.speaker}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </span>
                      )}
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Componente Patrocinadores
export const SponsorsComponent: React.FC<ComponentProps> = ({ settings, componentSettings }) => {
  const sponsors = settings.content.sponsors || []

  if (sponsors.length === 0) return null

  const sponsorsByTier = sponsors.reduce((acc: Record<string, Sponsor[]>, sponsor: Sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = []
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {})

  const tierOrder = ["ouro", "prata", "bronze", "apoio"]
  const tierLabels = {
    ouro: "Patrocinadores Ouro",
    prata: "Patrocinadores Prata",
    bronze: "Patrocinadores Bronze",
    apoio: "Apoio",
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Patrocinadores"}</h2>
        <div className="max-w-6xl mx-auto space-y-12">
          {tierOrder.map((tier) => {
            const tierSponsors = sponsorsByTier[tier]
            if (!tierSponsors?.length) return null

            return (
              <div key={tier}>
                <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">
                  {tierLabels[tier as keyof typeof tierLabels]}
                </h3>
                <div
                  className={`grid gap-8 justify-items-center ${
                    tier === "ouro"
                      ? "grid-cols-1 md:grid-cols-2"
                      : tier === "prata"
                        ? "grid-cols-2 md:grid-cols-3"
                        : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                  }`}
                >
                  {tierSponsors.map((sponsor: Sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-center">
                      <img
                        src={sponsor.logo || "/placeholder.svg"}
                        alt={sponsor.name}
                        className={`max-w-full h-auto object-contain ${
                          tier === "ouro" ? "max-h-20" : tier === "prata" ? "max-h-16" : "max-h-12"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Componente Localização
export const LocationComponent: React.FC<ComponentProps> = ({ event, componentSettings }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Localização"}</h2>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{event.location}</h3>
                  {componentSettings.address && <p className="text-gray-600 mb-4">{componentSettings.address}</p>}
                  {componentSettings.directions && (
                    <p className="text-sm text-gray-500">{componentSettings.directions}</p>
                  )}
                </div>
              </div>
              {componentSettings.showMap && (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mapa será carregado aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// Componente Contato
export const ContactComponent: React.FC<ComponentProps> = ({ event, componentSettings }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{componentSettings.title || "Contato"}</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-6">
            {componentSettings.description || "Entre em contato conosco para mais informações"}
          </p>
          <div className="space-y-4">
            {componentSettings.email && (
              <p>
                <strong>Email:</strong>
                <a href={`mailto:${componentSettings.email}`} className="text-blue-600 hover:underline ml-2">
                  {componentSettings.email}
                </a>
              </p>
            )}
            {componentSettings.phone && (
              <p>
                <strong>Telefone:</strong>
                <a href={`tel:${componentSettings.phone}`} className="text-blue-600 hover:underline ml-2">
                  {componentSettings.phone}
                </a>
              </p>
            )}
            {componentSettings.whatsapp && (
              <p>
                <strong>WhatsApp:</strong>
                <a href={`https://wa.me/${componentSettings.whatsapp}`} className="text-blue-600 hover:underline ml-2">
                  {componentSettings.whatsapp}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Mapeamento de componentes
export const COMPONENT_MAP = {
  banner: BannerComponent,
  description: DescriptionComponent,
  tickets: TicketsComponent,
  speakers: SpeakersComponent,
  schedule: ScheduleComponent,
  sponsors: SponsorsComponent,
  location: LocationComponent,
  contact: ContactComponent,
}

// Configurações padrão dos componentes
export const DEFAULT_COMPONENT_SETTINGS = {
  banner: {
    height: "500px",
    showDescription: true,
    showCTA: true,
    ctaText: "Inscrever-se Agora",
  },
  description: {
    title: "Sobre o Evento",
  },
  tickets: {
    title: "Ingressos",
  },
  speakers: {
    title: "Palestrantes",
  },
  schedule: {
    title: "Programação",
  },
  sponsors: {
    title: "Patrocinadores",
  },
  location: {
    title: "Localização",
    showMap: true,
  },
  contact: {
    title: "Contato",
    description: "Entre em contato conosco para mais informações",
  },
}
