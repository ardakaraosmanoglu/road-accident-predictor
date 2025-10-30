'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { analyzeRouteForForm } from '@/lib/maps-integration'
import type { RouteAnalysisResult } from '@/types/maps'

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
}

const defaultCenter = {
  lat: 41.015137,
  lng: 28.979530 // Istanbul center
}

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

interface RouteInputMapProps {
  onRouteData: (data: RouteAnalysisResult) => void
}

export function RouteInputMap({ onRouteData }: RouteInputMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [originInput, setOriginInput] = useState('')
  const [destinationInput, setDestinationInput] = useState('')
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [originLocation, setOriginLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userCountry, setUserCountry] = useState<string>('tr') // Default fallback to Turkey

  // Detect user's country from their location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Use reverse geocoding to get country code
            const response = await fetch('/api/maps/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latlng: `${latitude},${longitude}` })
            })

            const data = await response.json()

            // Extract country code from address components
            if (data.results && data.results.length > 0) {
              const countryComponent = data.results[0].address_components.find(
                (comp: { types: string[] }) => comp.types.includes('country')
              )

              if (countryComponent) {
                const countryCode = countryComponent.short_name.toLowerCase()
                setUserCountry(countryCode)
                console.log('User country detected:', countryCode)
              }
            }
          } catch (error) {
            console.warn('Country detection failed, using default (tr):', error)
          }
        },
        (error) => {
          console.warn('Geolocation failed, using default country (tr):', error)
        }
      )
    }
  }, [])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onOriginAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setOriginAutocomplete(autocomplete)
  }, [])

  const onDestinationAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setDestinationAutocomplete(autocomplete)
  }, [])

  const onOriginPlaceChanged = useCallback(() => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace()
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        setOriginLocation(location)
        setOriginInput(place.formatted_address || place.name || '')

        // Center map on origin
        if (map) {
          map.panTo(location)
          map.setZoom(14)
        }
      }
    }
  }, [originAutocomplete, map])

  const onDestinationPlaceChanged = useCallback(() => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace()
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        setDestinationLocation(location)
        setDestinationInput(place.formatted_address || place.name || '')
      }
    }
  }, [destinationAutocomplete])

  // When both locations are set, calculate and display the route
  useEffect(() => {
    if (originLocation && destinationLocation) {
      const directionsService = new google.maps.DirectionsService()

      directionsService.route(
        {
          origin: originLocation,
          destination: destinationLocation,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result)
            setError(null)
          } else {
            setError('Rota hesaplanamadı')
          }
        }
      )
    }
  }, [originLocation, destinationLocation])

  const handleAnalyzeRoute = async () => {
    if (!originInput || !destinationInput) {
      setError('Lütfen başlangıç ve varış noktalarını girin')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setSuccess(false)

    try {
      const analysisResult = await analyzeRouteForForm(originInput, destinationInput)
      onRouteData(analysisResult)
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rota analizi başarısız oldu')
      console.error('Route analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setOriginLocation(location)
          setOriginInput(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`)

          if (map) {
            map.panTo(location)
            map.setZoom(14)
          }
        },
        (error) => {
          setError('Konum alınamadı: ' + error.message)
        }
      )
    } else {
      setError('Tarayıcınız konum özelliğini desteklemiyor')
    }
  }

  return (
    <div className="space-y-4">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={libraries}
      >
        <div className="space-y-4">
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Başlangıç Noktası
              </Label>
              <Autocomplete
                onLoad={onOriginAutocompleteLoad}
                onPlaceChanged={onOriginPlaceChanged}
                options={{
                  componentRestrictions: { country: userCountry },
                  types: ['establishment', 'geocode'],
                  fields: ['place_id', 'geometry', 'name', 'formatted_address']
                }}
              >
                <Input
                  id="origin"
                  placeholder="Başlangıç adresini yazın..."
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  className="h-11"
                />
              </Autocomplete>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                className="w-full text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Mevcut Konumumu Kullan
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Varış Noktası
              </Label>
              <Autocomplete
                onLoad={onDestinationAutocompleteLoad}
                onPlaceChanged={onDestinationPlaceChanged}
                options={{
                  componentRestrictions: { country: userCountry },
                  types: ['establishment', 'geocode'],
                  fields: ['place_id', 'geometry', 'name', 'formatted_address']
                }}
              >
                <Input
                  id="destination"
                  placeholder="Varış adresini yazın..."
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  className="h-11"
                />
              </Autocomplete>
            </div>
          </div>

          {/* Map */}
          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={11}
                onLoad={onMapLoad}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false
                }}
              >
                {/* Origin Marker */}
                {originLocation && !directionsResponse && (
                  <Marker
                    position={originLocation}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    }}
                  />
                )}

                {/* Destination Marker */}
                {destinationLocation && !directionsResponse && (
                  <Marker
                    position={destinationLocation}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }}
                  />
                )}

                {/* Directions Route */}
                {directionsResponse && (
                  <DirectionsRenderer
                    directions={directionsResponse}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleAnalyzeRoute}
              disabled={isAnalyzing || !originInput || !destinationInput}
              className="w-full md:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Rota Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  Rota Bilgilerini Al ve Formu Doldur
                </>
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  ✓ Rota bilgileri başarıyla alındı ve form otomatik dolduruldu!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </LoadScript>
    </div>
  )
}
