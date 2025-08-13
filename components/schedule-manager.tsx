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
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react"
import type { ScheduleItem, Speaker } from "@/lib/types"

interface ScheduleManagerProps {
  schedule: ScheduleItem[]
  speakers: Speaker[]
  onUpdate: (schedule: ScheduleItem[]) => void
}

export function ScheduleManager({ schedule, speakers, onUpdate }: ScheduleManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    time: "",
    title: "",
    description: "",
    speaker: "",
    speakerId: "default", // Updated default value to be a non-empty string
    duration: 60,
    location: "",
  })

  const handleOpenDialog = (item?: ScheduleItem) => {
    if (item) {
      setEditingItem(item)
      setFormData(item)
    } else {
      setEditingItem(null)
      setFormData({
        time: "",
        title: "",
        description: "",
        speaker: "",
        speakerId: "default", // Updated default value to be a non-empty string
        duration: 60,
        location: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.time?.trim() || !formData.title?.trim()) return

    const scheduleData: ScheduleItem = {
      id: editingItem?.id || `schedule-${Date.now()}`,
      time: formData.time.trim(),
      title: formData.title.trim(),
      description: formData.description?.trim(),
      speaker: formData.speaker?.trim(),
      speakerId: formData.speakerId?.trim(),
      duration: formData.duration || 60,
      location: formData.location?.trim(),
    }

    if (editingItem) {
      // Editar item existente
      const updatedSchedule = schedule.map((s) => (s.id === editingItem.id ? scheduleData : s))
      onUpdate(updatedSchedule)
    } else {
      // Adicionar novo item
      onUpdate([...schedule, scheduleData])
    }

    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (itemId: string) => {
    const updatedSchedule = schedule.filter((s) => s.id !== itemId)
    onUpdate(updatedSchedule)
  }

  const handleSpeakerChange = (speakerId: string) => {
    const selectedSpeaker = speakers.find((s) => s.id === speakerId)
    setFormData({
      ...formData,
      speakerId,
      speaker: selectedSpeaker?.name || "",
    })
  }

  // Ordenar programação por horário
  const sortedSchedule = [...schedule].sort((a, b) => {
    const timeA = a.time.replace(":", "")
    const timeB = b.time.replace(":", "")
    return timeA.localeCompare(timeB)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Programação</h2>
          <p className="text-gray-600">Gerencie a programação do seu evento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time || ""}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.duration || 60}
                    onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título da Atividade *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Palestra de Abertura, Workshop de React"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da atividade..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="speaker-select">Palestrante</Label>
                  <Select value={formData.speakerId || "default"} onValueChange={handleSpeakerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar palestrante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Nenhum palestrante</SelectItem>
                      {speakers.map((speaker) => (
                        <SelectItem key={speaker.id} value={speaker.id}>
                          {speaker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Auditório Principal, Sala 1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.time?.trim() || !formData.title?.trim()}>
                  {editingItem ? "Salvar Alterações" : "Adicionar Atividade"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {schedule.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade cadastrada</h3>
            <p className="text-gray-600 text-center mb-4">Adicione atividades para criar a programação do seu evento</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Atividade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSchedule.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {item.time}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}

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
      )}
    </div>
  )
}
