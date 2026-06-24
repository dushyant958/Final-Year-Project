import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLatestAQI, type AQIData } from '../lib/aqi';

export interface HistoryPoint {
  timestamp: string;
  aqi: number;
  time: string;
}

const HISTORY_KEY = 'aqi_history';
const MAX_HISTORY = 96; // 48 hours at 30s intervals

function loadHistory(): HistoryPoint[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(h: HistoryPoint[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* ignore */ }
}

export function useAQIData() {
  const [latest, setLatest] = useState<AQIData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>(() => loadHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastTs = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await fetchLatestAQI();
    if (!data) { setError(true); setLoading(false); return; }
    setError(false);
    setLatest(data);
    setLastUpdated(new Date());
    setLoading(false);

    if (data.timestamp !== lastTs.current) {
      lastTs.current = data.timestamp;
      const point: HistoryPoint = {
        timestamp: data.timestamp,
        aqi: Math.round(data.aqi),
        time: new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory(prev => {
        const next = [...prev.filter(p => p.timestamp !== data.timestamp), point]
          .slice(-MAX_HISTORY);
        saveHistory(next);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { latest, history, loading, error, lastUpdated, refresh };
}
