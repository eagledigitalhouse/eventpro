import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { EventPublicPage } from "@/components/event-public-page"
import { useEventStore } from "@/lib/store"

interface EventPageProps {
  params: {
    slug: string
  }
}

// Função para buscar dados do evento pelo slug
async function getEventBySlug(slug: string) {
  // Em produção, isso seria uma chamada para API/banco de dados
  // Por enquanto, simulamos a busca no store
  const store = useEventStore.getState()
  const event = store.events.find(
    (e) =>
      e.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "") === slug,
  )

  if (!event) return null

  // Buscar configurações da página do evento
  const pageSettings = store.eventPageSettings[event.id]

  return { event, pageSettings }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const data = await getEventBySlug(params.slug)

  if (!data) {
    return {
      title: "Evento não encontrado",
    }
  }

  const { event, pageSettings } = data

  return {
    title: pageSettings?.seo?.title || `${event.name} - EventPass`,
    description: pageSettings?.seo?.description || event.description,
    keywords: pageSettings?.seo?.keywords || [event.category, "evento", "ingresso"].filter(Boolean),
    openGraph: {
      title: pageSettings?.seo?.title || event.name,
      description: pageSettings?.seo?.description || event.description,
      images: pageSettings?.seo?.ogImage ? [pageSettings.seo.ogImage] : event.bannerUrl ? [event.bannerUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageSettings?.seo?.title || event.name,
      description: pageSettings?.seo?.description || event.description,
      images: pageSettings?.seo?.ogImage ? [pageSettings.seo.ogImage] : event.bannerUrl ? [event.bannerUrl] : [],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const data = await getEventBySlug(params.slug)

  if (!data) {
    notFound()
  }

  const { event, pageSettings } = data

  // Se a página não está publicada, mostrar apenas para o proprietário
  if (!pageSettings?.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página em Construção</h1>
          <p className="text-gray-600">Esta página do evento ainda não foi publicada.</p>
        </div>
      </div>
    )
  }

  return <EventPublicPage event={event} settings={pageSettings} />
}

export async function generateStaticParams() {
  // Em produção, isso geraria todos os slugs de eventos publicados
  return []
}
