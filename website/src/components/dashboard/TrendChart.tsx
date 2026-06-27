import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { HistoryPoint } from '../../hooks/useAQIData';

interface Props { history: HistoryPoint[]; }

const ZONES = [
  { y: 50,  color: '#16a34a', label: 'Good' },
  { y: 100, color: '#65a30d', label: 'Satisfactory' },
  { y: 200, color: '#d97706', label: 'Moderate' },
  { y: 300, color: '#dc2626', label: 'Poor' },
  { y: 400, color: '#9333ea', label: 'Very Poor' },
];

function aqiColor(aqi: number) {
  if (aqi <= 50)  return '#16a34a';
  if (aqi <= 100) return '#65a30d';
  if (aqi <= 200) return '#d97706';
  if (aqi <= 300) return '#dc2626';
  if (aqi <= 400) return '#9333ea';
  return '#7f1d1d';
}

const AXIS_TICK = {
  fontSize: 10,
  fill: '#999999',
  fontWeight: 700,
  fontFamily: '"Geist Mono", monospace',
};

const TOOLTIP_STYLE = {
  background: '#242424',
  border: '1px dotted #3D3D3D',
  borderRadius: 0,
  fontSize: 11,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div className="px-4 py-3" style={TOOLTIP_STYLE}>
      <p className="text-[10px] font-mono text-dm mb-1">{label}</p>
      <p className="font-display font-bold text-xl" style={{ color: aqiColor(v) }}>{v}</p>
      <p className="text-[10px] font-mono text-dsc">AQI</p>
    </div>
  );
};

export function TrendChart({ history }: Props) {
  const data = history.slice(-48);

  if (data.length === 0) {
    return (
      <div className={cn(
        'bg-ds border border-dotted border-db p-6 rounded-none',
        'flex items-center justify-center h-48'
      )}>
        {/* Shimmer loading animation */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-48 h-2 bg-de rounded-none animate-pulse" />
          <div className="w-32 h-2 bg-de rounded-none animate-pulse" />
          <p className="text-[10px] font-mono text-dm uppercase tracking-widest mt-2">
            Collecting data&hellip; readings appear every 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
      className={cn('bg-ds border border-dotted border-db p-6 rounded-none')}
    >
      <h3 className="font-display font-bold text-lg tracking-tight text-dh mb-4">
        AQI Trend
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqi-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ff4040" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ff4040" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,61,61,0.5)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 500]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          {ZONES.map(z => (
            <ReferenceLine
              key={z.y}
              y={z.y}
              stroke={z.color}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{
                value: z.label,
                position: 'right',
                fontSize: 9,
                fill: z.color,
                fontFamily: '"Geist Mono", monospace',
              }}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#ff4040"
            strokeWidth={2}
            fill="url(#aqi-grad)"
            dot={false}
            activeDot={{ r: 4, fill: '#ff4040' }}
            radius={[0, 0, 0, 0] as any}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
