"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Linkedin, Twitter, Instagram } from "lucide-react"
import type { Speaker } from "@/lib/types"

interface SpeakersManagerProps {
  speakers: Speaker[]
  onUpdate: (speakers: Speaker[]) => void
}

export function SpeakersManager({ speakers, onUpdate }: SpeakersManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [formData, setFormData] = useState<Partial<Speaker>>({
    name: "",
    bio: "",
    role: "",
    company: "",
    photo: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
    },
  })

  const handleOpenDialog = (speaker?: Speaker) => {
    if (speaker) {
      setEditingSpeaker(speaker)
      setFormData(speaker)
    } else {
      setEditingSpeaker(null)
      setFormData({
        name: "",
        bio: "",
        role: "",
        company: "",
        photo: "",
        socialLinks: {
          linkedin: "",
          twitter: "",
          instagram: "",
        },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name?.trim()) return

    const speakerData: Speaker = {
      id: editingSpeaker?.id || `speaker-${Date.now()}`,
      name: formData.name.trim(),
      bio: formData.bio?.trim() || "",
      role: formData.role?.trim(),
      company: formData.company?.trim(),
      photo: formData.photo?.trim(),
      socialLinks: {
        linkedin: formData.socialLinks?.linkedin?.trim(),
        twitter: formData.socialLinks?.twitter?.trim(),
        instagram: formData.socialLinks?.instagram?.trim(),
      },
    }

    if (editingSpeaker) {
      // Editar palestrante existente
      const updatedSpeakers = speakers.map((s) => (s.id === editingSpeaker.id ? speakerData : s))
      onUpdate(updatedSpeakers)
    } else {
      // Adicionar novo palestrante
      onUpdate([...speakers, speakerData])
    }

    setIsDialogOpen(false)
    setEditingSpeaker(null)
  }

  const handleDelete = (speakerId: string) => {
    const updatedSpeakers = speakers.filter((s) => s.id !== speakerId)
    onUpdate(updatedSpeakers)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Palestrantes</h2>
          <p className="text-gray-600">Gerencie os palestrantes do seu evento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Palestrante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSpeaker ? "Editar Palestrante" : "Novo Palestrante"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo do palestrante"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Cargo/Função</Label>
                  <Input
                    id="role"
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ex: CEO, Desenvolvedor Senior"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <Label htmlFor="photo">URL da Foto</Label>
                <Input
                  id="photo"
                  type="url"
                  value={formData.photo || ""}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Biografia do palestrante..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Redes Sociais</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <Input
                      placeholder="LinkedIn (URL completa)"
                      value={formData.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <Input
                      placeholder="Twitter (URL completa)"
                      value={formData.socialLinks?.twitter || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <Input
                      placeholder="Instagram (URL completa)"
                      value={formData.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.name?.trim()}>
                  {editingSpeaker ? "Salvar Alterações" : "Adicionar Palestrante"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {speakers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum palestrante cadastrado</h3>
            <p className="text-gray-600 text-center mb-4">Adicione palestrantes para exibir na página do seu evento</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Palestrante
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <Card key={speaker.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {speaker.photo ? (
                      <img
                        src={speaker.photo || "/placeholder.svg"}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{speaker.name}</h3>
                    {speaker.role && <p className="text-sm text-gray-600 mb-1">{speaker.role}</p>}
                    {speaker.company && <p className="text-sm text-gray-500 mb-2">{speaker.company}</p>}
                    {speaker.bio && <p className="text-sm text-gray-600 line-clamp-3 mb-3">{speaker.bio}</p>}

                    {/* Redes Sociais */}
                    <div className="flex gap-2 mb-3">
                      {speaker.socialLinks?.linkedin && (
                        <Badge variant="outline" className="text-xs">
                          <Linkedin className="w-3 h-3 mr-1" />
                          LinkedIn
                        </Badge>
                      )}
                      {speaker.socialLinks?.twitter && (
                        <Badge variant="outline" className="text-xs">
                          <Twitter className="w-3 h-3 mr-1" />
                          Twitter
                        </Badge>
                      )}
                      {speaker.socialLinks?.instagram && (
                        <Badge variant="outline" className="text-xs">
                          <Instagram className="w-3 h-3 mr-1" />
                          Instagram
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(speaker)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(speaker.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
