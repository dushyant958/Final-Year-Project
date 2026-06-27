import { useState, useEffect, useCallback } from 'react';
import { fetchLatestAQI, type AQIData } from '../lib/aqi';

export interface HistoryPoint {
  timestamp: string;
  aqi: number;
  time: string;
}

const MAX_HISTORY = 96;

function seedHistory(): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = Date.now();
  for (let i = 95; i >= 0; i--) {
    const t = new Date(now - i * 30 * 1000);
    const hour = t.getHours();
    const base = 80;
    const rush1 = Math.exp(-0.5 * Math.pow((hour - 8) / 2, 2)) * 25;
    const rush2 = Math.exp(-0.5 * Math.pow((hour - 18) / 2, 2)) * 20;
    const night = Math.exp(-0.5 * Math.pow((hour - 3) / 3, 2)) * -15;
    const noise = (Math.random() - 0.5) * 14;
    const aqi = Math.max(57, Math.min(116, Math.round(base + rush1 + rush2 + night + noise)));
    points.push({
      timestamp: t.toISOString(),
      aqi,
      time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  }
  return points;
}

export function useAQIData() {
  const [latest, setLatest] = useState<AQIData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>(() => seedHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [spikeMode, setSpikeMode] = useState(false);

  const refresh = useCallback(async () => {
    const data = await fetchLatestAQI();
    if (!data) { setError(true); setLoading(false); return; }

    setError(false);
    setLastUpdated(new Date());
    setLoading(false);

    // In spike mode, bump AQI by 40-80
    const spikeOffset = spikeMode ? 40 + Math.random() * 40 : 0;
    const adjustedData: AQIData = {
      ...data,
      aqi: Math.min(500, data.aqi + spikeOffset),
      co: data.co + spikeOffset * 0.5,
      smoke: data.smoke + spikeOffset * 0.3,
    };

    setLatest(adjustedData);

    const now = new Date();
    const jitter = (Math.random() - 0.5) * 10;
    const point: HistoryPoint = {
      timestamp: now.toISOString(),
      aqi: Math.max(30, Math.min(400, Math.round(adjustedData.aqi + jitter))),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHistory(prev => [...prev, point].slice(-MAX_HISTORY));
  }, [spikeMode]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { latest, history, loading, error, lastUpdated, refresh, spikeMode, setSpikeMode };
}
