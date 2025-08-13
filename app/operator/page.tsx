"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useEventStore } from "@/lib/store"
import { QrScanner } from "@/components/qr-scanner"
import { TEMP_MOCK_DATA } from "@/lib/mock-data-temp"
import {
  UserCheck,
  QrCode,
  Users,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Printer,
  Volume2,
  VolumeX,
  Search,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Monitor,
  Shield,
  MapPin,
  History,
} from "lucide-react"

interface OperatorSession {
  stationId: string
  stationName: string
  eventId: string
  eventName: string
  startTime: number
  checkinCount: number
  lastActivity: number
}

interface RecentActivity {
  id: string
  participantName: string
  ticketType: string
  time: number
  status: "success" | "duplicate" | "error"
  zone?: string
  entryNumber?: number
}

export default function OperatorDashboard() {
  const { toast } = useToast()

  const events = useEventStore(useCallback((s) => s.events, []))
  const orders = useEventStore(useCallback((s) => s.orders, []))
  const stations = useEventStore(useCallback((s) => s.stations || [], []))
  const checkInByCode = useEventStore(useCallback((s) => s.checkInByCode, []))
  const checkInByPayload = useEventStore(useCallback((s) => s.checkInByPayload, []))
  const getEventById = useEventStore(useCallback((s) => s.getEventById, []))
  const getStationByOperatorId = useEventStore(useCallback((s) => s.getStationByOperatorId, []))
  const getOrdersByEventId = useEventStore(useCallback((s) => s.getOrdersByEventId, []))
  const getAccessZones = useEventStore(useCallback((s) => s.getAccessZones, []))
  const getCheckInHistory = useEventStore(useCallback((s) => s.getCheckInHistory, []))
  const canAccessZone = useEventStore(useCallback((s) => s.canAccessZone, []))
  const processAdvancedCheckIn = useEventStore(useCallback((s) => s.processAdvancedCheckIn, []))

  const currentUserRef = useRef(TEMP_MOCK_DATA.currentUser)
  const currentUser = currentUserRef.current

  const userStation = useMemo(() => {
    return TEMP_MOCK_DATA.station
  }, [])

  const currentEvent = useMemo(() => {
    return TEMP_MOCK_DATA.event
  }, [])

  const [session, setSession] = useState<OperatorSession>(() => ({
    stationId: "",
    stationName: "Estação não atribuída",
    eventId: "",
    eventName: "Nenhum evento",
    startTime: Date.now(),
    checkinCount: 0,
    lastActivity: Date.now(),
  }))

  const [scannerActive, setScannerActive] = useState(true)
  const [manualCode, setManualCode] = useState("")
  const [search, setSearch] = useState("")
  const [selectedZone, setSelectedZone] = useState<string>("todas")
  const [quickSettings, setQuickSettings] = useState({
    soundEnabled: true,
    autoprint: false,
    confirmationRequired: false,
    advancedMode: true,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const sessionRef = useRef(session)
  sessionRef.current = session

  const quickSettingsRef = useRef(quickSettings)
  quickSettingsRef.current = quickSettings

  const eventOrders = useMemo(() => {
    return TEMP_MOCK_DATA.orders
  }, [])

  const accessZones = useMemo(() => {
    return TEMP_MOCK_DATA.accessZones
  }, [])

  const participants = useMemo(() => {
    if (!currentEvent) return []

    const list: {
      orderId: string
      buyerName: string
      ticketType: string
      ticketId: string
      code: string
      checkedIn: boolean
      checkedInAt?: number
      checkInCount?: number
      lastZone?: string
      accessConfig?: any
    }[] = []

    for (const order of eventOrders) {
      for (const item of order.items) {
        for (const attendee of item.attendees) {
          const ticketType = currentEvent.ticketTypes?.find((t) => t.name === item.ticketName)

          list.push({
            orderId: order.id,
            buyerName: order.buyerName,
            ticketType: item.ticketName,
            ticketId: attendee.id,
            code: attendee.code,
            checkedIn: attendee.checkedIn,
            checkedInAt: attendee.checkedInAt,
            checkInCount: attendee.checkInCount || 0,
            lastZone: attendee.lastZone,
            accessConfig: ticketType?.accessConfig,
          })
        }
      }
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      return list.filter(
        (p) =>
          p.buyerName.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.ticketType.toLowerCase().includes(query),
      )
    }

    return list.sort((a, b) => (b.checkedInAt || 0) - (a.checkedInAt || 0))
  }, [currentEvent, eventOrders, search])

  const stats = useMemo(() => {
    const total = participants.length
    const checkedIn = participants.filter((p) => p.checkedIn).length
    const pending = total - checkedIn
    const checkinRate = total > 0 ? (checkedIn / total) * 100 : 0
    const sessionDuration = Date.now() - session.startTime
    const avgPerHour = sessionDuration > 0 ? (session.checkinCount / (sessionDuration / 3600000)).toFixed(1) : "0"
    const multipleEntries = participants.filter((p) => (p.checkInCount || 0) > 1).length

    return { total, checkedIn, pending, checkinRate, avgPerHour, multipleEntries }
  }, [participants, session.checkinCount, session.startTime])

  const handleQrScan = useCallback(
    (code: string) => {
      const currentSession = sessionRef.current
      const currentQuickSettings = quickSettingsRef.current

      if (!currentSession.eventId) {
        toast({ title: "Nenhum evento atribuído", variant: "destructive" })
        return
      }

      let result
      if (currentQuickSettings.advancedMode) {
        result = processAdvancedCheckIn(
          code,
          currentSession.eventId,
          selectedZone !== "todas" ? selectedZone : undefined,
        )
      } else {
        result = checkInByCode(code, currentSession.eventId)
      }

      if (currentQuickSettings.soundEnabled) {
        const audio = new Audio(result.status === "ok" ? "/sounds/success.mp3" : "/sounds/error.mp3")
        audio.play().catch(() => {})
      }

      if (result.status === "ok") {
        setSession((prev) => ({
          ...prev,
          checkinCount: prev.checkinCount + 1,
          lastActivity: Date.now(),
        }))

        const participant = participants.find((p) => p.code === code)
        if (participant) {
          setRecentActivity((prev) => [
            {
              id: Date.now().toString(),
              participantName: participant.buyerName,
              ticketType: participant.ticketType,
              time: Date.now(),
              status: "success",
              zone: selectedZone !== "todas" ? selectedZone : undefined,
              entryNumber: (participant.checkInCount || 0) + 1,
            },
            ...prev.slice(0, 9),
          ])
        }
      }

      toast({
        title: result.message,
        variant: result.status === "ok" ? "default" : result.status === "already" ? "default" : "destructive",
      })
    },
    [checkInByCode, processAdvancedCheckIn, participants, selectedZone, toast],
  )

  const handleManualCheckin = useCallback(() => {
    const currentSession = sessionRef.current
    const currentQuickSettings = quickSettingsRef.current

    if (!manualCode.trim() || !currentSession.eventId) return

    let result
    if (currentQuickSettings.advancedMode) {
      result = processAdvancedCheckIn(
        manualCode.trim(),
        currentSession.eventId,
        selectedZone !== "todas" ? selectedZone : undefined,
      )
    } else {
      result = checkInByCode(manualCode.trim(), currentSession.eventId)
    }

    if (result.status === "ok") {
      setSession((prev) => ({
        ...prev,
        checkinCount: prev.checkinCount + 1,
        lastActivity: Date.now(),
      }))

      const participant = participants.find((p) => p.code === manualCode.trim())
      if (participant) {
        setRecentActivity((prev) => [
          {
            id: Date.now().toString(),
            participantName: participant.buyerName,
            ticketType: participant.ticketType,
            time: Date.now(),
            status: "success",
            zone: selectedZone !== "todas" ? selectedZone : undefined,
            entryNumber: (participant.checkInCount || 0) + 1,
          },
          ...prev.slice(0, 9),
        ])
      }

      setManualCode("")
    }

    toast({
      title: result.message,
      variant: result.status === "ok" ? "default" : result.status === "already" ? "default" : "destructive",
    })
  }, [manualCode, checkInByCode, processAdvancedCheckIn, participants, selectedZone, toast])

  useEffect(() => {
    if (!userStation || !currentEvent) return

    const newSession = {
      stationId: userStation.id,
      stationName: userStation.name,
      eventId: userStation.eventId,
      eventName: currentEvent.name,
      checkinCount: userStation.checkedInCount || 0,
      lastActivity: userStation.lastActivity || Date.now(),
      startTime: sessionRef.current.startTime,
    }

    const newSettings = {
      soundEnabled: userStation.settings?.soundEnabled ?? true,
      autoprint: userStation.settings?.autoprint ?? false,
      confirmationRequired: userStation.settings?.requireConfirmation ?? false,
      advancedMode: userStation.settings?.advancedMode ?? true,
    }

    if (JSON.stringify(newSession) !== JSON.stringify(sessionRef.current)) {
      setSession(newSession)
    }

    if (JSON.stringify(newSettings) !== JSON.stringify(quickSettingsRef.current)) {
      setQuickSettings(newSettings)
    }
  }, [userStation, currentEvent])

  if (!userStation || !currentEvent) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma estação atribuída</h3>
              <p className="text-muted-foreground">
                Entre em contato com o administrador para atribuir uma estação de credenciamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold">Credenciamento</h1>
            <p className="text-muted-foreground">
              {session.stationName} • {session.eventName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <Activity className="h-3 w-3" />
              Conectado
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Sessão iniciada: {new Date(session.startTime).toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {session.checkinCount} credenciamentos realizados
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {stats.avgPerHour} por hora
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Inscritos no evento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credenciados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">{stats.checkinRate.toFixed(1)}% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando credenciamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Múltiplas Entradas</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.multipleEntries}</div>
            <p className="text-xs text-muted-foreground">Re-entradas permitidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha Estação</CardTitle>
            <Monitor className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{session.checkinCount}</div>
            <p className="text-xs text-muted-foreground">Credenciamentos hoje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Credenciamento Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scanner" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scanner">Scanner QR</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="scanner" className="space-y-4">
                  {quickSettings.advancedMode && accessZones.length > 0 && (
                    <div>
                      <Label>Zona de Acesso</Label>
                      <Select value={selectedZone} onValueChange={setSelectedZone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as zonas</SelectItem>
                          {accessZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {zone.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-center">
                    {scannerActive ? (
                      <div className="w-full max-w-sm">
                        <QrScanner onScan={handleQrScan} />
                      </div>
                    ) : (
                      <div className="w-full max-w-sm h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Scanner pausado</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setScannerActive(!scannerActive)}
                    className="w-full"
                    variant={scannerActive ? "destructive" : "default"}
                  >
                    {scannerActive ? "Pausar Scanner" : "Ativar Scanner"}
                  </Button>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  {quickSettings.advancedMode && accessZones.length > 0 && (
                    <div>
                      <Label>Zona de Acesso</Label>
                      <Select value={selectedZone} onValueChange={setSelectedZone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as zonas</SelectItem>
                          {accessZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {zone.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Código do Ingresso</Label>
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Digite ou cole o código"
                      onKeyDown={(e) => e.key === "Enter" && handleManualCheckin()}
                      className="text-lg"
                    />
                  </div>
                  <Button onClick={handleManualCheckin} className="w-full" disabled={!manualCode.trim()}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Fazer Credenciamento
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Participantes</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar participante..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum participante encontrado para este evento</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.slice(0, 20).map((participant) => (
                    <div key={participant.ticketId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{participant.buyerName}</div>
                          <Badge variant="outline" className="text-xs">
                            {participant.ticketType}
                          </Badge>
                          {participant.checkedIn ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Credenciado{" "}
                              {participant.checkInCount &&
                                participant.checkInCount > 1 &&
                                `(${participant.checkInCount}x)`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Pendente
                            </Badge>
                          )}
                          {participant.lastZone && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {participant.lastZone}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{participant.code}</div>
                        {participant.accessConfig && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {participant.accessConfig.allowMultipleEntries && (
                              <span className="inline-flex items-center gap-1 mr-2">
                                <Shield className="h-3 w-3" />
                                Múltiplas entradas
                              </span>
                            )}
                            {participant.accessConfig.maxEntriesPerDay && (
                              <span>Máx: {participant.accessConfig.maxEntriesPerDay}/dia</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.checkedIn && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const history = getCheckInHistory(participant.ticketId)
                              if (history.length > 0) {
                                toast({
                                  title: `Histórico de ${participant.buyerName}`,
                                  description: `${history.length} entradas registradas`,
                                })
                              }
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            let result
                            if (quickSettings.advancedMode) {
                              result = processAdvancedCheckIn(
                                participant.code,
                                session.eventId,
                                selectedZone !== "todas" ? selectedZone : undefined,
                              )
                            } else {
                              result = checkInByPayload({ ticketId: participant.ticketId, eventId: session.eventId })
                            }

                            if (result.status === "ok") {
                              setSession((prev) => ({
                                ...prev,
                                checkinCount: prev.checkinCount + 1,
                                lastActivity: Date.now(),
                              }))
                            }
                            toast({
                              title: result.message,
                              variant: result.status === "ok" ? "default" : "destructive",
                            })
                          }}
                          disabled={participant.checkedIn && !participant.accessConfig?.allowMultipleEntries}
                        >
                          {participant.checkedIn ? "Re-credenciar" : "Credenciar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {quickSettings.soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label>Sons</Label>
                </div>
                <Switch
                  checked={quickSettings.soundEnabled}
                  onCheckedChange={(checked) => setQuickSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer
                    className={`h-4 w-4 ${quickSettings.autoprint ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <Label>Impressão Automática</Label>
                </div>
                <Switch
                  checked={quickSettings.autoprint}
                  onCheckedChange={(checked) => setQuickSettings((prev) => ({ ...prev, autoprint: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className={`h-4 w-4 ${quickSettings.confirmationRequired ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <Label>Confirmação Obrigatória</Label>
                </div>
                <Switch
                  checked={quickSettings.confirmationRequired}
                  onCheckedChange={(checked) =>
                    setQuickSettings((prev) => ({ ...prev, confirmationRequired: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield
                    className={`h-4 w-4 ${quickSettings.advancedMode ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <Label>Modo Avançado</Label>
                </div>
                <Switch
                  checked={quickSettings.advancedMode}
                  onCheckedChange={(checked) => setQuickSettings((prev) => ({ ...prev, advancedMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      {activity.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.participantName}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.ticketType} • {new Date(activity.time).toLocaleTimeString()}
                          {activity.zone && ` • ${activity.zone}`}
                          {activity.entryNumber && activity.entryNumber > 1 && ` • ${activity.entryNumber}ª entrada`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Relatório
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Dados
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Estação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
