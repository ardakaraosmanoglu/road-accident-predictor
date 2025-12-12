import type {
  DirectionsRequest,
  DirectionsResponse,
  PlacesAutocompleteRequest,
  PlacesAutocompleteResponse,
  PlacesNearbyRequest,
  PlacesNearbyResponse,
  GeocodingRequest,
  GeocodingResponse,
  RoadsRequest,
  RouteAnalysisResult,
  RouteAnalysisError,
  LatLng
} from '@/types/maps'

/**
 * Fetch directions between two points with traffic data
 */
export async function fetchDirectionsData(
  origin: string,
  destination: string
): Promise<DirectionsResponse> {
  const body: DirectionsRequest = {
    origin,
    destination,
    travelMode: 'DRIVING',
    departureTime: new Date() // Current time for real-time traffic
  }

  const response = await fetch('/api/maps/directions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch directions')
  }

  return response.json()
}

/**
 * Fetch place autocomplete suggestions
 */
export async function fetchPlaceAutocomplete(
  input: string,
  location?: LatLng,
  radius?: number
): Promise<PlacesAutocompleteResponse> {
  const body: PlacesAutocompleteRequest = { input, location, radius }

  const response = await fetch('/api/maps/places/autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch autocomplete')
  }

  return response.json()
}

/**
 * Fetch nearby places by type
 */
export async function fetchNearbyPlaces(
  location: LatLng,
  radius: number,
  type?: string
): Promise<PlacesNearbyResponse> {
  const body: PlacesNearbyRequest = { location, radius, type }

  const response = await fetch('/api/maps/places/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch nearby places')
  }

  return response.json()
}

/**
 * Geocode an address or reverse geocode coordinates
 */
export async function fetchGeocoding(
  addressOrLatLng: string
): Promise<GeocodingResponse> {
  const body: GeocodingRequest = addressOrLatLng.includes(',')
    ? { latlng: addressOrLatLng }
    : { address: addressOrLatLng }

  const response = await fetch('/api/maps/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to geocode')
  }

  return response.json()
}

/**
 * Fetch road information and speed limits
 */
export async function fetchRoadInfo(path: string, interpolate = false) {
  const body: RoadsRequest & { requestSpeedLimits: boolean } = {
    path,
    interpolate,
    requestSpeedLimits: true
  }

  const response = await fetch('/api/maps/roads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch road info')
  }

  return response.json()
}

/**
 * Estimate speed limit based on road type (fallback when Roads API is unavailable)
 * Uses typical Turkish road speed limits
 */
function estimateSpeedLimitFromRoadType(roadType: RouteAnalysisResult['road_type']): number {
  switch (roadType) {
    case 'highway': return 120 // Otoyol - Turkish highway speed limit
    case 'arterial': return 80  // Cadde/Bulvar - Major urban roads
    case 'collector': return 50 // Toplayıcı yol - Collector roads
    case 'local': return 40     // Sokak - Local streets
    case 'rural': return 90     // Kırsal yol - Rural roads
    default: return 50
  }
}

/**
 * Main function: Analyze a route and return form data
 * This combines multiple API calls to gather all necessary information
 */
