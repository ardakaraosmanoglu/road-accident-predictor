'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { WeatherService, getCurrentPosition, ProcessedWeatherData } from '@/lib/weather-api'
import { MapPin, RefreshCw, Thermometer, Eye, Wind, Droplets, AlertCircle, CheckCircle } from 'lucide-react'

interface WeatherFetcherProps {
  onWeatherData: (data: ProcessedWeatherData) => void
}

export function WeatherFetcher({ onWeatherData }: WeatherFetcherProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWeather, setCurrentWeather] = useState<ProcessedWeatherData | null>(null)
  const [cityInput, setCityInput] = useState('')
  const weatherService = new WeatherService()

  const fetchWeatherByLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const coords = await getCurrentPosition()
      const weatherData = await weatherService.getCurrentWeatherByCoords(
        coords.latitude,
        coords.longitude
      )

      setCurrentWeather(weatherData)
      onWeatherData(weatherData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherByCity = async () => {
    if (!cityInput.trim()) {
      setError('Please enter a city name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const weatherData = await weatherService.getCurrentWeatherByCity(cityInput.trim())
      setCurrentWeather(weatherData)
      onWeatherData(weatherData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear': return '☀️'
      case 'cloudy': return '☁️'
      case 'rain': return '🌧️'
      case 'snow': return '❄️'
      case 'fog': return '🌫️'
      case 'storm': return '⛈️'
      default: return '🌤️'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'clear': return 'bg-yellow-100 text-yellow-800'
      case 'cloudy': return 'bg-gray-100 text-gray-800'
      case 'rain': return 'bg-blue-100 text-blue-800'
      case 'snow': return 'bg-blue-50 text-blue-900'
      case 'fog': return 'bg-gray-200 text-gray-900'
      case 'storm': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Weather Fetching Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1">
          <div className="flex gap-2">
            <Button
              onClick={fetchWeatherByLocation}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {isLoading ? 'Getting Location...' : 'Use My Location'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Enter city name..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeatherByCity()}
            className="flex-1 sm:w-48"
            disabled={isLoading}
          />
          <Button
            onClick={fetchWeatherByCity}
            disabled={isLoading || !cityInput.trim()}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Get Weather'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Weather Display */}
      {currentWeather && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Current Weather Data</h3>
            </div>
            <Badge className={getConditionColor(currentWeather.weather_condition)}>
              {getWeatherIcon(currentWeather.weather_condition)} {currentWeather.weather_condition}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="font-medium">{currentWeather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{currentWeather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{currentWeather.wind_speed} km/h</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="font-medium">{currentWeather.visibility} km</span>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            📍 {currentWeather.location} • Updated: {currentWeather.timestamp.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!currentWeather && !error && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 <strong>Pro tip:</strong> Get real-time weather data to improve accident risk predictions.
          Use your current location for the most accurate results, or enter any city name.
        </div>
      )}
    </div>
  )
}