import { AccidentPredictionInput, AccidentRiskPrediction } from '@/types/dataset'

type Locale = 'tr' | 'en'

const messageTranslations: Record<string, string> = {
  // Weather
  '☁️ Bulutlu hava - görüş mesafesi azalmış olabilir': '☁️ Cloudy - visibility may be reduced',
  '🌧️ Yağışlı hava - yollar kaygan, takip mesafesini artırın': '🌧️ Rainy - roads are slippery, increase following distance',
  '🌫️ Sisli hava - görüş ciddi şekilde kısıtlı, sis farı kullanın': '🌫️ Foggy - severely limited visibility, use fog lights',
  '❄️ Karlı hava - buzlanma riski var, yavaş sürün': '❄️ Snowy - ice risk, drive slowly',
  '⛈️ Fırtına - seyahati mümkünse erteleyin': '⛈️ Storm - postpone travel if possible',
  '🥶 Dondurucu soğuk - buzlanma riski': '🥶 Freezing cold - ice risk',
  '🌡️ Aşırı sıcak - dikkat dağılabilir': '🌡️ Extreme heat - distraction risk',
  '👁️ Görüş mesafesi çok düşük': '👁️ Very low visibility',
  '👁️ Görüş mesafesi düşük': '👁️ Low visibility',
  '💨 Şiddetli rüzgar - direksiyon hakimiyetine dikkat': '💨 Strong wind - watch steering control',
  '💨 Kuvvetli rüzgar': '💨 Windy conditions',
  '✅ Hava koşulları uygun': '✅ Weather conditions are good',
  'Dondurucu soğuk': 'Freezing cold',
  'Aşırı sıcak': 'Extreme heat',
  'Çok düşük görüş': 'Very low visibility',
  'Düşük görüş': 'Low visibility',
  'Şiddetli rüzgar': 'Strong wind',
  'Kuvvetli rüzgar': 'Windy conditions',
  // Traffic
  '🚗 Yoğun trafik - takip mesafesine dikkat edin': '🚗 Heavy traffic - keep safe distance',
  '🚗 Çok yoğun trafik - sabırlı olun ve güvenli mesafe bırakın': '🚗 Very heavy traffic - stay patient and keep distance',
  '🚗 Yoğun araç trafiği': '🚗 High vehicle volume',
  '🚗 Orta yoğunlukta trafik': '🚗 Medium traffic',
  '✅ Trafik akışı normal': '✅ Traffic flow is normal',
  'Aşırı hız': 'Severe speeding',
  'Hız aşımı': 'Speeding',
  'Hafif hız aşımı': 'Light speeding',
  'Yoğun araç trafiği': 'High vehicle volume',
  'Orta yoğunlukta trafik': 'Medium traffic',
  // Road
  '🛣️ Yol durumu orta - dikkatli sürün': '🛣️ Fair road condition - drive carefully',
  '🛣️ Yol durumu kötü - çukur ve bozuklara dikkat': '🛣️ Poor road condition - watch for potholes',
  '🛣️ Yüksek hızlı otoyol - mesafe koruyun': '🛣️ High-speed highway - maintain distance',
  '🛤️ Kırsal yol - aydınlatma yetersiz olabilir': '🛤️ Rural road - lighting may be poor',
  '🚧 Tek şeritli yol - sollama zorlaşır': '🚧 Single-lane road - overtaking is difficult',
  '🛣️ Çok şeritli yol - şerit değiştirirken dikkat': '🛣️ Multi-lane road - be careful changing lanes',
  '⚠️ Yol ver kavşağı - önceliğe dikkat': '⚠️ Yield intersection - watch right of way',
  '🔄 Dönel kavşak - dönüş yönüne dikkat': '🔄 Roundabout - mind the flow direction',
  '✅ Yol koşulları uygun': '✅ Road conditions are fine',
  'Otoyol': 'Highway',
  'Kırsal yol': 'Rural road',
  'Tek şerit': 'Single lane',
  'Çok şeritli': 'Multi-lane',
  'Yol ver işareti': 'Yield sign',
  'Dönel kavşak': 'Roundabout',
  // Time
  '⏰ Saat yoğun trafik saati - sabırlı olun': '⏰ Rush hour - stay patient',
  '🌙 Gece sürüşü - görüş azalmış, uykuya dikkat': '🌙 Night driving - reduced visibility, stay alert',
  '🌅 Sabah trafiği - güneş gözünüze gelebilir': '🌅 Morning traffic - sun glare possible',
  '🌆 Akşam trafiği - yorgunluk artmış olabilir': '🌆 Evening traffic - fatigue may be higher',
  '📅 Hafta sonu - beklenmedik trafik olabilir': '📅 Weekend - unexpected traffic possible',
  '🎉 Tatil günü - alkollü sürücülere dikkat': '🎉 Holiday - watch for impaired drivers',
  '❄️ Kış mevsimi - erken karanlık, buzlanma riski': '❄️ Winter season - early darkness, ice risk',
  '✅ Zaman koşulları uygun': '✅ Time conditions are favorable',
  'Gece sürüşü': 'Night driving',
  'Sabah trafiği': 'Morning traffic',
  'Akşam trafiği': 'Evening traffic',
  'Hafta sonu': 'Weekend',
  'Tatil günü': 'Holiday',
  'Kış mevsimi': 'Winter season',
  // Location
  '🏙️ Şehir içi - yaya ve bisikletlilere dikkat': '🏙️ Urban area - watch for pedestrians and cyclists',
  '🌾 Kırsal bölge - hayvan geçişine dikkat': '🌾 Rural area - watch for animals',
  '🏫 Okul bölgesi - çocuklara dikkat, yavaşlayın': '🏫 School zone - watch for children, slow down',
  '🚧 İnşaat bölgesi - işçilere dikkat, işaretleri takip edin': '🚧 Construction zone - mind workers, follow signs',
  '✅ Konum koşulları uygun': '✅ Location conditions are fine',
  'Okul bölgesi': 'School zone',
  'İnşaat bölgesi': 'Construction zone',
  // Driver
  '🍺 Alkol tespit edildi - refleksleriniz yavaşlamış olabilir': '🍺 Alcohol detected - your reflexes may be slower',
  '🍺 Orta seviye alkol - ARAÇ KULLANMAYIN': '🍺 Moderate alcohol - DO NOT DRIVE',
  '🍺 Yüksek alkol - KRİTİK TEHLİKE, kesinlikle kullanmayın': '🍺 High alcohol - CRITICAL DANGER, do not drive',
  '🍺 Ağır sarhoşluk - AŞIRI TEHLİKE, acil yardım alın': '🍺 Severe intoxication - EXTREME DANGER, seek help',
  '😐 Normal yorgunluk seviyesi': '😐 Normal fatigue level',
  '😴 Yorgunsunuz - 15-20 dk mola verin': '😴 You are tired - take a 15-20 min break',
  '😴 Çok yorgunsunuz - seyahati erteleyin veya şoför değiştirin': '😴 Very tired - postpone travel or change driver',
  '🔰 Orta seviye tecrübe - dikkatli sürün': '🔰 Intermediate experience - drive carefully',
  '🔰 Acemi sürücü - zorlu koşullarda ekstra dikkat': '🔰 New driver - extra caution in tough conditions',
  '🔴 Emniyet kemeri takılı değil - kaza anında ölüm riski 30x artar!': '🔴 Seatbelt not fastened - fatality risk increases 30x',
  '🔧 Araç bakımı yapılmamış - lastik, fren, yağ kontrolü yapın': '🔧 Vehicle not maintained - check tires, brakes, oil',
  'İyi sürücü ve araç koşulları': 'Good driver and vehicle conditions',
  'Normal yorgunluk': 'Normal fatigue',
  'Yorgun': 'Tired',
  'Çok yorgun': 'Very tired',
  'Orta tecrübe': 'Intermediate experience',
  'Acemi sürücü': 'New driver',
  'KEMER YOK': 'NO SEATBELT',
  'Araç kontrol edilmemiş': 'Vehicle not checked',
  // Recommendations
  'İşte alkol kullanmayınız. Yasal sınırı aşıyorsunuz.': 'Do not drive after drinking. You are over the legal limit.',
  '⚠️ Ehliyet iptali + Ceza riski!': '⚠️ License revocation + fine risk!',
  '🚕 Taksi veya toplu taşıma kullan': '🚕 Use a taxi or public transport',
  '⚠️ Yasal sınırın altında, yine de dikkat!': '⚠️ Below legal limit, still be careful!',
  "🔴 Kemer tak! KKTC'de zorunlu": '🔴 Wear a seatbelt! Mandatory in KKTC',
  '😴 Çok yorgunsun, sürme!': "😴 You're very tired, don't drive!",
  '😴 Yorgunsun, 15 dk mola ver': '😴 You are tired, take a 15 min break',
  '🔧 Araç bakımını kontrol et': '🔧 Check vehicle maintenance',
  '🔰 Yeni sürücü: Gündüz sür': '🔰 New driver: drive in daylight',
  '🌧️ Yağmurda hız %20 azalt': '🌧️ Reduce speed by 20% in rain',
  '❄️ Buzda ani fren yapma': '❄️ Avoid sudden braking on ice',
  '🌫️ Siste kısa far kullan': '🌫️ Use low beams in fog',
  '⛈️ Fırtınada park et, bekle': '⛈️ Park and wait during storms',
  '🚗 3 sn takip mesafesi koru': '🚗 Keep a 3-second following distance',
  '🐢 Çok yavaş, trafiği engelleme': "🐢 Too slow, don't block traffic",
  '🌙 Gece farlarını kontrol et': '🌙 Check your lights at night',
  '⏰ Yoğun saat: Sabırlı ol': '⏰ Rush hour: stay patient',
  '🏫 Okul bölgesi: Yavaşla': '🏫 School zone: slow down',
  '🚧 İnşaat: İşaretleri takip et': '🚧 Construction: follow the signs',
  '⚠️ Yüksek risk: Seyahati ertele': '⚠️ High risk: postpone the trip',
  '✅ Güvenli sürüş, iyi yolculuklar': '✅ Safe driving, have a good trip'
}

