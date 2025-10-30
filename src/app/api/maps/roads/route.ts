import { NextResponse } from 'next/server'
import type { RoadsRequest, RoadsResponse, SpeedLimitsResponse } from '@/types/maps'

export async function POST(request: Request) {
  try {
    const body: RoadsRequest & { requestSpeedLimits?: boolean } = await request.json()
    const { path, interpolate = false, requestSpeedLimits = false } = body

    // Validation
    if (!path || path.trim().length === 0) {
      return NextResponse.json(
        { error: 'Path is required (format: "lat,lng|lat,lng|...")' },
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

    // First request: Snap to Roads
    const snapParams = new URLSearchParams({
      path: path,
      interpolate: interpolate.toString(),
      key: apiKey
    })

    const snapUrl = `https://roads.googleapis.com/v1/snapToRoads?${snapParams.toString()}`
    const snapResponse = await fetch(snapUrl)
    const snapData: RoadsResponse = await snapResponse.json()

    // Check for errors
    if (!snapData.snappedPoints || snapData.snappedPoints.length === 0) {
      console.error('Roads API error: No snapped points returned')
      return NextResponse.json(
        { error: 'Roads API returned no snapped points' },
        { status: 400 }
      )
    }

    // If speed limits are requested, make a second request
    let speedLimitsData: SpeedLimitsResponse | null = null

    if (requestSpeedLimits) {
      // Extract place IDs from snapped points
      const placeIds = snapData.snappedPoints
        .map(point => point.placeId)
        .filter((id, index, self) => id && self.indexOf(id) === index) // Remove duplicates

      if (placeIds.length > 0) {
        const speedLimitsParams = new URLSearchParams({
          placeId: placeIds.join(','),
          key: apiKey
        })

        const speedLimitsUrl = `https://roads.googleapis.com/v1/speedLimits?${speedLimitsParams.toString()}`
        const speedLimitsResponse = await fetch(speedLimitsUrl)
        speedLimitsData = await speedLimitsResponse.json()
      }
    }

    // Return combined response
    return NextResponse.json({
      snappedPoints: snapData.snappedPoints,
      speedLimits: speedLimitsData?.speedLimits || []
    })

  } catch (error) {
    console.error('Roads API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
