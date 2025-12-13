'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

import { routing } from '@/i18n/routing'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: string) => {
    const segments = pathname.split('/')
    if (routing.locales.includes(segments[1])) {
      segments[1] = nextLocale
    } else {
      segments.splice(1, 0, nextLocale)
    }
    const newPath = segments.join('/') || '/'
    router.push(newPath)
  }

  const isTurkish = locale === 'tr'

  return (
    <button
      type="button"
      onClick={() => switchLocale(isTurkish ? 'en' : 'tr')}
      className={`flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold shadow-md shadow-black/5 ring-1 ring-black/5 hover:shadow-lg transition ${className || ''}`}
      aria-label={isTurkish ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <span>{isTurkish ? '🇬🇧 EN' : '🇹🇷 TR'}</span>
    </button>
  )
}
