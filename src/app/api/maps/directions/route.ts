import { NextResponse } from 'next/server'
import type { DirectionsRequest, DirectionsResponse } from '@/types/maps'

export async function POST(request: Request) {
  try {
    const body: DirectionsRequest = await request.json()
    const { origin, destination, travelMode = 'DRIVING', departureTime } = body

    // Validation
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
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
      origin: origin,
      destination: destination,
      mode: travelMode.toLowerCase(),
      key: apiKey,
      // Request traffic data for real-time traffic density analysis
      departure_time: departureTime
        ? Math.floor(new Date(departureTime).getTime() / 1000).toString()
        : 'now',
      traffic_model: 'best_guess',
      // Include alternative routes for better analysis
      alternatives: 'true'
    })

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`

    // Make request to Google Directions API
    const response = await fetch(url)
    const data: DirectionsResponse = await response.json()

    // Check for API errors
    if (data.status !== 'OK') {
      console.error('Directions API error:', data.status, data.error_message)
      return NextResponse.json(
        {
          error: data.error_message || `Directions API returned status: ${data.status}`,
          status: data.status
        },
        { status: 400 }
      )
    }

    // Return successful response
    return NextResponse.json(data)

  } catch (error) {
    console.error('Directions API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
