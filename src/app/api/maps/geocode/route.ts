import { NextResponse } from 'next/server'
import type { GeocodingRequest, GeocodingResponse } from '@/types/maps'

export async function POST(request: Request) {
  try {
    const body: GeocodingRequest = await request.json()
    const { address, latlng } = body

    // Validation - either address or latlng must be provided
    if (!address && !latlng) {
      return NextResponse.json(
        { error: 'Either address or latlng is required' },
        { status: 400 }
      )
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not configured')
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      )
    }

    // Build URL with parameters
    const params = new URLSearchParams({
      key: apiKey
    })

    // Add either address or latlng
    if (address) {
      params.append('address', address)
    } else if (latlng) {
      params.append('latlng', latlng)
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`

    // Make request to Google Geocoding API
    const response = await fetch(url)
    const data: GeocodingResponse = await response.json()

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Geocoding API error:', data.status)
      return NextResponse.json(
        {
          error: `Geocoding API returned status: ${data.status}`,
          status: data.status
        },
        { status: 400 }
      )
    }

    // Return successful response
    return NextResponse.json(data)

  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
