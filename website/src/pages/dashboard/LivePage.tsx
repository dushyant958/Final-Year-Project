import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { Pulse } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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

const PRIMARY_STATS = [
  { key: 'aqi', label: 'AQI', unit: '' },
  { key: 'temperature', label: 'Temperature', unit: '\u00b0C' },
  { key: 'humidity', label: 'Humidity', unit: '% RH' },
  { key: 'pressure', label: 'Pressure', unit: 'hPa' },
];

const SECONDARY_STATS = [
  { key: 'co', label: 'CO', unit: '\u00b5g/m\u00b3' },
  { key: 'nh3', label: 'NH\u2083', unit: '\u00b5g/m\u00b3' },
  { key: 'benzene', label: 'Benzene', unit: '\u00b5g/m\u00b3' },
  { key: 'smoke', label: 'Smoke', unit: '\u00b5g/m\u00b3' },
];

export default function LivePage() {
  const { latest, aqi } = useOutletContext<DashboardContext>();

  const getValue = (key: string) => {
    if (key === 'aqi') return aqi ?? null;
    return latest?.[key] ?? null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Live
        </span>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRIMARY_STATS.map((stat, idx) => {
          const val = getValue(stat.key);
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'bg-ds border border-dotted border-db p-6',
                'hover:-translate-y-px transition-transform'
              )}
              style={{ borderRadius: 0 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(255,64,64,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div className="h-[2px] bg-primary opacity-60 -mx-6 -mt-6 mb-5" />
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-3">
                {stat.label}
              </p>
              <p className="font-display text-5xl font-bold text-dh tracking-tight">
                {val != null ? (typeof val === 'number' ? val.toFixed(1) : val) : '\u2014'}
              </p>
              <p className="text-[10px] font-mono text-dsc mt-1">{stat.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SECONDARY_STATS.map((stat, idx) => {
          const val = getValue(stat.key);
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (idx + 4) * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'bg-ds border border-dotted border-db p-6',
                'hover:-translate-y-px transition-transform'
              )}
              style={{ borderRadius: 0 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(255,64,64,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div className="h-[2px] bg-primary opacity-60 -mx-6 -mt-6 mb-5" />
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-3">
                {stat.label}
              </p>
              <p className="font-display text-3xl font-bold text-dh tracking-tight">
                {val != null ? (typeof val === 'number' ? val.toFixed(2) : val) : '\u2014'}
              </p>
              <p className="text-[10px] font-mono text-dsc mt-1">{stat.unit}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
