import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import {
  Thermometer, Drop, Gauge, Fire, Flask, Wind, Cloud, Heartbeat,
} from '@phosphor-icons/react';
import { getAQICategory } from '../../lib/aqi';

type DashboardContext = {
  latest: any;
  history: any[];
  loading: boolean;
  error: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
  aqi: number;
  cat: any;
  online: boolean;
};

const SENSORS = [
  { key: 'aqi', label: 'AQI', unit: '', icon: Heartbeat, color: '#ff4040', thresholds: [100, 200] },
  { key: 'temperature', label: 'Temperature', unit: '\u00b0C', icon: Thermometer, color: '#3b82f6', thresholds: [35, 42] },
  { key: 'humidity', label: 'Humidity', unit: '% RH', icon: Drop, color: '#06b6d4', thresholds: [70, 85] },
  { key: 'pressure', label: 'Pressure', unit: 'hPa', icon: Gauge, color: '#6366f1', thresholds: [1020, 1040] },
  { key: 'co', label: 'CO', unit: '\u00b5g/m\u00b3', icon: Fire, color: '#f59e0b', thresholds: [2000, 4000] },
  { key: 'nh3', label: 'NH\u2083', unit: '\u00b5g/m\u00b3', icon: Flask, color: '#8b5cf6', thresholds: [200, 400] },
  { key: 'benzene', label: 'Benzene', unit: '\u00b5g/m\u00b3', icon: Wind, color: '#10b981', thresholds: [5, 10] },
  { key: 'smoke', label: 'Smoke / PM2.5', unit: '\u00b5g/m\u00b3', icon: Cloud, color: '#ef4444', thresholds: [60, 120] },
];

function getStatus(value: number | null, thresholds: number[]): { label: string; color: string } {
  if (value == null) return { label: 'N/A', color: '#666' };
  if (value > thresholds[1]) return { label: 'High', color: '#ef4444' };
  if (value > thresholds[0]) return { label: 'Elevated', color: '#f59e0b' };
  return { label: 'Normal', color: '#22c55e' };
}

export default function LivePage() {
  const { latest, aqi, cat } = useOutletContext<DashboardContext>();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const getValue = (key: string): number | null => {
    if (key === 'aqi') return aqi ?? null;
    return latest?.[key] ?? null;
  };

  const currentCat = getAQICategory(aqi ?? 0);
  const HEALTH_ADVICE: Record<string, string> = {
    Good: 'Air quality is great. Perfect for outdoor activities.',
    Satisfactory: 'Air quality is acceptable. Sensitive individuals may notice mild effects.',
    Moderate: 'Air quality is acceptable. However, some pollutants may concern sensitive groups.',
    Poor: 'Everyone may experience health effects. Limit prolonged outdoor exertion.',
    'Very Poor': 'Health warnings. Reduce time outdoors, especially for children and elderly.',
    Severe: 'Emergency conditions. Avoid all outdoor activity. Wear N95 mask if going out.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Live indicator + timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
            Live Monitoring
          </span>
        </div>
        <span className="text-[10px] font-mono text-dm">
          {now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
        </span>
      </div>

      {/* 2x4 Sensor grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SENSORS.map((sensor, idx) => {
          const Icon = sensor.icon;
          const val = getValue(sensor.key);
          const status = getStatus(val, sensor.thresholds);
          return (
            <motion.div
              key={sensor.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-ds border border-dotted border-db p-5 relative overflow-hidden hover:-translate-y-px transition-transform"
            >
              {/* 2px accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: sensor.color }}
              />
              <div className="flex items-center justify-between mb-3">
                <Icon weight="thin" className="h-5 w-5" style={{ color: sensor.color }} />
                <span
                  className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5"
                  style={{ color: status.color, backgroundColor: `${status.color}15` }}
                >
                  {status.label}
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-dm mb-1">
                {sensor.label}
              </p>
              <p className="font-display text-4xl font-bold text-dh tracking-tight">
                {val != null ? (typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val) : '\u2014'}
              </p>
              <p className="text-[10px] font-mono text-dsc mt-1">{sensor.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* AQI Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-ds border border-dotted border-db p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div
              className="font-display text-6xl font-bold tracking-tighter"
              style={{ color: currentCat.color }}
            >
              {aqi ?? '\u2014'}
            </div>
            <div>
              <p
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: currentCat.color }}
              >
                {currentCat.label}
              </p>
              <p className="text-[10px] font-mono text-dm uppercase tracking-widest">
                AQI {currentCat.min}&ndash;{currentCat.max}
              </p>
            </div>
          </div>
          <div className="flex-1 border-l border-dotted border-db pl-6 hidden md:block">
            <p className="text-[10px] font-mono text-dm uppercase tracking-widest mb-1">Health Advisory</p>
            <p className="text-sm text-dbd leading-relaxed">
              {HEALTH_ADVICE[currentCat.label] ?? ''}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
