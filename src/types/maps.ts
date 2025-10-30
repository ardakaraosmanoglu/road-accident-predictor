// Google Maps API TypeScript Type Definitions
// For use with Google Maps Platform APIs

// ============================================
// Directions API Types
// ============================================

export interface DirectionsRequest {
  origin: string
  destination: string
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'
  departureTime?: Date
}

export interface DirectionsResponse {
  routes: Route[]
  status: string
  error_message?: string
}

export interface Route {
  summary: string
  legs: RouteLeg[]
  overview_polyline: {
    points: string
  }
  bounds: LatLngBounds
}

export interface RouteLeg {
  distance: {
    text: string
    value: number // meters
  }
  duration: {
    text: string
    value: number // seconds
  }
  duration_in_traffic?: {
    text: string
    value: number // seconds
  }
  start_address: string
  end_address: string
  start_location: LatLng
  end_location: LatLng
  steps: RouteStep[]
}

export interface RouteStep {
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  start_location: LatLng
  end_location: LatLng
  html_instructions: string
  polyline: {
    points: string
  }
  maneuver?: string
}

// ============================================
// Places API Types
// ============================================

export interface PlacesAutocompleteRequest {
  input: string
  location?: LatLng
  radius?: number
}

export interface PlacesAutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
}

export interface AutocompletePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  types: string[]
}

export interface PlaceDetailsRequest {
  placeId: string
  fields?: string[]
}

export interface PlaceDetailsResponse {
  result: PlaceDetails
  status: string
}

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: LatLng
    viewport: LatLngBounds
  }
  types: string[]
  address_components: AddressComponent[]
}

export interface PlacesNearbyRequest {
  location: LatLng
  radius: number // meters
  type?: string // school, hospital, etc.
}

export interface PlacesNearbyResponse {
  results: NearbyPlace[]
  status: string
}

export interface NearbyPlace {
  place_id: string
  name: string
  geometry: {
    location: LatLng
  }
  types: string[]
  vicinity: string
}

// ============================================
// Geocoding API Types
// ============================================

export interface GeocodingRequest {
  address?: string
  latlng?: string // "lat,lng"
}

export interface GeocodingResponse {
  results: GeocodingResult[]
  status: string
}

export interface GeocodingResult {
  formatted_address: string
  geometry: {
    location: LatLng
    location_type: string
    viewport: LatLngBounds
  }
  address_components: AddressComponent[]
  place_id: string
  types: string[]
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

// ============================================
// Roads API Types
// ============================================

export interface RoadsRequest {
  path: string // "lat,lng|lat,lng|..."
  interpolate?: boolean
}

export interface RoadsResponse {
  snappedPoints: SnappedPoint[]
}

export interface SnappedPoint {
  location: LatLng
  originalIndex?: number
  placeId: string
}

export interface SpeedLimitsRequest {
  path: string
  placeIds?: string[]
}

export interface SpeedLimitsResponse {
  speedLimits: SpeedLimit[]
}

export interface SpeedLimit {
  placeId: string
  speedLimit: number // km/h
  units: 'KPH' | 'MPH'
}

// ============================================
// Common Types
// ============================================

export interface LatLng {
  lat: number
  lng: number
}

export interface LatLngBounds {
  northeast: LatLng
  southwest: LatLng
}

// ============================================
// Form Integration Types
// ============================================

export interface RouteAnalysisResult {
  // Traffic data
  traffic_density: 'low' | 'medium' | 'high' | 'very_high'
  average_speed: number // km/h
  vehicle_count: number // estimated vehicles per hour

  // Road data
  road_type: 'highway' | 'arterial' | 'collector' | 'local' | 'rural'
  road_condition: 'excellent' | 'good' | 'fair' | 'poor'
  number_of_lanes: number
  speed_limit: number // km/h
  intersection_type: 'none' | 'traffic_light' | 'stop_sign' | 'roundabout' | 'yield'

  // Location context
  urban_rural: 'urban' | 'suburban' | 'rural'
  school_zone: boolean
  construction_zone: boolean

  // Raw API responses (for debugging)
  _raw?: {
    directions?: DirectionsResponse
    places?: PlacesNearbyResponse[]
    roads?: RoadsResponse
    geocoding?: GeocodingResponse
  }
}

export interface RouteAnalysisError {
  message: string
  code: string
  details?: unknown
}
