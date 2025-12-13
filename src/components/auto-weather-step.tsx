'use client'

import { useEffect, useState } from 'react'
import { 
  Loader2, AlertCircle, 
  Thermometer, Droplets, Wind, Eye 
} from 'lucide-react'
import { WeatherService, ProcessedWeatherData } from '@/lib/weather-api'
import type { LocationData } from './route-step'

interface AutoWeatherStepProps {
  location: LocationData | null
  onWeatherFetched: (weather: ProcessedWeatherData) => void
  onStatusChange: (status: 'loading' | 'completed' | 'error') => void
  onNext: () => void
}

const weatherIcons: Record<string, string> = {
  clear: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  fog: '🌫️',
  storm: '⛈️'
}

const weatherLabels: Record<string, string> = {
  clear: 'Açık',
  cloudy: 'Bulutlu',
  rain: 'Yağmurlu',
  snow: 'Karlı',
  fog: 'Sisli',
  storm: 'Fırtınalı'
}

export function AutoWeatherStep({ 
  location, 
  onWeatherFetched, 
  onStatusChange,
  onNext 
}: AutoWeatherStepProps) {
  const [status, setStatus] = useState<'waiting' | 'loading' | 'success' | 'error'>('waiting')
  const [weather, setWeather] = useState<ProcessedWeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    if (!location) return

    setStatus('loading')
    setError(null)
    onStatusChange('loading')

    try {
      const weatherService = new WeatherService()
      const weatherData = await weatherService.getCurrentWeatherByCoords(
        location.latitude,
        location.longitude
      )

      setWeather(weatherData)
      setStatus('success')
      onStatusChange('completed')
      onWeatherFetched(weatherData)

    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Hava durumu bilgisi alınamadı')
      setStatus('error')
      onStatusChange('error')
    }
  }

  useEffect(() => {
    if (location) {
      const timer = setTimeout(() => {
        fetchWeather()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  if (!location) {
    return (
      <div className="step-card animate-spring">
        <div className="flex flex-col items-center justify-center text-center px-6 py-8 space-y-6">
          <div className="icon-xlarge bg-gray-100">
            <span className="text-5xl">🌤️</span>
          </div>
          <p className="text-lg text-gray-500">Konum bilgisi bekleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col items-center justify-center text-center px-4 py-4 space-y-4 md:space-y-6">
        {/* Large Weather Icon */}
        <div className={`icon-xlarge transition-all duration-500 ${
          status === 'loading' ? 'bg-blue-100 animate-pulse-ring' :
          status === 'success' ? 'bg-gradient-to-br from-sky-100 to-blue-100' :
          status === 'error' ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          {status === 'loading' ? (
            <Loader2 className="h-14 w-14 text-blue-500 animate-spin" />
          ) : status === 'success' && weather ? (
            <span className="text-6xl">{weatherIcons[weather.weather_condition]}</span>
          ) : status === 'error' ? (
            <AlertCircle className="h-14 w-14 text-orange-500" />
          ) : (
            <span className="text-6xl">🌤️</span>
          )}
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'loading' ? 'Hava Durumu' :
             status === 'success' && weather ? weatherLabels[weather.weather_condition] :
             status === 'error' ? 'Veri Alınamadı' : 'Hava Durumu'}
          </h2>
          <p className="text-base text-gray-500">
            {status === 'loading' ? 'Veriler alınıyor...' :
             status === 'success' && weather ? weather.location :
             status === 'error' ? 'Varsayılan değerler kullanılacak' : ''}
          </p>
        </div>

        {/* Weather Stats */}
        {status === 'success' && weather && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/80 rounded-2xl p-3 mobile-card flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Thermometer className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-gray-900">{weather.temperature}°</p>
                  <p className="text-xs text-gray-500">Sıcaklık</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Droplets className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-gray-900">{weather.humidity}%</p>
                  <p className="text-xs text-gray-500">Nem</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Wind className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-gray-900">{weather.wind_speed}</p>
                  <p className="text-xs text-gray-500">km/h</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 mobile-card flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-gray-900">{weather.visibility}</p>
                  <p className="text-xs text-gray-500">km görüş</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-sm bg-orange-50 rounded-2xl p-4 text-left">
            <p className="text-sm text-orange-700">{error}</p>
          </div>
        )}

        {/* Loading Dots */}
        {status === 'loading' && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Next Button */}
        {(status === 'success' || status === 'error') && (
          <div className="w-full max-w-sm">
            <button
              onClick={onNext}
              className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              İleri
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
