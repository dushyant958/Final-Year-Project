import { useState, useEffect } from 'react';

export interface WeatherData {
  windSpeed: number;   // km/h
  windDeg: number;     // 0–360°
  windDir: string;     // N, NE, E, …
  description: string;
  icon: string;
}

const LAT = 18.6298;
const LON = 73.7997;
const KEY = import.meta.env.VITE_OPENWEATHER_KEY ?? '';

function degToDir(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Realistic Pune defaults when no API key
const MOCK: WeatherData = {
  windSpeed: 14,
  windDeg: 225,
  windDir: 'SW',
  description: 'Partly cloudy',
  icon: '02d',
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>(MOCK);
  const [loading, setLoading] = useState(!!KEY);

  useEffect(() => {
    if (!KEY) return;
    const fetch_ = async () => {
      try {
        const r = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${KEY}&units=metric`
        );
        const j = await r.json();
        setWeather({
          windSpeed: Math.round(j.wind.speed * 3.6), // m/s → km/h
          windDeg: j.wind.deg,
          windDir: degToDir(j.wind.deg),
          description: j.weather[0].description,
          icon: j.weather[0].icon,
        });
      } catch { /* keep mock */ } finally { setLoading(false); }
    };
    fetch_();
    const id = setInterval(fetch_, 600_000); // refresh every 10 min
    return () => clearInterval(id);
  }, []);

  return { weather, loading };
}
