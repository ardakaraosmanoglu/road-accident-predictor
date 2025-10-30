# Weather Integration with OpenWeatherMap

This application now includes real-time weather data integration using your OpenWeatherMap API key.

## Features Added

### 🌤️ Real Weather Data
- **Current Location**: Get weather data based on your GPS location
- **City Search**: Enter any city name to get its current weather
- **Auto-populate**: Weather data automatically fills the form fields

### 📊 Weather Data Points
- **Temperature**: Real temperature in Celsius
- **Humidity**: Current humidity percentage
- **Visibility**: Visibility distance in kilometers
- **Wind Speed**: Wind speed in km/h (converted from m/s)
- **Weather Condition**: Mapped to our risk categories:
  - Clear ☀️
  - Cloudy ☁️
  - Rain 🌧️
  - Snow ❄️
  - Fog 🌫️
  - Storm ⛈️

## How to Use

### Option 1: Use Your Location
1. Click "Use My Location" button
2. Allow location access when prompted
3. Weather data will be fetched automatically
4. All weather fields will be populated

### Option 2: Search by City
1. Enter a city name (e.g., "London", "Tokyo", "New York")
2. Click "Get Weather" or press Enter
3. Current weather for that city will be loaded
4. Form fields will be updated automatically

### Manual Override
Even after fetching real weather data, you can still manually adjust any weather field if needed for testing different scenarios.

## API Configuration

The app uses your OpenWeatherMap API key: `50e401c3b7f60c4711737a0fb6f1cf49`

This is stored in `.env.local` as:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=50e401c3b7f60c4711737a0fb6f1cf49
```

## Error Handling

The app gracefully handles:
- Location access denied
- Invalid city names
- Network errors
- API rate limits
- Missing location data

## Benefits for Risk Prediction

Real weather data significantly improves accident risk predictions by:
- Providing accurate current conditions
- Eliminating guesswork for weather parameters
- Including real-time visibility and wind data
- Mapping complex weather conditions to risk factors

## Development

- Weather data is cached for 5 minutes to avoid excessive API calls
- Geolocation uses high accuracy when available
- API calls include proper error handling and user feedback
- All weather conditions are mapped to our simplified risk categories

The weather integration makes the accident risk predictor much more practical and accurate for real-world use!