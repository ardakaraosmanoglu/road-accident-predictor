'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import {
  searchAlcoholDatabase,
  estimatePromil,
  getWaitTimeHours,
  LEGAL_LIMITS
} from '@/lib/alcohol-database'

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

export function DriverSafetyStep({ 
  onSafetyDataComplete, 
  onStatusChange,
  onNext 
}: DriverSafetyStepProps) {
  const [questionStep, setQuestionStep] = useState<QuestionStep>('seatbelt')
  const [safetyData, setSafetyData] = useState<SafetyData>({
    seatbelt_usage: true,
    alcohol_consumption: 'none',
    alcohol_details: '',
    driver_fatigue: 'normal',
    driver_experience: 'experienced',
    vehicle_maintenance_check: true
  })
  const [showAlcoholInput, setShowAlcoholInput] = useState(false)

  const handleSeatbeltAnswer = (answer: boolean) => {
    setSafetyData(prev => ({ ...prev, seatbelt_usage: answer }))
    setQuestionStep('alcohol')
  }

  const handleAlcoholAnswer = (hasAlcohol: boolean) => {
    if (hasAlcohol) {
      setShowAlcoholInput(true)
    } else {
      setSafetyData(prev => ({ ...prev, alcohol_consumption: 'none', alcohol_details: '' }))
      setQuestionStep('fatigue')
    }
  }

  const handleAlcoholDetailsSubmit = () => {
    const detected = searchAlcoholDatabase(safetyData.alcohol_details)
    if (detected) {
      setSafetyData(prev => ({ ...prev, alcohol_consumption: detected.level }))
    }
    setQuestionStep('fatigue')
  }

  const handleFatigueAnswer = (fatigue: SafetyData['driver_fatigue']) => {
    const finalData = { ...safetyData, driver_fatigue: fatigue }
    setSafetyData(finalData)
    setQuestionStep('complete')
    onStatusChange('completed')
    onSafetyDataComplete(finalData)
  }

  const alcoholPromil = safetyData.alcohol_details ? estimatePromil(safetyData.alcohol_details) : 0
  const alcoholWaitTime = safetyData.alcohol_details ? getWaitTimeHours(safetyData.alcohol_details) : 0

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
            {questionStep === 'seatbelt' ? 'Emniyet Kemeri' :
             questionStep === 'alcohol' ? 'Alkol Durumu' :
             questionStep === 'fatigue' ? 'Nasıl Hissediyorsunuz?' :
             'Tamamlandı!'}
          </h2>
          <p className="text-base text-gray-500">
            {questionStep === 'seatbelt' ? 'Kemerinizi taktınız mı?' :
             questionStep === 'alcohol' && !showAlcoholInput ? 'Son 24 saatte alkol aldınız mı?' :
             questionStep === 'alcohol' && showAlcoholInput ? 'Ne içtiğinizi yazın' :
             questionStep === 'fatigue' ? 'Yorgunluk seviyenizi seçin' :
             'Risk analizi başlıyor...'}
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
              <span>Evet, Takılı</span>
            </button>
            <button
              onClick={() => handleSeatbeltAnswer(false)}
              className="w-full mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex items-center justify-center gap-3"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Hayır</span>
            </button>
          </div>
        )}

        {/* Question 2: Alcohol - Yes/No */}
        {questionStep === 'alcohol' && !showAlcoholInput && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <button
              onClick={() => handleAlcoholAnswer(false)}
              className="w-full mobile-btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Hayır, Almadım</span>
            </button>
            <button
              onClick={() => handleAlcoholAnswer(true)}
              className="w-full mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex items-center justify-center gap-3"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Evet, Aldım</span>
            </button>
          </div>
        )}

        {/* Alcohol Details Input */}
        {questionStep === 'alcohol' && showAlcoholInput && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <Input
              placeholder="Örnek: 2 kadeh şarap, 1 bira..."
              value={safetyData.alcohol_details}
              onChange={(e) => setSafetyData(prev => ({ ...prev, alcohol_details: e.target.value }))}
              className="h-14 text-lg rounded-2xl px-5 bg-white"
              autoFocus
            />
            
            {safetyData.alcohol_details && alcoholPromil > 0 && (
              <div className={`rounded-2xl p-4 ${
                alcoholPromil >= LEGAL_LIMITS.HUSUSI_ARAC 
                  ? 'bg-red-50 border-2 border-red-200' 
                  : 'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Tahmini Promil:</span>
                  <span className={`text-xl font-bold ${
                    alcoholPromil >= LEGAL_LIMITS.HUSUSI_ARAC ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alcoholPromil.toFixed(2)}‰
                  </span>
                </div>
                {alcoholWaitTime > 0 && (
                  <p className="text-sm text-gray-600">
                    ⏰ Tavsiye: En az {alcoholWaitTime} saat bekleyin
                  </p>
                )}
                {alcoholPromil >= LEGAL_LIMITS.HUSUSI_ARAC && (
                  <p className="text-sm text-red-700 font-medium mt-2">
                    ⚠️ Yasal sınırın üzerinde!
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleAlcoholDetailsSubmit}
              className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Devam Et
            </Button>
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
                <span className="text-sm">Dinç</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('normal')}
                className="mobile-btn bg-white border-2 border-gray-300 text-gray-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😐</span>
                <span className="text-sm">Normal</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('tired')}
                className="mobile-btn bg-white border-2 border-orange-300 text-orange-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😪</span>
                <span className="text-sm">Yorgun</span>
              </button>
              <button
                onClick={() => handleFatigueAnswer('very_tired')}
                className="mobile-btn bg-white border-2 border-red-300 text-red-700 flex flex-col items-center justify-center py-6"
              >
                <span className="text-4xl mb-2">😴</span>
                <span className="text-sm">Çok Yorgun</span>
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
              Analizi Başlat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
