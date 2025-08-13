"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Building, ExternalLink } from "lucide-react"
import type { Sponsor } from "@/lib/types"

interface SponsorsManagerProps {
  sponsors: Sponsor[]
  onUpdate: (sponsors: Sponsor[]) => void
}

const TIER_LABELS = {
  ouro: "Ouro",
  prata: "Prata",
  bronze: "Bronze",
  apoio: "Apoio",
}

const TIER_COLORS = {
  ouro: "bg-yellow-100 text-yellow-800 border-yellow-200",
  prata: "bg-gray-100 text-gray-800 border-gray-200",
  bronze: "bg-orange-100 text-orange-800 border-orange-200",
  apoio: "bg-blue-100 text-blue-800 border-blue-200",
}

export function SponsorsManager({ sponsors, onUpdate }: SponsorsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [formData, setFormData] = useState<Partial<Sponsor>>({
    name: "",
    logo: "",
    website: "",
    tier: "apoio",
    description: "",
  })

  const handleOpenDialog = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor)
      setFormData(sponsor)
    } else {
      setEditingSponsor(null)
      setFormData({
        name: "",
        logo: "",
        website: "",
        tier: "apoio",
        description: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.logo?.trim()) return

    const sponsorData: Sponsor = {
      id: editingSponsor?.id || `sponsor-${Date.now()}`,
      name: formData.name.trim(),
      logo: formData.logo.trim(),
      website: formData.website?.trim(),
      tier: formData.tier as Sponsor["tier"],
      description: formData.description?.trim(),
    }

    if (editingSponsor) {
      // Editar patrocinador existente
      const updatedSponsors = sponsors.map((s) => (s.id === editingSponsor.id ? sponsorData : s))
      onUpdate(updatedSponsors)
    } else {
      // Adicionar novo patrocinador
      onUpdate([...sponsors, sponsorData])
    }

    setIsDialogOpen(false)
    setEditingSponsor(null)
  }

  const handleDelete = (sponsorId: string) => {
    const updatedSponsors = sponsors.filter((s) => s.id !== sponsorId)
    onUpdate(updatedSponsors)
  }

  // Agrupar patrocinadores por tier
  const sponsorsByTier = sponsors.reduce((acc: Record<string, Sponsor[]>, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = []
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {})

  const tierOrder = ["ouro", "prata", "bronze", "apoio"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patrocinadores</h2>
          <p className="text-gray-600">Gerencie os patrocinadores do seu evento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Patrocinador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSponsor ? "Editar Patrocinador" : "Novo Patrocinador"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="tier">Categoria *</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: any) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ouro">Ouro</SelectItem>
                      <SelectItem value="prata">Prata</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="apoio">Apoio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="logo">URL do Logo *</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo || ""}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
                {formData.logo && (
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Preview do logo:</p>
                    <img
                      src={formData.logo || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-16 max-w-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da empresa ou patrocínio..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name?.trim() || !formData.logo?.trim()}>
                  {editingSponsor ? "Salvar Alterações" : "Adicionar Patrocinador"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum patrocinador cadastrado</h3>
            <p className="text-gray-600 text-center mb-4">
              Adicione patrocinadores para exibir na página do seu evento
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Patrocinador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {tierOrder.map((tier) => {
            const tierSponsors = sponsorsByTier[tier]
            if (!tierSponsors?.length) return null

            return (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">
                    Patrocinadores {TIER_LABELS[tier as keyof typeof TIER_LABELS]}
                  </h3>
                  <Badge className={TIER_COLORS[tier as keyof typeof TIER_COLORS]}>
                    {tierSponsors.length} {tierSponsors.length === 1 ? "empresa" : "empresas"}
                  </Badge>
                </div>

                <div
                  className={`grid gap-4 ${
                    tier === "ouro"
                      ? "grid-cols-1 md:grid-cols-2"
                      : tier === "prata"
                        ? "grid-cols-2 md:grid-cols-3"
                        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {tierSponsors.map((sponsor) => (
                    <Card key={sponsor.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg">
                            <img
                              src={sponsor.logo || "/placeholder.svg"}
                              alt={sponsor.name}
                              className={`max-w-full max-h-full object-contain ${
                                tier === "ouro" ? "max-h-12" : tier === "prata" ? "max-h-10" : "max-h-8"
                              }`}
                            />
                          </div>

                          <div className="text-center">
                            <h4 className="font-medium text-sm mb-1">{sponsor.name}</h4>
                            {sponsor.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{sponsor.description}</p>
                            )}

                            <div className="flex items-center justify-center gap-1 mb-3">
                              <Badge className={`text-xs ${TIER_COLORS[sponsor.tier]}`}>
                                {TIER_LABELS[sponsor.tier]}
                              </Badge>
                              {sponsor.website && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => window.open(sponsor.website, "_blank")}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs bg-transparent"
                                onClick={() => handleOpenDialog(sponsor)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(sponsor.id)}
                                className="text-red-600 hover:text-red-700 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
