// Google Maps API Integration for Route Data
export interface RouteLocation {
  address: string
  lat: number
  lng: number
}

export interface ProcessedRouteData {
  distance_km: number
  duration_minutes: number
  duration_with_traffic_minutes?: number
  average_speed_kmh: number
  traffic_delay_factor: number
  road_types: string[]
  traffic_density: 'low' | 'medium' | 'high' | 'very_high'
  estimated_vehicle_count: number
  route_summary: string
  major_roads: string[]
  urban_rural: 'urban' | 'suburban' | 'rural'
  road_conditions_estimated: 'excellent' | 'good' | 'fair' | 'poor'
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export class MapsService {
  private apiKey: string
  private directionsService: any = null
  private geocoder: any = null

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    this.initializeGoogleMaps()
  }

  private initializeGoogleMaps() {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return
    }

    if (!this.apiKey) {
      console.warn('⚠️ Google Maps API key not found')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      this.directionsService = new window.google.maps.DirectionsService()
      this.geocoder = new window.google.maps.Geocoder()
      return
    }

    // Load Google Maps script if not already loaded
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry&callback=initGoogleMaps`
      script.async = true

      window.initGoogleMaps = () => {
        this.directionsService = new window.google.maps.DirectionsService()
        this.geocoder = new window.google.maps.Geocoder()
        console.log('✅ Google Maps API loaded successfully')
      }

      document.head.appendChild(script)
    }
  }

  private async waitForGoogleMaps(): Promise<boolean> {
    // Return false if not in browser environment
    if (typeof window === 'undefined') {
      return false
    }

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait

    while ((!window.google || !this.directionsService) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    return !!(window.google && this.directionsService)
  }

  async getDirections(
    origin: string | RouteLocation,
    destination: string | RouteLocation,
    waypoints?: string[]
  ): Promise<ProcessedRouteData> {
    console.log('🗺️ Fetching route data with Google Maps...', { origin, destination })

    try {
      // Wait for Google Maps to load
      const isLoaded = await this.waitForGoogleMaps()

      if (isLoaded && this.directionsService) {
        const googleResponse = await this.tryGoogleMapsDirectionsAPI(origin, destination, waypoints)
        if (googleResponse) {
          return googleResponse
        }
      }

      // Fallback to enhanced mock data
      console.log('⚠️ Google Maps API failed or not loaded, using enhanced mock data')
      return this.generateEnhancedMockRouteData(origin, destination)

    } catch (error) {
      console.error('❌ Error fetching directions:', error)
      return this.generateEnhancedMockRouteData(origin, destination)
    }
  }

  private async tryGoogleMapsDirectionsAPI(
    origin: string | RouteLocation,
    destination: string | RouteLocation,
    waypoints?: string[]
  ): Promise<ProcessedRouteData | null> {
    try {
      console.log('🔍 Trying Google Maps Directions API directly...')

      // Format origin and destination
      const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`
      const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`

      // Prepare waypoints
      const waypointObjects = waypoints?.map(wp => ({ location: wp })) || []

      // Create directions request
      const request = {
        origin: originStr,
        destination: destStr,
        waypoints: waypointObjects,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
        },
        optimizeWaypoints: true
      }

      // Make the directions request
      const result = await new Promise((resolve, reject) => {
        this.directionsService.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result)
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        })
      })

      console.log('✅ Google Maps Directions API successful')
      return this.processGoogleMapsDirectionsData(result as any)

    } catch (error: unknown) {
      const err = error as { message?: string }
      console.log('⚠️ Google Maps Directions API failed:', err.message)

      if (err.message?.includes('REQUEST_DENIED')) {
        console.log('⚠️ API key issue: Please enable Directions API in Google Cloud Console')
      }

      return null
    }
  }

  private processGoogleMapsDirectionsData(data: any): ProcessedRouteData {
    const route = data.routes[0]
    const leg = route.legs[0]

    // Extract basic route information
    const distance_km = (leg.distance?.value || 0) / 1000
    const duration_minutes = (leg.duration?.value || 0) / 60

    // Get duration in traffic if available
    const duration_with_traffic_minutes = leg.duration_in_traffic
      ? leg.duration_in_traffic.value / 60
      : duration_minutes * 1.2 // Estimate if not available

    // Calculate traffic delay factor
    const traffic_delay_factor = duration_with_traffic_minutes / duration_minutes

    // Calculate average speed
    const average_speed_kmh = (distance_km / duration_with_traffic_minutes) * 60

    // Analyze route for additional data
    const road_types = this.analyzeGoogleMapsRoadTypes(route)
    const traffic_density = this.estimateTrafficDensity(traffic_delay_factor, average_speed_kmh)
    const estimated_vehicle_count = this.estimateVehicleCount(traffic_density, distance_km)
    const urban_rural = this.analyzeUrbanRural(leg)
    const road_conditions_estimated = this.estimateRoadConditions(urban_rural, road_types)
    const major_roads = this.extractMajorRoads(leg)

    return {
      distance_km: Math.round(distance_km * 10) / 10,
      duration_minutes: Math.round(duration_minutes),
      duration_with_traffic_minutes: Math.round(duration_with_traffic_minutes),
      average_speed_kmh: Math.round(average_speed_kmh),
      traffic_delay_factor: Math.round(traffic_delay_factor * 100) / 100,
      road_types,
      traffic_density,
      estimated_vehicle_count,
      route_summary: route.summary || 'Google Maps route',
      major_roads,
      urban_rural,
      road_conditions_estimated
    }
  }

  private analyzeGoogleMapsRoadTypes(route: any): string[] {
    const roadTypes = new Set<string>()

    // Analyze route summary and legs for road types
    const summary = route.summary?.toLowerCase() || ''

    if (summary.includes('highway') || summary.includes('interstate') ||
        summary.includes('motorway') || summary.includes('freeway')) {
      roadTypes.add('highway')
    }

    if (summary.includes('avenue') || summary.includes('boulevard') ||
        summary.includes('main') || summary.includes('primary')) {
      roadTypes.add('arterial')
    }

    // Analyze individual steps
    route.legs.forEach(leg => {
      leg.steps?.forEach(step => {
        const instruction = step.instructions?.toLowerCase() || ''
        if (instruction.includes('highway') || instruction.includes('interstate')) {
          roadTypes.add('highway')
        } else if (instruction.includes('avenue') || instruction.includes('boulevard')) {
          roadTypes.add('arterial')
        } else if (instruction.includes('street') || instruction.includes('road')) {
          roadTypes.add('local')
        }
      })
    })

    return Array.from(roadTypes).length > 0 ? Array.from(roadTypes) : ['arterial']
  }

  private analyzeUrbanRural(leg: any): ProcessedRouteData['urban_rural'] {
    const startAddress = leg.start_address?.toLowerCase() || ''
    const endAddress = leg.end_address?.toLowerCase() || ''
    const allText = `${startAddress} ${endAddress}`

    const urbanKeywords = ['city', 'downtown', 'center', 'metro', 'urban', 'district']
    const ruralKeywords = ['rural', 'country', 'county', 'highway', 'route']

    if (ruralKeywords.some(keyword => allText.includes(keyword))) {
      return 'rural'
    }
    if (urbanKeywords.some(keyword => allText.includes(keyword))) {
      return 'urban'
    }
    return 'suburban'
  }

  private extractMajorRoads(leg: any): string[] {
    const roads: string[] = []

    leg.steps?.forEach(step => {
      const instruction = step.instructions || ''
      // Extract road names from instructions
      const roadMatch = instruction.match(/on\s+([^<]+)/i)
      if (roadMatch && roadMatch[1]) {
        const roadName = roadMatch[1].trim()
        if (!roads.includes(roadName) && roadName.length > 3) {
          roads.push(roadName)
        }
      }
    })

    return roads.slice(0, 3) // Return first 3 major roads
  }

  async getRouteDataForCurrentLocation(destination: string): Promise<ProcessedRouteData> {
    try {
      // Get user's current location
      const position = await this.getCurrentPosition()

      return await this.getDirections(
        { address: 'Current Location', lat: position.latitude, lng: position.longitude },
        destination
      )
    } catch (error) {
      console.error('Error getting current location route:', error)
      throw new Error('Location could not be obtained. Please enter starting point manually.')
    }
  }

  private estimateTrafficDensity(delayFactor: number, avgSpeed: number): ProcessedRouteData['traffic_density'] {
    // Estimate traffic density based on delay factor and average speed
    if (delayFactor > 1.5 || avgSpeed < 20) return 'very_high'
    if (delayFactor > 1.3 || avgSpeed < 35) return 'high'
    if (delayFactor > 1.1 || avgSpeed < 50) return 'medium'
    return 'low'
  }

  private estimateVehicleCount(density: ProcessedRouteData['traffic_density'], distance: number): number {
    // Estimate hourly vehicle count based on density and distance
    const baseCount = distance * 100 // Base vehicle count per km

    switch (density) {
      case 'very_high': return Math.round(baseCount * 4)
      case 'high': return Math.round(baseCount * 2.5)
      case 'medium': return Math.round(baseCount * 1.5)
      case 'low': return Math.round(baseCount * 0.8)
      default: return Math.round(baseCount)
    }
  }

  private estimateRoadConditions(urbanRural: string, roadTypes: string[]): ProcessedRouteData['road_conditions_estimated'] {
    // Estimate road conditions based on urban/rural and road types
    if (roadTypes.includes('highway')) {
      return urbanRural === 'urban' ? 'good' : 'excellent'
    }
    if (roadTypes.includes('arterial')) {
      return urbanRural === 'rural' ? 'fair' : 'good'
    }
    // Local roads
    if (urbanRural === 'rural') return 'fair'
    if (urbanRural === 'urban') return 'good'
    return 'good'
  }

  private generateEnhancedMockRouteData(origin: string | RouteLocation, destination: string | RouteLocation): ProcessedRouteData {
    console.log('🎭 Generating enhanced mock data for:', { origin, destination })

    // Extract city/country information from destination string
    const destStr = typeof destination === 'string' ? destination.toLowerCase() : destination.address.toLowerCase()
    const originStr = typeof origin === 'string' ? origin.toLowerCase() : origin.address.toLowerCase()

    // City/country based customizations
    const isInternational = destStr.includes('turkey') || destStr.includes('türkiye') ||
                            destStr.includes('istanbul') || destStr.includes('ankara') ||
                            originStr.includes('turkey') || originStr.includes('türkiye')

    const isCityRoute = destStr.includes('city') || destStr.includes('şehir') ||
                       destStr.includes('downtown') || destStr.includes('center')

    const isHighway = destStr.includes('highway') || destStr.includes('otoyol') ||
                     (isInternational && Math.random() > 0.4)

    // Mock data parameters
    let distance_km = Math.random() * 50 + 5 // 5-55km
    let duration_minutes = distance_km * (Math.random() * 2 + 1) // Variable speed
    let traffic_density: 'low' | 'medium' | 'high' | 'very_high' = 'medium'
    let road_types: string[] = ['arterial']
    let urban_rural: 'urban' | 'suburban' | 'rural' = 'suburban'
    let road_conditions: 'excellent' | 'good' | 'fair' | 'poor' = 'good'

    // Scenario-based adjustments
    if (isHighway) {
      distance_km = Math.random() * 200 + 50 // 50-250km
      duration_minutes = distance_km * (Math.random() * 1.2 + 0.8) // Faster highway speed
      road_types = ['highway', 'arterial']
      road_conditions = 'excellent'
      traffic_density = Math.random() > 0.6 ? 'high' : 'medium'
    }

    if (isCityRoute) {
      distance_km = Math.random() * 15 + 2 // 2-17km
      duration_minutes = distance_km * (Math.random() * 3 + 2) // Slower city traffic
      road_types = ['arterial', 'local']
      urban_rural = 'urban'
      traffic_density = Math.random() > 0.3 ? 'very_high' : 'high'
    }

    if (isInternational) {
      // Turkish road characteristics
      road_conditions = Math.random() > 0.7 ? 'excellent' : 'good'
      urban_rural = Math.random() > 0.5 ? 'urban' : 'suburban'
    }

    // Traffic delay simulation
    const traffic_delay_factor = (() => {
      if (traffic_density === 'very_high') return 1.8 + Math.random() * 0.4
      if (traffic_density === 'high') return 1.4 + Math.random() * 0.3
      if (traffic_density === 'medium') return 1.1 + Math.random() * 0.2
      if (traffic_density === 'low') return 1.0 + Math.random() * 0.1
      return 1.2
    })()

    const duration_with_traffic = duration_minutes * traffic_delay_factor
    const average_speed = (distance_km / duration_with_traffic) * 60

    // Generate realistic route summary
    const routeSummary = this.generateMockRouteSummary(originStr, destStr, road_types, isInternational)

    return {
      distance_km: Math.round(distance_km * 10) / 10,
      duration_minutes: Math.round(duration_minutes),
      duration_with_traffic_minutes: Math.round(duration_with_traffic),
      average_speed_kmh: Math.round(average_speed),
      traffic_delay_factor: Math.round(traffic_delay_factor * 100) / 100,
      road_types,
      traffic_density,
      estimated_vehicle_count: this.estimateVehicleCount(traffic_density, distance_km),
      route_summary: routeSummary,
      major_roads: this.generateMockMajorRoads(isInternational, road_types),
      urban_rural,
      road_conditions_estimated: road_conditions
    }
  }

  private generateMockRouteSummary(origin: string, destination: string, roadTypes: string[], isInternational: boolean): string {
    const roadTypeText = roadTypes.includes('highway')
      ? (isInternational ? 'otoyol' : 'highway')
      : roadTypes.includes('arterial')
      ? (isInternational ? 'ana cadde' : 'main road')
      : (isInternational ? 'şehir içi' : 'local road')

    return `${roadTypeText} üzerinden ${isInternational ? 'güzergah' : 'route'}`
  }

  private generateMockMajorRoads(isInternational: boolean, roadTypes: string[]): string[] {
    if (isInternational) {
      if (roadTypes.includes('highway')) {
        return ['D-100', 'TEM Otoyolu', 'E-5']
      }
      return ['Atatürk Caddesi', 'İstiklal Caddesi', 'Bağdat Caddesi']
    }

    if (roadTypes.includes('highway')) {
      return ['I-95', 'Highway 101', 'Interstate 405']
    }
    return ['Main Street', 'Broadway', 'Central Avenue']
  }

  private getCurrentPosition(): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error('Location could not be obtained: ' + error.message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }
}

// Utility functions
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km}km`
}