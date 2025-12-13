import { AccidentPredictionInput, AccidentRiskPrediction } from '@/types/dataset'

interface RiskFactor {
  name: string
  weight: number
  score: number
  reason: string
}

export function predictAccidentRisk(input: AccidentPredictionInput): AccidentRiskPrediction {
  const riskFactors: RiskFactor[] = []

  // Weather risk scoring
  const weatherRisk = calculateWeatherRisk(input)
  if (weatherRisk.score > 0) riskFactors.push(weatherRisk)

  // Traffic risk scoring
  const trafficRisk = calculateTrafficRisk(input)
  if (trafficRisk.score > 0) riskFactors.push(trafficRisk)

  // Road risk scoring
  const roadRisk = calculateRoadRisk(input)
  if (roadRisk.score > 0) riskFactors.push(roadRisk)

  // Time risk scoring
  const timeRisk = calculateTimeRisk(input)
  if (timeRisk.score > 0) riskFactors.push(timeRisk)

  // Location risk scoring
  const locationRisk = calculateLocationRisk(input)
  if (locationRisk.score > 0) riskFactors.push(locationRisk)

  // Driver & Vehicle risk scoring (MOST IMPORTANT - highest weight)
  const driverVehicleRisk = calculateDriverVehicleRisk(input)
  if (driverVehicleRisk.score > 0) riskFactors.push(driverVehicleRisk)

  // Calculate weighted total score
  const totalScore = riskFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
  const maxPossibleScore = riskFactors.reduce((sum, factor) => sum + (100 * factor.weight), 0)
  const normalizedScore = maxPossibleScore > 0 ? Math.min(100, (totalScore / maxPossibleScore) * 100) : 0

  // Determine risk level
  const riskLevel = getRiskLevel(normalizedScore)

  // Generate contributing factors and recommendations
  const contributingFactors = riskFactors
    .filter(factor => factor.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(factor => factor.name)

  const recommendations = generateRecommendations(input, riskFactors)

  // Calculate confidence based on number of factors and score certainty
  const confidence = calculateConfidence(riskFactors, normalizedScore)

  return {
    risk_level: riskLevel,
    risk_score: Math.round(normalizedScore),
    confidence: Math.round(confidence),
    contributing_factors: contributingFactors,
    recommendations: recommendations
  }
}

function calculateWeatherRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Weather condition scoring
  switch (input.weather_condition) {
    case 'clear':
      score += 0
      break
    case 'cloudy':
      score += 10
      reason = 'Reduced visibility'
      break
    case 'rain':
      score += 40
      reason = 'Slippery roads and reduced visibility'
      break
    case 'fog':
      score += 60
      reason = 'Severely reduced visibility'
      break
    case 'snow':
      score += 70
      reason = 'Icy conditions and poor visibility'
      break
    case 'storm':
      score += 85
      reason = 'Extreme weather conditions'
      break
  }

  // Temperature effects
  if (input.temperature < 0) {
    score += 25
    reason += ', freezing conditions'
  } else if (input.temperature > 35) {
    score += 15
    reason += ', extreme heat affecting driver alertness'
  }

  // Visibility effects
  if (input.visibility < 1) {
    score += 50
    reason += ', very poor visibility'
  } else if (input.visibility < 5) {
    score += 25
    reason += ', reduced visibility'
  }

  // Wind effects
  if (input.wind_speed > 60) {
    score += 30
    reason += ', strong winds'
  } else if (input.wind_speed > 40) {
    score += 15
    reason += ', moderate winds'
  }

  // Humidity effects
  if (input.humidity > 90) {
    score += 10
    reason += ', high humidity reducing comfort'
  }

  return {
    name: 'Hava',
    weight: 0.25,
    score: Math.min(100, score),
    reason: reason || 'İyi hava koşulları'
  }
}

function calculateTrafficRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Traffic density scoring
  switch (input.traffic_density) {
    case 'low':
      score += 5
      break
    case 'medium':
      score += 15
      break
    case 'high':
      score += 35
      reason = 'High traffic density'
      break
    case 'very_high':
      score += 60
      reason = 'Very high traffic density'
      break
  }

  // Speed-related risk - sadece limit aşıldığında
  if (input.average_speed > input.speed_limit) {
    const overSpeed = input.average_speed - input.speed_limit
    if (overSpeed > 30) {
      score += 50
      reason += ', aşırı hız'
    } else if (overSpeed > 15) {
      score += 30
      reason += ', hız limiti aşıldı'
    } else if (overSpeed > 5) {
      score += 15
      reason += ', hafif hız aşımı'
    }
  }

  // Vehicle count effects
  if (input.vehicle_count > 1000) {
    score += 25
    reason += ', heavy traffic volume'
  } else if (input.vehicle_count > 500) {
    score += 15
    reason += ', moderate traffic volume'
  }

  return {
    name: 'Trafik',
    weight: 0.15,
    score: Math.min(100, score),
    reason: reason || 'Normal trafik koşulları'
  }
}

function calculateRoadRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Road condition scoring
  switch (input.road_condition) {
    case 'excellent':
      score += 0
      break
    case 'good':
      score += 5
      break
    case 'fair':
      score += 25
      reason = 'Fair road conditions'
      break
    case 'poor':
      score += 50
      reason = 'Poor road conditions'
      break
  }

  // Road type risk
  switch (input.road_type) {
    case 'highway':
      score += 20
      reason += ', high-speed highway'
      break
    case 'arterial':
      score += 15
      break
    case 'collector':
      score += 10
      break
    case 'local':
      score += 5
      break
    case 'rural':
      score += 25
      reason += ', rural road conditions'
      break
  }

  // Lane configuration
  if (input.number_of_lanes === 1) {
    score += 20
    reason += ', single lane'
  } else if (input.number_of_lanes > 6) {
    score += 15
    reason += ', complex multi-lane configuration'
  }

  // Intersection risk
  switch (input.intersection_type) {
    case 'none':
      score += 0
      break
    case 'yield':
      score += 15
      reason += ', yield intersection'
      break
    case 'stop_sign':
      score += 10
      break
    case 'traffic_light':
      score += 5
      break
    case 'roundabout':
      score += 20
      reason += ', roundabout complexity'
      break
  }

  return {
    name: 'Yol',
    weight: 0.10,
    score: Math.min(100, score),
    reason: reason || 'İyi yol koşulları'
  }
}

function calculateTimeRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Rush hour effects
  if (input.is_rush_hour) {
    score += 30
    reason = 'Rush hour traffic'
  }

  // Hour of day effects
  if (input.hour_of_day >= 22 || input.hour_of_day <= 5) {
    score += 35
    reason += ', nighttime driving'
  } else if (input.hour_of_day >= 6 && input.hour_of_day <= 9) {
    score += 20
    reason += ', morning rush hour'
  } else if (input.hour_of_day >= 16 && input.hour_of_day <= 19) {
    score += 25
    reason += ', evening rush hour'
  }

  // Weekend effects
  if (input.day_of_week === 'saturday' || input.day_of_week === 'sunday') {
    score += 15
    reason += ', weekend traffic patterns'
  }

  // Holiday effects
  if (input.is_holiday) {
    score += 20
    reason += ', holiday traffic'
  }

  // Winter months (higher accident rates)
  if (input.month >= 11 || input.month <= 2) {
    score += 15
    reason += ', winter season'
  }

  return {
    name: 'Zaman',
    weight: 0.10,
    score: Math.min(100, score),
    reason: reason || 'Normal zaman koşulları'
  }
}

function calculateLocationRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Urban vs rural
  switch (input.urban_rural) {
    case 'urban':
      score += 25
      reason = 'Urban area complexity'
      break
    case 'suburban':
      score += 15
      break
    case 'rural':
      score += 20
      reason = 'Rural road conditions'
      break
  }

  // Special zones
  if (input.school_zone) {
    score += 20
    reason += ', school zone'
  }

  if (input.construction_zone) {
    score += 35
    reason += ', construction zone'
  }

  return {
    name: 'Konum',
    weight: 0.05,
    score: Math.min(100, score),
    reason: reason || 'Normal konum koşulları'
  }
}

function calculateDriverVehicleRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // ALCOHOL CONSUMPTION - Most critical factor!
  switch (input.alcohol_consumption) {
    case 'none':
      score += 0
      break
    case 'light':
      score += 40
      reason = '🍺 Alcohol consumption detected (light)'
      break
    case 'moderate':
      score += 70
      reason = '🍺 Moderate alcohol consumption - UNSAFE TO DRIVE'
      break
    case 'heavy':
      score += 90
      reason = '🍺 Heavy alcohol consumption - CRITICAL DANGER'
      break
    case 'severe':
      score += 100
      reason = '🍺 Severe intoxication - EXTREME DANGER'
      break
  }

  // DRIVER FATIGUE
  switch (input.driver_fatigue) {
    case 'fresh':
      score += 0
      break
    case 'normal':
      score += 10
      reason += reason ? ', normal tiredness' : 'Normal tiredness'
      break
    case 'tired':
      score += 35
      reason += reason ? ', driver is tired' : '😴 Driver is tired'
      break
    case 'very_tired':
      score += 60
      reason += reason ? ', driver is very tired' : '😴 Driver is very tired - HIGH RISK'
      break
  }

  // DRIVER EXPERIENCE
  switch (input.driver_experience) {
    case 'professional':
      score += 0
      break
    case 'experienced':
      score += 5
      break
    case 'intermediate':
      score += 15
      reason += reason ? ', intermediate driver' : 'Intermediate driver experience'
      break
    case 'beginner':
      score += 30
      reason += reason ? ', beginner driver' : '🔰 Beginner driver - less experience'
      break
  }

  // SEATBELT USAGE - Critical safety factor
  if (!input.seatbelt_usage) {
    score += 50
    reason += reason ? ', NO SEATBELT' : '⚠️ NO SEATBELT - Critical safety risk!'
  }

  // VEHICLE MAINTENANCE
  if (!input.vehicle_maintenance_check) {
    score += 25
    reason += reason ? ', vehicle not checked' : '🔧 Vehicle maintenance not performed'
  }

  return {
    name: 'Sürücü',
    weight: 0.35, // HIGHEST WEIGHT - driver factors are primary cause of accidents
    score: Math.min(100, score),
    reason: reason || 'İyi sürücü ve araç koşulları'
  }
}

function getRiskLevel(score: number): AccidentRiskPrediction['risk_level'] {
  if (score < 20) return 'very_low'
  if (score < 40) return 'low'
  if (score < 60) return 'medium'
  if (score < 80) return 'high'
  return 'very_high'
}

