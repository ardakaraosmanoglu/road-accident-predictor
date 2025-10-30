# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Road Accident Risk Predictor** - A Next.js web application that analyzes road conditions and predicts accident risk using real-time weather data and manual traffic/road inputs. The application provides risk scores, contributing factors, and safety recommendations based on multiple risk dimensions.

### Core Features

1. **Sophisticated Risk Prediction Engine** - Client-side calculation using weighted factors across weather, traffic, road conditions, time, and location
2. **Real-Time Weather Integration** - OpenWeatherMap API with fallback to manual input
3. **Visual Risk Assessment** - Risk meter display, confidence scoring, and contributing factors
4. **Safety Recommendations** - Context-aware recommendations based on identified risk factors

## Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5 (strict mode)
- **Build Tool**: Turbopack (via Next.js)
- **Styling**: TailwindCSS 4.0 with PostCSS
- **UI Components**: Radix UI + shadcn/ui pattern (custom Card, Button, Input, Label, Select, Badge, Alert, Progress)
- **Icons**: Lucide React
- **API Clients**: Axios
- **Linting**: ESLint 9

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local
# Add your API key:
# NEXT_PUBLIC_OPENWEATHER_API_KEY

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Access the app at `http://localhost:3000`

## Project Architecture

```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Main accident predictor page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── api/                      # API routes (event management system)
│
├── components/
│   ├── accident-prediction-form.tsx    # Main prediction interface
│   ├── weather-fetcher.tsx            # Real-time weather integration
│   ├── risk-meter.tsx                 # Visual risk display
│   ├── ui/                            # Radix UI + shadcn components
│   └── [other components]/
│
├── lib/
│   ├── prediction-engine.ts       # Core risk calculation engine
│   ├── weather-api.ts            # OpenWeatherMap integration
│   ├── utils.ts                  # Utility functions
│   └── [auth, storage, hooks]/   # Supporting libraries
│
├── types/
│   └── dataset.ts                # Type definitions for prediction inputs/outputs
│
└── [infrastructure, domain, application]/  # Clean architecture (event system)
```

## Key Files and Responsibilities

### Core Prediction Logic

- **`src/lib/prediction-engine.ts`** - Main prediction algorithm
  - `predictAccidentRisk()` - Calculates risk score and factors
  - `calculateWeatherRisk()` - Weather-based risk (0-100 scale)
  - `calculateTrafficRisk()` - Traffic density/speed analysis
  - `calculateRoadRisk()` - Road type, condition, lanes
  - `calculateTimeRisk()` - Hour, day, holidays
  - `calculateLocationRisk()` - Urban/rural, school zones, construction
  - Returns: `AccidentRiskPrediction` with risk_level, risk_score (0-100), confidence, contributing_factors, recommendations

- **`src/lib/weather-api.ts`** - OpenWeatherMap integration
  - Converts raw API responses to `ProcessedWeatherData`
  - Maps conditions: clear, rain, snow, fog, cloudy, storm

### UI Components

- **`src/components/accident-prediction-form.tsx`** - Main form (21+ input fields)
  - Weather inputs (manual + real-time fetcher)
  - Traffic inputs (manual entry)
  - Road layout inputs (type, condition, lanes, speed limit, intersection type)
  - Time/context inputs (hour, day, month, special conditions)
  - Displays prediction results with risk meter and recommendations

- **`src/components/weather-fetcher.tsx`** - Real-time weather button
- **`src/components/risk-meter.tsx`** - Visual risk gauge display

### Type Definitions

- **`src/types/dataset.ts`** - Core types:
  - `AccidentPredictionInput` - All 21 form inputs
  - `AccidentRiskPrediction` - Prediction output with risk level, score, confidence, factors, recommendations

## Risk Calculation

The prediction engine uses a **weighted factor system**:

