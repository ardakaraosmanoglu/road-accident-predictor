'use client'

import { AccidentPredictionForm } from '@/components/accident-prediction-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Road Accident Risk Predictor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter road conditions, weather, and traffic information to predict accident risk levels.
            This tool uses machine learning to assess safety conditions and provide recommendations.
          </p>
        </div>

        <AccidentPredictionForm />

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>Based on road accident risk prediction dataset • Built with Next.js and shadcn/ui</p>
        </footer>
      </div>
    </div>
  )
}
