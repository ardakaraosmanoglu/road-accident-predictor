# Google Maps Integration Guide

This document explains the Google Maps API integration for route data in the Road Accident Risk Predictor application.

## 🌟 Overview

Google Maps API provides comprehensive routing capabilities with real-time traffic data and detailed route information. It offers these advantages:

- **Real-time Traffic Data** - Accurate travel times with current traffic conditions
- **Global Coverage** - Worldwide routing with detailed local information
- **High Accuracy** - Precise route calculations and ETAs
- **Comprehensive Data** - Detailed turn-by-turn directions and road information
- **Traffic Insights** - Duration in traffic and optimal route selection

## 🔑 API Key Setup

### 1. Get Your Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. **Enable the Directions API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Directions API"
   - Click "Enable"
4. **Enable the Geocoding API** (optional, for address resolution):
   - Search for "Geocoding API"
   - Click "Enable"
5. **Create credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
6. **Secure your API key**:
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*` for development)
7. **Set up billing** (required for API usage):
   - Go to "Billing" and add a payment method
   - Google provides $200 free credit monthly
8. Copy your API key for configuration

### 2. Configure Environment Variables

Add your Google Maps API key to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 📊 API Specifications

### Base URL
```
https://maps.googleapis.com/maps/api/directions/json
```

### Authentication
```javascript
// API key is included as a query parameter
key: 'your_api_key_here'
```

### Request Format
```javascript
GET /maps/api/directions/json?parameters

// Example parameters:
{
  origin: 'Istanbul, Turkey',
  destination: 'Ankara, Turkey',
  key: 'your_api_key_here',
  departure_time: 'now',
  traffic_model: 'best_guess',
  mode: 'driving'
}
```

### Coordinate Format
- Uses standard `latitude,longitude` format
- Example: `41.0082,28.9784` (Istanbul coordinates)
- Supports both address strings and coordinate pairs

## 🔄 Fallback System

The application uses a two-tier fallback system:

1. **Google Maps Directions API** (primary - requires API key)
2. **Enhanced Mock Data** (fallback - works without API key for development)

## 📈 API Limits and Pricing

### Free Tier (Google Maps Platform)
- **Monthly Credit**: $200 free usage per month
- **Directions API**: $5 per 1,000 requests
- **Free Requests**: ~40,000 requests per month with free credit
- **Rate Limits**: 50 requests per second per project

### Production Considerations
- Monitor usage in Google Cloud Console
- Set up billing alerts
- Consider caching results for frequently requested routes
- Implement request quotas if needed

## 🛠️ Implementation Details

### Data Processing

Google Maps provides comprehensive data that our integration processes:

1. **Distance & Duration**: Direct from API response
2. **Traffic Data**: Real-time `duration_in_traffic` values
3. **Route Analysis**: Extracted from detailed step-by-step directions
4. **Road Classification**: Analyzed from route summary and instructions
5. **Urban/Rural Detection**: Based on start/end addresses and route characteristics

### Key Features

- **Real-time Traffic**: Actual traffic conditions and delays
- **Accurate ETAs**: Traffic-aware arrival time estimates
- **Detailed Directions**: Turn-by-turn navigation instructions
- **Route Optimization**: Best route selection considering traffic
- **Waypoint Support**: Multi-stop route planning
- **Address Geocoding**: Convert addresses to coordinates

## 🎯 Usage Examples

### Basic Route Request
```javascript
import { MapsService } from '@/lib/maps-api'

const mapsService = new MapsService()

