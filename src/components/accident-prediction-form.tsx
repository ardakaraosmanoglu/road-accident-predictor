'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AccidentPredictionInput, AccidentRiskPrediction } from '@/types/dataset'
import { predictAccidentRisk } from '@/lib/prediction-engine'
import { RiskMeter } from '@/components/risk-meter'
import { WeatherFetcher } from '@/components/weather-fetcher'
import { ProcessedWeatherData } from '@/lib/weather-api'
import { CloudRain, Car, Map, Clock, AlertTriangle, CheckCircle, RefreshCw, UserCheck, Activity } from 'lucide-react'
import {
  searchAlcoholDatabase,
  estimatePromil,
  getWaitTimeHours,
  getAlcoholRiskCategory,
  LEGAL_LIMITS
} from '@/lib/alcohol-database'
import type { RouteAnalysisResult } from '@/types/maps'

/**
 * Get the current time context from the device
 * Returns hour, day of week, month, and whether it's likely rush hour
 */
function getCurrentTimeContext() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ...
  const month = now.getMonth() + 1

  // Convert day number to day name
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const day_of_week = dayNames[dayOfWeek] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

  // Detect rush hour: typically 7-9 AM or 5-7 PM on weekdays (Monday-Friday)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const is_rush_hour = isWeekday && ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19))

  return {
    hour_of_day: hour,
    day_of_week,
    month,
    is_rush_hour
  }
}

