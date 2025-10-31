'use client'

import { AccidentPredictionForm } from '@/components/accident-prediction-form'
import { Shield, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              <span>Güvenli Sürüş Asistanı</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Kazaya Karşı Korunma
              </span>
              <br />
              <span className="text-gray-800">Risk Analizi</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
              Yol koşulları, hava durumu ve trafik bilgilerini analiz ederek kaza risk seviyesini tahmin edin.
              Yapay zeka destekli güvenlik değerlendirmesi ile güvenli sürüş planı yapın.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:mt-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs sm:text-sm text-gray-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                <span>AI Destekli</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs sm:text-sm text-gray-700 shadow-sm">
                <span>🌤️</span>
                <span>Gerçek Zamanlı Veri</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs sm:text-sm text-gray-700 shadow-sm">
                <span>📱</span>
                <span>Mobil Uyumlu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <AccidentPredictionForm />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white/50 backdrop-blur-sm mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Yol kazası risk tahmin veri seti temel alınarak geliştirilmiştir
            </p>
            <p className="text-xs text-gray-500">
              Next.js ve shadcn/ui ile geliştirildi • Güvenli sürüş, güvenli gelecek
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