function generateRecommendations(input: AccidentPredictionInput, riskFactors: RiskFactor[]): string[] {
  const recommendations: string[] = []

  // ALKOL - KKTC yasal limit: 0.50 promil
  if (input.alcohol_consumption !== 'none') {
    if (input.alcohol_consumption === 'severe' || input.alcohol_consumption === 'heavy') {
      recommendations.push('🚨 KULLANMA! Yasal sınır aşıldı (0.50‰)')
      recommendations.push('⚠️ Ehliyet iptali + Ceza riski!')
    } else if (input.alcohol_consumption === 'moderate') {
      recommendations.push('🚨 KULLANMA! Yasal sınır aşıldı (0.50‰)')
      recommendations.push('🚕 Taksi veya toplu taşıma kullan')
    } else {
      recommendations.push('⚠️ Yasal sınırın altında, yine de dikkat!')
    }
  }

  // EMNİYET KEMERİ
  if (!input.seatbelt_usage) {
    recommendations.push('🔴 Kemer tak! KKTC\'de zorunlu')
  }

  // YORGUNLUK
  if (input.driver_fatigue === 'very_tired') {
    recommendations.push('😴 Çok yorgunsun, sürme!')
  } else if (input.driver_fatigue === 'tired') {
    recommendations.push('😴 Yorgunsun, 15 dk mola ver')
  }

  // ARAÇ BAKIMI
  if (!input.vehicle_maintenance_check) {
    recommendations.push('🔧 Araç bakımını kontrol et')
  }

  // YENİ SÜRÜCÜ
  if (input.driver_experience === 'beginner') {
    recommendations.push('🔰 Yeni sürücü: Gündüz sür')
  }

  // HAVA DURUMU
  if (input.weather_condition === 'rain') {
    recommendations.push('🌧️ Yağmurda hız %20 azalt')
  } else if (input.weather_condition === 'snow') {
    recommendations.push('❄️ Buzda ani fren yapma')
  } else if (input.weather_condition === 'fog') {
    recommendations.push('🌫️ Siste kısa far kullan')
  } else if (input.weather_condition === 'storm') {
    recommendations.push('⛈️ Fırtınada park et, bekle')
  }

  // TRAFİK
  if (input.traffic_density === 'high' || input.traffic_density === 'very_high') {
    recommendations.push('🚗 3 sn takip mesafesi koru')
  }

  // HIZ - Dinamik limit kontrolü
  if (input.average_speed > input.speed_limit) {
    const over = input.average_speed - input.speed_limit
    if (over > 20) {
      recommendations.push(`🚨 Hız limitini aştın! (${input.speed_limit} km/h)`)
    } else {
      recommendations.push(`⚠️ Limiti aştın: ${input.speed_limit} km/h`)
    }
  } else if (input.average_speed < input.speed_limit * 0.5) {
    recommendations.push('🐢 Çok yavaş, trafiği engelleme')
  }

  // GECE
  if (input.hour_of_day >= 22 || input.hour_of_day <= 5) {
    recommendations.push('🌙 Gece farlarını kontrol et')
  }

  // YOĞUN SAAT
  if (input.is_rush_hour) {
    recommendations.push('⏰ Yoğun saat: Sabırlı ol')
  }

  // OKUL BÖLGESİ
  if (input.school_zone) {
    recommendations.push('🏫 Okul bölgesi: Yavaşla')
  }

  // İNŞAAT BÖLGESİ
  if (input.construction_zone) {
    recommendations.push('🚧 İnşaat: İşaretleri takip et')
  }

  // YÜKSEK RİSK
  const highRiskFactors = riskFactors.filter(factor => factor.score > 50)
  if (highRiskFactors.length > 2) {
    recommendations.push('⚠️ Yüksek risk: Seyahati ertele')
  }

  // VARSAYILAN
  if (recommendations.length === 0) {
    recommendations.push('✅ Güvenli sürüş, iyi yolculuklar')
  }

  return recommendations.slice(0, 5)
}

function calculateConfidence(riskFactors: RiskFactor[], finalScore: number): number {
  // Base confidence starts high
  let confidence = 85

  // Reduce confidence if we have few risk factors to analyze
  if (riskFactors.length < 3) {
    confidence -= 15
  }

  // Reduce confidence for edge cases (very low or very high scores)
  if (finalScore < 10 || finalScore > 90) {
    confidence -= 10
  }

  // Increase confidence if multiple factors agree on risk level
  const highRiskFactors = riskFactors.filter(f => f.score > 50).length
  const lowRiskFactors = riskFactors.filter(f => f.score < 30).length

  if (highRiskFactors > 2 || lowRiskFactors > 3) {
    confidence += 10
  }

  return Math.max(60, Math.min(95, confidence))
}