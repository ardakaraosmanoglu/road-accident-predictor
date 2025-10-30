'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapsService, ProcessedRouteData, formatDuration, formatDistance } from '@/lib/maps-api'
import {
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Clock,
  Car,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface RouteFetcherProps {
  onRouteData: (data: ProcessedRouteData) => void
}

export function RouteFetcher({ onRouteData }: RouteFetcherProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRoute, setCurrentRoute] = useState<ProcessedRouteData | null>(null)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const mapsService = new MapsService()

  const fetchRouteData = async () => {
    if (!destination.trim()) {
      setError('Lütfen en az varış noktası girin')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let routeData: ProcessedRouteData

      if (origin.trim()) {
        // Her iki nokta da girilmiş
        routeData = await mapsService.getDirections(origin.trim(), destination.trim())
      } else {
        // Sadece varış noktası, mevcut konumdan
        routeData = await mapsService.getRouteDataForCurrentLocation(destination.trim())
      }

      setCurrentRoute(routeData)
      onRouteData(routeData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rota verisi alınamadı'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrafficDensityColor = (density: string) => {
    switch (density) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'very_high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrafficIcon = (density: string) => {
    switch (density) {
      case 'low': return '🟢'
      case 'medium': return '🟡'
      case 'high': return '🟠'
      case 'very_high': return '🔴'
      default: return '⚪'
    }
  }

  const getRoadConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Route Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Rota Bilgilerini Al
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Başlangıç Noktası</Label>
              <Input
                id="origin"
                placeholder="Mevcut konumum (boş bırakın) veya adres girin..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Boş bırakırsanız mevcut konumunuz kullanılır
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Varış Noktası *</Label>
              <Input
                id="destination"
                placeholder="Varış adresi girin..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchRouteData()}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={fetchRouteData}
              disabled={isLoading || !destination.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {isLoading ? 'Rota Analiz Ediliyor...' : 'Rota Verilerini Al'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Route Data Display */}
      {currentRoute && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Rota Analizi Tamamlandı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Summary */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDistance(currentRoute.distance_km)}
                  </div>
                  <div className="text-xs text-gray-500">Mesafe</div>
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400" />

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(currentRoute.duration_minutes)}
                  </div>
                  <div className="text-xs text-gray-500">Normal Süre</div>
                </div>

                {currentRoute.duration_with_traffic_minutes && (
                  <>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatDuration(currentRoute.duration_with_traffic_minutes)}
                      </div>
                      <div className="text-xs text-gray-500">Trafikle</div>
                    </div>
                  </>
                )}
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">
                  {currentRoute.average_speed_kmh} km/sa
                </div>
                <div className="text-xs text-gray-500">Ort. Hız</div>
              </div>
            </div>

            {/* Traffic and Road Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Trafik Durumu</h4>
                <div className="space-y-2">
                  <Badge className={getTrafficDensityColor(currentRoute.traffic_density)}>
                    {getTrafficIcon(currentRoute.traffic_density)}
                    {currentRoute.traffic_density === 'very_high' ? 'Çok Yoğun' :
                     currentRoute.traffic_density === 'high' ? 'Yoğun' :
                     currentRoute.traffic_density === 'medium' ? 'Orta' : 'Az'} Trafik
                  </Badge>

                  <div className="text-sm text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Gecikme faktörü: x{currentRoute.traffic_delay_factor}
                  </div>

                  <div className="text-sm text-gray-600">
                    <Car className="h-4 w-4 inline mr-1" />
                    Tahmini araç: {currentRoute.estimated_vehicle_count}/saat
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Yol Bilgileri</h4>
                <div className="space-y-2">
                  <Badge className={getRoadConditionColor(currentRoute.road_conditions_estimated)}>
                    <Settings className="h-3 w-3 mr-1" />
                    {currentRoute.road_conditions_estimated === 'excellent' ? 'Mükemmel' :
                     currentRoute.road_conditions_estimated === 'good' ? 'İyi' :
                     currentRoute.road_conditions_estimated === 'fair' ? 'Orta' : 'Kötü'} Durum
                  </Badge>

                  <div className="text-sm text-gray-600">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {currentRoute.urban_rural === 'urban' ? 'Şehir' :
                     currentRoute.urban_rural === 'suburban' ? 'Şehir Dışı' : 'Kırsal'} Bölge
                  </div>

                  {currentRoute.road_types.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Yol tipleri: {currentRoute.road_types.map(type =>
                        type === 'highway' ? 'Otoyol' :
                        type === 'arterial' ? 'Ana Cadde' :
                        type === 'collector' ? 'Toplayıcı' :
                        type === 'local' ? 'Yerel Yol' : type
                      ).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Route Summary */}
            {currentRoute.route_summary && (
              <div className="bg-white p-3 rounded-lg border">
                <h5 className="font-medium text-gray-800 mb-1">Rota Özeti</h5>
                <p className="text-sm text-gray-600">{currentRoute.route_summary}</p>

                {currentRoute.major_roads.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Ana yollar: {currentRoute.major_roads.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Data Populated Message */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Rota verileri form alanlarına otomatik olarak aktarıldı.
                Trafik yoğunluğu, yol durumu ve diğer parametreler güncellendi.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Helper Text */}
      {!currentRoute && !error && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          🗺️ <strong>İpucu:</strong> Gerçek zamanlı trafik ve yol verilerini alın.
          Başlangıç noktasını boş bırakırsanız mevcut konumunuz kullanılır.
        </div>
      )}
    </div>
  )
}