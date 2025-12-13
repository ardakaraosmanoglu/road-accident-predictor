'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle } from 'lucide-react'

interface TimeContext {
  hour_of_day: number
  day_of_week: string
  month: number
  is_rush_hour: boolean
}

interface TimeStepProps {
  timeContext: TimeContext
  onStatusChange: (status: 'loading' | 'completed' | 'error') => void
  onNext: () => void
}

export function TimeStep({ timeContext, onStatusChange, onNext }: TimeStepProps) {
  const t = useTranslations('timeStep')
  const tCommon = useTranslations('common')

  const hasCalledRef = useRef(false)

  useEffect(() => {
    if (hasCalledRef.current) return
    hasCalledRef.current = true
    onStatusChange('completed')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDayName = (day: string) => {
    return tCommon(`days.${day}` as const)
  }

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col items-center justify-center text-center px-4 py-4 space-y-4 md:space-y-6">
        {/* Large Icon */}
        <div className="icon-xlarge bg-green-100 animate-success">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-base text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Time Info Grid */}
        <div className="w-full max-w-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl block mb-1">🕐</span>
              <p className="text-xl font-bold text-gray-900">{timeContext.hour_of_day}:00</p>
              <p className="text-xs text-gray-500">{t('hour')}</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl block mb-1">📅</span>
              <p className="text-base font-bold text-gray-900">{getDayName(timeContext.day_of_week)}</p>
              <p className="text-xs text-gray-500">{t('day')}</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl block mb-1">📆</span>
              <p className="text-xl font-bold text-gray-900">{timeContext.month}</p>
              <p className="text-xs text-gray-500">{t('month')}</p>
            </div>
            <div className={`rounded-2xl p-3 mobile-card text-center ${
              timeContext.is_rush_hour ? 'bg-orange-100' : 'bg-green-50'
            }`}>
              <span className="text-2xl block mb-1">{timeContext.is_rush_hour ? '🚗' : '✅'}</span>
              <p className="text-base font-bold text-gray-900">
                {timeContext.is_rush_hour ? t('rush') : t('calm')}
              </p>
              <p className="text-xs text-gray-500">{t('traffic')}</p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-sm">
          <button
            onClick={onNext}
            className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {tCommon('next')}
          </button>
        </div>
      </div>
    </div>
  )
}