const patternTranslations: Array<{ pattern: RegExp; translate: (match: RegExpMatchArray) => string }> = [
  {
    pattern: /Hız limiti çok aşılmış \((\d+)\s*km\/h\)/,
    translate: (m) => `🚨 Speed limit heavily exceeded (${m[1]} km/h)`
  },
  {
    pattern: /Hız limiti aşılmış \((\d+)\s*km\/h\)/,
    translate: (m) => `⚠️ Speed limit exceeded (${m[1]} km/h)`
  },
  {
    pattern: /Hafif hız aşımı \((\d+)\s*km\/h\)/,
    translate: (m) => `⚠️ Slight overspeed (${m[1]} km/h)`
  },
  {
    pattern: /Hız limitini aştın! \((\d+)\s*km\/h\)/,
    translate: (m) => `🚨 You exceeded the speed limit! (${m[1]} km/h)`
  },
  {
    pattern: /Limiti aştın: (\d+)\s*km\/h/,
    translate: (m) => `⚠️ Limit exceeded: ${m[1]} km/h`
  }
]

function translateMessage(message: string, locale: Locale): string {
  if (locale !== 'en') return message
  if (messageTranslations[message]) {
    return messageTranslations[message]
  }

  for (const { pattern, translate } of patternTranslations) {
    const match = message.match(pattern)
    if (match) return translate(match)
  }

  return message
}

