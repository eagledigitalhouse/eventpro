"use client"

import { useState, useCallback } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Copy,
  Settings,
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  FileText,
  List,
  CheckCircle,
  Upload,
  Star,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "rating"

interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    dependsOn: string
    value: string
  }
}

interface TicketForm {
  id: string
  ticketTypeId: string
  ticketTypeName: string
  fields: FormField[]
  isActive: boolean
}

const fieldTypeIcons = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  date: Calendar,
  textarea: FileText,
  select: List,
  radio: CheckCircle,
  checkbox: CheckCircle,
  file: Upload,
  rating: Star,
}

const fieldTypeLabels = {
  text: "Texto",
  email: "Email",
  phone: "Telefone",
  number: "Número",
  date: "Data",
  textarea: "Texto Longo",
  select: "Lista Suspensa",
  radio: "Múltipla Escolha",
  checkbox: "Caixas de Seleção",
  file: "Upload de Arquivo",
  rating: "Avaliação",
}

export default function EventFormsPage() {
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const eventId = params?.id

  const event = useEventStore((s) => s.events.find((e) => e.id === eventId))

  const [forms, setForms] = useState<TicketForm[]>(() => {
    if (!event) return []
    return event.tickets.map((ticket) => ({
      id: `form-${ticket.id}`,
      ticketTypeId: ticket.id,
      ticketTypeName: ticket.name,
      fields: [],
      isActive: false,
    }))
  })

  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [newFieldDialog, setNewFieldDialog] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)

  const currentForm = forms.find((f) => f.id === selectedForm)

  const createField = useCallback(
    (type: FieldType): FormField => ({
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `${fieldTypeLabels[type]} ${(currentForm?.fields.length || 0) + 1}`,
      required: false,
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Opção 1", "Opção 2"] : undefined,
    }),
    [currentForm?.fields.length],
  )

  const addField = useCallback(
    (type: FieldType) => {
      if (!selectedForm) return

      const newField = createField(type)
      setForms((prev) =>
        prev.map((form) => (form.id === selectedForm ? { ...form, fields: [...form.fields, newField] } : form)),
      )
      setNewFieldDialog(false)
      toast({ title: "Campo adicionado com sucesso!" })
    },
    [selectedForm, createField, toast],
  )

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      if (!selectedForm) return

      setForms((prev) =>
        prev.map((form) =>
          form.id === selectedForm
            ? {
                ...form,
                fields: form.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
              }
            : form,
        ),
      )
    },
    [selectedForm],
  )

  const removeField = useCallback(
    (fieldId: string) => {
      if (!selectedForm) return

      setForms((prev) =>
        prev.map((form) =>
          form.id === selectedForm ? { ...form, fields: form.fields.filter((field) => field.id !== fieldId) } : form,
        ),
      )
      toast({ title: "Campo removido!" })
    },
    [selectedForm, toast],
  )

  const duplicateForm = useCallback(
    (formId: string) => {
      const formToDuplicate = forms.find((f) => f.id === formId)
      if (!formToDuplicate) return

      const newForm: TicketForm = {
        ...formToDuplicate,
        id: `form-${Date.now()}`,
        ticketTypeName: `${formToDuplicate.ticketTypeName} (Cópia)`,
        fields: formToDuplicate.fields.map((field) => ({
          ...field,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      }

      setForms((prev) => [...prev, newForm])
      toast({ title: "Formulário duplicado!" })
    },
    [forms, toast],
  )

  const toggleFormActive = useCallback((formId: string) => {
    setForms((prev) => prev.map((form) => (form.id === formId ? { ...form, isActive: !form.isActive } : form)))
  }, [])

  const saveForms = useCallback(() => {
    // Aqui você salvaria os formulários no store ou API
    toast({ title: "Formulários salvos com sucesso!" })
  }, [toast])

  if (!event) return notFound()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/events/${event.id}/manage`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Formulários de Inscrição</h1>
            <p className="text-muted-foreground">{event.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Editar" : "Preview"}
          </Button>
          <Button onClick={saveForms}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Lista de Formulários */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipos de Ingresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedForm === form.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedForm(form.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{form.ticketTypeName}</div>
                      <div className="text-xs text-muted-foreground">{form.fields.length} campos</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={form.isActive} onCheckedChange={() => toggleFormActive(form.id)} size="sm" />
                      {form.isActive && (
                        <Badge variant="default" className="text-xs">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Templates */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  if (!selectedForm) return
                  const basicFields: FormField[] = [createField("text"), createField("email"), createField("phone")]
                  setForms((prev) =>
                    prev.map((form) =>
                      form.id === selectedForm ? { ...form, fields: [...form.fields, ...basicFields] } : form,
                    ),
                  )
                  toast({ title: "Template básico aplicado!" })
                }}
              >
                Básico (Nome, Email, Telefone)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  if (!selectedForm) return
                  const eventFields: FormField[] = [
                    createField("text"),
                    createField("email"),
                    createField("phone"),
                    createField("select"),
                    createField("textarea"),
                  ]
                  setForms((prev) =>
                    prev.map((form) =>
                      form.id === selectedForm ? { ...form, fields: [...form.fields, ...eventFields] } : form,
                    ),
                  )
                  toast({ title: "Template de evento aplicado!" })
                }}
              >
                Evento Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedForm ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um tipo de ingresso</h3>
                  <p className="text-muted-foreground">
                    Escolha um tipo de ingresso na barra lateral para configurar seu formulário
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : previewMode ? (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <CardTitle>Preview - {currentForm?.ticketTypeName}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  {currentForm?.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {field.type === "text" && <Input placeholder={field.placeholder} />}

                      {field.type === "email" && <Input type="email" placeholder={field.placeholder} />}

                      {field.type === "phone" && <Input type="tel" placeholder={field.placeholder} />}

                      {field.type === "number" && <Input type="number" placeholder={field.placeholder} />}

                      {field.type === "date" && <Input type="date" />}

                      {field.type === "textarea" && <Textarea placeholder={field.placeholder} />}

                      {field.type === "select" && (
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "radio" && (
                        <div className="space-y-2">
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input type="radio" name={field.id} id={`${field.id}-${idx}`} />
                              <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div className="space-y-2">
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input type="checkbox" id={`${field.id}-${idx}`} />
                              <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === "file" && <Input type="file" />}

                      {field.type === "rating" && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-6 w-6 text-muted-foreground hover:text-yellow-400 cursor-pointer"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {currentForm?.fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nenhum campo adicionado ainda</div>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Form Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentForm?.ticketTypeName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure os campos que serão solicitados na compra deste tipo de ingresso
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => duplicateForm(selectedForm)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </Button>
                      <Dialog open={newFieldDialog} onOpenChange={setNewFieldDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Campo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Campo</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => {
                                const Icon = fieldTypeIcons[type]
                                return (
                                  <Button
                                    key={type}
                                    variant="outline"
                                    className="h-20 flex-col gap-2 bg-transparent"
                                    onClick={() => addField(type)}
                                  >
                                    <Icon className="h-6 w-6" />
                                    <span className="text-xs">{fieldTypeLabels[type]}</span>
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Fields List */}
              <div className="space-y-3">
                {currentForm?.fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4 cursor-move" />
                          <span className="text-sm">{index + 1}</span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = fieldTypeIcons[field.type]
                              return <Icon className="h-4 w-4" />
                            })()}
                            <Badge variant="secondary" className="text-xs">
                              {fieldTypeLabels[field.type]}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <Label className="text-xs">Rótulo</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Placeholder</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="h-8"
                              />
                            </div>
                          </div>

                          {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                            <div>
                              <Label className="text-xs">Opções (uma por linha)</Label>
                              <Textarea
                                value={field.options?.join("\n") || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    options: e.target.value.split("\n").filter((o) => o.trim()),
                                  })
                                }
                                className="h-20"
                                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                size="sm"
                              />
                              <Label className="text-xs">Obrigatório</Label>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(field.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {currentForm?.fields.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum campo adicionado</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => setNewFieldDialog(true)}
                        >
                          Adicionar Primeiro Campo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
