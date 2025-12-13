'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react'

import { RiskMeter } from '@/components/risk-meter'
import { predictAccidentRisk } from '@/lib/prediction-engine'
import { AccidentPredictionInput } from '@/types/dataset'
import { Button } from '@/components/ui/button'

interface Scenario {
  id: number
  titleKey: 'ideal' | 'rain' | 'alcohol' | 'storm' | 'school'
  icon: string
  location: string
  input: AccidentPredictionInput
}

const scenarios: Scenario[] = [
  {
    id: 1,
    titleKey: 'ideal',
    icon: '☀️',
    location: 'Girne',
    input: {
      weather_condition: 'clear',
      temperature: 24,
      visibility: 15,
      wind_speed: 10,
      humidity: 45,
      traffic_density: 'low',
      average_speed: 55,
      vehicle_count: 80,
      road_type: 'arterial',
      road_condition: 'excellent',
      number_of_lanes: 2,
      speed_limit: 65,
      intersection_type: 'traffic_light',
      hour_of_day: 14,
      day_of_week: 'wednesday',
      month: 5,
      is_holiday: false,
      is_rush_hour: false,
      urban_rural: 'suburban',
      school_zone: false,
      construction_zone: false,
      alcohol_consumption: 'none',
      driver_fatigue: 'fresh',
      driver_experience: 'experienced',
      seatbelt_usage: true,
      vehicle_maintenance_check: true
    }
  },
  {
    id: 2,
    titleKey: 'rain',
    icon: '🌧️',
    location: 'Lefkoşa',
    input: {
      weather_condition: 'rain',
      temperature: 16,
      visibility: 4,
      wind_speed: 25,
      humidity: 85,
      traffic_density: 'medium',
      average_speed: 40,
      vehicle_count: 200,
      road_type: 'arterial',
      road_condition: 'fair',
      number_of_lanes: 2,
      speed_limit: 50,
      intersection_type: 'traffic_light',
      hour_of_day: 23,
      day_of_week: 'friday',
      month: 11,
      is_holiday: false,
      is_rush_hour: false,
      urban_rural: 'urban',
      school_zone: false,
      construction_zone: false,
      alcohol_consumption: 'none',
      driver_fatigue: 'tired',
      driver_experience: 'experienced',
      seatbelt_usage: true,
      vehicle_maintenance_check: true
    }
  },
  {
    id: 3,
    titleKey: 'alcohol',
    icon: '🍺',
    location: 'Mağusa',
    input: {
      weather_condition: 'clear',
      temperature: 22,
      visibility: 10,
      wind_speed: 5,
      humidity: 60,
      traffic_density: 'low',
      average_speed: 70,
      vehicle_count: 50,
      road_type: 'arterial',
      road_condition: 'good',
      number_of_lanes: 2,
      speed_limit: 50,
      intersection_type: 'traffic_light',
      hour_of_day: 2,
      day_of_week: 'saturday',
      month: 7,
      is_holiday: false,
      is_rush_hour: false,
      urban_rural: 'urban',
      school_zone: false,
      construction_zone: false,
      alcohol_consumption: 'moderate',
      alcohol_details: '3 bira, 2 shot',
      driver_fatigue: 'very_tired',
      driver_experience: 'intermediate',
      seatbelt_usage: false,
      vehicle_maintenance_check: false
    }
  },
  {
    id: 4,
    titleKey: 'storm',
    icon: '❄️',
    location: 'Dağlar',
    input: {
      weather_condition: 'snow',
      temperature: -2,
      visibility: 1,
      wind_speed: 45,
      humidity: 90,
      traffic_density: 'low',
      average_speed: 30,
      vehicle_count: 30,
      road_type: 'rural',
      road_condition: 'poor',
      number_of_lanes: 1,
      speed_limit: 80,
      intersection_type: 'none',
      hour_of_day: 17,
      day_of_week: 'sunday',
      month: 1,
      is_holiday: false,
      is_rush_hour: false,
      urban_rural: 'rural',
      school_zone: false,
      construction_zone: true,
      alcohol_consumption: 'none',
      driver_fatigue: 'normal',
      driver_experience: 'experienced',
      seatbelt_usage: true,
      vehicle_maintenance_check: true
    }
  },
  {
    id: 5,
    titleKey: 'school',
    icon: '🏫',
    location: 'Lefkoşa',
    input: {
      weather_condition: 'cloudy',
      temperature: 18,
      visibility: 8,
      wind_speed: 15,
      humidity: 65,
      traffic_density: 'very_high',
      average_speed: 25,
      vehicle_count: 400,
      road_type: 'local',
      road_condition: 'good',
      number_of_lanes: 2,
      speed_limit: 30,
      intersection_type: 'stop_sign',
      hour_of_day: 8,
      day_of_week: 'monday',
      month: 9,
      is_holiday: false,
      is_rush_hour: true,
      urban_rural: 'urban',
      school_zone: true,
      construction_zone: false,
      alcohol_consumption: 'none',
      driver_fatigue: 'normal',
      driver_experience: 'beginner',
      seatbelt_usage: true,
      vehicle_maintenance_check: true
    }
  }
]

