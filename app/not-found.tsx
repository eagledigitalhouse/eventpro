import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold">Página não encontrada</h2>
      <p className="text-muted-foreground">A página que você procura não existe.</p>
      <Link href="/events">
        <Button>Voltar aos eventos</Button>
      </Link>
    </main>
  )
}
