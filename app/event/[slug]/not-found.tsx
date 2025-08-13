import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evento não encontrado</h1>
          <p className="text-gray-600">O evento que você está procurando não existe ou foi removido.</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/events">
              <Search className="w-4 h-4 mr-2" />
              Explorar Eventos
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
