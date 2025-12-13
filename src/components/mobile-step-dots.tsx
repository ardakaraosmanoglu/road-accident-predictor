'use client'

import { cn } from '@/lib/utils'
import type { Step } from '@/hooks/use-stepper'

interface MobileStepDotsProps {
  steps: Step[]
  currentStep: number
}

export function MobileStepDots({ steps, currentStep }: MobileStepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed'
        const isCurrent = index === currentStep
        const isLoading = step.status === 'loading'

        return (
          <div
            key={step.id}
            className={cn(
              'rounded-full transition-all duration-300',
              isCompleted && 'bg-green-500',
              isCurrent && !isCompleted && 'bg-blue-500 animate-pulse-ring',
              isLoading && 'bg-blue-400',
              !isCompleted && !isCurrent && !isLoading && 'bg-gray-300',
              isCurrent ? 'w-8 h-2' : 'w-2 h-2'
            )}
          />
        )
      })}
    </div>
  )
}