export async function analyzeRouteForForm(
  origin: string,
  destination: string
): Promise<RouteAnalysisResult> {
  try {
    // Step 1: Fetch directions with traffic data
    const directions = await fetchDirectionsData(origin, destination)

    if (!directions.routes || directions.routes.length === 0) {
      throw new Error('No routes found')
    }

    const route = directions.routes[0]
    const leg = route.legs[0]

    // Extract key coordinates for further analysis
    const startLocation = leg.start_location
    const endLocation = leg.end_location

    // Calculate midpoint for nearby searches
    const midpoint: LatLng = {
      lat: (startLocation.lat + endLocation.lat) / 2,
      lng: (startLocation.lng + endLocation.lng) / 2
    }

    // Step 2: Analyze traffic density from duration_in_traffic
    const normalDuration = leg.duration.value // seconds
    const trafficDuration = leg.duration_in_traffic?.value || normalDuration
    const trafficDelay = trafficDuration - normalDuration
    const delayPercentage = (trafficDelay / normalDuration) * 100

    let traffic_density: RouteAnalysisResult['traffic_density']
    if (delayPercentage < 10) traffic_density = 'low'
    else if (delayPercentage < 30) traffic_density = 'medium'
    else if (delayPercentage < 50) traffic_density = 'high'
    else traffic_density = 'very_high'

    // Step 3: Calculate average speed (km/h)
    const distanceKm = leg.distance.value / 1000
    const durationHours = trafficDuration / 3600
    const average_speed = Math.round(distanceKm / durationHours)

    // Step 4: Estimate vehicle count based on traffic density
    let vehicle_count: number
    switch (traffic_density) {
      case 'low': vehicle_count = 50; break
      case 'medium': vehicle_count = 150; break
      case 'high': vehicle_count = 300; break
      case 'very_high': vehicle_count = 500; break
    }

    // Step 5: Determine road type from route summary
    const summary = route.summary.toLowerCase()
    let road_type: RouteAnalysisResult['road_type']
    if (summary.includes('highway') || summary.includes('motorway') || summary.includes('otoyol')) {
      road_type = 'highway'
    } else if (summary.includes('arterial') || summary.includes('cadde') || summary.includes('bulvar')) {
      road_type = 'arterial'
    } else if (summary.includes('rural') || summary.includes('kırsal')) {
      road_type = 'rural'
    } else if (summary.includes('local') || summary.includes('sokak')) {
      road_type = 'local'
    } else {
      road_type = 'collector'
    }

    // Step 6: Parallel API calls for nearby context
    const [schoolsNearby, geocodingData] = await Promise.allSettled([
      fetchNearbyPlaces(midpoint, 500, 'school'),
      fetchGeocoding(`${midpoint.lat},${midpoint.lng}`)
    ])

    // Step 7: Determine school zone
    const school_zone = schoolsNearby.status === 'fulfilled' &&
                        schoolsNearby.value.results?.length > 0

    // Step 8: Determine urban/rural from geocoding
    let urban_rural: RouteAnalysisResult['urban_rural'] = 'suburban'
    if (geocodingData.status === 'fulfilled' && geocodingData.value.results?.length > 0) {
      const addressComponents = geocodingData.value.results[0].address_components
      const hasLocality = addressComponents.some(c => c.types.includes('locality'))
      const hasSublocality = addressComponents.some(c => c.types.includes('sublocality'))

      if (hasLocality || hasSublocality) {
        urban_rural = 'urban'
      } else {
        const hasAdminArea = addressComponents.some(c =>
          c.types.includes('administrative_area_level_1') ||
          c.types.includes('administrative_area_level_2')
        )
        if (!hasAdminArea) {
          urban_rural = 'rural'
        }
      }
    }

    // Step 9: Determine speed limit
    // Start with intelligent estimate based on road type (always have a reasonable value)
    let speed_limit = estimateSpeedLimitFromRoadType(road_type)

    // Try to get real speed limit from Google Roads API (if enabled in Google Cloud)
    // NOTE: To use Roads API, you need to:
    // 1. Enable "Roads API" in Google Cloud Console
    // 2. Ensure billing is set up (first $200/month free)
    // 3. Roads API provides exact speed limits for specific road segments
    try {
      // Create path from route steps (sample 5 points along the route)
      const points = leg.steps
        .filter((_, i) => i % Math.max(1, Math.floor(leg.steps.length / 5)) === 0)
        .map(step => `${step.start_location.lat},${step.start_location.lng}`)
        .join('|')

      if (points) {
        const roadsData = await fetchRoadInfo(points, true)
        if (roadsData.speedLimits && roadsData.speedLimits.length > 0) {
          // Average the speed limits along the route
          const avgSpeedLimit = roadsData.speedLimits.reduce(
            (sum: number, limit: { speedLimit: number }) => sum + limit.speedLimit,
            0
          ) / roadsData.speedLimits.length
          speed_limit = Math.round(avgSpeedLimit)
          console.log(`✅ Speed limit from Roads API: ${speed_limit} km/h`)
        } else {
          console.log(`⚠️ Roads API returned no speed limits, using estimated: ${speed_limit} km/h (${road_type})`)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Roads API failed (using estimated ${speed_limit} km/h for ${road_type}):`, error instanceof Error ? error.message : error)
      // Keep the estimated speed_limit - no change needed
    }

    // Step 10: Estimate number of lanes based on road type
    let number_of_lanes: number
    switch (road_type) {
      case 'highway': number_of_lanes = 4; break
      case 'arterial': number_of_lanes = 3; break
      case 'collector': number_of_lanes = 2; break
      case 'local': number_of_lanes = 1; break
      case 'rural': number_of_lanes = 2; break
    }

    // Step 11: Set other defaults (can be enhanced with more API calls)
    const road_condition: RouteAnalysisResult['road_condition'] =
      road_type === 'highway' ? 'excellent' : 'good'

    const intersection_type: RouteAnalysisResult['intersection_type'] =
      road_type === 'highway' ? 'none' : 'traffic_light'

    const construction_zone = false // Would need specific construction data source

    // Return complete analysis
    return {
      traffic_density,
      average_speed,
      vehicle_count,
      road_type,
      road_condition,
      number_of_lanes,
      speed_limit,
      intersection_type,
      urban_rural,
      school_zone,
      construction_zone,
      _raw: {
        directions,
        places: schoolsNearby.status === 'fulfilled' ? [schoolsNearby.value] : [],
        geocoding: geocodingData.status === 'fulfilled' ? geocodingData.value : undefined
      }
    }

  } catch (error) {
    console.error('Route analysis error:', error)
    const analysisError: RouteAnalysisError = {
      message: error instanceof Error ? error.message : 'Route analysis failed',
      code: 'ANALYSIS_ERROR',
      details: error
    }
    throw analysisError
  }
}
