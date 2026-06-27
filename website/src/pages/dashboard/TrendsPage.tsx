import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { TrendUp } from '@phosphor-icons/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { MOCK_HISTORY, MOCK_CO_HISTORY, MOCK_TEMP_HISTORY } from '../../lib/mockData';

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

const AXIS_TICK = {
  fontSize: 10,
  fill: '#666',
  fontWeight: 700,
  fontFamily: '"Geist Mono", monospace',
};

const TOOLTIP_STYLE = {
  background: '#111114',
  border: '1px dotted #2a2a30',
  borderRadius: 0,
  fontSize: 11,
  fontFamily: '"Geist Mono", monospace',
};

export default function TrendsPage() {
  const { history } = useOutletContext<DashboardContext>();

  // Merge context history with mock for richer data
  const allHistory = [...MOCK_HISTORY];
  if (history.length > 0) {
    // Append real data at the end
    history.forEach((h: any) => {
      if (h.aqi != null) {
        allHistory.push({ timestamp: h.timestamp, aqi: h.aqi, time: h.time });
      }
    });
  }

  const aqiValues = allHistory.map(h => h.aqi).filter(v => v != null);
  const minAqi = aqiValues.length > 0 ? Math.min(...aqiValues) : 0;
  const maxAqi = aqiValues.length > 0 ? Math.max(...aqiValues) : 0;
  const avgAqi = aqiValues.length > 0
    ? Math.round((aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) * 10) / 10
    : 0;

  const summaryCards = [
    { label: 'Min AQI', value: minAqi },
    { label: 'Max AQI', value: maxAqi },
    { label: 'Avg AQI', value: avgAqi },
  ];

  // Chart data
  const aqiData = allHistory.slice(-48);
  const coData = MOCK_CO_HISTORY.slice(-48);
  const tempData = MOCK_TEMP_HISTORY.slice(-48);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <TrendUp weight="thin" className="h-5 w-5 text-primary" />
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary">
          Trends & Analytics
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-ds border border-dotted border-db p-6 hover:-translate-y-px transition-transform"
          >
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dm mb-3">
              {card.label}
            </p>
            <p className="font-display text-4xl font-bold text-dh tracking-tight">
              {card.value}
            </p>
            <p className="text-[10px] font-mono text-dsc mt-1">
              from {aqiValues.length} readings
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AQI Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
            AQI Trend
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={aqiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqi-trend-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4040" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff4040" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,48,0.8)" vertical={false} />
              <XAxis dataKey="time" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 400]} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={100} stroke="#a3e635" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#ff4040"
                strokeWidth={2}
                fill="url(#aqi-trend-grad)"
                dot={false}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* CO Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
            CO Trend
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={coData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="co-trend-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,48,0.8)" vertical={false} />
              <XAxis dataKey="time" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#co-trend-grad)"
                dot={false}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Temperature Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-ds border border-dotted border-db p-6"
        >
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
            Temperature Trend
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tempData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="temp-trend-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,48,0.8)" vertical={false} />
              <XAxis dataKey="time" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#temp-trend-grad)"
                dot={false}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
