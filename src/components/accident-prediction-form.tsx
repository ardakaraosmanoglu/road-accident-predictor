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
import { RouteFetcher } from '@/components/route-fetcher'
import { ProcessedWeatherData } from '@/lib/weather-api'
import { ProcessedRouteData } from '@/lib/maps-api'
import { CloudRain, Car, Map, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

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
    construction_zone: false
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

  const handleRouteData = (routeData: ProcessedRouteData) => {
    // Rota verilerini forma otomatik doldur
    const roadTypeMapping: { [key: string]: string } = {
      'highway': 'highway',
      'arterial': 'arterial',
      'collector': 'collector',
      'local': 'local'
    }

    // Ana yol tipini belirle (ilk tip)
    const primaryRoadType = routeData.road_types.length > 0
      ? (roadTypeMapping[routeData.road_types[0]] as 'highway' | 'arterial' | 'collector' | 'local' | 'rural') || 'arterial'
      : 'arterial'

    // Şerrit sayısını yol tipine göre tahmin et
    const estimatedLanes = (() => {
      if (routeData.road_types.includes('highway')) return 4
      if (routeData.road_types.includes('arterial')) return 3
      if (routeData.road_types.includes('collector')) return 2
      return 2
    })()

    // Hız limitini ortalama hız ve yol tipine göre tahmin et
    const estimatedSpeedLimit = (() => {
      if (routeData.road_types.includes('highway')) return Math.min(120, routeData.average_speed_kmh + 20)
      if (routeData.road_types.includes('arterial')) return Math.min(80, routeData.average_speed_kmh + 15)
      return Math.min(50, routeData.average_speed_kmh + 10)
    })()

    setFormData(prev => ({
      ...prev,
      // Trafik verileri
      traffic_density: routeData.traffic_density,
      average_speed: routeData.average_speed_kmh,
      vehicle_count: routeData.estimated_vehicle_count,

      // Yol düzeni verileri
      road_type: primaryRoadType,
      road_condition: routeData.road_conditions_estimated,
      number_of_lanes: estimatedLanes,
      speed_limit: estimatedSpeedLimit,
      urban_rural: routeData.urban_rural,

      // Kavşak tipini yol tipine göre tahmin et
      intersection_type: routeData.road_types.includes('highway') ? 'none' : 'traffic_light'
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
    <div className="space-y-6">
      {/* Weather Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real Weather Data Fetcher */}
          <div>
            <h4 className="font-medium mb-3 text-sm text-gray-700">Get Real Weather Data</h4>
            <WeatherFetcher onWeatherData={handleWeatherData} />
          </div>

          {/* Manual Weather Inputs */}
          <div>
            <h4 className="font-medium mb-3 text-sm text-gray-700">Manual Weather Input</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weather">Weather Condition</Label>
            <Select value={formData.weather_condition} onValueChange={(value) => handleInputChange('weather_condition', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="snow">Snow</SelectItem>
                <SelectItem value="fog">Fog</SelectItem>
                <SelectItem value="cloudy">Cloudy</SelectItem>
                <SelectItem value="storm">Storm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility (km)</Label>
            <Input
              id="visibility"
              type="number"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wind_speed">Wind Speed (km/h)</Label>
            <Input
              id="wind_speed"
              type="number"
              value={formData.wind_speed}
              onChange={(e) => handleInputChange('wind_speed', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="humidity">Humidity (%)</Label>
            <Input
              id="humidity"
              type="number"
              min="0"
              max="100"
              value={formData.humidity}
              onChange={(e) => handleInputChange('humidity', Number(e.target.value))}
              className="w-full"
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Traffic Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real Route Data Fetcher */}
          <div>
            <h4 className="font-medium mb-3 text-sm text-gray-700">Gerçek Rota ve Trafik Verilerini Al</h4>
            <RouteFetcher onRouteData={handleRouteData} />
          </div>

          {/* Manual Traffic Inputs */}
          <div>
            <h4 className="font-medium mb-3 text-sm text-gray-700">Manuel Trafik Girişi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="traffic_density">Traffic Density</Label>
            <Select value={formData.traffic_density} onValueChange={(value) => handleInputChange('traffic_density', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="average_speed">Average Speed (km/h)</Label>
            <Input
              id="average_speed"
              type="number"
              value={formData.average_speed}
              onChange={(e) => handleInputChange('average_speed', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_count">Vehicle Count (per hour)</Label>
            <Input
              id="vehicle_count"
              type="number"
              value={formData.vehicle_count}
              onChange={(e) => handleInputChange('vehicle_count', Number(e.target.value))}
              className="w-full"
            />
          </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Road Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Road Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="road_type">Road Type</Label>
            <Select value={formData.road_type} onValueChange={(value) => handleInputChange('road_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highway">Highway</SelectItem>
                <SelectItem value="arterial">Arterial</SelectItem>
                <SelectItem value="collector">Collector</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="road_condition">Road Condition</Label>
            <Select value={formData.road_condition} onValueChange={(value) => handleInputChange('road_condition', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_of_lanes">Number of Lanes</Label>
            <Input
              id="number_of_lanes"
              type="number"
              min="1"
              value={formData.number_of_lanes}
              onChange={(e) => handleInputChange('number_of_lanes', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speed_limit">Speed Limit (km/h)</Label>
            <Input
              id="speed_limit"
              type="number"
              value={formData.speed_limit}
              onChange={(e) => handleInputChange('speed_limit', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intersection_type">Intersection Type</Label>
            <Select value={formData.intersection_type} onValueChange={(value) => handleInputChange('intersection_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="traffic_light">Traffic Light</SelectItem>
                <SelectItem value="stop_sign">Stop Sign</SelectItem>
                <SelectItem value="roundabout">Roundabout</SelectItem>
                <SelectItem value="yield">Yield</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urban_rural">Area Type</Label>
            <Select value={formData.urban_rural} onValueChange={(value) => handleInputChange('urban_rural', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="suburban">Suburban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time & Context */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time & Context
            </CardTitle>
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">Auto-filled from device time</span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hour_of_day">Hour of Day (0-23)</Label>
            <Input
              id="hour_of_day"
              type="number"
              min="0"
              max="23"
              value={formData.hour_of_day}
              onChange={(e) => handleInputChange('hour_of_day', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select value={formData.day_of_week} onValueChange={(value) => handleInputChange('day_of_week', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month (1-12)</Label>
            <Input
              id="month"
              type="number"
              min="1"
              max="12"
              value={formData.month}
              onChange={(e) => handleInputChange('month', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Special Conditions</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={formData.is_holiday ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInputChange('is_holiday', !formData.is_holiday)}
              >
                Holiday
              </Badge>
              <Badge
                variant={formData.is_rush_hour ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInputChange('is_rush_hour', !formData.is_rush_hour)}
              >
                Rush Hour
              </Badge>
              <Badge
                variant={formData.school_zone ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInputChange('school_zone', !formData.school_zone)}
              >
                School Zone
              </Badge>
              <Badge
                variant={formData.construction_zone ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInputChange('construction_zone', !formData.construction_zone)}
              >
                Construction Zone
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Button */}
      <div className="text-center">
        <Button
          onClick={handlePredict}
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 text-lg"
        >
          {isLoading ? 'Analyzing Risk...' : 'Predict Accident Risk'}
        </Button>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Analyzing risk factors...</p>
              </div>
              <Progress value={66} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {prediction && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Level with Visual Meter */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <RiskMeter
                  score={prediction.risk_score}
                  riskLevel={prediction.risk_level}
                  size={180}
                />
              </div>
              <div className="text-center lg:text-left flex-1">
                <h3 className="text-2xl font-bold mb-2">Risk Assessment Complete</h3>
                <p className="text-gray-600 mb-4">
                  Based on the provided conditions, the accident risk level has been calculated
                  with {prediction.confidence}% confidence.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Analysis Summary</div>
                  <div className="font-semibold">
                    Risk Score: {prediction.risk_score}/100 • Confidence: {prediction.confidence}%
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Factors */}
            <div>
              <h3 className="font-semibold mb-3">Contributing Risk Factors:</h3>
              <div className="flex flex-wrap gap-2">
                {prediction.contributing_factors.map((factor, index) => (
                  <Badge key={index} variant="destructive">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3">Safety Recommendations:</h3>
              <div className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
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