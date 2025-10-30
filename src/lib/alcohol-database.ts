/**
 * Alcohol Database for Blood Alcohol Content (BAC) Estimation
 *
 * This database maps common alcoholic beverages to their approximate
 * alcohol content and risk levels for driving safety assessment.
 *
 * Future: Will integrate with Gemini API for unknown/complex drink combinations
 */

export type AlcoholLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'severe'

export interface AlcoholData {
  level: AlcoholLevel
  bac_estimate: number // Blood Alcohol Content estimate (0.00 - 0.40)
  description: string
  warning: string
}

/**
 * Standard drink database
 * Keys are lowercase for case-insensitive matching
 */
export const ALCOHOL_DATABASE: Record<string, AlcoholData> = {
  // No alcohol
  'hayır': {
    level: 'none',
    bac_estimate: 0.00,
    description: 'Alkol tüketimi yok',
    warning: 'Güvenli sürüş'
  },
  'yok': {
    level: 'none',
    bac_estimate: 0.00,
    description: 'Alkol tüketimi yok',
    warning: 'Güvenli sürüş'
  },

  // Light consumption (1-2 drinks)
  '1 kadeh şarap': {
    level: 'light',
    bac_estimate: 0.02,
    description: '1 kadeh şarap (~150ml)',
    warning: 'Dikkatli sürüş gerekli'
  },
  '1 bira': {
    level: 'light',
    bac_estimate: 0.02,
    description: '1 şişe bira (~330ml)',
    warning: 'Dikkatli sürüş gerekli'
  },
  '1 shot': {
    level: 'light',
    bac_estimate: 0.025,
    description: '1 shot sert içki (~40ml)',
    warning: 'Dikkatli sürüş gerekli'
  },
  '2 kadeh şarap': {
    level: 'light',
    bac_estimate: 0.04,
    description: '2 kadeh şarap (~300ml)',
    warning: 'Sürüş önerilmez'
  },
  '2 bira': {
    level: 'light',
    bac_estimate: 0.04,
    description: '2 şişe bira (~660ml)',
    warning: 'Sürüş önerilmez'
  },

  // Moderate consumption (3-4 drinks)
  '3 kadeh şarap': {
    level: 'moderate',
    bac_estimate: 0.06,
    description: '3 kadeh şarap (~450ml)',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '3 bira': {
    level: 'moderate',
    bac_estimate: 0.06,
    description: '3 şişe bira (~1L)',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '2 kadeh viski': {
    level: 'moderate',
    bac_estimate: 0.05,
    description: '2 kadeh viski',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '2 shot rakı': {
    level: 'moderate',
    bac_estimate: 0.055,
    description: '2 shot rakı',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '4 kadeh şarap': {
    level: 'moderate',
    bac_estimate: 0.08,
    description: '4 kadeh şarap (~600ml)',
    warning: '🚨 SÜRÜŞ YAPMAYIN!'
  },
  '4 bira': {
    level: 'moderate',
    bac_estimate: 0.08,
    description: '4 şişe bira (~1.3L)',
    warning: '🚨 SÜRÜŞ YAPMAYIN!'
  },
  '3 shot': {
    level: 'moderate',
    bac_estimate: 0.075,
    description: '3 shot sert içki',
    warning: '🚨 SÜRÜŞ YAPMAYIN!'
  },

  // Heavy consumption (5-7 drinks)
  '5 kadeh şarap': {
    level: 'heavy',
    bac_estimate: 0.10,
    description: '5 kadeh şarap',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },
  '5 bira': {
    level: 'heavy',
    bac_estimate: 0.10,
    description: '5 şişe bira',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },
  '4 shot': {
    level: 'heavy',
    bac_estimate: 0.10,
    description: '4 shot sert içki',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },
  '3 kadeh viski': {
    level: 'heavy',
    bac_estimate: 0.095,
    description: '3 kadeh viski',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },
  '6 bira': {
    level: 'heavy',
    bac_estimate: 0.12,
    description: '6 şişe bira',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },
  '1 şişe şarap': {
    level: 'heavy',
    bac_estimate: 0.12,
    description: 'Tam bir şişe şarap',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  },

  // Severe consumption (8+ drinks or very high BAC)
  '7+ bira': {
    level: 'severe',
    bac_estimate: 0.15,
    description: '7 veya daha fazla bira',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski!'
  },
  '5+ shot': {
    level: 'severe',
    bac_estimate: 0.15,
    description: '5 veya daha fazla shot',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski!'
  },
  'çok fazla': {
    level: 'severe',
    bac_estimate: 0.20,
    description: 'Aşırı alkol tüketimi',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski!'
  },
  'sarhoşum': {
    level: 'severe',
    bac_estimate: 0.18,
    description: 'Sarhoşluk durumu',
    warning: '🚨 AŞIRI TEHLİKELİ! Acil sağlık riski!'
  },

  // Common mixed drinks
  '1 kokteyl': {
    level: 'light',
    bac_estimate: 0.03,
    description: '1 kokteyl (standart)',
    warning: 'Dikkatli sürüş gerekli'
  },
  '2 kokteyl': {
    level: 'moderate',
    bac_estimate: 0.06,
    description: '2 kokteyl',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '3 kokteyl': {
    level: 'heavy',
    bac_estimate: 0.09,
    description: '3 kokteyl',
    warning: '🚨 SÜRÜŞ YAPMAYIN!'
  },

  // Turkish specific drinks
  '1 tek rakı': {
    level: 'light',
    bac_estimate: 0.035,
    description: '1 tek rakı',
    warning: 'Dikkatli sürüş gerekli'
  },
  '2 tek rakı': {
    level: 'moderate',
    bac_estimate: 0.07,
    description: '2 tek rakı',
    warning: '🚨 SÜRÜŞ YAPMAYIN!'
  },
  '1 duble rakı': {
    level: 'moderate',
    bac_estimate: 0.055,
    description: '1 duble rakı',
    warning: '⚠️ Sürüş yapmamalısınız!'
  },
  '2 duble rakı': {
    level: 'heavy',
    bac_estimate: 0.11,
    description: '2 duble rakı',
    warning: '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
  }
}

/**
 * Search for alcohol information by user input
 * Returns the closest match or undefined
 */
export function searchAlcoholDatabase(input: string): AlcoholData | undefined {
  if (!input || input.trim() === '') return undefined

  const normalized = input.toLowerCase().trim()

  // Direct match
  if (ALCOHOL_DATABASE[normalized]) {
    return ALCOHOL_DATABASE[normalized]
  }

  // Partial match - find best match
  const matches = Object.keys(ALCOHOL_DATABASE).filter(key =>
    key.includes(normalized) || normalized.includes(key)
  )

  if (matches.length > 0) {
    // Return the longest matching key (most specific)
    const bestMatch = matches.reduce((a, b) => a.length > b.length ? a : b)
    return ALCOHOL_DATABASE[bestMatch]
  }

  return undefined
}

/**
 * Get alcohol level from user input
 * Returns 'none' if not found or empty
 */
export function getAlcoholLevel(input: string): AlcoholLevel {
  if (!input || input.trim() === '') return 'none'

  const data = searchAlcoholDatabase(input)
  return data ? data.level : 'none'
}

/**
 * Get estimated BAC from user input
 */
export function estimateBAC(input: string): number {
  if (!input || input.trim() === '') return 0.00

  const data = searchAlcoholDatabase(input)
  return data ? data.bac_estimate : 0.00
}

/**
 * Check if input indicates alcohol consumption
 */
export function hasAlcoholConsumption(input: string): boolean {
  if (!input || input.trim() === '') return false

  const level = getAlcoholLevel(input)
  return level !== 'none'
}

/**
 * Get legal driving status based on BAC
 * Turkey legal limit: 0.05% BAC
 */
export function isLegalToDrive(bac: number): boolean {
  return bac < 0.05
}

/**
 * Get warning message for alcohol level
 */
export function getAlcoholWarning(level: AlcoholLevel): string {
  switch (level) {
    case 'none':
      return 'Güvenli sürüş koşulları'
    case 'light':
      return '⚠️ Dikkatli olun! Refleksleriniz etkilenebilir.'
    case 'moderate':
      return '🚨 SÜRÜŞ YAPMAYIN! Yasal limit aşıldı.'
    case 'heavy':
      return '🚨 CİDDİ TEHLİKE! Asla sürüş yapmayın!'
    case 'severe':
      return '🚨 AŞIRI TEHLİKELİ! Sağlığınız risk altında!'
    default:
      return ''
  }
}
