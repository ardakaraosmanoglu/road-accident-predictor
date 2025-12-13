'use client'

interface RiskMeterProps {
  score: number
  riskLevel: string
  size?: number
}

export function RiskMeter({ score, riskLevel, size = 200 }: RiskMeterProps) {
  const circumference = Math.PI * (size * 0.8)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'very_low': return '#10b981' // green-500
      case 'low': return '#22c55e' // green-400
      case 'medium': return '#eab308' // yellow-500
      case 'high': return '#f97316' // orange-500
      case 'very_high': return '#ef4444' // red-500
      default: return '#6b7280' // gray-500
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'very_low': return 'Çok Düşük'
      case 'low': return 'Düşük'
      case 'medium': return 'Orta'
      case 'high': return 'Yüksek'
      case 'very_high': return 'Çok Yüksek'
      default: return 'Bilinmiyor'
    }
  }

  const color = getRiskColor(riskLevel)
  const label = getRiskLabel(riskLevel)

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.4}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.4}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Risk Puanı
          </div>
        </div>
      </div>

      {/* Risk level indicator */}
      <div className="mt-4 text-center">
        <div
          className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm"
          style={{ backgroundColor: color }}
        >
          {label} Risk
        </div>
      </div>
    </div>
  )
}