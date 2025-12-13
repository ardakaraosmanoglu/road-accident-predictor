'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export interface SafetyData {
  seatbelt_usage: boolean
  alcohol_consumption: 'none' | 'light' | 'moderate' | 'heavy' | 'severe'
  alcohol_details: string
  driver_fatigue: 'fresh' | 'normal' | 'tired' | 'very_tired'
  driver_experience: 'beginner' | 'intermediate' | 'experienced' | 'professional'
  vehicle_maintenance_check: boolean
}

interface DriverSafetyStepProps {
  onSafetyDataComplete: (data: SafetyData) => void
  onStatusChange: (status: 'loading' | 'completed' | 'error') => void
  onNext: () => void
}

type QuestionStep = 'seatbelt' | 'alcohol' | 'fatigue' | 'complete'

const DRINK_TYPES = [
  { id: 'bira', emoji: '🍺' },
  { id: 'sarap', emoji: '🍷' },
  { id: 'raki', emoji: '🥃' },
  { id: 'viski', emoji: '🥃' },
  { id: 'votka', emoji: '🍸' },
  { id: 'kokteyl', emoji: '🍹' }
]

const DRINK_COUNTS = [1, 2, 3, 4, 5]

// Map drink type + count to alcohol level
function getAlcoholLevel(drinkType: string, count: number): SafetyData['alcohol_consumption'] {
  // Her içki için ortalama promil değeri (1 adet için)
  const promilPerDrink: Record<string, number> = {
    bira: 0.28,
    sarap: 0.21,
    raki: 0.20,
    viski: 0.18,
    votka: 0.18,
    kokteyl: 0.25
  }
  
  const totalPromil = (promilPerDrink[drinkType] || 0.2) * count
  
  if (totalPromil < 0.30) return 'light'
  if (totalPromil < 0.50) return 'moderate'
  if (totalPromil < 0.80) return 'heavy'
  return 'severe'
}

