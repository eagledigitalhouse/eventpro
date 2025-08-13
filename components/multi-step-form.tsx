"use client"

import { useState, type ReactNode, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

interface Step {
  id: string
  title: string
  description?: string
  content: ReactNode
  isValid?: boolean
  validationErrors?: string[]
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void
  onCancel?: () => void
  className?: string
  showProgress?: boolean
  isLoading?: boolean
}

export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  className = "",
  showProgress = true,
  isLoading = false,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or current step
    if (stepIndex <= currentStep && !isLoading) {
      setCurrentStep(stepIndex)
    }
  }

  const currentStepData = steps[currentStep]
  const canProceed = currentStepData?.isValid !== false && !isLoading

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Etapa {currentStep + 1} de {steps.length}
            </h2>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200
                  ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                        ? "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={index > currentStep || isLoading}
              >
                {index + 1}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`
                  w-12 h-0.5 mx-2
                  ${index < currentStep ? "bg-primary" : "bg-muted"}
                `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          {currentStepData.description && <p className="text-muted-foreground">{currentStepData.description}</p>}
        </CardHeader>
        <CardContent>
          {currentStepData.validationErrors && currentStepData.validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {currentStepData.validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {currentStepData.content}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {!isFirstStep && (
            <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
          {isFirstStep && onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
        </div>

        <Button onClick={handleNext} disabled={!canProceed}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processando...
            </>
          ) : isLastStep ? (
            "Finalizar"
          ) : (
            <>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Hook para gerenciar estado do formulário multi-step
export function useMultiStepForm<T extends Record<string, unknown>>(initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => {
      const newData = { ...prev, ...updates }
      // Only update if data actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newData)) {
        return newData
      }
      return prev
    })
  }, [])

  const resetData = useCallback(() => {
    setData(initialData)
  }, [initialData])

  const memoizedSetData = useCallback((newData: T) => {
    setData((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newData)) {
        return newData
      }
      return prev
    })
  }, [])

  return {
    data,
    updateData,
    resetData,
    setData: memoizedSetData,
    isLoading,
    setIsLoading,
  }
}
