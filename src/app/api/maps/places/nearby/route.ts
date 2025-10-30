import { NextResponse } from 'next/server'
import type { PlacesNearbyRequest, PlacesNearbyResponse } from '@/types/maps'

export async function POST(request: Request) {
  try {
    const body: PlacesNearbyRequest = await request.json()
    const { location, radius, type } = body

    // Validation
    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location (lat, lng) is required' },
        { status: 400 }
      )
    }

    if (!radius || radius <= 0) {
      return NextResponse.json(
        { error: 'Radius must be greater than 0' },
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
      location: `${location.lat},${location.lng}`,
      radius: radius.toString(),
      key: apiKey
    })

    // Add optional type filter
    if (type) {
      params.append('type', type)
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`

    // Make request to Google Places Nearby Search API
    const response = await fetch(url)
    const data: PlacesNearbyResponse = await response.json()

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places Nearby API error:', data.status)
      return NextResponse.json(
        {
          error: `Places Nearby API returned status: ${data.status}`,
          status: data.status
        },
        { status: 400 }
      )
    }

    // Return successful response
    return NextResponse.json(data)

  } catch (error) {
    console.error('Places Nearby API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
