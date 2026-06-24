export interface AQIData {
  timestamp: string;
  aqi: number;
  co: number;
  nh3: number;
  benzene: number;
  smoke: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

export const AQI_CATEGORIES = [
  { label: 'Good',        min: 0,   max: 50,  color: '#22c55e', rgb: [0.13, 0.77, 0.37] as [number,number,number] },
  { label: 'Satisfactory',min: 51,  max: 100, color: '#a3e635', rgb: [0.64, 0.90, 0.21] as [number,number,number] },
  { label: 'Moderate',    min: 101, max: 200, color: '#f59e0b', rgb: [0.96, 0.62, 0.04] as [number,number,number] },
  { label: 'Poor',        min: 201, max: 300, color: '#ef4444', rgb: [0.94, 0.27, 0.27] as [number,number,number] },
  { label: 'Very Poor',   min: 301, max: 400, color: '#a855f7', rgb: [0.66, 0.33, 0.97] as [number,number,number] },
  { label: 'Severe',      min: 401, max: 500, color: '#7f1d1d', rgb: [0.50, 0.11, 0.11] as [number,number,number] },
];

export function getAQICategory(aqi: number) {
  return AQI_CATEGORIES.find(c => aqi >= c.min && aqi <= c.max) ?? AQI_CATEGORIES[0];
}

const S3_URL = 'https://s3.in-west3.purestore.io/aqi-data/latest.json';

export async function fetchLatestAQI(): Promise<AQIData | null> {
  try {
    const res = await fetch(S3_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
