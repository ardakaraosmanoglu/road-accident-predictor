'use client'

import Image from 'next/image'

import { PredictionWizard } from '@/components/prediction-wizard'
import { MapPin, Cloud, Clock, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="app-container bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col md:bg-gradient-to-br md:from-slate-100 md:via-blue-50 md:to-indigo-100 md:items-center md:justify-center relative overflow-hidden">
      {/* Desktop decorative orbs - hidden on mobile */}
      <div className="hidden md:block desktop-gradient-orb w-96 h-96 bg-blue-400 -top-48 -left-48" />
      <div className="hidden md:block desktop-gradient-orb w-80 h-80 bg-purple-400 -bottom-40 -right-40" />
      <div className="hidden md:block desktop-gradient-orb w-64 h-64 bg-indigo-300 top-1/2 -left-32" />

          {/* Desktop Layout Container */}
          <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-center md:gap-12 lg:gap-20 md:px-8 md:py-8 w-full md:max-w-6xl">
            
            {/* Left Side - Desktop Branding (hidden on mobile) */}
            <aside className="hidden md:flex flex-col justify-center flex-1 max-w-md space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-lg shadow-blue-500/20 overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Drivo logo"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">DRIVO</h1>
                    <p className="text-gray-500">Yol Güvenliği Asistanı</p>
                  </div>
                </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Yapay zeka destekli yol güvenliği analizi ile seyahatinizi daha güvenli hale getirin.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="desktop-feature-card">
              <MapPin className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-gray-900">Otomatik Konum</p>
              <p className="text-xs text-gray-500">GPS ile anlık tespit</p>
            </div>
            <div className="desktop-feature-card">
              <Cloud className="h-5 w-5 text-sky-500 mb-2" />
              <p className="text-sm font-medium text-gray-900">Hava Durumu</p>
              <p className="text-xs text-gray-500">Gerçek zamanlı veri</p>
            </div>
            <div className="desktop-feature-card">
              <Clock className="h-5 w-5 text-indigo-500 mb-2" />
              <p className="text-sm font-medium text-gray-900">Trafik Analizi</p>
              <p className="text-xs text-gray-500">Anlık yoğunluk</p>
            </div>
            <div className="desktop-feature-card">
              <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-sm font-medium text-gray-900">Risk Skoru</p>
              <p className="text-xs text-gray-500">26 parametre analizi</p>
            </div>
          </div>
        </aside>

          {/* Wizard Container */}
          <div className="flex-1 flex flex-col md:flex-none">
            {/* Mobile Header - hidden on desktop */}
            <header className="app-header sticky top-0 z-50 border-b border-gray-200/50 pt-safe md:hidden">
              <div className="flex items-center justify-center gap-2 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/90 ring-1 ring-black/5 shadow-md overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Drivo logo"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-gray-900">DRIVO</span>
                </div>
              </div>
            </header>

          {/* Main Content */}
          <main className="flex-1 px-4 py-4 md:px-0 md:py-0">
            <div className="desktop-wizard-container h-full">
              <PredictionWizard />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
