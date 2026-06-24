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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-black text-xl" style={{ color: aqiColor(v) }}>{v}</p>
      <p className="text-xs text-gray-400">AQI</p>
    </div>
  );
};

export function TrendChart({ history }: Props) {
  // Show last 48 points (24 min if 30s interval) — keeps chart readable
  const data = history.slice(-48);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
        Collecting data… readings appear every 30 seconds.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="aqi-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 500]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        {ZONES.map(z => (
          <ReferenceLine key={z.y} y={z.y} stroke={z.color} strokeDasharray="4 4" strokeOpacity={0.4}
            label={{ value: z.label, position: 'right', fontSize: 9, fill: z.color }} />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={2}
          fill="url(#aqi-grad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
