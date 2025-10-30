import axios from 'axios'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export interface OpenWeatherData {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    visibility?: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

export interface ProcessedWeatherData {
  temperature: number
  humidity: number
  visibility: number
  wind_speed: number
  weather_condition: 'clear' | 'rain' | 'snow' | 'fog' | 'cloudy' | 'storm'
  location: string
  timestamp: Date
}

export class WeatherService {
  private apiKey: string

  constructor() {
    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key is required')
    }
    this.apiKey = API_KEY
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<ProcessedWeatherData> {
    try {
      const response = await axios.get<OpenWeatherData>(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric' // Get temperature in Celsius
        }
      })

      return this.processWeatherData(response.data)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  async getCurrentWeatherByCity(city: string): Promise<ProcessedWeatherData> {
    try {
      const response = await axios.get<OpenWeatherData>(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      })

      return this.processWeatherData(response.data)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  private processWeatherData(data: OpenWeatherData): ProcessedWeatherData {
    // Convert OpenWeatherMap data to our format
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert to km
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      weather_condition: this.mapWeatherCondition(data.weather[0]),
      location: `${data.name}, ${data.sys.country}`,
      timestamp: new Date()
    }
  }

  private mapWeatherCondition(weather: OpenWeatherData['weather'][0]): ProcessedWeatherData['weather_condition'] {
    const { main, id } = weather

    // Map OpenWeatherMap conditions to our simplified categories
    switch (main.toLowerCase()) {
      case 'clear':
        return 'clear'

      case 'clouds':
        return 'cloudy'

      case 'rain':
      case 'drizzle':
        return 'rain'

      case 'snow':
        return 'snow'

      case 'mist':
      case 'fog':
      case 'haze':
        return 'fog'

      case 'thunderstorm':
        return 'storm'

      default:
        // Use weather ID for more specific conditions
        if (id >= 200 && id < 300) return 'storm' // Thunderstorm
        if (id >= 300 && id < 400) return 'rain'  // Drizzle
        if (id >= 500 && id < 600) return 'rain'  // Rain
        if (id >= 600 && id < 700) return 'snow'  // Snow
        if (id >= 700 && id < 800) return 'fog'   // Atmosphere (fog, mist, etc.)
        if (id === 800) return 'clear'            // Clear sky
        if (id > 800) return 'cloudy'             // Clouds

        return 'clear' // Default fallback
    }
  }
}

// Geolocation utilities
export interface GeolocationCoords {
  latitude: number
  longitude: number
}

export function getCurrentPosition(): Promise<GeolocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
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
        let errorMessage = 'Unknown error occurred'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}