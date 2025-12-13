'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export interface LocationData {
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
}

interface AutoLocationStepProps {
  onLocationDetected: (location: LocationData) => void
  onStatusChange: (status: 'loading' | 'completed' | 'error') => void
  onAutoAdvance: () => void
}

export function AutoLocationStep({ 
  onLocationDetected, 
  onStatusChange,
  onAutoAdvance 
}: AutoLocationStepProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualCity, setManualCity] = useState('')
  const [showManual, setShowManual] = useState(false)

  const detectLocation = async () => {
    setStatus('loading')
    setError(null)
    onStatusChange('loading')

    if (!navigator.geolocation) {
      setError('Tarayıcınız konum özelliğini desteklemiyor')
      setStatus('error')
      onStatusChange('error')
      setShowManual(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch('/api/maps/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latlng: `${latitude},${longitude}` })
          })

          let address = ''
          let city = ''
          let country = ''

          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              address = data.results[0].formatted_address
              const components = data.results[0].address_components
              city = components.find((c: { types: string[] }) => 
                c.types.includes('locality') || c.types.includes('administrative_area_level_1')
              )?.long_name || ''
              country = components.find((c: { types: string[] }) => 
                c.types.includes('country')
              )?.long_name || ''
            }
          }

          const locationData: LocationData = {
            latitude,
            longitude,
            address,
            city,
            country
          }

          setLocation(locationData)
          setStatus('success')
          onStatusChange('completed')
          onLocationDetected(locationData)

          setTimeout(() => {
            onAutoAdvance()
          }, 1500)

        } catch {
          const locationData: LocationData = { latitude, longitude }
          setLocation(locationData)
          setStatus('success')
          onStatusChange('completed')
          onLocationDetected(locationData)
          setTimeout(() => onAutoAdvance(), 1500)
        }
      },
      (err) => {
        let message = 'Konum alınamadı'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Konum izni reddedildi. Lütfen şehir adı girin.'
            break
          case err.POSITION_UNAVAILABLE:
            message = 'Konum bilgisi alınamıyor'
            break
          case err.TIMEOUT:
            message = 'Konum isteği zaman aşımına uğradı'
            break
        }
        setError(message)
        setStatus('error')
        onStatusChange('error')
        setShowManual(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleManualSubmit = async () => {
    if (!manualCity.trim()) return

    setStatus('loading')
    onStatusChange('loading')

    try {
      const response = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: manualCity })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          const locationData: LocationData = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            address: result.formatted_address,
            city: manualCity
          }
          setLocation(locationData)
          setStatus('success')
          onStatusChange('completed')
          onLocationDetected(locationData)
          setTimeout(() => onAutoAdvance(), 1500)
          return
        }
      }
      throw new Error('Şehir bulunamadı')
    } catch {
      setError('Şehir bulunamadı, lütfen tekrar deneyin')
      setStatus('error')
      onStatusChange('error')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      detectLocation()
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col items-center justify-center text-center px-6 py-8 space-y-8">
        {/* Large Icon */}
        <div className={`icon-xlarge transition-all duration-500 ${
          status === 'loading' ? 'bg-blue-100 animate-pulse-ring' :
          status === 'success' ? 'bg-green-100 animate-success' :
          status === 'error' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {status === 'loading' ? (
            <MapPin className="h-16 w-16 text-blue-500" />
          ) : status === 'success' ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : status === 'error' ? (
            <AlertCircle className="h-16 w-16 text-red-500" />
          ) : (
            <MapPin className="h-16 w-16 text-gray-400" />
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'loading' ? 'Konum Alınıyor' :
             status === 'success' ? 'Konum Bulundu!' :
             status === 'error' ? 'Konum Alınamadı' : 'Konum Tespiti'}
          </h2>
          <p className="text-base text-gray-500 max-w-xs mx-auto">
            {status === 'loading' ? 'GPS koordinatlarınız tespit ediliyor...' :
             status === 'success' && location?.city ? location.city :
             status === 'success' && location?.address ? location.address :
             status === 'error' ? 'Lütfen şehir adını manuel girin' : ''}
          </p>
        </div>

        {/* Success State */}
        {status === 'success' && location && (
          <div className="w-full max-w-sm bg-white/80 rounded-2xl p-4 mobile-card animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {location.city || 'Konum'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !showManual && (
          <div className="w-full max-w-sm bg-red-50 rounded-2xl p-4 text-left">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Manual Input */}
        {showManual && status !== 'success' && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <Input
              placeholder="Şehir adı (örn: İstanbul)"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="h-14 text-lg rounded-2xl px-5 bg-white"
            />
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualCity.trim() || status === 'loading'}
              className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              {status === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Şehri Bul'
              )}
            </Button>
            <button
              onClick={detectLocation}
              className="w-full text-blue-600 text-sm font-medium py-2 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar dene
            </button>
          </div>
        )}

        {/* Loading Dots */}
        {status === 'loading' && !showManual && (
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
      </div>
    </div>
  )
}
