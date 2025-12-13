'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Loader2, CheckCircle, AlertCircle,
  Car, Gauge, Navigation 
} from 'lucide-react'
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
import { analyzeRouteForForm } from '@/lib/maps-integration'
import type { RouteAnalysisResult } from '@/types/maps'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  city?: string
  country?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '200px'
}

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

interface RouteStepProps {
  onLocationDetected: (location: LocationData) => void
  onRouteAnalyzed: (route: RouteAnalysisResult) => void
  onStatusChange: (status: 'loading' | 'completed' | 'error') => void
  onNext: () => void
}

export function RouteStep({ 
  onLocationDetected,
  onRouteAnalyzed, 
  onStatusChange,
  onNext 
}: RouteStepProps) {
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'ready' | 'error'>('detecting')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [destinationInput, setDestinationInput] = useState('')
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [routeData, setRouteData] = useState<RouteAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const hasDetectedRef = useRef(false)

  // Auto-detect location on mount
  useEffect(() => {
    if (hasDetectedRef.current) return
    hasDetectedRef.current = true

    if (!navigator.geolocation) {
      setLocationStatus('error')
      setError('Tarayıcınız konum servisini desteklemiyor')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `/api/maps/geocode?lat=${latitude}&lng=${longitude}`
          )
          const data = await response.json()
          
          const locationData: LocationData = {
            latitude,
            longitude,
            accuracy,
            address: data.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: data.city,
            country: data.country
          }
          
          setLocation(locationData)
          setLocationStatus('ready')
          onLocationDetected(locationData)
        } catch {
          const locationData: LocationData = {
            latitude,
            longitude,
            accuracy,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }
          setLocation(locationData)
          setLocationStatus('ready')
          onLocationDetected(locationData)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocationStatus('error')
        setError('Konum alınamadı. Lütfen konum izni verin.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [onLocationDetected])

  const originAddress = location?.address || 
    (location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '')

  const center = location 
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 41.015137, lng: 28.979530 }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onDestinationAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setDestinationAutocomplete(autocomplete)
  }, [])

  const onDestinationPlaceChanged = useCallback(async () => {
    if (!destinationAutocomplete || !location) return

    const place = destinationAutocomplete.getPlace()
    if (!place.geometry?.location) return

    const destination = place.formatted_address || place.name || ''
    setDestinationInput(destination)
    setStatus('loading')
    setError(null)
    onStatusChange('loading')

    try {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: { lat: location.latitude, lng: location.longitude },
          destination: place.geometry.location,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, mapStatus) => {
          if (mapStatus === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result)
          }
        }
      )

      const analysisResult = await analyzeRouteForForm(originAddress, destination)
      setRouteData(analysisResult)
      setStatus('success')
      onStatusChange('completed')
      onRouteAnalyzed(analysisResult)

    } catch (err) {
      console.error('Route analysis error:', err)
      setError('Rota analizi başarısız oldu')
      setStatus('error')
      onStatusChange('error')
    }
  }, [destinationAutocomplete, location, originAddress, onRouteAnalyzed, onStatusChange])

  useEffect(() => {
    if (location && map) {
      map.panTo({ lat: location.latitude, lng: location.longitude })
      map.setZoom(13)
    }
  }, [location, map])

  // Show location detecting state
  if (locationStatus === 'detecting') {
    return (
      <div className="step-card animate-spring">
        <div className="flex flex-col items-center justify-center text-center px-6 py-12 space-y-8">
          <div className="icon-xlarge bg-blue-100 pulse-ring">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Konumunuz Alınıyor</h2>
            <p className="text-base text-gray-500">GPS sinyali bekleniyor...</p>
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
      </div>
    )
  }

  // Show error state
  if (locationStatus === 'error' && !location) {
    return (
      <div className="step-card animate-spring">
        <div className="flex flex-col items-center justify-center text-center px-6 py-12 space-y-8">
          <div className="icon-xlarge bg-red-100">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Konum Alınamadı</h2>
            <p className="text-base text-gray-500">{error || 'Lütfen konum izni verin'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="text-center px-6 pt-6 pb-4">
          <div className={`icon-large mx-auto mb-4 ${
            status === 'loading' ? 'bg-blue-100' :
            status === 'success' ? 'bg-green-100 animate-success' :
            status === 'error' ? 'bg-red-100' : 'bg-purple-100'
          }`}>
            {status === 'loading' ? (
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="h-10 w-10 text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle className="h-10 w-10 text-red-500" />
            ) : (
              <span className="text-4xl">📍</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'loading' ? 'Rota Analiz Ediliyor...' :
             status === 'success' ? 'Rota Hazır!' :
             status === 'error' ? 'Hata Oluştu' : 'Nereye Gidiyorsunuz?'}
          </h2>
          <p className="text-base text-gray-500 mt-2">
            {status === 'idle' ? 'Varış noktasını yazın' :
             status === 'loading' ? 'Trafik bilgileri alınıyor...' :
             status === 'success' ? 'Trafik ve yol bilgileri alındı' : error || ''}
          </p>
        </div>

        {/* Origin Badge */}
        <div className="px-6 pb-4">
          <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600 font-medium">Başlangıç</p>
              <p className="text-sm text-gray-700 truncate">
                {originAddress || 'Konum alınıyor...'}
              </p>
            </div>
          </div>
        </div>

        {/* Destination Input */}
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
          libraries={libraries}
        >
          <div className="px-6 pb-4">
            <Autocomplete
              onLoad={onDestinationAutocompleteLoad}
              onPlaceChanged={onDestinationPlaceChanged}
              options={{
                types: ['establishment', 'geocode'],
                fields: ['place_id', 'geometry', 'name', 'formatted_address']
              }}
            >
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <Input
                  placeholder="Varış adresini yazın..."
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  className="h-16 text-lg pl-16 pr-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-purple-500"
                  disabled={status === 'loading' || !location}
                />
              </div>
            </Autocomplete>
          </div>

          {/* Map */}
          <div className="flex-1 px-6 pb-4 min-h-[200px]">
            <div className="h-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
                onLoad={onMapLoad}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  zoomControl: false
                }}
              >
                {location && !directionsResponse && (
                  <Marker
                    position={{ lat: location.latitude, lng: location.longitude }}
                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
                  />
                )}
                {directionsResponse && (
                  <DirectionsRenderer
                    directions={directionsResponse}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#6366F1',
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </div>
        </LoadScript>

        {/* Success Stats */}
        {status === 'success' && routeData && (
          <div className="px-6 pb-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/80 rounded-2xl p-4 mobile-card text-center">
                <Car className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {routeData.traffic_density === 'low' ? 'Düşük' :
                   routeData.traffic_density === 'medium' ? 'Orta' :
                   routeData.traffic_density === 'high' ? 'Yüksek' : 'Çok Yüksek'}
                </p>
                <p className="text-xs text-gray-500">Trafik</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-4 mobile-card text-center">
                <Gauge className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{routeData.average_speed}</p>
                <p className="text-xs text-gray-500">km/h Ort.</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-4 mobile-card text-center">
                <Navigation className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{routeData.speed_limit}</p>
                <p className="text-xs text-gray-500">km/h Limit</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {status === 'success' && (
          <div className="px-6 pb-6 safe-area-bottom">
            <button
              onClick={onNext}
              className="w-full mobile-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              İleri
            </button>
          </div>
        )}

        {/* Loading Dots */}
        {status === 'loading' && (
          <div className="px-6 pb-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