function translateList(messages: string[], locale: Locale): string[] {
  return messages.map(msg => translateMessage(msg, locale))
}

interface RiskFactor {
  name: string
  weight: number
  score: number
  reason: string
}

export function predictAccidentRisk(input: AccidentPredictionInput, locale: Locale = 'tr'): AccidentRiskPrediction {
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

  // Generate contributing factors (açıklamalı uyarılar)
  // Her faktörün reason'ını | ile ayırıp ayrı ayrı liste yap
  const contributingFactors = riskFactors
    .filter(factor => factor.score > 30)
    .sort((a, b) => b.score - a.score)
    .flatMap(factor => factor.reason.split(' | ').map(r => r.trim()).filter(r => r.length > 0))
    .slice(0, 8) // max 8 uyarı göster

  const recommendations = generateRecommendations(input, riskFactors)

  // Calculate confidence based on number of factors and score certainty
  const confidence = calculateConfidence(riskFactors, normalizedScore)

  return {
    risk_level: riskLevel,
    risk_score: Math.round(normalizedScore),
    confidence: Math.round(confidence),
    contributing_factors: translateList(contributingFactors, locale),
    recommendations: translateList(recommendations, locale)
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
      reason = '☁️ Bulutlu hava - görüş mesafesi azalmış olabilir'
      break
    case 'rain':
      score += 40
      reason = '🌧️ Yağışlı hava - yollar kaygan, takip mesafesini artırın'
      break
    case 'fog':
      score += 60
      reason = '🌫️ Sisli hava - görüş ciddi şekilde kısıtlı, sis farı kullanın'
      break
    case 'snow':
      score += 70
      reason = '❄️ Karlı hava - buzlanma riski var, yavaş sürün'
      break
    case 'storm':
      score += 85
      reason = '⛈️ Fırtına - seyahati mümkünse erteleyin'
      break
  }

  // Temperature effects
  if (input.temperature < 0) {
    score += 25
    reason += reason ? ' | Dondurucu soğuk' : '🥶 Dondurucu soğuk - buzlanma riski'
  } else if (input.temperature > 35) {
    score += 15
    reason += reason ? ' | Aşırı sıcak' : '🌡️ Aşırı sıcak - dikkat dağılabilir'
  }

  // Visibility effects
  if (input.visibility < 1) {
    score += 50
    reason += reason ? ' | Çok düşük görüş' : '👁️ Görüş mesafesi çok düşük'
  } else if (input.visibility < 5) {
    score += 25
    reason += reason ? ' | Düşük görüş' : '👁️ Görüş mesafesi düşük'
  }

  // Wind effects
  if (input.wind_speed > 60) {
    score += 30
    reason += reason ? ' | Şiddetli rüzgar' : '💨 Şiddetli rüzgar - direksiyon hakimiyetine dikkat'
  } else if (input.wind_speed > 40) {
    score += 15
    reason += reason ? ' | Kuvvetli rüzgar' : '💨 Kuvvetli rüzgar'
  }

  return {
    name: 'Hava',
    weight: 0.25,
    score: Math.min(100, score),
    reason: reason || '✅ Hava koşulları uygun'
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
      reason = '🚗 Yoğun trafik - takip mesafesine dikkat edin'
      break
    case 'very_high':
      score += 60
      reason = '🚗 Çok yoğun trafik - sabırlı olun ve güvenli mesafe bırakın'
      break
  }

  // Speed-related risk - sadece limit aşıldığında
  if (input.average_speed > input.speed_limit) {
    const overSpeed = input.average_speed - input.speed_limit
    if (overSpeed > 30) {
      score += 50
      reason += reason ? ' | Aşırı hız' : `🚨 Hız limiti çok aşılmış (${input.speed_limit} km/h)`
    } else if (overSpeed > 15) {
      score += 30
      reason += reason ? ' | Hız aşımı' : `⚠️ Hız limiti aşılmış (${input.speed_limit} km/h)`
    } else if (overSpeed > 5) {
      score += 15
      reason += reason ? ' | Hafif hız aşımı' : `⚠️ Hafif hız aşımı (${input.speed_limit} km/h)`
    }
  }

  // Vehicle count effects
  if (input.vehicle_count > 1000) {
    score += 25
    reason += reason ? ' | Yoğun araç trafiği' : '🚗 Yoğun araç trafiği'
  } else if (input.vehicle_count > 500) {
    score += 15
    reason += reason ? ' | Orta yoğunlukta trafik' : '🚗 Orta yoğunlukta trafik'
  }

  return {
    name: 'Trafik',
    weight: 0.15,
    score: Math.min(100, score),
    reason: reason || '✅ Trafik akışı normal'
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
      reason = '🛣️ Yol durumu orta - dikkatli sürün'
      break
    case 'poor':
      score += 50
      reason = '🛣️ Yol durumu kötü - çukur ve bozuklara dikkat'
      break
  }

  // Road type risk
  switch (input.road_type) {
    case 'highway':
      score += 20
      reason += reason ? ' | Otoyol' : '🛣️ Yüksek hızlı otoyol - mesafe koruyun'
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
      reason += reason ? ' | Kırsal yol' : '🛤️ Kırsal yol - aydınlatma yetersiz olabilir'
      break
  }

  // Lane configuration
  if (input.number_of_lanes === 1) {
    score += 20
    reason += reason ? ' | Tek şerit' : '🚧 Tek şeritli yol - sollama zorlaşır'
  } else if (input.number_of_lanes > 6) {
    score += 15
    reason += reason ? ' | Çok şeritli' : '🛣️ Çok şeritli yol - şerit değiştirirken dikkat'
  }

  // Intersection risk
  switch (input.intersection_type) {
    case 'none':
      score += 0
      break
    case 'yield':
      score += 15
      reason += reason ? ' | Yol ver işareti' : '⚠️ Yol ver kavşağı - önceliğe dikkat'
      break
    case 'stop_sign':
      score += 10
      break
    case 'traffic_light':
      score += 5
      break
    case 'roundabout':
      score += 20
      reason += reason ? ' | Dönel kavşak' : '🔄 Dönel kavşak - dönüş yönüne dikkat'
      break
  }

  return {
    name: 'Yol',
    weight: 0.10,
    score: Math.min(100, score),
    reason: reason || '✅ Yol koşulları uygun'
  }
}

function calculateTimeRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Rush hour effects
  if (input.is_rush_hour) {
    score += 30
    reason = '⏰ Saat yoğun trafik saati - sabırlı olun'
  }

  // Hour of day effects
  if (input.hour_of_day >= 22 || input.hour_of_day <= 5) {
    score += 35
    reason += reason ? ' | Gece sürüşü' : '🌙 Gece sürüşü - görüş azalmış, uykuya dikkat'
  } else if (input.hour_of_day >= 6 && input.hour_of_day <= 9) {
    score += 20
    reason += reason ? ' | Sabah trafiği' : '🌅 Sabah trafiği - güneş gözünüze gelebilir'
  } else if (input.hour_of_day >= 16 && input.hour_of_day <= 19) {
    score += 25
    reason += reason ? ' | Akşam trafiği' : '🌆 Akşam trafiği - yorgunluk artmış olabilir'
  }

  // Weekend effects
  if (input.day_of_week === 'saturday' || input.day_of_week === 'sunday') {
    score += 15
    reason += reason ? ' | Hafta sonu' : '📅 Hafta sonu - beklenmedik trafik olabilir'
  }

  // Holiday effects
  if (input.is_holiday) {
    score += 20
    reason += reason ? ' | Tatil günü' : '🎉 Tatil günü - alkollü sürücülere dikkat'
  }

  // Winter months (higher accident rates)
  if (input.month >= 11 || input.month <= 2) {
    score += 15
    reason += reason ? ' | Kış mevsimi' : '❄️ Kış mevsimi - erken karanlık, buzlanma riski'
  }

  return {
    name: 'Zaman',
    weight: 0.10,
    score: Math.min(100, score),
    reason: reason || '✅ Zaman koşulları uygun'
  }
}

