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
import { searchAlcoholDatabase } from '@/lib/alcohol-database'

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
    <div className="space-y-5 sm:space-y-6 animate-slide-up">
      {/* Driver & Vehicle Safety - MOST IMPORTANT SECTION */}
      <Card className={`border-0 shadow-sm hover-lift bg-white/80 backdrop-blur-sm ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'border-2 border-red-300 bg-red-50/30' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span>Sürücü ve Araç Güvenliği</span>
              {(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') && (
                <Badge variant="destructive" className="ml-2">KRİTİK!</Badge>
              )}
            </CardTitle>
            <p className="text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded-full">
              💡 Bu bilgiler risk analizi için çok önemli
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Vehicle Checks */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Araç Kontrolleri
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Aracınızın güvenlik durumunu kontrol edin</p>
              </div>
            </div>
            
            <div className="ml-11 space-y-3">
              <div className={`p-4 rounded-lg border-2 transition-all ${formData.vehicle_maintenance_check ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vehicle_maintenance_check}
                    onChange={(e) => handleInputChange('vehicle_maintenance_check', e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      ✅ Rutin araç kontrolü yapıldı
                    </div>
                    <p className="text-xs text-gray-600">
                      Fren sistemi, lastikler, farlar, sinyaller ve diğer güvenlik ekipmanları kontrol edildi
                    </p>
                  </div>
                </Label>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-all ${formData.seatbelt_usage ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <Label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seatbelt_usage}
                    onChange={(e) => handleInputChange('seatbelt_usage', e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      🔒 Emniyet kemeri takılı
                    </div>
                    <p className="text-xs text-gray-600">
                      Emniyet kemeri takmak yasal zorunluluktur ve kaza riskini önemli ölçüde azaltır
                    </p>
                    {!formData.seatbelt_usage && (
                      <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1">
                        ⚠️ Lütfen emniyet kemerinizi takın!
                      </p>
                    )}
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Step 2: Alcohol Consumption */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className={`font-semibold text-base flex items-center gap-2 ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'text-red-800' : 'text-gray-900'}`}>
                  🍺 Alkol Tüketimi
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Son 24 saat içinde alkol tüketimi bilgisi
                </p>
              </div>
            </div>
            
            <div className={`ml-11 p-4 rounded-lg border-2 transition-all ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alcohol" className="text-sm font-medium text-gray-700 mb-2 block">
                    Son 24 saat içinde alkol aldınız mı?
                  </Label>
                  <Select
                    value={formData.alcohol_consumption}
                    onValueChange={(value) => {
                      handleInputChange('alcohol_consumption', value)
                      if (value === 'none') {
                        handleInputChange('alcohol_details', '')
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>Hayır, alkol almadım</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Hafif (1-2 içki)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderate">
                        <div className="flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Orta (3-4 içki)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="heavy">
                        <div className="flex items-center gap-2">
                          <span>🚫</span>
                          <span>Ağır (5+ içki)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="severe">
                        <div className="flex items-center gap-2">
                          <span>🚫</span>
                          <span>Çok fazla (sarhoş)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.alcohol_consumption !== 'none' && (
                    <div className="mt-3">
                      <Badge 
                        variant={formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe' ? "destructive" : "secondary"} 
                        className="text-xs py-1 px-3"
                      >
                        ⚠️ Alkollüyken sürüş yapmak yasaktır ve suçtur!
                      </Badge>
                    </div>
                  )}
                </div>

                {formData.alcohol_consumption !== 'none' && (
                  <div className="pt-3 border-t border-gray-200">
                    <Label htmlFor="alcohol_details" className="text-sm font-medium text-gray-700 mb-2 block">
                      Detayları girin (opsiyonel)
                    </Label>
                    <Input
                      id="alcohol_details"
                      type="text"
                      placeholder="Örnek: 2 kadeh şarap, 1 bira..."
                      value={formData.alcohol_details || ''}
                      onChange={(e) => {
                        handleInputChange('alcohol_details', e.target.value)
                        const detected = searchAlcoholDatabase(e.target.value)
                        if (detected) {
                          handleInputChange('alcohol_consumption', detected.level)
                        }
                      }}
                      className="h-11"
                    />
                    {formData.alcohol_details && searchAlcoholDatabase(formData.alcohol_details) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        💡 Otomatik tespit: {searchAlcoholDatabase(formData.alcohol_details)?.description}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Bu bilgiyi girerseniz sistem otomatik olarak seviyeyi belirleyebilir
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Driver Condition */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                  👤 Sürücü Durumu
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Şu anki fiziksel ve mental durumunuz</p>
              </div>
            </div>
            
            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
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
                <p className="text-xs text-gray-500 mt-1">
                  💡 Deneyim seviyesi risk hesaplamasında önemli bir faktördür
                </p>
              </div>
            </div>
          </div>

          {/* Safety Warning - Only for critical situations */}
          {(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe' || formData.driver_fatigue === 'very_tired' || !formData.seatbelt_usage) && (
            <Alert className={`mt-4 ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'bg-red-100 border-red-300' : 'bg-orange-50 border-orange-200'}`}>
              <AlertTriangle className={`h-5 w-5 ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'text-red-600' : 'text-orange-600'}`} />
              <AlertDescription className={`text-sm font-semibold ${(formData.alcohol_consumption === 'heavy' || formData.alcohol_consumption === 'severe') ? 'text-red-800' : 'text-orange-800'}`}>
                ⚠️ <strong>Kritik güvenlik riski tespit edildi!</strong> Lütfen sürüş yapmadan önce bu sorunları mutlaka düzeltin. Güvenliğiniz için bekleyin veya alternatif bir ulaşım yöntemi kullanın.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Weather Conditions */}
      <Card className="border-0 shadow-sm hover-lift bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <CloudRain className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>Hava Durumu</span>
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
          <div className="space-y-1.5">
            <Label htmlFor="weather" className="text-sm font-medium text-gray-700">Hava Durumu</Label>
            <Select value={formData.weather_condition} onValueChange={(value) => handleInputChange('weather_condition', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">☀️ Açık</SelectItem>
                <SelectItem value="rain">🌧️ Yağmurlu</SelectItem>
                <SelectItem value="snow">❄️ Karlı</SelectItem>
                <SelectItem value="fog">🌫️ Sisli</SelectItem>
                <SelectItem value="cloudy">☁️ Bulutlu</SelectItem>
                <SelectItem value="storm">⛈️ Fırtınalı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">Sıcaklık (°C)</Label>
            <Input
              id="temperature"
              type="number"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visibility" className="text-sm font-medium text-gray-700">Görüş Mesafesi (km)</Label>
            <Input
              id="visibility"
              type="number"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wind_speed" className="text-sm font-medium text-gray-700">Rüzgar Hızı (km/h)</Label>
            <Input
              id="wind_speed"
              type="number"
              value={formData.wind_speed}
              onChange={(e) => handleInputChange('wind_speed', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="humidity" className="text-sm font-medium text-gray-700">Nem (%)</Label>
            <Input
              id="humidity"
              type="number"
              min="0"
              max="100"
              value={formData.humidity}
              onChange={(e) => handleInputChange('humidity', Number(e.target.value))}
              className="h-10"
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Conditions */}
      <Card className="border-0 shadow-sm hover-lift bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>Trafik Koşulları</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Manual Traffic Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="traffic_density" className="text-sm font-medium text-gray-700">Trafik Yoğunluğu</Label>
            <Select value={formData.traffic_density} onValueChange={(value) => handleInputChange('traffic_density', value)}>
                  <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="low">🟢 Düşük</SelectItem>
                    <SelectItem value="medium">🟡 Orta</SelectItem>
                    <SelectItem value="high">🟠 Yüksek</SelectItem>
                    <SelectItem value="very_high">🔴 Çok Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="space-y-1.5">
                <Label htmlFor="average_speed" className="text-sm font-medium text-gray-700">Ortalama Hız (km/h)</Label>
            <Input
              id="average_speed"
              type="number"
              value={formData.average_speed}
              onChange={(e) => handleInputChange('average_speed', Number(e.target.value))}
                  className="h-10"
            />
          </div>

              <div className="space-y-1.5">
                <Label htmlFor="vehicle_count" className="text-sm font-medium text-gray-700">Araç Sayısı (saatlik)</Label>
            <Input
              id="vehicle_count"
              type="number"
              value={formData.vehicle_count}
              onChange={(e) => handleInputChange('vehicle_count', Number(e.target.value))}
                  className="h-10"
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Road Layout */}
      <Card className="border-0 shadow-sm hover-lift bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Map className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>Yol Düzeni</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="road_type" className="text-sm font-medium text-gray-700">Yol Tipi</Label>
            <Select value={formData.road_type} onValueChange={(value) => handleInputChange('road_type', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highway">🛣️ Otoyol</SelectItem>
                <SelectItem value="arterial">🛣️ Ana Cadde</SelectItem>
                <SelectItem value="collector">🛤️ Toplayıcı Yol</SelectItem>
                <SelectItem value="local">🛤️ Yerel Yol</SelectItem>
                <SelectItem value="rural">🌾 Kırsal Yol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="road_condition" className="text-sm font-medium text-gray-700">Yol Durumu</Label>
            <Select value={formData.road_condition} onValueChange={(value) => handleInputChange('road_condition', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">⭐ Mükemmel</SelectItem>
                <SelectItem value="good">✅ İyi</SelectItem>
                <SelectItem value="fair">⚠️ Orta</SelectItem>
                <SelectItem value="poor">❌ Kötü</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="number_of_lanes" className="text-sm font-medium text-gray-700">Şerit Sayısı</Label>
            <Input
              id="number_of_lanes"
              type="number"
              min="1"
              value={formData.number_of_lanes}
              onChange={(e) => handleInputChange('number_of_lanes', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="speed_limit" className="text-sm font-medium text-gray-700">Hız Limiti (km/h)</Label>
            <Input
              id="speed_limit"
              type="number"
              value={formData.speed_limit}
              onChange={(e) => handleInputChange('speed_limit', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intersection_type" className="text-sm font-medium text-gray-700">Kavşak Tipi</Label>
            <Select value={formData.intersection_type} onValueChange={(value) => handleInputChange('intersection_type', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">➖ Yok</SelectItem>
                <SelectItem value="traffic_light">🚦 Trafik Işığı</SelectItem>
                <SelectItem value="stop_sign">🛑 Durdur İşareti</SelectItem>
                <SelectItem value="roundabout">🌀 Dönel Kavşak</SelectItem>
                <SelectItem value="yield">⚠️ Yol Ver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urban_rural" className="text-sm font-medium text-gray-700">Bölge Tipi</Label>
            <Select value={formData.urban_rural} onValueChange={(value) => handleInputChange('urban_rural', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urban">🏙️ Şehir</SelectItem>
                <SelectItem value="suburban">🏘️ Şehir Dışı</SelectItem>
                <SelectItem value="rural">🌾 Kırsal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time & Context */}
      <Card className="border-0 shadow-sm hover-lift bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span>Zaman & Bağlam</span>
            </CardTitle>
            <span className="text-xs text-gray-600 bg-indigo-50 px-3 py-1.5 rounded-full font-medium">
              📱 Cihaz zamanından otomatik
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hour_of_day" className="text-sm font-medium text-gray-700">Saat (0-23)</Label>
            <Input
              id="hour_of_day"
              type="number"
              min="0"
              max="23"
              value={formData.hour_of_day}
              onChange={(e) => handleInputChange('hour_of_day', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="day_of_week" className="text-sm font-medium text-gray-700">Haftanın Günü</Label>
            <Select value={formData.day_of_week} onValueChange={(value) => handleInputChange('day_of_week', value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">📅 Pazartesi</SelectItem>
                <SelectItem value="tuesday">📅 Salı</SelectItem>
                <SelectItem value="wednesday">📅 Çarşamba</SelectItem>
                <SelectItem value="thursday">📅 Perşembe</SelectItem>
                <SelectItem value="friday">📅 Cuma</SelectItem>
                <SelectItem value="saturday">📅 Cumartesi</SelectItem>
                <SelectItem value="sunday">📅 Pazar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="month" className="text-sm font-medium text-gray-700">Ay (1-12)</Label>
            <Input
              id="month"
              type="number"
              min="1"
              max="12"
              value={formData.month}
              onChange={(e) => handleInputChange('month', Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-sm font-medium text-gray-700">Özel Durumlar</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={formData.is_holiday ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 px-3 py-1.5"
                onClick={() => handleInputChange('is_holiday', !formData.is_holiday)}
              >
                🎉 Tatil
              </Badge>
              <Badge
                variant={formData.is_rush_hour ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 px-3 py-1.5"
                onClick={() => handleInputChange('is_rush_hour', !formData.is_rush_hour)}
              >
                🚗 Yoğun Saat
              </Badge>
              <Badge
                variant={formData.school_zone ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 px-3 py-1.5"
                onClick={() => handleInputChange('school_zone', !formData.school_zone)}
              >
                🏫 Okul Bölgesi
              </Badge>
              <Badge
                variant={formData.construction_zone ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 px-3 py-1.5"
                onClick={() => handleInputChange('construction_zone', !formData.construction_zone)}
              >
                🚧 İnşaat Bölgesi
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
          className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Analiz Ediliyor...
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 mr-2" />
              Kaza Riskini Tahmin Et
            </>
          )}
        </Button>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <p className="text-sm font-medium">Risk faktörleri analiz ediliyor...</p>
                </div>
                <Progress value={66} className="w-full h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {prediction && !isLoading && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-slide-up hover-lift">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span>Risk Değerlendirme Sonuçları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Level with Visual Meter */}
            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
              <div className="flex-shrink-0">
                <RiskMeter
                  score={prediction.risk_score}
                  riskLevel={prediction.risk_level}
                  size={160}
                />
              </div>
              <div className="text-center lg:text-left flex-1 space-y-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Risk Değerlendirmesi Tamamlandı</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Sağlanan koşullara göre kaza risk seviyesi {prediction.confidence}% güvenle hesaplandı.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-xs text-gray-600 mb-1.5 font-medium">Analiz Özeti</div>
                  <div className="text-base font-semibold text-gray-900">
                    Risk Skoru: <span className="text-blue-600">{prediction.risk_score}/100</span> • 
                    Güven: <span className="text-indigo-600">{prediction.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Risk Faktörleri:</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {prediction.contributing_factors.map((factor, index) => (
                  <Badge key={index} variant="destructive" className="px-3 py-1.5 text-sm">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Güvenlik Önerileri:</span>
              </h3>
              <div className="space-y-2.5">
                {prediction.recommendations.map((rec, index) => (
                  <Alert key={index} className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-gray-700">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}