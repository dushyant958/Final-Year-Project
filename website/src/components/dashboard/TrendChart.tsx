import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryPoint } from '../../hooks/useAQIData';

interface Props { history: HistoryPoint[]; }

function aqiColor(aqi: number) {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#a3e635';
  if (aqi <= 200) return '#f59e0b';
  if (aqi <= 300) return '#ef4444';
  if (aqi <= 400) return '#a855f7';
  return '#7f1d1d';
}

const AXIS_TICK = {
  fontSize: 10,
  fill: '#666666',
  fontWeight: 600,
  fontFamily: '"Geist Mono", monospace',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div className="px-3 py-2 bg-de border border-dotted border-db">
      <p className="text-[10px] font-mono text-dm">{label}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color: aqiColor(v) }}>{v}</p>
    </div>
  );
};

export function TrendChart({ history }: Props) {
  const data = history.slice(-48);

  if (data.length === 0) {
    return (
      <div className="bg-ds border border-dotted border-db p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-1.5 bg-de animate-pulse" />
          <div className="w-32 h-1.5 bg-de animate-pulse" />
          <p className="text-[10px] font-mono text-dm mt-3">Collecting data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-ds border border-dotted border-db p-6"
    >
      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dsc">
        AQI Trend · Last {data.length} readings
      </span>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqi-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,48,0.6)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              dy={8}
            />
            <YAxis
              domain={[0, 'auto']}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#aqi-grad)"
              dot={false}
              activeDot={{ r: 3, fill: '#22c55e', stroke: '#111114', strokeWidth: 2 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
