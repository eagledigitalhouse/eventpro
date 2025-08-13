"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useEventStore } from "@/lib/store"
import type { CheckinStation, User } from "@/lib/types"
import {
  Monitor,
  Plus,
  Settings,
  Users,
  Printer,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react"

// Added proper TypeScript interface for new station form data
interface NewStationFormData {
  name: string
  location: string
  description: string
  eventId: string
  operatorId: string
  accessZoneId?: string
  printerName?: string
  printerType?: string
  advancedMode?: boolean
}

export default function StationsPage() {
  const { toast } = useToast()
  const events = useEventStore((s) => s.events)

  const [stations, setStations] = useState<CheckinStation[]>([])

  const [users] = useState<User[]>([])

  const [search, setSearch] = useState("")
  const [filterEvent, setFilterEvent] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingStation, setEditingStation] = useState<CheckinStation | null>(null)

  const [newStation, setNewStation] = useState<NewStationFormData>({
    name: "",
    location: "",
    description: "",
    eventId: "",
    operatorId: "",
    accessZoneId: "",
    printerName: "",
    printerType: "thermal",
    advancedMode: false,
  })

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(search.toLowerCase()) ||
        station.location.toLowerCase().includes(search.toLowerCase()) ||
        station.operatorName?.toLowerCase().includes(search.toLowerCase())

      const matchesEvent = filterEvent === "all" || station.eventId === filterEvent

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && station.isActive) ||
        (filterStatus === "inactive" && !station.isActive)

      return matchesSearch && matchesEvent && matchesStatus
    })
  }, [stations, search, filterEvent, filterStatus])

  const handleCreateStation = () => {
    if (!newStation.name || !newStation.location || !newStation.eventId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    const station: CheckinStation = {
      id: `station-${Date.now()}`,
      name: newStation.name,
      location: newStation.location,
      description: newStation.description,
      isActive: true,
      eventId: newStation.eventId,
      operatorId: newStation.operatorId || undefined,
      operatorName: newStation.operatorId ? users.find((u) => u.id === newStation.operatorId)?.name : undefined,
      checkedInCount: 0,
      settings: {
        autoprint: false,
        soundEnabled: true,
        requireConfirmation: false,
        accessZoneId: newStation.accessZoneId,
        printerName: newStation.printerName,
        printerType: newStation.printerType,
        advancedMode: newStation.advancedMode,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setStations((prev) => [...prev, station])
    setNewStation({
      name: "",
      location: "",
      description: "",
      eventId: "",
      operatorId: "",
      accessZoneId: "",
      printerName: "",
      printerType: "thermal",
      advancedMode: false,
    })
    setShowCreateDialog(false)
    toast({ title: "Estação criada com sucesso!" })
  }

  const handleUpdateStation = (stationId: string, updates: Partial<CheckinStation>) => {
    setStations((prev) =>
      prev.map((station) => (station.id === stationId ? { ...station, ...updates, updatedAt: Date.now() } : station)),
    )
  }

  const handleToggleStation = (stationId: string) => {
    setStations((prev) =>
      prev.map((station) =>
        station.id === stationId ? { ...station, isActive: !station.isActive, updatedAt: Date.now() } : station,
      ),
    )
  }

  const handleDeleteStation = (stationId: string) => {
    setStations((prev) => prev.filter((station) => station.id !== stationId))
    toast({ title: "Estação removida com sucesso!" })
  }

  const getStatusColor = (station: CheckinStation): string => {
    if (!station.isActive) return "text-gray-500"
    if (!station.lastActivity) return "text-yellow-500"
    const timeSinceActivity = Date.now() - station.lastActivity
    if (timeSinceActivity < 300000) return "text-green-500" // 5 min
    if (timeSinceActivity < 900000) return "text-yellow-500" // 15 min
    return "text-red-500"
  }

  const getActivityStatus = (station: CheckinStation): string => {
    if (!station.isActive) return "Inativa"
    if (!station.lastActivity) return "Sem atividade"
    const timeSinceActivity = Date.now() - station.lastActivity
    if (timeSinceActivity < 300000) return "Online"
    if (timeSinceActivity < 900000) return "Inativa"
    return "Desconectada"
  }

  const stats = useMemo(() => {
    const total = stations.length
    const active = stations.filter((s) => s.isActive).length
    const online = stations.filter((s) => s.isActive && s.lastActivity && Date.now() - s.lastActivity < 300000).length
    const totalCheckins = stations.reduce((sum, s) => sum + s.checkedInCount, 0)

    return { total, active, online, totalCheckins }
  }, [stations])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Estações de Credenciamento</h1>
          <p className="text-muted-foreground">Gerencie estações de check-in e suas configurações</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Estação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Estação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome da Estação *</Label>
                <Input
                  value={newStation.name}
                  onChange={(e) => setNewStation((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Entrada Principal"
                />
              </div>
              <div>
                <Label>Evento *</Label>
                <Select
                  value={newStation.eventId}
                  onValueChange={(value: string) => setNewStation((prev) => ({ ...prev, eventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum evento disponível
                      </SelectItem>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Localização *</Label>
                <Input
                  value={newStation.location}
                  onChange={(e) => setNewStation((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Hall de Entrada - Portão A"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newStation.description}
                  onChange={(e) => setNewStation((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional da estação"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Operador Responsável</Label>
                <Select
                  value={newStation.operatorId}
                  onValueChange={(value: string) => setNewStation((prev) => ({ ...prev, operatorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um operador (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter((user) => user.role === "checkin_operator").length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum operador disponível
                      </SelectItem>
                    ) : (
                      users
                        .filter((user) => user.role === "checkin_operator")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.email}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Zona de Acesso</Label>
                <Select
                  value={newStation.accessZoneId || "none"}
                  onValueChange={(value: string) => setNewStation((prev) => ({ ...prev, accessZoneId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma zona de acesso (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todas as zonas</SelectItem>
                    <SelectItem value="vip">Zona VIP</SelectItem>
                    <SelectItem value="geral">Zona Geral</SelectItem>
                    <SelectItem value="backstage">Backstage</SelectItem>
                    <SelectItem value="imprensa">Área de Imprensa</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Define qual zona esta estação pode credenciar</p>
              </div>
              <div>
                <Label>Impressora</Label>
                <Input
                  value={newStation.printerName || ""}
                  onChange={(e) => setNewStation((prev) => ({ ...prev, printerName: e.target.value }))}
                  placeholder="Nome da impressora (ex: HP-LaserJet-01)"
                />
              </div>
              <div>
                <Label>Tipo de Impressora</Label>
                <Select
                  value={newStation.printerType || "thermal"}
                  onValueChange={(value: string) => setNewStation((prev) => ({ ...prev, printerType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal">Térmica (Etiquetas)</SelectItem>
                    <SelectItem value="inkjet">Jato de Tinta</SelectItem>
                    <SelectItem value="laser">Laser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-center space-x-2">
                <Switch
                  id="advanced-mode"
                  checked={newStation.advancedMode || false}
                  onCheckedChange={(checked) => setNewStation((prev) => ({ ...prev, advancedMode: checked }))}
                />
                <Label htmlFor="advanced-mode">Modo Avançado</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita controle de acesso avançado, múltiplas entradas e zonas
                </p>
              </div>
              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button onClick={handleCreateStation} className="flex-1">
                  Criar Estação
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="stations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stations">Estações</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="settings">Configurações Globais</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estações ({filteredStations.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estações..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterEvent} onValueChange={(value: string) => setFilterEvent(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStations.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma estação encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {stations.length === 0
                      ? "Comece criando sua primeira estação de credenciamento."
                      : "Nenhuma estação corresponde aos filtros aplicados."}
                  </p>
                  {stations.length === 0 && events.length > 0 && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Estação
                    </Button>
                  )}
                  {events.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Você precisa criar um evento primeiro antes de configurar estações.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStations.map((station) => (
                    <Card key={station.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">{station.name}</h3>
                              </div>
                              <Badge variant={station.isActive ? "default" : "secondary"}>
                                {station.isActive ? "Ativa" : "Inativa"}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {station.isActive &&
                                station.lastActivity &&
                                Date.now() - station.lastActivity < 300000 ? (
                                  <Wifi className="h-4 w-4 text-green-500" />
                                ) : (
                                  <WifiOff className="h-4 w-4 text-red-500" />
                                )}
                                <span className={`text-sm ${getStatusColor(station)}`}>
                                  {getActivityStatus(station)}
                                </span>
                              </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{station.location}</span>
                              </div>
                              {station.operatorName && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{station.operatorName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span>{station.checkedInCount} check-ins</span>
                              </div>
                              {station.lastActivity && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{new Date(station.lastActivity).toLocaleTimeString()}</span>
                                </div>
                              )}
                            </div>

                            {station.description && (
                              <p className="text-sm text-muted-foreground mt-2">{station.description}</p>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1">
                                {station.settings.autoprint ? (
                                  <Printer className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Printer className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>Impressão {station.settings.autoprint ? "automática" : "manual"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {station.settings.soundEnabled ? (
                                  <Volume2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>Sons {station.settings.soundEnabled ? "ativados" : "desativados"}</span>
                              </div>
                              {station.settings.printerName && (
                                <div className="flex items-center gap-1">
                                  <Settings className="h-4 w-4 text-muted-foreground" />
                                  <span>{station.settings.printerName}</span>
                                </div>
                              )}
                              {station.settings.advancedMode && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    Modo Avançado
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Switch
                              checked={station.isActive}
                              onCheckedChange={() => handleToggleStation(station.id)}
                            />
                            <Button variant="outline" size="sm" onClick={() => setEditingStation(station)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStation(station.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Zonas de Acesso</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium">Zona VIP</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Área premium com acesso restrito para ingressos VIP
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Zona Geral</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Área principal acessível para todos os tipos de ingresso
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">Backstage</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Área restrita para staff e equipe técnica</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Área de Imprensa</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Área dedicada para jornalistas e fotógrafos credenciados
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Configurações de Impressão</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Impressão Automática Global</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar impressão automática para todas as novas estações
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sons de Notificação</Label>
                      <p className="text-sm text-muted-foreground">Ativar sons para todas as estações por padrão</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Avançado Global</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilitar controle de acesso avançado para novas estações
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