1. **Weather Risk** (Factors: condition, temperature, visibility, wind, humidity)
2. **Traffic Risk** (Factors: density, speed, vehicle count)
3. **Road Risk** (Factors: type, condition, lanes, speed limit, intersections)
4. **Time Risk** (Factors: hour, day of week, month, holidays, rush hour)
5. **Location Risk** (Factors: urban/rural, school zones, construction zones)

Each factor has:
- `score`: 0-100 normalized value
- `weight`: relative importance in calculation
- `reason`: explanation for the score
- `name`: human-readable factor name

Final risk score is normalized to 0-100 with confidence percentage calculated based on factor certainty.

Risk levels: `low`, `moderate`, `high`, `critical`

## Environment Variables

```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key    # OpenWeatherMap API
```

**Note**: The app gracefully degrades with mock data if the API key is not configured.

## Development Commands

```bash
# Development server with hot reload (Turbopack)
npm run dev

# Production build
npm run build

# Preview production build locally
npm start

# Lint check (ESLint)
npm run lint

# Lint with fix
npm run lint -- --fix
```

## Code Patterns

### Prediction Input/Output

```typescript
// Input all 21 parameters
const input: AccidentPredictionInput = {
  weather_condition: 'rain',
  temperature: 15,
  visibility: 5,
  wind_speed: 20,
  humidity: 80,
  traffic_density: 'high',
  average_speed: 40,
  vehicle_count: 500,
  road_type: 'arterial',
  road_condition: 'fair',
  number_of_lanes: 3,
  speed_limit: 60,
  intersection_type: 'traffic_light',
  hour_of_day: 17,
  day_of_week: 'friday',
  month: 11,
  is_holiday: false,
  is_rush_hour: true,
  urban_rural: 'urban',
  school_zone: false,
  construction_zone: false
}

// Get prediction
const prediction = predictAccidentRisk(input)
// Returns: { risk_level, risk_score (0-100), confidence (0-100), contributing_factors[], recommendations[] }
```
### Real-Time Data Integration

```typescript
// Weather Fetcher automatically updates form
const handleWeatherData = (weatherData: ProcessedWeatherData) => {
  setFormData(prev => ({
    ...prev,
    weather_condition: weatherData.weather_condition,
    temperature: weatherData.temperature,
    humidity: weatherData.humidity,
    visibility: weatherData.visibility,
    wind_speed: weatherData.wind_speed
  }))
}
```

## Component Structure

### Main Page (page.tsx)
- Renders `AccidentPredictionForm` component
- Displays title and description
- Handles layout with gradient background

### AccidentPredictionForm (accident-prediction-form.tsx)
- Manages form state with 21+ input fields
- 5 main card sections: Driver & Vehicle Safety, Weather, Traffic, Road Layout, Time & Context
- Real-time weather data fetcher
- Prediction button with loading state
- Results display with risk meter, contributing factors, and recommendations

## Key Considerations

1. **API Key for Weather Data**: Weather fetcher requires OpenWeatherMap API key. App works with mock data in development.

2. **Client-Side Prediction**: Risk calculation happens entirely on the client (no server API calls for predictions).

3. **Real-Time Weather Integration**: Weather data is fetched on-demand via button, not automatically.

4. **Confidence Scoring**: Based on number of risk factors and certainty of calculations, not just the risk score.

5. **UI Framework**: Uses Radix UI headless components with shadcn/ui styling patterns. Check `src/components/ui/` for available components.

6. **TypeScript Strict Mode**: All code must pass strict TypeScript checking.

## Testing

Currently no automated tests configured. Testing approach:
- Manual testing via UI at http://localhost:3000
- Test various weather/traffic/road combinations
- Verify API integration with real keys
- Check prediction logic with known input scenarios

## Linting & Code Quality

ESLint 9 is configured. Run before committing:

```bash
npm run lint -- --fix
```

## Build & Deployment

The Turbopack build system provides fast builds:

```bash
# Production build creates .next directory
npm run build

# Test production build locally
npm start
```

Vercel is recommended for deployment (seamless Next.js integration).

