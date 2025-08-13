"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { auth, ROLE_PERMISSIONS } from "@/lib/auth"
import type { User, UserRole } from "@/lib/types"
import { UserPlus, Shield, Search, Edit } from "lucide-react"

// Added proper TypeScript interface for new user form data
interface NewUserFormData {
  name: string
  email: string
  phone: string
  role: UserRole
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState<NewUserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "checkin_operator",
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, filterRole, filterStatus])

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || undefined,
      role: newUser.role,
      permissions: ROLE_PERMISSIONS[newUser.role],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: auth.getCurrentUser()?.id,
    }

    setUsers((prev) => [...prev, user])
    setNewUser({ name: "", email: "", phone: "", role: "checkin_operator" })
    setShowCreateDialog(false)
    toast({ title: "Usuário criado com sucesso!" })
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, isActive: !user.isActive, updatedAt: Date.now() } : user)),
    )
  }

  const getRoleBadgeVariant = (role: UserRole): "destructive" | "default" | "secondary" | "outline" => {
    switch (role) {
      case "admin":
        return "destructive"
      case "producer":
        return "default"
      case "checkin_operator":
        return "secondary"
      case "customer":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "producer":
        return "Produtor"
      case "checkin_operator":
        return "Operador Check-in"
      case "customer":
        return "Cliente"
      default:
        return role
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários, permissões e acessos</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label>Função</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) => setNewUser((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producer">Produtor</SelectItem>
                    <SelectItem value="checkin_operator">Operador Check-in</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateUser} className="flex-1">
                  Criar Usuário
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Funções e Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={(value: UserRole | "all") => setFilterRole(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as funções</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="producer">Produtor</SelectItem>
                      <SelectItem value="checkin_operator">Operador Check-in</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
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
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {users.length === 0
                      ? "Comece criando seu primeiro usuário do sistema."
                      : "Nenhum usuário corresponde aos filtros aplicados."}
                  </p>
                  {users.length === 0 && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Primeiro Usuário
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{user.name}</div>
                            <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                            {!user.isActive && (
                              <Badge variant="outline" className="text-red-600">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                            {user.phone && ` • ${user.phone}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Criado em {new Date(user.createdAt).toLocaleDateString()}
                            {user.lastLoginAt && ` • Último acesso: ${new Date(user.lastLoginAt).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.isActive} onCheckedChange={() => handleToggleUserStatus(user.id)} />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {getRoleLabel(role as UserRole)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-3">Permissões ({permissions.length}):</div>
                    <div className="grid gap-1">
                      {permissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {permission}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
