import { motion } from 'motion/react';
import { CloudArrowUp, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAQIData } from '../hooks/useAQIData';
import { getAQICategory } from '../lib/aqi';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashHeader } from '../components/dashboard/DashHeader';
import { AQIGauge } from '../components/dashboard/AQIGauge';
import { SensorCard } from '../components/dashboard/SensorCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { WindPanel } from '../components/dashboard/WindPanel';

const HEALTH_ADVICE: Record<string, string> = {
  Good: 'Air quality is great. Perfect for outdoor activities.',
  Satisfactory:
    'Air quality is acceptable. Sensitive individuals may notice mild effects.',
  Moderate:
    'Air quality is acceptable. However, some pollutants may concern sensitive groups.',
  Poor: 'Everyone may experience health effects. Limit prolonged outdoor exertion.',
  'Very Poor':
    'Health warnings. Reduce time outdoors, especially for children and elderly.',
  Severe:
    'Emergency conditions. Avoid all outdoor activity. Wear N95 mask if going out.',
};

export default function Dashboard() {
  const { latest, history, loading, error, lastUpdated, refresh } =
    useAQIData();

  const aqi = latest?.aqi ?? 0;
  const cat = getAQICategory(aqi);
  const online = !error && !loading;

  return (
    <div className="dashboard-shell flex min-h-screen bg-dbg font-sans">
      {/* Dot pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <Sidebar online={online} />

      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen relative z-[2]">
        <DashHeader
          online={online}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-1 p-6 space-y-6 max-w-[1400px]"
        >
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* AQI Gauge card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-ds border border-dotted border-db p-6 flex flex-col hover:-translate-y-px transition-transform"
              style={{
                boxShadow: '0 0 0 0 rgba(255,64,64,0)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(255,64,64,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 0 0 0 rgba(255,64,64,0)';
              }}
            >
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
                Air Quality Index
              </p>
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-dm text-sm font-mono">
                  Fetching latest reading...
                </div>
              ) : (
                <AQIGauge aqi={aqi} />
              )}
            </motion.div>

            {/* Category card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="bg-ds border border-dotted border-db p-6 flex flex-col justify-between hover:-translate-y-px transition-transform"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(255,64,64,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
                Category
              </p>
              <div>
                <div
                  className="text-3xl font-display font-bold tracking-tight"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </div>
                <div className="text-[11px] font-mono text-dm mt-1">
                  AQI {cat.min}&ndash;{cat.max}
                </div>
              </div>
            </motion.div>

            {/* Health advice card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.4 }}
              className="bg-ds border border-dotted border-db p-6 flex flex-col hover:-translate-y-px transition-transform"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(255,64,64,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
                Health Advice
              </p>
              <div className="flex gap-2 items-start">
                <Info weight="thin" className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-dbd leading-relaxed">
                  {HEALTH_ADVICE[cat.label]}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Sensor Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'CO',
                unit: 'Carbon Monoxide · \u00b5g/m\u00b3',
                value: latest?.co ?? null,
                color: '#f59e0b',
                decimals: 0,
              },
              {
                label: 'NH\u2083',
                unit: 'Ammonia · \u00b5g/m\u00b3',
                value: latest?.nh3 ?? null,
                color: '#8b5cf6',
              },
              {
                label: 'Benzene',
                unit: 'Benzene · \u00b5g/m\u00b3',
                value: latest?.benzene ?? null,
                color: '#10b981',
              },
              {
                label: 'Smoke / PM2.5',
                unit: 'Smoke proxy · \u00b5g/m\u00b3',
                value: latest?.smoke ?? null,
                color: '#ef4444',
              },
              {
                label: 'Temperature',
                unit: '\u00b0C',
                value: latest?.temperature ?? null,
                color: '#3b82f6',
              },
              {
                label: 'Humidity',
                unit: '% RH',
                value: latest?.humidity ?? null,
                color: '#06b6d4',
              },
              {
                label: 'Pressure',
                unit: 'hPa',
                value: latest?.pressure ?? null,
                color: '#6366f1',
                decimals: 1,
              },
            ].map((sensor, idx) => (
              <motion.div
                key={sensor.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
              >
                <SensorCard
                  label={sensor.label}
                  unit={sensor.unit}
                  value={sensor.value}
                  color={sensor.color}
                  decimals={sensor.decimals}
                />
              </motion.div>
            ))}
          </div>

          {/* Row 3: Charts (2-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-ds border border-dotted border-db p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
                  AQI Trend
                </p>
                <span className="text-[10px] font-mono text-dm">
                  {history.length} readings &middot; last 24h
                </span>
              </div>
              <TrendChart history={history} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.4 }}
              className="bg-ds border border-dotted border-db p-6"
            >
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
                Latest Reading
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Device ID', val: 'AQI_NODE_01' },
                  { label: 'Location', val: 'Pimpri, Pune, India' },
                  { label: 'Coordinates', val: '18.6298\u00b0N \u00b7 73.7997\u00b0E' },
                  { label: 'Data Source', val: 'STM32F407 + IoT Sensors' },
                  { label: 'Prediction Model', val: 'XGBoost (via m2cgen)' },
                  {
                    label: 'Last Updated',
                    val: lastUpdated?.toLocaleString('en-IN') ?? '\u2014',
                  },
                  { label: 'Timestamp (UTC)', val: latest?.timestamp ?? '\u2014' },
                  {
                    label: 'Upload Status',
                    val: online ? 'S3 Cloud' : 'Offline',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-start gap-2 text-xs border-b border-dotted border-db pb-2"
                  >
                    <span className="text-dm font-mono shrink-0">
                      {row.label}
                    </span>
                    <span className="text-dbd font-medium text-right">
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Row 4: Wind Panel (full width) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.4 }}
          >
            <WindPanel aqi={aqi} />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.4 }}
            className="bg-ds border border-dotted border-db px-6 py-4 flex items-center justify-between text-[11px] font-mono text-dm"
          >
            <div className="flex items-center gap-3">
              <CloudArrowUp weight="thin" className="h-5 w-5 text-primary" />
              <span>
                Data pushed to S3 every 30s &middot; Dashboard auto-refreshes
                every 30s
              </span>
            </div>
            <span className="text-dsc">
              Designed for a cleaner tomorrow
            </span>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