const weatherEmoji: Record<string, string> = {
  clear: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  fog: '🌫️',
  storm: '⛈️'
}

export default function DemoPage() {
  const locale = useLocale()
  const tResults = useTranslations('results')
  const tDemo = useTranslations('demo')
  const tRoute = useTranslations('routeStep')

  const [activeScenario, setActiveScenario] = useState(0)
  
  const scenario = scenarios[activeScenario]
  const prediction = predictAccidentRisk(scenario.input, locale as 'tr' | 'en')

  const trafficLabels = useMemo(() => ({
    low: tRoute('trafficDensity.low'),
    medium: tRoute('trafficDensity.medium'),
    high: tRoute('trafficDensity.high'),
    very_high: tRoute('trafficDensity.very_high')
  }), [tRoute])

  return (
    <div className="app-container bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col md:bg-gradient-to-br md:from-slate-100 md:via-blue-50 md:to-indigo-100 md:items-center md:justify-center">
      {/* Desktop wrapper - aynı prediction-wizard gibi */}
      <div className="w-full h-full md:w-[480px] lg:w-[520px] md:h-auto md:max-h-[90vh] md:rounded-3xl md:shadow-2xl md:bg-white md:overflow-hidden">
        
        {/* Scenario Tabs - Header */}
        <div className="flex gap-1 p-3 bg-gray-100 overflow-x-auto scrollbar-hide">
          {scenarios.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(index)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl whitespace-nowrap transition-all min-w-[60px] ${
                activeScenario === index
                  ? 'bg-white shadow-md'
                  : 'hover:bg-white/50'
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs font-medium ${activeScenario === index ? 'text-gray-900' : 'text-gray-500'}`}>
                {tDemo(`scenarios.${s.titleKey}` as const)}
              </span>
            </button>
          ))}
        </div>

        {/* Results - Aynı prediction-wizard tasarımı */}
        <div className="flex flex-col px-6 py-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Risk Meter */}
          <div className="flex flex-col items-center text-center space-y-4">
            <RiskMeter
              score={prediction.risk_score}
              riskLevel={prediction.risk_level}
              size={180}
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{tResults('title')}</h2>
              <p className="text-base text-gray-500">
                {tResults('confidence', { value: prediction.confidence })}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl">📍</span>
              <p className="text-xs text-gray-500 mt-1">{scenario.location}</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl">{weatherEmoji[scenario.input.weather_condition]}</span>
              <p className="text-xs text-gray-500 mt-1">{scenario.input.temperature}°C</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl">🚗</span>
              <p className="text-xs text-gray-500 mt-1 capitalize">{trafficLabels[scenario.input.traffic_density]}</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 mobile-card text-center">
              <span className="text-2xl">🕐</span>
              <p className="text-xs text-gray-500 mt-1">{scenario.input.hour_of_day}:00</p>
            </div>
          </div>

          {/* Contributing Factors - Açıklamalı Uyarılar */}
          {prediction.contributing_factors.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {tResults('factors')}
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
              {tResults('recommendations')}
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

          {/* Button */}
          <div className="pt-4 safe-area-bottom">
            <Link href={`/${locale}`}>
              <Button className="w-full mobile-btn bg-gray-900 hover:bg-gray-800 text-white">
                <RotateCcw className="h-5 w-5 mr-2" />
                {tDemo('startYourAnalysis')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
