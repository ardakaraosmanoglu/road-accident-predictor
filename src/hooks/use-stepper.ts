'use client'

import { useState, useCallback } from 'react'

export interface Step {
  id: string
  title: string
  description: string
  icon: string
  status: 'pending' | 'loading' | 'completed' | 'error' | 'skipped'
}

export interface UseStepperReturn {
  currentStep: number
  steps: Step[]
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setStepStatus: (stepIndex: number, status: Step['status']) => void
  updateStep: (stepIndex: number, updates: Partial<Step>) => void
  isFirstStep: boolean
  isLastStep: boolean
  progress: number
}

const initialSteps: Step[] = [
  {
    id: 'route',
    title: 'Rota',
    description: 'Nereye gidiyorsunuz?',
    icon: '📍',
    status: 'pending'
  },
  {
    id: 'weather',
    title: 'Hava Durumu',
    description: 'Hava bilgileri alınıyor',
    icon: '🌤️',
    status: 'pending'
  },
  {
    id: 'time',
    title: 'Zaman',
    description: 'Zaman bilgileri',
    icon: '🕐',
    status: 'pending'
  },
  {
    id: 'safety',
    title: 'Güvenlik',
    description: 'Sürücü güvenliği',
    icon: '🛡️',
    status: 'pending'
  }
]

export function useStepper(): UseStepperReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>(initialSteps)

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }, [steps.length])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const setStepStatus = useCallback((stepIndex: number, status: Step['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ))
  }, [])

  const updateStep = useCallback((stepIndex: number, updates: Partial<Step>) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, ...updates } : step
    ))
  }, [])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const progress = Math.round((completedSteps / steps.length) * 100)

  return {
    currentStep,
    steps,
    goToStep,
    nextStep,
    prevStep,
    setStepStatus,
    updateStep,
    isFirstStep,
    isLastStep,
    progress
  }
}
