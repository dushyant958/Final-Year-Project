import { motion } from 'motion/react';
import { CloudArrowUp, Info } from '@phosphor-icons/react';
import { useOutletContext } from 'react-router-dom';
import { AQIGauge } from '../components/dashboard/AQIGauge';
import { SensorCard } from '../components/dashboard/SensorCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { WindPanel } from '../components/dashboard/WindPanel';

const HEALTH_ADVICE: Record<string, string> = {
  Good: 'Air quality is great. Perfect for outdoor activities.',
  Satisfactory: 'Air quality is acceptable. Sensitive individuals may notice mild effects.',
  Moderate: 'Air quality is acceptable. However, some pollutants may concern sensitive groups.',
  Poor: 'Everyone may experience health effects. Limit prolonged outdoor exertion.',
  'Very Poor': 'Health warnings. Reduce time outdoors, especially for children and elderly.',
  Severe: 'Emergency conditions. Avoid all outdoor activity. Wear N95 mask if going out.',
};

const HEALTH_ACTIONS: Record<string, string[]> = {
  Good: ['Enjoy outdoor activities', 'Windows can stay open'],
  Satisfactory: ['Generally safe for outdoors', 'Sensitive individuals should monitor'],
  Moderate: ['Reduce prolonged outdoor exertion', 'Keep windows closed during peak hours'],
  Poor: ['Avoid outdoor exercise', 'Use air purifier indoors', 'Wear N95 mask outside'],
  'Very Poor': ['Stay indoors', 'Run air purifiers on high', 'Seek medical help if symptoms appear'],
  Severe: ['Do not go outside', 'Seal windows', 'Emergency protocols'],
};

interface Ctx {
  latest: any;
  history: any[];
  loading: boolean;
  aqi: number;
  cat: any;
  online: boolean;
  lastUpdated: Date | null;
}

export default function Dashboard() {
  const { latest, history, loading, aqi, cat, online, lastUpdated } = useOutletContext<Ctx>();

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 p-6 space-y-6 max-w-[1400px]"
    >
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6 flex flex-col group hover:-translate-y-px transition-transform"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-dsc mb-4">
            Air Quality Index
          </p>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="shimmer inline-block h-16 w-24" />
            </div>
          ) : (
            <AQIGauge aqi={aqi} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6 flex flex-col justify-between group hover:-translate-y-px transition-transform"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-dsc mb-4">
            Category
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-2xl font-display font-bold text-dh">{cat.label}</span>
            </div>
            <div className="text-xs font-mono text-dm">
              AQI {cat.min}&ndash;{cat.max}
            </div>
            <div className="h-1 w-full" style={{ backgroundColor: cat.color }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6 flex flex-col group hover:-translate-y-px transition-transform"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-dsc mb-4">
            Health Advisory
          </p>
          <div className="space-y-3 flex-1">
            <div className="flex gap-2 items-start">
              <Info weight="thin" className="h-4 w-4 text-dsc mt-0.5 shrink-0" />
              <p className="text-sm text-dbd leading-relaxed">{HEALTH_ADVICE[cat.label]}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-2">Recommended Actions</p>
              <ul className="space-y-1">
                {(HEALTH_ACTIONS[cat.label] ?? []).map((action) => (
                  <li key={action} className="text-xs text-dbd flex items-start gap-2">
                    <span className="text-dm mt-1 shrink-0">&bull;</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CO', unit: 'Carbon Monoxide · µg/m³', value: latest?.co ?? null, color: '#f59e0b', decimals: 0 },
          { label: 'NH₃', unit: 'Ammonia · µg/m³', value: latest?.nh3 ?? null, color: '#8b5cf6' },
          { label: 'Benzene', unit: 'Benzene · µg/m³', value: latest?.benzene ?? null, color: '#10b981' },
          { label: 'Smoke / PM2.5', unit: 'Smoke proxy · µg/m³', value: latest?.smoke ?? null, color: '#ef4444' },
          { label: 'Temperature', unit: '°C', value: latest?.temperature ?? null, color: '#3b82f6' },
          { label: 'Humidity', unit: '% RH', value: latest?.humidity ?? null, color: '#06b6d4' },
          { label: 'Pressure', unit: 'hPa', value: latest?.pressure ?? null, color: '#6366f1', decimals: 1 },
        ].map((sensor, idx) => (
          <motion.div
            key={sensor.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <SensorCard label={sensor.label} unit={sensor.unit} value={sensor.value} color={sensor.color} decimals={sensor.decimals} />
          </motion.div>
        ))}
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-dsc">AQI Trend</p>
            <span className="text-[10px] font-mono text-dm">{history.length} readings</span>
          </div>
          <TrendChart history={history} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-dsc mb-4">Device Info</p>
          <div className="space-y-3">
            {[
              { label: 'Device ID', val: 'AQI_NODE_01' },
              { label: 'Location', val: 'Pimpri, Pune, India' },
              { label: 'Coordinates', val: '18.6298°N · 73.7997°E' },
              { label: 'Model', val: 'XGBoost (m2cgen)' },
              { label: 'Last Updated', val: lastUpdated?.toLocaleString('en-IN') ?? '—' },
              { label: 'Status', val: online ? 'Online — S3 Cloud' : 'Offline' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-start gap-2 text-xs border-b border-dotted border-db pb-2">
                <span className="text-dm font-mono shrink-0">{row.label}</span>
                <span className="text-dbd font-medium text-right">{row.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4: Wind Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.66, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <WindPanel aqi={aqi} />
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.74 }}
        className="bg-ds border border-dotted border-db px-6 py-4 flex items-center justify-between text-[11px] font-mono text-dm"
      >
        <div className="flex items-center gap-3">
          <CloudArrowUp weight="thin" className="h-5 w-5 text-dsc" />
          <span>Data pushed to S3 every 30s · Dashboard auto-refreshes</span>
        </div>
        <span className="text-dsc">Designed for a cleaner tomorrow</span>
      </motion.div>
    </motion.main>
  );
}