// Get route data with Google Maps
const routeData = await mapsService.getDirections(
  'Istanbul, Turkey',
  'Ankara, Turkey'
)
```

### With Coordinates
```javascript
const routeData = await mapsService.getDirections(
  { address: 'Start', lat: 41.0082, lng: 28.9784 },
  { address: 'End', lat: 39.9334, lng: 32.8597 }
)
```

### With Waypoints
```javascript
const routeData = await mapsService.getDirections(
  'Istanbul, Turkey',
  'Ankara, Turkey',
  ['Izmit', 'Bolu'] // Waypoints
)
```

### Current Location Route
```javascript
// Uses browser geolocation
const routeData = await mapsService.getRouteDataForCurrentLocation(
  'Ankara, Turkey'
)
```

## 🔍 Response Data Structure

The processed route data includes:

```typescript
{
  distance_km: number                    // Total distance in kilometers
  duration_minutes: number               // Base travel time without traffic
  duration_with_traffic_minutes: number // Real travel time with current traffic
  average_speed_kmh: number             // Average speed considering traffic
  traffic_delay_factor: number          // Ratio of traffic time to base time
  road_types: string[]                  // ['highway', 'arterial', 'local']
  traffic_density: 'low' | 'medium' | 'high' | 'very_high'
  estimated_vehicle_count: number       // Estimated vehicles on route
  route_summary: string                 // Google's route description
  major_roads: string[]                 // Names of major roads used
  urban_rural: 'urban' | 'suburban' | 'rural'
  road_conditions_estimated: 'excellent' | 'good' | 'fair' | 'poor'
}
```

## 🚨 Error Handling

The integration includes comprehensive error handling:

- **API Key Issues**: Clear warnings when key is missing or invalid
- **Rate Limiting**: Graceful handling of quota exceeded errors
- **Network Errors**: Timeout handling and retry logic
- **Invalid Routes**: Fallback to mock data when no route found
- **CORS Issues**: Handled through proper API configuration

## 🧪 Testing

### Testing the Integration
To test the Google Maps integration:

1. Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Enable Directions API in Google Cloud Console
3. Test route requests in the application
4. Watch console logs for API status messages

### Console Output
Watch for these log messages:
- `🔍 Trying Google Maps Directions API...`
- `✅ Google Maps API successful`
- `⚠️ Google Maps API returned error: [status] [message]`
- `⚠️ Google Maps API failed or not configured, using enhanced mock data`

## 📊 Service Comparison

| Feature | Google Maps | OSRM | OpenRouteService |
|---------|-------------|------|------------------|
| **Cost** | Paid (free tier) | Free | Free (limited) |
| **API Key** | ✅ Required | ❌ Not Required | ✅ Required |
| **Rate Limits** | ✅ Generous | ❌ None | ✅ 2,000/day |
| **Real-time Traffic** | ✅ Yes | ❌ No | ❌ No |
| **Accuracy** | ✅ Excellent | ✅ Good | ✅ Good |
| **Global Coverage** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Route Quality** | ✅ Excellent | ✅ Good | ✅ Good |
| **Traffic Optimization** | ✅ Yes | ❌ No | ❌ No |

## 🔧 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check API key is correct in `.env.local`
   - Verify Directions API is enabled in Google Cloud Console
   - Check API key restrictions (HTTP referrers, IP addresses)
   - Ensure billing is set up (required even for free tier)

2. **REQUEST_DENIED Error** (Most Common)
   - **Directions API not enabled**: Go to APIs & Services > Library > Enable "Directions API"
   - **Billing not set up**: Go to Billing and add a payment method (free $200 credit provided)
   - **API key restrictions**: Check if domain restrictions are too strict
   - **Invalid API key**: Verify the key is copied correctly

3. **OVER_QUERY_LIMIT Error**
   - Daily quota exceeded
   - Too many requests per second
   - Check usage in Google Cloud Console

4. **ZERO_RESULTS Error**
   - Invalid addresses or coordinates
   - No route available between points
   - Try broader address terms

5. **CORS Errors**
   - Using server-side API correctly (not browser-side)
   - Check domain restrictions on API key

### Debug Mode
Enable detailed logging by checking browser console for Google Maps-specific messages.

## 🌐 Additional Resources

- [Google Maps Directions API Documentation](https://developers.google.com/maps/documentation/directions)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://developers.google.com/maps/documentation/directions/usage-and-billing)
- [Error Codes Reference](https://developers.google.com/maps/documentation/directions/web-service-status-codes)

## 🚀 Benefits for Production

Using Google Maps API provides:

1. **Professional Quality** - Industry-standard routing and accuracy
2. **Real-time Data** - Current traffic conditions and incidents
3. **Global Reliability** - Consistent service worldwide
4. **Rich Features** - Comprehensive route information
5. **Business Ready** - Enterprise-grade SLA and support

## 🔒 Security Best Practices

### API Key Security
- ✅ **Never expose API keys in client-side code**
- ✅ **Use HTTP referrer restrictions** for web applications
- ✅ **Restrict API key to specific APIs** (Directions, Geocoding only)
- ✅ **Monitor usage** regularly in Google Cloud Console
- ✅ **Set up billing alerts** to avoid unexpected charges

### Implementation Security
- Server-side API calls prevent key exposure
- Request validation and sanitization
- Rate limiting to prevent abuse
- Error handling without exposing internal details

## 💡 Optimization Tips

### Performance
- **Cache Results**: Store frequently requested routes
- **Batch Requests**: Use waypoints for multiple destinations
- **Optimize Requests**: Only request needed data fields
- **Monitor Usage**: Track API calls and costs

### Cost Management
- Set up billing alerts in Google Cloud Console
- Use mock data for development to save API calls
- Implement client-side caching for repeated requests
- Consider regional pricing differences

This integration ensures the application provides accurate, real-time routing data while maintaining fallback options for development and edge cases.