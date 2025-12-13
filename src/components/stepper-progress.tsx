'use client'

import { CheckCircle, Loader2, AlertCircle, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Step } from '@/hooks/use-stepper'

interface StepperProgressProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function StepperProgress({ steps, currentStep, onStepClick }: StepperProgressProps) {
  const getStepIcon = (step: Step, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-white" />
    }
    if (step.status === 'loading') {
      return <Loader2 className="h-5 w-5 text-white animate-spin" />
    }
    if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-white" />
    }
    if (step.status === 'skipped') {
      return <SkipForward className="h-5 w-5 text-white" />
    }
    return <span className="text-sm font-semibold">{index + 1}</span>
  }

  const getStepColor = (step: Step, index: number) => {
    if (step.status === 'completed') return 'bg-green-500 border-green-500'
    if (step.status === 'loading') return 'bg-blue-500 border-blue-500 animate-pulse'
    if (step.status === 'error') return 'bg-red-500 border-red-500'
    if (step.status === 'skipped') return 'bg-gray-400 border-gray-400'
    if (index === currentStep) return 'bg-blue-600 border-blue-600'
    return 'bg-gray-200 border-gray-200 text-gray-500'
  }

  const getLineColor = (index: number) => {
    const step = steps[index]
    if (step.status === 'completed') return 'bg-green-500'
    if (step.status === 'loading') return 'bg-blue-300'
    return 'bg-gray-200'
  }

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Mobile: Compact view */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {steps[currentStep].icon} {steps[currentStep].title}
          </span>
          <span className="text-xs text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{steps[currentStep].description}</p>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={step.status === 'pending' && index > currentStep}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    getStepColor(step, index),
                    step.status !== 'pending' || index <= currentStep
                      ? 'cursor-pointer hover:scale-110'
                      : 'cursor-not-allowed opacity-60'
                  )}
                >
                  {getStepIcon(step, index)}
                </button>
                <div className="mt-2 text-center">
                  <p className={cn(
                    'text-xs font-medium transition-colors',
                    index === currentStep ? 'text-blue-600' : 
                    step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {step.icon} {step.title}
                  </p>
                  <p className="text-[10px] text-gray-400 max-w-[80px] truncate">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 mt-[-24px]">
                  <div className={cn(
                    'h-1 rounded-full transition-all duration-500',
                    getLineColor(index)
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
