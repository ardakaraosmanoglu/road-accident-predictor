'use client'

import { AccidentPredictionForm } from '@/components/accident-prediction-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-300 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kaza Risk Analizi
          </h1>
          <p className="text-sm text-gray-600">
            Yol koşulları, hava durumu ve trafik bilgilerini analiz ederek kaza risk seviyesini tahmin edin.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AccidentPredictionForm />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-gray-50 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Yol kazası risk tahmin veri seti temel alınarak geliştirilmiştir
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
