'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Loader2, CheckCircle, AlertCircle,
  Car, Gauge, Navigation 
} from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
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
  const t = useTranslations('routeStep')
  const tCommon = useTranslations('common')

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

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
      setError(t('locationUnsupported'))
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
        setError(t('locationError'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [onLocationDetected, t])

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
      setError(t('analysisError'))
      setStatus('error')
      onStatusChange('error')
    }
  }, [destinationAutocomplete, location, originAddress, onRouteAnalyzed, onStatusChange, t])

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
            <h2 className="text-2xl font-bold text-gray-900">{t('detectingTitle')}</h2>
            <p className="text-base text-gray-500">{t('detectingSubtitle')}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">{t('errorTitle')}</h2>
            <p className="text-base text-gray-500">{error || t('errorSubtitle')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="step-card animate-spring">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header - kompakt */}
        <div className="text-center px-4 pt-3 pb-2 flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
            status === 'loading' ? 'bg-blue-100' :
            status === 'success' ? 'bg-green-100' :
            status === 'error' ? 'bg-red-100' : 'bg-purple-100'
          }`}>
            {status === 'loading' ? (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <span className="text-2xl">📍</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {status === 'loading' ? t('header.loading') :
             status === 'success' ? t('header.success') :
             status === 'error' ? t('header.error') : t('header.idle')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'idle' ? t('subheader.idle') :
             status === 'loading' ? t('subheader.loading') :
             status === 'success' ? t('subheader.success') : error || t('subheader.error')}
          </p>
        </div>

        {/* Origin Badge - kompakt */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate">
                {originAddress || t('originLoading')}
              </p>
            </div>
          </div>
        </div>

        {/* Destination Input */}
        {isLoaded ? (
          <>
            <div className="px-4 pb-2 flex-shrink-0">
              <Autocomplete
                onLoad={onDestinationAutocompleteLoad}
                onPlaceChanged={onDestinationPlaceChanged}
                options={{
                  types: ['establishment', 'geocode'],
                  fields: ['place_id', 'geometry', 'name', 'formatted_address']
                }}
              >
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <Input
                    placeholder={t('destinationPlaceholder')}
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    className="h-12 text-base pl-14 pr-4 rounded-xl bg-white border-2 border-gray-200 focus:border-purple-500"
                    disabled={status === 'loading' || !location}
                  />
                </div>
              </Autocomplete>
            </div>

            {/* Map */}
            <div className="flex-1 px-4 pb-2 min-h-[120px]">
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
          </>
        ) : (
          <div className="flex-1 px-4 pb-2 min-h-[120px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Success Stats */}
        {status === 'success' && routeData && (
          <div className="px-4 pb-2 animate-fade-in flex-shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/80 rounded-xl p-2 mobile-card text-center">
                <Car className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900">
                  {routeData.traffic_density === 'low' ? t('trafficDensity.low') :
                   routeData.traffic_density === 'medium' ? t('trafficDensity.medium') :
                   routeData.traffic_density === 'high' ? t('trafficDensity.high') : t('trafficDensity.very_high')}
                </p>
                <p className="text-xs text-gray-500">{t('trafficLabel')}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-2 mobile-card text-center">
                <Gauge className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900">{routeData.average_speed}</p>
                <p className="text-xs text-gray-500">{t('speedLabel')}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-2 mobile-card text-center">
                <Navigation className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900">{routeData.speed_limit}</p>
                <p className="text-xs text-gray-500">{t('limitLabel')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {status === 'success' && (
          <div className="px-4 pb-4 safe-area-bottom flex-shrink-0">
            <button
              onClick={onNext}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {tCommon('next')}
            </button>
          </div>
        )}

        {/* Loading Dots */}
        {status === 'loading' && (
          <div className="px-4 pb-4 flex justify-center gap-2 flex-shrink-0">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