export function AccidentPredictionForm() {
  const timeContext = getCurrentTimeContext()

  const [formData, setFormData] = useState<Partial<AccidentPredictionInput>>({
    weather_condition: 'clear',
    temperature: 20,
    visibility: 10,
    wind_speed: 10,
    humidity: 50,
    traffic_density: 'medium',
    average_speed: 50,
    vehicle_count: 100,
    road_type: 'arterial',
    road_condition: 'good',
    number_of_lanes: 2,
    speed_limit: 50,
    intersection_type: 'traffic_light',
    hour_of_day: timeContext.hour_of_day,
    day_of_week: timeContext.day_of_week,
    month: timeContext.month,
    is_holiday: false,
    is_rush_hour: timeContext.is_rush_hour,
    urban_rural: 'urban',
    school_zone: false,
    construction_zone: false,
    // Driver & Vehicle safety defaults
    alcohol_consumption: 'none',
    alcohol_details: '',
    driver_fatigue: 'fresh',
    driver_experience: 'experienced',
    seatbelt_usage: true,
    vehicle_maintenance_check: true
  })

  const [prediction, setPrediction] = useState<AccidentRiskPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Update time context every minute to keep it current
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeContext = getCurrentTimeContext()
      setFormData(prev => ({
        ...prev,
        hour_of_day: newTimeContext.hour_of_day,
        day_of_week: newTimeContext.day_of_week,
        month: newTimeContext.month,
        is_rush_hour: newTimeContext.is_rush_hour
      }))
    }, 60000) // Update every 60 seconds

    return () => clearInterval(timer)
  }, [])

  const handleInputChange = (field: keyof AccidentPredictionInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWeatherData = (weatherData: ProcessedWeatherData) => {
    setFormData(prev => ({
      ...prev,
      weather_condition: weatherData.weather_condition,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      visibility: weatherData.visibility,
      wind_speed: weatherData.wind_speed
    }))
  }

  const handleRouteData = (routeData: RouteAnalysisResult) => {
    // Update form data with route analysis results
    setFormData(prev => ({
      ...prev,
      traffic_density: routeData.traffic_density,
      average_speed: routeData.average_speed,
      vehicle_count: routeData.vehicle_count,
      road_type: routeData.road_type,
      road_condition: routeData.road_condition,
      number_of_lanes: routeData.number_of_lanes,
      speed_limit: routeData.speed_limit,
      intersection_type: routeData.intersection_type,
      urban_rural: routeData.urban_rural,
      school_zone: routeData.school_zone,
      construction_zone: routeData.construction_zone
    }))

    // Track which fields were auto-filled
    setAutoFilledFields(new Set([
      'traffic_density',
      'average_speed',
      'vehicle_count',
      'road_type',
      'road_condition',
      'number_of_lanes',
      'speed_limit',
      'intersection_type',
      'urban_rural',
      'school_zone',
      'construction_zone'
    ]))
  }

  const handlePredict = async () => {
    setIsLoading(true)

    // Simulate API call delay for realistic UX
    setTimeout(() => {
      // Use our sophisticated prediction engine
      const prediction = predictAccidentRisk(formData as AccidentPredictionInput)
      setPrediction(prediction)
      setIsLoading(false)
    }, 2000)
  }


  return (
    <div className="space-y-4">
      {/* Route Information - Simplified */}
      <Card className="border border-gray-300 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Rota Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 border border-gray-200">
            Başlangıç ve varış noktalarını girin. Trafik, yol durumu ve konum bilgileri manuel olarak doldurulacaktır.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="origin" className="text-sm">Başlangıç Noktası</Label>
              <Input
                id="origin"
                placeholder="Başlangıç adresini yazın..."
                className="h-10 border-gray-300"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="destination" className="text-sm">Varış Noktası</Label>
              <Input
                id="destination"
                placeholder="Varış adresini yazın..."
                className="h-10 border-gray-300"
              />
            </div>
          </div>

          {autoFilledFields.size > 0 && (
            <div className="text-sm text-green-700 bg-green-50 p-2 border border-green-200">
              ✓ {autoFilledFields.size} parametre otomatik dolduruldu! Aşağıdaki form alanlarında mavi kenarlıkla işaretlenmiştir.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver & Vehicle Safety */}
      <Card className={`border border-gray-300 bg-white ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'border-2 border-red-400 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Sürücü ve Araç Güvenliği
            {(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') && (
              <Badge variant="destructive" className="ml-2">KRİTİK!</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Vehicle Checks */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">
              1. Araç Kontrolleri
            </h4>
            
            <div className="space-y-2">
              <div className={`p-3 border ${formData.vehicle_maintenance_check ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                <Label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vehicle_maintenance_check}
                    onChange={(e) => handleInputChange('vehicle_maintenance_check', e.target.checked)}
                    className="w-4 h-4 mt-0.5 border-gray-300"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      Rutin araç kontrolü yapıldı
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Fren sistemi, lastikler, farlar kontrol edildi
                    </p>
                  </div>
                </Label>
              </div>

              <div className={`p-3 border ${formData.seatbelt_usage ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                <Label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seatbelt_usage}
                    onChange={(e) => handleInputChange('seatbelt_usage', e.target.checked)}
                    className="w-4 h-4 mt-0.5 border-gray-300"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      Emniyet kemeri takılı
                    </div>
                    {!formData.seatbelt_usage && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Lütfen emniyet kemerinizi takın!
                      </p>
                    )}
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Step 2: Alcohol Consumption */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">
              2. Alkol Tüketimi
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-gray-50 border border-gray-300">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alcohol_consumption !== 'none'}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleInputChange('alcohol_consumption', 'none')
                        handleInputChange('alcohol_details', '')
                      } else {
                        handleInputChange('alcohol_consumption', 'light')
                      }
                    }}
                    className="w-4 h-4 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">
                    Son 24 saat içinde alkol aldım
                  </span>
                </Label>
              </div>

              {formData.alcohol_consumption !== 'none' && (
                <div className="p-3 bg-orange-50 border border-orange-300 space-y-2">
                  <div>
                    <Label htmlFor="alcohol_details" className="text-sm font-medium text-gray-900 mb-1 block">
                      Ne aldınız? (Detaylı yazın)
                    </Label>
                    <Input
                      id="alcohol_details"
                      type="text"
                      placeholder="Örnek: 2 kadeh şarap, 3 bira, 1 tek rakı..."
                      value={formData.alcohol_details || ''}
                      onChange={(e) => {
                        handleInputChange('alcohol_details', e.target.value)
                        const detected = searchAlcoholDatabase(e.target.value)
                        if (detected) {
                          handleInputChange('alcohol_consumption', detected.level)
                        }
                      }}
                      className="h-10 bg-white border-gray-300"
                    />
                  </div>

                  {/* Auto-detection and warnings */}
                  {formData.alcohol_details && (() => {
                    const detected = searchAlcoholDatabase(formData.alcohol_details)
                    if (!detected) return null

                    const promil = estimatePromil(formData.alcohol_details)
                    const waitTime = getWaitTimeHours(formData.alcohol_details)
                    const risk = getAlcoholRiskCategory(promil)

                    return (
                      <div className="space-y-3">
                        <div className="p-2 bg-white border border-gray-300">
                          <div className="text-xs font-semibold text-gray-700 mb-1">
                            Otomatik Tespit:
                          </div>
                          <div className="text-sm text-gray-900">
                            {detected.description}
                          </div>
                        </div>

                        <div className={`p-2 border ${
                          promil >= LEGAL_LIMITS.HUSUSI_ARAC
                            ? 'bg-red-50 border-red-300'
                            : promil >= LEGAL_LIMITS.TICARI_ARAC
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Tahmini Promil:</span>
                              <span className="text-sm font-bold">{promil.toFixed(2)}‰</span>
                            </div>
                            <div className="text-xs">
                              <div className={detected.is_legal_hususi ? 'text-green-700' : 'text-red-700'}>
                                {detected.is_legal_hususi ? '✓' : '✗'} Hususi araç sınırı ({LEGAL_LIMITS.HUSUSI_ARAC}‰)
                              </div>
                              <div className={detected.is_legal_ticari ? 'text-green-700' : 'text-red-700'}>
                                {detected.is_legal_ticari ? '✓' : '✗'} Ticari araç sınırı ({LEGAL_LIMITS.TICARI_ARAC}‰)
                              </div>
                            </div>
                          </div>
                        </div>

                        {waitTime > 0 && (
                          <div className="p-2 bg-blue-50 border border-blue-300">
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              Bekleme Tavsiyesi:
                            </div>
                            <div className="text-sm text-gray-900">
                              En az {waitTime} saat bekleyin
                            </div>
                          </div>
                        )}

                        <div className={`p-2 border ${
                          promil >= LEGAL_LIMITS.HUSUSI_ARAC
                            ? 'bg-red-100 border-red-400'
                            : promil >= LEGAL_LIMITS.TICARI_ARAC
                            ? 'bg-yellow-100 border-yellow-400'
                            : 'bg-blue-100 border-blue-300'
                        }`}>
                          <div className={`text-sm ${
                            promil >= LEGAL_LIMITS.HUSUSI_ARAC ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {risk.message}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Driver Condition */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">
              3. Sürücü Durumu
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fatigue" className="text-sm font-medium text-gray-700">
                  Yorgunluk seviyeniz nasıl?
                </Label>
                <Select value={formData.driver_fatigue} onValueChange={(value) => handleInputChange('driver_fatigue', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">😊 Dinç ve uyanık - Kendimi çok iyi hissediyorum</SelectItem>
                    <SelectItem value="normal">😐 Normal - Normal hissettiğim gibi</SelectItem>
                    <SelectItem value="tired">😪 Yorgun - Biraz yorgunum</SelectItem>
                    <SelectItem value="very_tired">😴 Çok yorgun - Uykum var, dikkat eksikliği hissediyorum</SelectItem>
                  </SelectContent>
                </Select>
                {(formData.driver_fatigue === 'tired' || formData.driver_fatigue === 'very_tired') && (
                  <div className="mt-1 p-2 bg-orange-50 border border-orange-300 text-xs text-orange-700">
                    ⚠️ Yorgunken sürüş yapmak dikkat eksikliği ve kaza riskini artırır. Lütfen dinlenin!
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Ne kadar süredir araç kullanıyorsunuz?
                </Label>
                <Select value={formData.driver_experience} onValueChange={(value) => handleInputChange('driver_experience', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">🔰 Yeni sürücü (0-2 yıl)</SelectItem>
                    <SelectItem value="intermediate">📋 Orta seviye (3-5 yıl)</SelectItem>
                    <SelectItem value="experienced">⭐ Deneyimli (6-10 yıl)</SelectItem>
                    <SelectItem value="professional">🏆 Çok deneyimli (10+ yıl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe' || formData.driver_fatigue === 'very_tired' || !formData.seatbelt_usage) && (
            <div className={`mt-3 p-3 border ${
              (formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') 
                ? 'bg-red-100 border-red-400' 
                : 'bg-orange-50 border-orange-300'
            }`}>
              <div className={`text-sm font-semibold ${
                (formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') 
                  ? 'text-red-800' 
                  : 'text-orange-800'
              }`}>
                ⚠️ Kritik güvenlik riski tespit edildi! Lütfen sürüş yapmadan önce bu sorunları mutlaka düzeltin.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Conditions */}
      <Card className="border border-gray-300 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Hava Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Real Weather Data Fetcher */}
          <div className="space-y-3">
            <WeatherFetcher onWeatherData={handleWeatherData} />
          </div>

          {/* Manual Weather Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="weather" className="text-sm">Hava Durumu</Label>
            <Select value={formData.weather_condition} onValueChange={(value) => handleInputChange('weather_condition', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Açık</SelectItem>
                <SelectItem value="rain">Yağmurlu</SelectItem>
                <SelectItem value="snow">Karlı</SelectItem>
                <SelectItem value="fog">Sisli</SelectItem>
                <SelectItem value="cloudy">Bulutlu</SelectItem>
                <SelectItem value="storm">Fırtınalı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="temperature" className="text-sm">Sıcaklık (°C)</Label>
            <Input
              id="temperature"
              type="number"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="visibility" className="text-sm">Görüş Mesafesi (km)</Label>
            <Input
              id="visibility"
              type="number"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="wind_speed" className="text-sm">Rüzgar Hızı (km/h)</Label>
            <Input
              id="wind_speed"
              type="number"
              value={formData.wind_speed}
              onChange={(e) => handleInputChange('wind_speed', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="humidity" className="text-sm">Nem (%)</Label>
            <Input
              id="humidity"
              type="number"
              min="0"
              max="100"
              value={formData.humidity}
              onChange={(e) => handleInputChange('humidity', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Conditions */}
      <Card className="border border-gray-300 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Trafik Koşulları
            {(autoFilledFields.has('traffic_density') || autoFilledFields.has('average_speed') || autoFilledFields.has('vehicle_count')) && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">Otomatik</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Manual Traffic Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label htmlFor="traffic_density" className="text-sm">
                  Trafik Yoğunluğu
                  {autoFilledFields.has('traffic_density') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
                </Label>
            <Select value={formData.traffic_density} onValueChange={(value) => handleInputChange('traffic_density', value)}>
                  <SelectTrigger className={`h-10 border-gray-300 ${autoFilledFields.has('traffic_density') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="very_high">Çok Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="space-y-1">
                <Label htmlFor="average_speed" className="text-sm">
                  Ortalama Hız (km/h)
                  {autoFilledFields.has('average_speed') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
                </Label>
            <Input
              id="average_speed"
              type="number"
              value={formData.average_speed}
              onChange={(e) => handleInputChange('average_speed', Number(e.target.value))}
                  className={`h-10 border-gray-300 ${autoFilledFields.has('average_speed') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}
            />
          </div>

              <div className="space-y-1">
                <Label htmlFor="vehicle_count" className="text-sm">
                  Araç Sayısı (saatlik)
                  {autoFilledFields.has('vehicle_count') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
                </Label>
            <Input
              id="vehicle_count"
              type="number"
              value={formData.vehicle_count}
              onChange={(e) => handleInputChange('vehicle_count', Number(e.target.value))}
                  className={`h-10 border-gray-300 ${autoFilledFields.has('vehicle_count') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Road Layout */}
      <Card className="border border-gray-300 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Yol Düzeni
            {(autoFilledFields.has('road_type') || autoFilledFields.has('road_condition') || autoFilledFields.has('number_of_lanes') ||
              autoFilledFields.has('speed_limit') || autoFilledFields.has('intersection_type') || autoFilledFields.has('urban_rural')) && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">Otomatik</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="road_type" className="text-sm">
              Yol Tipi
              {autoFilledFields.has('road_type') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Select value={formData.road_type} onValueChange={(value) => handleInputChange('road_type', value)}>
              <SelectTrigger className={`h-10 border-gray-300 ${autoFilledFields.has('road_type') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highway">Otoyol</SelectItem>
                <SelectItem value="arterial">Ana Cadde</SelectItem>
                <SelectItem value="collector">Toplayıcı Yol</SelectItem>
                <SelectItem value="local">Yerel Yol</SelectItem>
                <SelectItem value="rural">Kırsal Yol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="road_condition" className="text-sm">
              Yol Durumu
              {autoFilledFields.has('road_condition') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Select value={formData.road_condition} onValueChange={(value) => handleInputChange('road_condition', value)}>
              <SelectTrigger className={`h-10 border-gray-300 ${autoFilledFields.has('road_condition') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Mükemmel</SelectItem>
                <SelectItem value="good">İyi</SelectItem>
                <SelectItem value="fair">Orta</SelectItem>
                <SelectItem value="poor">Kötü</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="number_of_lanes" className="text-sm">
              Şerit Sayısı
              {autoFilledFields.has('number_of_lanes') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Input
              id="number_of_lanes"
              type="number"
              min="1"
              value={formData.number_of_lanes}
              onChange={(e) => handleInputChange('number_of_lanes', Number(e.target.value))}
              className={`h-10 border-gray-300 ${autoFilledFields.has('number_of_lanes') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="speed_limit" className="text-sm">
              Hız Limiti (km/h)
              {autoFilledFields.has('speed_limit') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Input
              id="speed_limit"
              type="number"
              value={formData.speed_limit}
              onChange={(e) => handleInputChange('speed_limit', Number(e.target.value))}
              className={`h-10 border-gray-300 ${autoFilledFields.has('speed_limit') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="intersection_type" className="text-sm">
              Kavşak Tipi
              {autoFilledFields.has('intersection_type') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Select value={formData.intersection_type} onValueChange={(value) => handleInputChange('intersection_type', value)}>
              <SelectTrigger className={`h-10 border-gray-300 ${autoFilledFields.has('intersection_type') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                <SelectItem value="traffic_light">Trafik Işığı</SelectItem>
                <SelectItem value="stop_sign">Durdur İşareti</SelectItem>
                <SelectItem value="roundabout">Dönel Kavşak</SelectItem>
                <SelectItem value="yield">Yol Ver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="urban_rural" className="text-sm">
              Bölge Tipi
              {autoFilledFields.has('urban_rural') && <span className="text-xs text-blue-600 ml-1">🤖</span>}
            </Label>
            <Select value={formData.urban_rural} onValueChange={(value) => handleInputChange('urban_rural', value)}>
              <SelectTrigger className={`h-10 border-gray-300 ${autoFilledFields.has('urban_rural') ? 'border-2 border-blue-400 bg-blue-50' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urban">Şehir</SelectItem>
                <SelectItem value="suburban">Şehir Dışı</SelectItem>
                <SelectItem value="rural">Kırsal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time & Context */}
      <Card className="border border-gray-300 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Zaman & Bağlam
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="hour_of_day" className="text-sm">Saat (0-23)</Label>
            <Input
              id="hour_of_day"
              type="number"
              min="0"
              max="23"
              value={formData.hour_of_day}
              onChange={(e) => handleInputChange('hour_of_day', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="day_of_week" className="text-sm">Haftanın Günü</Label>
            <Select value={formData.day_of_week} onValueChange={(value) => handleInputChange('day_of_week', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Pazartesi</SelectItem>
                <SelectItem value="tuesday">Salı</SelectItem>
                <SelectItem value="wednesday">Çarşamba</SelectItem>
                <SelectItem value="thursday">Perşembe</SelectItem>
                <SelectItem value="friday">Cuma</SelectItem>
                <SelectItem value="saturday">Cumartesi</SelectItem>
                <SelectItem value="sunday">Pazar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="month" className="text-sm">Ay (1-12)</Label>
            <Input
              id="month"
              type="number"
              min="1"
              max="12"
              value={formData.month}
              onChange={(e) => handleInputChange('month', Number(e.target.value))}
              className="h-10 border-gray-300"
            />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label className="text-sm">
              Özel Durumlar
              {(autoFilledFields.has('school_zone') || autoFilledFields.has('construction_zone')) && (
                <span className="text-xs text-blue-600 ml-1">🤖</span>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={formData.is_holiday ? "default" : "outline"}
                className="cursor-pointer px-2 py-1"
                onClick={() => handleInputChange('is_holiday', !formData.is_holiday)}
              >
                Tatil
              </Badge>
              <Badge
                variant={formData.is_rush_hour ? "default" : "outline"}
                className="cursor-pointer px-2 py-1"
                onClick={() => handleInputChange('is_rush_hour', !formData.is_rush_hour)}
              >
                Yoğun Saat
              </Badge>
              <Badge
                variant={formData.school_zone ? "default" : "outline"}
                className={`cursor-pointer px-2 py-1 ${
                  autoFilledFields.has('school_zone') ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => handleInputChange('school_zone', !formData.school_zone)}
              >
                Okul Bölgesi {autoFilledFields.has('school_zone') && '🤖'}
              </Badge>
              <Badge
                variant={formData.construction_zone ? "default" : "outline"}
                className={`cursor-pointer px-2 py-1 ${
                  autoFilledFields.has('construction_zone') ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => handleInputChange('construction_zone', !formData.construction_zone)}
              >
                İnşaat Bölgesi {autoFilledFields.has('construction_zone') && '🤖'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handlePredict}
          disabled={isLoading}
          className="w-full px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white border border-gray-300"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Analiz Ediliyor...
            </>
          ) : (
            <>
              Kaza Riskini Tahmin Et
            </>
          )}
        </Button>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <Card className="border border-gray-300 bg-white">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 mb-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p className="text-sm">Risk faktörleri analiz ediliyor...</p>
              </div>
              <Progress value={66} className="w-full h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {prediction && !isLoading && (
        <Card className="border border-gray-300 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Risk Değerlendirme Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Level with Visual Meter */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <RiskMeter
                  score={prediction.risk_score}
                  riskLevel={prediction.risk_level}
                  size={160}
                />
              </div>
              <div className="text-center lg:text-left flex-1 space-y-2">
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Risk Değerlendirmesi Tamamlandı</h3>
                  <p className="text-sm text-gray-600">
                    Sağlanan koşullara göre kaza risk seviyesi {prediction.confidence}% güvenle hesaplandı.
                  </p>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-300">
                  <div className="text-xs text-gray-600 mb-1">Analiz Özeti</div>
                  <div className="text-sm font-semibold text-gray-900">
                    Risk Skoru: {prediction.risk_score}/100 • Güven: {prediction.confidence}%
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-900">
                Risk Faktörleri:
              </h3>
              <div className="flex flex-wrap gap-2">
                {prediction.contributing_factors.map((factor, index) => (
                  <Badge key={index} variant="destructive" className="px-2 py-1 text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-900">
                Güvenlik Önerileri:
              </h3>
              <div className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="bg-green-50 border border-green-300 p-2">
                    <div className="text-sm text-gray-700">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}