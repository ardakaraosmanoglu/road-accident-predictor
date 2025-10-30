/**
 * Alkol Veritabanı - Kan Alkol Düzeyi (Promil) Tahmini ve Yasal Sınırlar
 *
 * ⚠️ ÖNEMLİ UYARI:
 * Bu veritabanı YALNIZCA KABA TAHMİNLER sunar. Promil seviyesi kişiye (kilo,
 * cinsiyet, metabolizma), zamana, açlık/tokluk durumuna ve birçok faktöre göre
 * BÜYÜK ÖLÇÜDE DEĞİŞİR. Bu tabloya güvenerek araç kullanmak SON DERECE RİSKLİDİR.
 *
 * Yasal ve güvenli olan tek davranış: ALKOL ALINDIYSA ARAÇ KULLANMAMAKTIR.
 */

export type AlcoholLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'severe'

export interface AlcoholData {
  level: AlcoholLevel
  promil_estimate: number // Promil tahmini (0.00 - 0.40)
  description: string
  warning: string
  wait_time_hours: number // Minimum bekleme süresi (saat)
  is_legal_hususi: boolean // 0.50 promil sınırı (hususi araç)
  is_legal_ticari: boolean // 0.20 promil sınırı (ticari araç)
}

/**
 * Yasal limitler (Türkiye)
 */
export const LEGAL_LIMITS = {
  HUSUSI_ARAC: 0.50, // Promil - Hususi araç yasal limiti
  TICARI_ARAC: 0.20, // Promil - Ticari araç yasal limiti
  SAFE_LIMIT: 0.00,  // Güvenli limit (sıfır tolerans önerilir)

  // Promil azalma hızı: Ortalama ~0.15 promil/saat
  AVERAGE_METABOLISM_RATE: 0.15
} as const

/**
 * İçki türleri ve standart porsiyonlar
 * Kullanıcının verdiği JSON veritabanından türetilmiştir
 */
export interface DrinkType {
  name: string
  source: string // Hammadde
  abv_range: string // Alkol oranı
  standard_portion: string // Standart porsiyon
  pure_alcohol_grams: number // Saf alkol gram
  promil_per_portion: number // Porsiyon başına ortalama promil (70kg kişi için)
}

export const DRINK_TYPES: Record<string, DrinkType> = {
  'bira': {
    name: 'Bira',
    source: 'Arpa maltı, şerbetçi otu',
    abv_range: '%4 - %9 (Ortalama ~%5)',
    standard_portion: '50 cl (1 şişe/kutu)',
    pure_alcohol_grams: 20,
    promil_per_portion: 0.28 // ~20g alkol → ~0.28 promil
  },
  'şarap': {
    name: 'Şarap',
    source: 'Üzüm',
    abv_range: '%9 - %15 (Ortalama ~%12.5)',
    standard_portion: '15 cl (1 kadeh)',
    pure_alcohol_grams: 15,
    promil_per_portion: 0.21 // ~15g alkol → ~0.21 promil
  },
  'şampanya': {
    name: 'Şampanya/Prosecco',
    source: 'Üzüm (ikinci fermantasyon)',
    abv_range: '%11 - %13 (Ortalama ~%12)',
    standard_portion: '15 cl (1 kadeh)',
    pure_alcohol_grams: 14,
    promil_per_portion: 0.20
  },
  'sake': {
    name: 'Sake',
    source: 'Pirinç',
    abv_range: '%15 - %16',
    standard_portion: '10 cl (Küçük karaf/bardak)',
    pure_alcohol_grams: 12,
    promil_per_portion: 0.17
  },
  'rakı': {
    name: 'Rakı',
    source: 'Üzüm (suma) + Anason',
    abv_range: '%40 - %50 (Genel %45)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 14.2,
    promil_per_portion: 0.20
  },
  'votka': {
    name: 'Votka',
    source: 'Patates / Buğday',
    abv_range: '%37 - %50 (Genel %40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'viski': {
    name: 'Whiskey',
    source: 'Arpa / Çavdar / Mısır',
    abv_range: '%40 - %50 (Genel %40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'gin': {
    name: 'Gin',
    source: 'Tahıl + ardıç aromaları',
    abv_range: '%40 - %47 (Genel ~%40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'tekila': {
    name: 'Tekila',
    source: 'Mavi agave',
    abv_range: '%38 - %55 (Genel %40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'rom': {
    name: 'Rom',
    source: 'Şeker kamışı / Melas',
    abv_range: '%37 - %50 (Genel %40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'konyak': {
    name: 'Konyak/Brandy',
    source: 'Şarabın damıtılmış hali',
    abv_range: '%35 - %60 (Genel %40)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 12.6,
    promil_per_portion: 0.18
  },
  'grappa': {
    name: 'Grappa',
    source: 'Üzüm kabuğu & çekirdek posası',
    abv_range: '%35 - %60 (Genel %45)',
    standard_portion: '4 cl (1 Tek)',
    pure_alcohol_grams: 14.2,
    promil_per_portion: 0.20
  }
}

