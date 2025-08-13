"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Grid3X3,
  List,
  Download,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  QrCode,
  MoreVertical,
} from "lucide-react"
import { ParticipantDetailsModal } from "./participant-details-modal"
import { formatCurrency } from "@/lib/format"
import type { Order, EventItem } from "@/lib/types"

interface ParticipantData {
  id: string
  name: string
  email: string
  phone?: string
  ticketTypeName: string
  checkedIn: boolean
  checkedInAt?: number
  code: string
  customFields?: Record<string, any>
  order?: Order
  unitPrice?: number
  addedAt?: number
  isManual?: boolean
}

interface ParticipantsListProps {
  event: EventItem
  participants: ParticipantData[]
  onCheckIn?: (participantId: string) => void
  onGenerateTicket?: (participantId: string) => void
  onBulkCheckIn?: (participantIds: string[]) => void
  onExportList?: () => void
}

export function ParticipantsList({
  event,
  participants,
  onCheckIn,
  onGenerateTicket,
  onBulkCheckIn,
  onExportList,
}: ParticipantsListProps) {
  const [viewMode, setViewMode] = useState<"list" | "cards">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "checked-in" | "pending">("all")
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>("all")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros e busca
  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const matchesSearch =
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "checked-in" && participant.checkedIn) ||
        (statusFilter === "pending" && !participant.checkedIn)

      const matchesTicketType = ticketTypeFilter === "all" || participant.ticketTypeName === ticketTypeFilter

      return matchesSearch && matchesStatus && matchesTicketType
    })
  }, [participants, searchTerm, statusFilter, ticketTypeFilter])

  // Estatísticas
  const stats = useMemo(() => {
    const total = participants.length
    const checkedIn = participants.filter((p) => p.checkedIn).length
    const pending = total - checkedIn
    const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0

    return { total, checkedIn, pending, attendanceRate }
  }, [participants])

  // Tipos de ingresso únicos
  const ticketTypes = useMemo(() => {
    const types = [...new Set(participants.map((p) => p.ticketTypeName))]
    return types.sort()
  }, [participants])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  const handleSelectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(filteredParticipants.map((p) => p.id))
    }
  }

  const handleViewDetails = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setIsModalOpen(true)
  }

  const handleBulkCheckIn = () => {
    if (onBulkCheckIn && selectedParticipants.length > 0) {
      onBulkCheckIn(selectedParticipants)
      setSelectedParticipants([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credenciados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Comparecimento</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="checked-in">Credenciados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ticketTypeFilter} onValueChange={setTicketTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de Ingresso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {ticketTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {selectedParticipants.length > 0 && (
            <Button onClick={handleBulkCheckIn} size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Credenciar Selecionados ({selectedParticipants.length})
            </Button>
          )}

          {onExportList && (
            <Button variant="outline" onClick={onExportList} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}

          {/* Alternar visualização */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista/Cards de Participantes */}
      {filteredParticipants.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum participante encontrado</h3>
              <p>Tente ajustar os filtros ou adicionar participantes ao evento.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Participantes ({filteredParticipants.length})</CardTitle>
              {filteredParticipants.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedParticipants.length === filteredParticipants.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "list" ? (
              <div className="space-y-2">
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      selectedParticipants.includes(participant.id) ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => handleSelectParticipant(participant.id)}
                      className="rounded"
                    />

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{participant.name}</h3>
                        {participant.isManual && (
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {participant.email}
                        </span>
                        {participant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {participant.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {participant.ticketTypeName}
                        </Badge>
                        {participant.unitPrice !== undefined && (
                          <div className="text-sm text-muted-foreground">{formatCurrency(participant.unitPrice)}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                          {participant.checkedIn ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Credenciado
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Pendente
                            </>
                          )}
                        </Badge>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(participant)}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedParticipants.includes(participant.id) ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleViewDetails(participant)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(participant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium truncate">{participant.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{participant.email}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectParticipant(participant.id)
                          }}
                          className="rounded"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{participant.ticketTypeName}</Badge>
                          <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                            {participant.checkedIn ? "Credenciado" : "Pendente"}
                          </Badge>
                        </div>

                        {participant.checkedInAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(participant.checkedInAt)}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <QrCode className="h-3 w-3" />
                          {participant.code}
                        </div>

                        {participant.unitPrice !== undefined && (
                          <div className="text-sm font-medium">{formatCurrency(participant.unitPrice)}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <ParticipantDetailsModal
        participant={selectedParticipant}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedParticipant(null)
        }}
        onCheckIn={onCheckIn}
        onGenerateTicket={onGenerateTicket}
      />
    </div>
  )
}
