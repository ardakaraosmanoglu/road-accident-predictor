// Road Accident Risk Prediction Dataset Structure
// Based on Kaggle dataset: predicting-road-accident-risk-vault

export interface AccidentPredictionInput {
  // Weather conditions
  weather_condition: 'clear' | 'rain' | 'snow' | 'fog' | 'cloudy' | 'storm'
  temperature: number // in Celsius
  visibility: number // in kilometers
  wind_speed: number // in km/h
  humidity: number // percentage

  // Traffic conditions
  traffic_density: 'low' | 'medium' | 'high' | 'very_high'
  average_speed: number // km/h
  vehicle_count: number // vehicles per hour

  // Road layout
  road_type: 'highway' | 'arterial' | 'collector' | 'local' | 'rural'
  road_condition: 'excellent' | 'good' | 'fair' | 'poor'
  number_of_lanes: number
  speed_limit: number // km/h
  intersection_type: 'none' | 'traffic_light' | 'stop_sign' | 'roundabout' | 'yield'

  // Time variables
  hour_of_day: number // 0-23
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  month: number // 1-12
  is_holiday: boolean
  is_rush_hour: boolean

  // Location factors
  urban_rural: 'urban' | 'suburban' | 'rural'
  school_zone: boolean
  construction_zone: boolean
}

export interface AccidentRiskPrediction {
  risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  risk_score: number // 0-100
  confidence: number // 0-100
  contributing_factors: string[]
  recommendations: string[]
}

export interface PredictionHistory {
  id: string
  timestamp: Date
  input: AccidentPredictionInput
  prediction: AccidentRiskPrediction
}