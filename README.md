# Road Accident Risk Predictor

A Next.js web application for predicting road accident risk using real-time weather data, traffic conditions, and route analysis. Built with TypeScript, Tailwind CSS, and integrated with OpenWeatherMap API and Google Maps Directions API.

## Features

- **Real-time Weather Integration**: Automatically fetches current weather data using OpenWeatherMap API
- **Route Analysis**: Integrates with Google Maps Directions API for real-time traffic and accurate route data
- **Risk Assessment**: Sophisticated prediction engine that calculates accident risk based on multiple factors
- **Interactive Form**: User-friendly interface for inputting trip details and viewing risk predictions
- **Geolocation Support**: Automatically detects current location for weather and route analysis

## Documentation

- [Weather Integration Guide](docs/WEATHER_INTEGRATION.md) - OpenWeatherMap API setup and usage
- [Google Maps Integration Guide](docs/GOOGLE_MAPS_INTEGRATION.md) - Google Maps Directions API setup and usage

## Configuration

Create a `.env.local` file in the root directory with your API keys:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### API Requirements

- **OpenWeatherMap**: Required for weather data (free tier available)
- **Google Maps Directions API**: For route data and real-time traffic analysis (free tier: $200 credit/month)

**Note**: The application will work with mock data if API keys are not configured, making it perfect for development and testing.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