function calculateLocationRisk(input: AccidentPredictionInput): RiskFactor {
  let score = 0
  let reason = ''

  // Urban vs rural
  switch (input.urban_rural) {
    case 'urban':
      score += 25
      reason = '🏙️ Şehir içi - yaya ve bisikletlilere dikkat'
      break
    case 'suburban':
      score += 15
      break
    case 'rural':
      score += 20
      reason = '🌾 Kırsal bölge - hayvan geçişine dikkat'
      break
  }

  // Special zones
  if (input.school_zone) {
    score += 20
    reason += reason ? ' | Okul bölgesi' : '🏫 Okul bölgesi - çocuklara dikkat, yavaşlayın'
  }

  if (input.construction_zone) {
    score += 35
    reason += reason ? ' | İnşaat bölgesi' : '🚧 İnşaat bölgesi - işçilere dikkat, işaretleri takip edin'
  }

  return {
    name: 'Konum',
    weight: 0.05,
    score: Math.min(100, score),
    reason: reason || '✅ Konum koşulları uygun'
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
      reason = '🍺 Alkol tespit edildi - refleksleriniz yavaşlamış olabilir'
      break
    case 'moderate':
      score += 70
      reason = '🍺 Orta seviye alkol - ARAÇ KULLANMAYIN'
      break
    case 'heavy':
      score += 90
      reason = '🍺 Yüksek alkol - KRİTİK TEHLİKE, kesinlikle kullanmayın'
      break
    case 'severe':
      score += 100
      reason = '🍺 Ağır sarhoşluk - AŞIRI TEHLİKE, acil yardım alın'
      break
  }

  // DRIVER FATIGUE
  switch (input.driver_fatigue) {
    case 'fresh':
      score += 0
      break
    case 'normal':
      score += 10
      reason += reason ? ' | Normal yorgunluk' : '😐 Normal yorgunluk seviyesi'
      break
    case 'tired':
      score += 35
      reason += reason ? ' | Yorgun' : '😴 Yorgunsunuz - 15-20 dk mola verin'
      break
    case 'very_tired':
      score += 60
      reason += reason ? ' | Çok yorgun' : '😴 Çok yorgunsunuz - seyahati erteleyin veya şoför değiştirin'
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
      reason += reason ? ' | Orta tecrübe' : '🔰 Orta seviye tecrübe - dikkatli sürün'
      break
    case 'beginner':
      score += 30
      reason += reason ? ' | Acemi sürücü' : '🔰 Acemi sürücü - zorlu koşullarda ekstra dikkat'
      break
  }

  // SEATBELT USAGE - Critical safety factor
  if (!input.seatbelt_usage) {
    score += 50
    reason += reason ? ' | KEMER YOK' : '🔴 Emniyet kemeri takılı değil - kaza anında ölüm riski 30x artar!'
  }

  // VEHICLE MAINTENANCE
  if (!input.vehicle_maintenance_check) {
    score += 25
    reason += reason ? ' | Araç kontrol edilmemiş' : '🔧 Araç bakımı yapılmamış - lastik, fren, yağ kontrolü yapın'
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
      recommendations.push('İşte alkol kullanmayınız. Yasal sınırı aşıyorsunuz.')
      recommendations.push('⚠️ Ehliyet iptali + Ceza riski!')
    } else if (input.alcohol_consumption === 'moderate') {
      recommendations.push('İşte alkol kullanmayınız. Yasal sınırı aşıyorsunuz.')
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
