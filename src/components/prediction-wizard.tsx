'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, CheckCircle, 
  Loader2, RotateCcw 
} from 'lucide-react'

import { useStepper } from '@/hooks/use-stepper'
import { MobileStepDots } from '@/components/mobile-step-dots'
import { RouteStep, type LocationData } from '@/components/route-step'
import { AutoWeatherStep } from '@/components/auto-weather-step'
import { TimeStep } from '@/components/time-step'
import { DriverSafetyStep, type SafetyData } from '@/components/driver-safety-step'
import { RiskMeter } from '@/components/risk-meter'

import { predictAccidentRisk } from '@/lib/prediction-engine'
import type { AccidentPredictionInput, AccidentRiskPrediction } from '@/types/dataset'
import type { ProcessedWeatherData } from '@/lib/weather-api'
import type { RouteAnalysisResult } from '@/types/maps'

function getCurrentTimeContext() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const month = now.getMonth() + 1
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const day_of_week = dayNames[dayOfWeek] as AccidentPredictionInput['day_of_week']
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const is_rush_hour = isWeekday && ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19))

  return { hour_of_day: hour, day_of_week, month, is_rush_hour }
}

export function PredictionWizard() {
  const { currentStep, steps, nextStep, setStepStatus, goToStep } = useStepper()
  
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<ProcessedWeatherData | null>(null)
  const [routeData, setRouteData] = useState<RouteAnalysisResult | null>(null)
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null)
  const [prediction, setPrediction] = useState<AccidentRiskPrediction | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const timeContext = getCurrentTimeContext()

  const handleLocationDetected = (loc: LocationData) => {
    setLocation(loc)
  }

  const handleWeatherFetched = (w: ProcessedWeatherData) => {
    setWeather(w)
  }

  const handleRouteAnalyzed = (route: RouteAnalysisResult) => {
    setRouteData(route)
  }

  const handleSafetyDataComplete = (safety: SafetyData) => {
    setSafetyData(safety)
  }

  const runPrediction = () => {
    setIsCalculating(true)
    setShowResults(true)

    const input: AccidentPredictionInput = {
      weather_condition: weather?.weather_condition || 'clear',
      temperature: weather?.temperature || 20,
      visibility: weather?.visibility || 10,
      wind_speed: weather?.wind_speed || 10,
      humidity: weather?.humidity || 50,
      traffic_density: routeData?.traffic_density || 'medium',
      average_speed: routeData?.average_speed || 50,
      vehicle_count: routeData?.vehicle_count || 100,
      road_type: routeData?.road_type || 'arterial',
      road_condition: routeData?.road_condition || 'good',
      number_of_lanes: routeData?.number_of_lanes || 2,
      speed_limit: routeData?.speed_limit || 50,
      intersection_type: routeData?.intersection_type || 'traffic_light',
      hour_of_day: timeContext.hour_of_day,
      day_of_week: timeContext.day_of_week,
      month: timeContext.month,
      is_holiday: false,
      is_rush_hour: timeContext.is_rush_hour,
      urban_rural: routeData?.urban_rural || 'urban',
      school_zone: routeData?.school_zone || false,
      construction_zone: routeData?.construction_zone || false,
      alcohol_consumption: safetyData?.alcohol_consumption || 'none',
      alcohol_details: safetyData?.alcohol_details || '',
      driver_fatigue: safetyData?.driver_fatigue || 'normal',
      driver_experience: safetyData?.driver_experience || 'experienced',
      seatbelt_usage: safetyData?.seatbelt_usage ?? true,
      vehicle_maintenance_check: safetyData?.vehicle_maintenance_check ?? true
    }

    // Fake loading delay: 5-20 seconds
    const fakeDelay = Math.random() * 15000 + 5000
    setTimeout(() => {
      const result = predictAccidentRisk(input)
      setPrediction(result)
      setIsCalculating(false)
    }, fakeDelay)
  }

  const handleReset = () => {
    setLocation(null)
    setWeather(null)
    setRouteData(null)
    setSafetyData(null)
    setPrediction(null)
    setShowResults(false)
    goToStep(0)
    steps.forEach((_, index) => setStepStatus(index, 'pending'))
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <RouteStep
            onLocationDetected={handleLocationDetected}
            onRouteAnalyzed={handleRouteAnalyzed}
            onStatusChange={(status) => setStepStatus(0, status)}
            onNext={nextStep}
          />
        )
      case 1:
        return (
          <AutoWeatherStep
            location={location}
            onWeatherFetched={handleWeatherFetched}
            onStatusChange={(status) => setStepStatus(1, status)}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <TimeStep
            timeContext={timeContext}
            onStatusChange={(status) => setStepStatus(2, status)}
            onNext={nextStep}
          />
        )
      case 3:
        return (
          <DriverSafetyStep
            onSafetyDataComplete={handleSafetyDataComplete}
            onStatusChange={(status) => setStepStatus(3, status)}
            onNext={runPrediction}
          />
        )
      default:
        return null
    }
  }

  if (showResults) {
    return (
      <div className={`step-card animate-spring ${!isCalculating ? 'results-card' : ''}`}>
        {/* Calculating state */}
        {isCalculating && (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12 space-y-8">
            <div className="icon-xlarge bg-blue-100">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Analiz Yapılıyor</h2>
              <p className="text-base text-gray-500">26 parametre işleniyor...</p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {prediction && !isCalculating && (
          <div className="flex flex-col px-6 py-6 space-y-6 overflow-y-auto">
            {/* Risk Meter */}
            <div className="flex flex-col items-center text-center space-y-4">
              <RiskMeter
                score={prediction.risk_score}
                riskLevel={prediction.risk_level}
                size={180}
              />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Risk Analizi</h2>
                <p className="text-base text-gray-500">
                  {prediction.confidence}% güvenle hesaplandı
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
                <span className="text-2xl">📍</span>
                <p className="text-xs text-gray-500 mt-1">{location?.city || '-'}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
                <span className="text-2xl">🌤️</span>
                <p className="text-xs text-gray-500 mt-1 capitalize">{weather?.weather_condition || '-'}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
                <span className="text-2xl">🚗</span>
                <p className="text-xs text-gray-500 mt-1 capitalize">{routeData?.traffic_density || '-'}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
                <span className="text-2xl">🕐</span>
                <p className="text-xs text-gray-500 mt-1">{timeContext.hour_of_day}:00</p>
              </div>
            </div>

            {/* Contributing Factors - Açıklamalı Uyarılar */}
            {prediction.contributing_factors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Dikkat Edilmesi Gerekenler
                </h3>
                <div className="space-y-2">
                  {prediction.contributing_factors.map((warning, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100"
                    >
                      <p className="text-sm text-gray-700">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Öneriler
              </h3>
              <div className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 safe-area-bottom">
              <Button
                onClick={handleReset}
                className="w-full mobile-btn bg-gray-900 hover:bg-gray-800 text-white"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Yeni Analiz Başlat
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Step Dots */}
      <div className="pt-4 pb-2">
        <MobileStepDots 
          steps={steps} 
          currentStep={currentStep}
        />
      </div>

      {/* Current Step Content */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentStep()}
      </div>

      {/* Bottom Status Bar */}
      {(location || weather || routeData) && (
        <div className="px-4 py-3 safe-area-bottom">
          <div className="flex justify-center gap-3">
            {location && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✓ Konum
              </span>
            )}
            {weather && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                ✓ Hava
              </span>
            )}
            {routeData && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                ✓ Rota
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
