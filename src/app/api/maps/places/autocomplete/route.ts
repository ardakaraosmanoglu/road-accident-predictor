import { NextResponse } from 'next/server'
import type { PlacesAutocompleteRequest, PlacesAutocompleteResponse } from '@/types/maps'

export async function POST(request: Request) {
  try {
    const body: PlacesAutocompleteRequest = await request.json()
    const { input, location, radius } = body

    // Validation
    if (!input || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required' },
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
      input: input,
      key: apiKey,
      // Restrict to Turkey for better results
      components: 'country:tr'
    })

    // Add optional location bias
    if (location && radius) {
      params.append('location', `${location.lat},${location.lng}`)
      params.append('radius', radius.toString())
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`

    // Make request to Google Places Autocomplete API
    const response = await fetch(url)
    const data: PlacesAutocompleteResponse = await response.json()

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places Autocomplete API error:', data.status)
      return NextResponse.json(
        {
          error: `Places Autocomplete API returned status: ${data.status}`,
          status: data.status
        },
        { status: 400 }
      )
    }

    // Return successful response
    return NextResponse.json(data)

  } catch (error) {
    console.error('Places Autocomplete API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