/**
 * Alkol veritabanı - Anahtar kelime bazlı eşleştirme için
 */
export const ALCOHOL_DATABASE: Record<string, AlcoholData> = {
  // Alkol yok
  'hayır': {
    level: 'none',
    promil_estimate: 0.00,
    description: 'Alkol tüketimi yok',
    warning: '✅ Güvenli sürüş',
    wait_time_hours: 0,
    is_legal_hususi: true,
    is_legal_ticari: true
  },
  'yok': {
    level: 'none',
    promil_estimate: 0.00,
    description: 'Alkol tüketimi yok',
    warning: '✅ Güvenli sürüş',
    wait_time_hours: 0,
    is_legal_hususi: true,
    is_legal_ticari: true
  },
  'almadım': {
    level: 'none',
    promil_estimate: 0.00,
    description: 'Alkol tüketimi yok',
    warning: '✅ Güvenli sürüş',
    wait_time_hours: 0,
    is_legal_hususi: true,
    is_legal_ticari: true
  },

  // BİRA - Hafif tüketim (1-2 şişe)
  '1 bira': {
    level: 'light',
    promil_estimate: 0.28,
    description: '1 şişe bira (50cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol! Refleksler etkilenebilir.',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '2 bira': {
    level: 'moderate',
    promil_estimate: 0.56,
    description: '2 şişe bira (1L)',
    warning: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.',
    wait_time_hours: 4,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '3 bira': {
    level: 'heavy',
    promil_estimate: 0.84,
    description: '3 şişe bira (1.5L)',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 6,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '4 bira': {
    level: 'heavy',
    promil_estimate: 1.12,
    description: '4 şişe bira (2L)',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 8,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '5 bira': {
    level: 'severe',
    promil_estimate: 1.40,
    description: '5 şişe bira (2.5L)',
    warning: '🚨 AŞIRI TEHLİKELİ! Sağlık riski var!',
    wait_time_hours: 10,
    is_legal_hususi: false,
    is_legal_ticari: false
  },

  // ŞARAP - Çeşitli miktarlar
  '1 kadeh şarap': {
    level: 'light',
    promil_estimate: 0.21,
    description: '1 kadeh şarap (15cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol!',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '2 kadeh şarap': {
    level: 'light',
    promil_estimate: 0.42,
    description: '2 kadeh şarap (30cl)',
    warning: '⚠️ Yasal sınıra yakın, dikkatli sürün!',
    wait_time_hours: 3,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '3 kadeh şarap': {
    level: 'moderate',
    promil_estimate: 0.63,
    description: '3 kadeh şarap (45cl)',
    warning: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.',
    wait_time_hours: 5,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '4 kadeh şarap': {
    level: 'heavy',
    promil_estimate: 0.84,
    description: '4 kadeh şarap (60cl)',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 6,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '1 şişe şarap': {
    level: 'severe',
    promil_estimate: 1.05,
    description: 'Tam bir şişe şarap (75cl)',
    warning: '🚨 AŞIRI TEHLİKELİ! Sağlık riski var!',
    wait_time_hours: 8,
    is_legal_hususi: false,
    is_legal_ticari: false
  },

  // RAKI - Türkiye'ye özel
  '1 tek rakı': {
    level: 'light',
    promil_estimate: 0.20,
    description: '1 tek rakı (4cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol!',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '2 tek rakı': {
    level: 'moderate',
    promil_estimate: 0.40,
    description: '2 tek rakı (8cl)',
    warning: '⚠️ Yasal sınır içinde ama çok dikkatli!',
    wait_time_hours: 3,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '3 tek rakı': {
    level: 'moderate',
    promil_estimate: 0.60,
    description: '3 tek rakı (12cl)',
    warning: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.',
    wait_time_hours: 4,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '1 duble rakı': {
    level: 'light',
    promil_estimate: 0.40,
    description: '1 duble rakı (8cl)',
    warning: '⚠️ Yasal sınır içinde ama çok dikkatli!',
    wait_time_hours: 3,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '2 duble rakı': {
    level: 'heavy',
    promil_estimate: 0.80,
    description: '2 duble rakı (16cl)',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 6,
    is_legal_hususi: false,
    is_legal_ticari: false
  },

  // SERTİÇKİLER (Viski, Votka, Gin, vs.)
  '1 shot': {
    level: 'light',
    promil_estimate: 0.18,
    description: '1 shot sert içki (4cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol!',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: true
  },
  '2 shot': {
    level: 'light',
    promil_estimate: 0.36,
    description: '2 shot sert içki (8cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli!',
    wait_time_hours: 3,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '3 shot': {
    level: 'moderate',
    promil_estimate: 0.54,
    description: '3 shot sert içki (12cl)',
    warning: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.',
    wait_time_hours: 4,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '4 shot': {
    level: 'heavy',
    promil_estimate: 0.72,
    description: '4 shot sert içki (16cl)',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 5,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  '1 kadeh viski': {
    level: 'light',
    promil_estimate: 0.18,
    description: '1 kadeh viski (4cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol!',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: true
  },
  '2 kadeh viski': {
    level: 'light',
    promil_estimate: 0.36,
    description: '2 kadeh viski (8cl)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli!',
    wait_time_hours: 3,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '3 kadeh viski': {
    level: 'moderate',
    promil_estimate: 0.54,
    description: '3 kadeh viski (12cl)',
    warning: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.',
    wait_time_hours: 4,
    is_legal_hususi: false,
    is_legal_ticari: false
  },

  // KOKTEYLler
  '1 kokteyl': {
    level: 'light',
    promil_estimate: 0.25,
    description: '1 kokteyl (standart)',
    warning: '⚠️ Yasal sınır içinde ama dikkatli ol!',
    wait_time_hours: 2,
    is_legal_hususi: true,
    is_legal_ticari: false
  },
  '2 kokteyl': {
    level: 'moderate',
    promil_estimate: 0.50,
    description: '2 kokteyl',
    warning: '🚨 YASAL SINIRDASINIZ! Sürüş yapmayın.',
    wait_time_hours: 4,
    is_legal_hususi: true, // Tam sınırda
    is_legal_ticari: false
  },
  '3 kokteyl': {
    level: 'heavy',
    promil_estimate: 0.75,
    description: '3 kokteyl',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!',
    wait_time_hours: 5,
    is_legal_hususi: false,
    is_legal_ticari: false
  },

  // AŞIRI TÜKETİM
  'çok fazla': {
    level: 'severe',
    promil_estimate: 1.50,
    description: 'Aşırı alkol tüketimi',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski! Asla sürüş yapmayın!',
    wait_time_hours: 12,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  'sarhoşum': {
    level: 'severe',
    promil_estimate: 1.80,
    description: 'Sarhoşluk durumu',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski! Tıbbi yardım gerekebilir!',
    wait_time_hours: 14,
    is_legal_hususi: false,
    is_legal_ticari: false
  },
  'sarhoş': {
    level: 'severe',
    promil_estimate: 1.80,
    description: 'Sarhoşluk durumu',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski! Tıbbi yardım gerekebilir!',
    wait_time_hours: 14,
    is_legal_hususi: false,
    is_legal_ticari: false
  }
}

/**
 * Kullanıcı girdisinden alkol bilgisi arama
 * Akıllı eşleştirme ile en yakın sonucu döndürür
 */
export function searchAlcoholDatabase(input: string): AlcoholData | undefined {
  if (!input || input.trim() === '') return undefined

  const normalized = input.toLowerCase().trim()

  // Doğrudan eşleşme
  if (ALCOHOL_DATABASE[normalized]) {
    return ALCOHOL_DATABASE[normalized]
  }

  // Kısmi eşleştirme - anahtar kelimelere göre
  const matches = Object.keys(ALCOHOL_DATABASE).filter(key =>
    normalized.includes(key) || key.includes(normalized)
  )

  if (matches.length > 0) {
    // En uzun eşleşeni döndür (en spesifik)
    const bestMatch = matches.reduce((a, b) => a.length > b.length ? a : b)
    return ALCOHOL_DATABASE[bestMatch]
  }

  // Sayı tespiti ile akıllı eşleştirme
  const numberMatch = normalized.match(/(\d+)\s*(bira|şarap|rakı|viski|shot|kokteyl|kadeh)/i)
  if (numberMatch) {
    const [, count, drinkType] = numberMatch
    const key = `${count} ${drinkType.toLowerCase()}`
    if (ALCOHOL_DATABASE[key]) {
      return ALCOHOL_DATABASE[key]
    }
  }

  return undefined
}

/**
 * Alkol seviyesini döndür
 */
export function getAlcoholLevel(input: string): AlcoholLevel {
  if (!input || input.trim() === '') return 'none'

  const data = searchAlcoholDatabase(input)
  return data ? data.level : 'none'
}

/**
 * Tahmini promil değerini döndür
 */
export function estimatePromil(input: string): number {
  if (!input || input.trim() === '') return 0.00

  const data = searchAlcoholDatabase(input)
  return data ? data.promil_estimate : 0.00
}

/**
 * Bekleme süresi tavsiyesi (saat)
 */
export function getWaitTimeHours(input: string): number {
  if (!input || input.trim() === '') return 0

  const data = searchAlcoholDatabase(input)
  return data ? data.wait_time_hours : 0
}

/**
 * Promil değerine göre bekleme süresi hesapla
 */
export function calculateWaitTimeFromPromil(promil: number): number {
  if (promil <= 0) return 0

  // Promil azalma hızı: Ortalama 0.15/saat
  // Güvenli sınır: 0.00 (tam temizlenmesi için ekstra süre ekle)
  const hoursToZero = Math.ceil(promil / LEGAL_LIMITS.AVERAGE_METABOLISM_RATE)
  return hoursToZero + 1 // +1 saat emniyet payı
}

/**
 * Yasal sınır kontrolü (hususi araç)
 */
export function isLegalToDriveHususi(promil: number): boolean {
  return promil < LEGAL_LIMITS.HUSUSI_ARAC
}

/**
 * Yasal sınır kontrolü (ticari araç)
 */
export function isLegalToDriveTicari(promil: number): boolean {
  return promil < LEGAL_LIMITS.TICARI_ARAC
}

/**
 * Alkol seviyesine göre risk kategorisi
 */
export function getAlcoholRiskCategory(promil: number): {
  category: string
  color: string
  message: string
} {
  if (promil === 0) {
    return {
      category: 'Güvenli',
      color: 'green',
      message: '✅ Alkol tüketimi yok - Güvenli sürüş'
    }
  } else if (promil < LEGAL_LIMITS.TICARI_ARAC) {
    return {
      category: 'Çok Düşük',
      color: 'blue',
      message: '⚠️ Yasal sınır içinde (ticari araç hariç) - Yine de dikkatli olun'
    }
  } else if (promil < LEGAL_LIMITS.HUSUSI_ARAC) {
    return {
      category: 'Düşük',
      color: 'yellow',
      message: '⚠️ Yasal sınır içinde (hususi araç) - Dikkatli sürün, refleksler etkilenebilir'
    }
  } else if (promil < 0.80) {
    return {
      category: 'Orta',
      color: 'orange',
      message: '🚨 YASAL SINIR AŞILDI! Sürüş yapmamalısınız.'
    }
  } else if (promil < 1.20) {
    return {
      category: 'Yüksek',
      color: 'red',
      message: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın! Koordinasyon ciddi şekilde bozulmuştur.'
    }
  } else {
    return {
      category: 'Çok Yüksek',
      color: 'darkred',
      message: '🚨 AŞIRI TEHLİKELİ! Sağlık riski var! Tıbbi yardım alın, asla sürüş yapmayın!'
    }
  }
}

/**
 * Detaylı uyarı mesajı oluştur
 */
export function getDetailedAlcoholWarning(input: string): string {
  if (!input || input.trim() === '') {
    return '✅ Alkol tüketimi yok - Güvenli sürüş koşulları'
  }

  const data = searchAlcoholDatabase(input)
  if (!data) {
    return '⚠️ Alkol tüketimi tespit edildi ancak detay belirsiz. Güvenli tarafta olmak için sürüş yapmayın.'
  }

  const risk = getAlcoholRiskCategory(data.promil_estimate)
  const waitTime = data.wait_time_hours

  let warning = `${risk.message}\n\n`
  warning += `📊 Tahmini Promil: ${data.promil_estimate.toFixed(2)}‰\n`
  warning += `⏰ Önerilen Bekleme Süresi: En az ${waitTime} saat\n`

  if (!data.is_legal_hususi) {
    warning += `\n🚫 Hususi araç yasal sınırı (${LEGAL_LIMITS.HUSUSI_ARAC}‰) AŞILDI!`
  }
  if (!data.is_legal_ticari) {
    warning += `\n🚫 Ticari araç yasal sınırı (${LEGAL_LIMITS.TICARI_ARAC}‰) AŞILDI!`
  }

  return warning
}

/**
 * Alkol tüketimi var mı kontrolü
 */
export function hasAlcoholConsumption(input: string): boolean {
  if (!input || input.trim() === '') return false

  const level = getAlcoholLevel(input)
  return level !== 'none'
}
