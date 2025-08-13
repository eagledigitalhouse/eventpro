"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Crown,
  Zap,
  Shield,
  BarChart3,
  Users,
  Calendar,
  Smartphone,
  Globe,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Lock,
  Palette,
  Code,
  Headphones,
  type LucideIcon,
} from "lucide-react"

type PremiumFeature = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: "analytics" | "customization" | "automation" | "support" | "integration"
  isActive: boolean
  isPremium: boolean
}

const createPremiumFeatures = (): PremiumFeature[] => [
  {
    id: "advanced-analytics",
    name: "Analytics Avançado",
    description: "Relatórios detalhados, funis de conversão e insights de comportamento",
    icon: BarChart3,
    category: "analytics",
    isActive: false,
    isPremium: true,
  },
  {
    id: "white-label",
    name: "White Label",
    description: "Remova nossa marca e use sua própria identidade visual",
    icon: Palette,
    category: "customization",
    isActive: false,
    isPremium: true,
  },
  {
    id: "custom-domain",
    name: "Domínio Personalizado",
    description: "Use seu próprio domínio para páginas de eventos",
    icon: Globe,
    category: "customization",
    isActive: false,
    isPremium: true,
  },
  {
    id: "api-access",
    name: "Acesso à API",
    description: "Integre com seus sistemas através da nossa API REST",
    icon: Code,
    category: "integration",
    isActive: false,
    isPremium: true,
  },
  {
    id: "priority-support",
    name: "Suporte Prioritário",
    description: "Atendimento prioritário via chat, email e telefone",
    icon: Headphones,
    category: "support",
    isActive: false,
    isPremium: true,
  },
  {
    id: "advanced-automation",
    name: "Automação Avançada",
    description: "Workflows complexos e triggers personalizados",
    icon: Zap,
    category: "automation",
    isActive: false,
    isPremium: true,
  },
  {
    id: "unlimited-events",
    name: "Eventos Ilimitados",
    description: "Crie quantos eventos quiser sem limitações",
    icon: Calendar,
    category: "analytics",
    isActive: false,
    isPremium: true,
  },
  {
    id: "mobile-app",
    name: "App Mobile Personalizado",
    description: "App nativo para iOS e Android com sua marca",
    icon: Smartphone,
    category: "customization",
    isActive: false,
    isPremium: true,
  },
]

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  isCurrentPlan: boolean
}

const createPricingPlans = (currentPlan = "free"): PricingPlan[] => [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "para sempre",
    description: "Perfeito para começar",
    features: [
      "Até 3 eventos por mês",
      "Até 100 participantes por evento",
      "Relatórios básicos",
      "Suporte por email",
      "Marca EventosPro",
    ],
    limitations: ["Funcionalidades limitadas", "Suporte básico", "Sem personalização"],
    isCurrentPlan: currentPlan === "free",
  },
  {
    id: "pro",
    name: "Profissional",
    price: 97,
    period: "por mês",
    description: "Para organizadores sérios",
    features: [
      "Eventos ilimitados",
      "Participantes ilimitados",
      "Analytics avançado",
      "Suporte prioritário",
      "Integrações premium",
      "Automação avançada",
      "Relatórios personalizados",
    ],
    popular: true,
    isCurrentPlan: currentPlan === "pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 297,
    period: "por mês",
    description: "Para grandes organizações",
    features: [
      "Tudo do Profissional",
      "White label completo",
      "Domínio personalizado",
      "API completa",
      "App mobile personalizado",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Treinamento personalizado",
    ],
    isCurrentPlan: currentPlan === "enterprise",
  },
]

export default function PremiumPage() {
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [features, setFeatures] = useState<PremiumFeature[]>(createPremiumFeatures())

  const plans = createPricingPlans(selectedPlan)

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, isActive: !f.isActive } : f)))

    const feature = features.find((f) => f.id === featureId)
    if (feature) {
      toast({
        title: `${feature.name} ${feature.isActive ? "desativado" : "ativado"}`,
        description: feature.isActive ? "Recurso desabilitado" : "Recurso habilitado com sucesso!",
      })
    }
  }

  const upgradePlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    if (planId === selectedPlan) {
      toast({
        title: `Você já está no plano ${plan.name}`,
        variant: "default",
      })
      return
    }

    setSelectedPlan(planId)

    // Enable premium features if upgrading to paid plan
    if (planId !== "free") {
      setFeatures((prev) => prev.map((f) => ({ ...f, isActive: f.isPremium })))
    } else {
      setFeatures((prev) => prev.map((f) => ({ ...f, isActive: false })))
    }

    toast({
      title: `Plano alterado para ${plan.name}!`,
      description: planId === "free" ? "Recursos premium foram desativados." : "Recursos premium foram ativados.",
    })
  }

  const activeFeatures = features.filter((f) => f.isActive)
  const availableFeatures = features.filter((f) => !f.isActive && f.isPremium)
  const currentPlan = plans.find((p) => p.isCurrentPlan)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">EventosPro Premium</h1>
        </div>
        <p className="text-muted-foreground text-lg">Desbloqueie todo o potencial da sua plataforma de eventos</p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Plano Atual: {currentPlan?.name || "Não definido"}</h3>
                <p className="text-muted-foreground">
                  Você está usando {activeFeatures.length} de {features.length} recursos disponíveis
                </p>
              </div>
            </div>
            {selectedPlan === "free" && (
              <Button size="lg" className="gap-2" onClick={() => upgradePlan("pro")}>
                <Sparkles className="h-4 w-4" />
                Fazer Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Escolha seu plano</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="gap-1">
                    <Star className="h-3 w-3" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Limitações:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={plan.isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                  onClick={() => upgradePlan(plan.id)}
                  disabled={plan.isCurrentPlan}
                >
                  {plan.isCurrentPlan ? "Plano Atual" : `Escolher ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Categories */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Active Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recursos Ativos ({activeFeatures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeFeatures.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum recurso premium ativo</p>
                <p className="text-sm text-muted-foreground">Faça upgrade para ativar recursos premium</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                          <Icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {feature.name}
                            {feature.isPremium && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{feature.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={feature.isActive}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        disabled={feature.isPremium && selectedPlan === "free"}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Premium Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-600" />
              Recursos Premium Disponíveis ({availableFeatures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableFeatures.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Todos os recursos premium estão ativos!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                          <Icon className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {feature.name}
                            <Badge className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{feature.description}</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => upgradePlan("pro")}>
                        Desbloquear
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Por que escolher o Premium?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Mais Vendas</h3>
              <p className="text-sm text-muted-foreground">
                Analytics avançado e automação para aumentar suas conversões
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Mais Segurança</h3>
              <p className="text-sm text-muted-foreground">Recursos avançados de segurança e backup automático</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Melhor Experiência</h3>
              <p className="text-sm text-muted-foreground">
                Interface personalizada e app mobile para seus participantes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Suporte Premium</h3>
              <p className="text-sm text-muted-foreground">Atendimento prioritário e gerente de conta dedicado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Pronto para decolar?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Junte-se a milhares de organizadores que já descobriram o poder do EventosPro Premium. Comece seu teste
            gratuito de 14 dias hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => upgradePlan("pro")}>
              <Sparkles className="h-4 w-4" />
              Começar Teste Gratuito
            </Button>
            <Button size="lg" variant="outline">
              Falar com Vendas
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Sem compromisso • Cancele a qualquer momento • Suporte 24/7
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
