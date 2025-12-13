'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'

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

export function useStepper(): UseStepperReturn {
  const t = useTranslations('stepper')

  const buildSteps = useCallback((): Step[] => [
    {
      id: 'route',
      title: t('routeTitle'),
      description: t('routeDescription'),
      icon: '📍',
      status: 'pending'
    },
    {
      id: 'weather',
      title: t('weatherTitle'),
      description: t('weatherDescription'),
      icon: '🌤️',
      status: 'pending'
    },
    {
      id: 'time',
      title: t('timeTitle'),
      description: t('timeDescription'),
      icon: '🕐',
      status: 'pending'
    },
    {
      id: 'safety',
      title: t('safetyTitle'),
      description: t('safetyDescription'),
      icon: '🛡️',
      status: 'pending'
    }
  ], [t])

  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>(buildSteps)

  useEffect(() => {
    setSteps(prev => buildSteps().map((step, index) => ({
      ...step,
      status: prev[index]?.status ?? 'pending'
    })))
  }, [buildSteps])

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