export function DriverSafetyStep({ 
  onSafetyDataComplete, 
  onStatusChange,
  onNext 
}: DriverSafetyStepProps) {
  const t = useTranslations('safetyStep')

  const [questionStep, setQuestionStep] = useState<QuestionStep>('seatbelt')
  const [safetyData, setSafetyData] = useState<SafetyData>({
    seatbelt_usage: true,
    alcohol_consumption: 'none',
    alcohol_details: '',
    driver_fatigue: 'normal',
    driver_experience: 'experienced',
    vehicle_maintenance_check: true
  })
  const [showAlcoholSelector, setShowAlcoholSelector] = useState(false)
  const [selectedDrinkType, setSelectedDrinkType] = useState<string | null>(null)
  const [selectedDrinkCount, setSelectedDrinkCount] = useState<number | null>(null)

  const handleSeatbeltAnswer = (answer: boolean) => {
    setSafetyData(prev => ({ ...prev, seatbelt_usage: answer }))
    setQuestionStep('alcohol')
  }

  const handleAlcoholAnswer = (hasAlcohol: boolean) => {
    if (hasAlcohol) {
      setShowAlcoholSelector(true)
    } else {
      setSafetyData(prev => ({ ...prev, alcohol_consumption: 'none', alcohol_details: '' }))
      setQuestionStep('fatigue')
    }
  }

  const handleDrinkTypeSelect = (drinkId: string) => {
    setSelectedDrinkType(drinkId)
  }

  const handleDrinkCountSelect = (count: number) => {
    setSelectedDrinkCount(count)
    if (selectedDrinkType) {
      const level = getAlcoholLevel(selectedDrinkType, count)
      const drinkName = t(`drinkTypes.${selectedDrinkType}` as const)
      const details = `${count} ${drinkName}`
      setSafetyData(prev => ({ 
        ...prev, 
        alcohol_consumption: level,
        alcohol_details: details
      }))
      setQuestionStep('fatigue')
    }
  }

  const handleFatigueAnswer = (fatigue: SafetyData['driver_fatigue']) => {
    const finalData = { ...safetyData, driver_fatigue: fatigue }
    setSafetyData(finalData)
    setQuestionStep('complete')
    onStatusChange('completed')
    onSafetyDataComplete(finalData)
  }

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col items-center justify-center text-center px-6 py-8 space-y-8">
        {/* Large Icon */}
        <div className={`icon-xlarge ${
          questionStep === 'complete' ? 'bg-green-100 animate-success' : 'bg-emerald-100'
        }`}>
          {questionStep === 'complete' ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : questionStep === 'seatbelt' ? (
            <span className="text-6xl">🔒</span>
          ) : questionStep === 'alcohol' ? (
            <span className="text-6xl">🍺</span>
          ) : (
            <span className="text-6xl">😊</span>
          )}
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {questionStep === 'seatbelt' ? t('titles.seatbelt') :
             questionStep === 'alcohol' ? t('titles.alcohol') :
             questionStep === 'fatigue' ? t('titles.fatigue') :
             t('titles.complete')}
          </h2>
          <p className="text-base text-gray-500">
            {questionStep === 'seatbelt' ? t('subtitles.seatbelt') :
             questionStep === 'alcohol' && !showAlcoholSelector ? t('subtitles.alcoholIntro') :
             questionStep === 'alcohol' && showAlcoholSelector && !selectedDrinkType ? t('subtitles.alcoholDrink') :
             questionStep === 'alcohol' && showAlcoholSelector && selectedDrinkType ? t('subtitles.alcoholCount') :
             questionStep === 'fatigue' ? t('subtitles.fatigue') :
             t('subtitles.complete')}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3">
          {(['seatbelt', 'alcohol', 'fatigue'] as const).map((step) => {
            const stepOrder = { seatbelt: 0, alcohol: 1, fatigue: 2, complete: 3 }
            const currentOrder = stepOrder[questionStep]
            const thisStepOrder = stepOrder[step]
            const isCompleted = currentOrder > thisStepOrder
            const isCurrent = step === questionStep

            return (
              <div
                key={step}
                className={`rounded-full transition-all duration-300 ${
                  isCompleted ? 'w-3 h-3 bg-green-500' : 
                  isCurrent ? 'w-10 h-3 bg-emerald-500' : 
                  'w-3 h-3 bg-gray-300'
                }`}
              />
            )
          })}
        </div>

        {/* Question 1: Seatbelt */}
        {questionStep === 'seatbelt' && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <button
              onClick={() => handleSeatbeltAnswer(true)}
              className="w-full mobile-btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3"
            >
              <CheckCircle className="h-6 w-6" />
              <span>{t('options.seatbeltYes')}</span>
            </button>
            <button
              onClick={() => handleSeatbeltAnswer(false)}
              className="w-full mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex items-center justify-center gap-3"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>{t('options.seatbeltNo')}</span>
            </button>
          </div>
        )}

        {/* Question 2: Alcohol - Yes/No */}
        {questionStep === 'alcohol' && !showAlcoholSelector && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <button
              onClick={() => handleAlcoholAnswer(false)}
              className="w-full mobile-btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3"
            >
              <CheckCircle className="h-6 w-6" />
              <span>{t('options.alcoholNo')}</span>
            </button>
            <button
              onClick={() => handleAlcoholAnswer(true)}
              className="w-full mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex items-center justify-center gap-3"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>{t('options.alcoholYes')}</span>
            </button>
          </div>
        )}

        {/* Alcohol Selector - Drink Type */}
        {questionStep === 'alcohol' && showAlcoholSelector && !selectedDrinkType && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <p className="text-sm text-gray-500 mb-2">{t('subtitles.alcoholDrink')}</p>
            <div className="grid grid-cols-3 gap-3">
              {DRINK_TYPES.map(drink => (
                <button
                  key={drink.id}
                  onClick={() => handleDrinkTypeSelect(drink.id)}
                  className="mobile-btn bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-700 flex flex-col items-center justify-center py-4"
                >
                  <span className="text-3xl mb-1">{drink.emoji}</span>
                  <span className="text-sm">{t(`drinkTypes.${drink.id}` as const)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alcohol Selector - Drink Count */}
        {questionStep === 'alcohol' && showAlcoholSelector && selectedDrinkType && !selectedDrinkCount && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <p className="text-sm text-gray-500 mb-2">{t('drinkCount')}</p>
            <div className="flex justify-center gap-3">
              {DRINK_COUNTS.map(count => (
                <button
                  key={count}
                  onClick={() => handleDrinkCountSelect(count)}
                  className="w-14 h-14 rounded-2xl bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-700 font-bold text-xl flex items-center justify-center"
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              {DRINK_TYPES.find(d => d.id === selectedDrinkType)?.emoji}{' '}
              {t('drinkSelected', { drink: t(`drinkTypes.${selectedDrinkType}` as const) })}
            </p>
          </div>
        )}

        {/* Question 3: Fatigue */}
        {questionStep === 'fatigue' && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleFatigueAnswer('fresh')}
                className="mobile-btn bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😊</span>
                <span className="text-sm">{t('fatigueOptions.fresh')}</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('normal')}
                className="mobile-btn bg-white border-2 border-gray-300 text-gray-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😐</span>
                <span className="text-sm">{t('fatigueOptions.normal')}</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('tired')}
                className="mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😪</span>
                <span className="text-sm">{t('fatigueOptions.tired')}</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('very_tired')}
                className="mobile-btn bg-white border-2 border-red-300 text-red-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😴</span>
                <span className="text-sm">{t('fatigueOptions.very_tired')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Complete State */}
        {questionStep === 'complete' && (
          <div className="w-full max-w-sm animate-fade-in space-y-6">
            <div className="flex justify-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                safetyData.seatbelt_usage ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {safetyData.seatbelt_usage ? '✅' : '❌'}
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                safetyData.alcohol_consumption === 'none' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {safetyData.alcohol_consumption === 'none' ? '✅' : '⚠️'}
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                safetyData.driver_fatigue === 'fresh' || safetyData.driver_fatigue === 'normal' 
                  ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {safetyData.driver_fatigue === 'fresh' ? '😊' : 
                 safetyData.driver_fatigue === 'normal' ? '😐' :
                 safetyData.driver_fatigue === 'tired' ? '😪' : '😴'}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={onNext}
              className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {t('startAnalysis')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
