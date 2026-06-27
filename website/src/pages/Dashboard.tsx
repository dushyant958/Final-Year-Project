import { motion } from 'motion/react';
import { Heartbeat, ShieldCheck, MapPin } from '@phosphor-icons/react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorCard } from '../components/dashboard/SensorCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { WindPanel } from '../components/dashboard/WindPanel';
import { MOCK_HISTORY, MOCK_CO_HISTORY, MOCK_TEMP_HISTORY, MOCK_HUMIDITY_HISTORY } from '../lib/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const HEALTH_ADVICE: Record<string, { text: string; actions: string[] }> = {
  Good: { text: 'Air quality is excellent. No health risk.', actions: ['Enjoy outdoor activities', 'Windows can stay open'] },
  Satisfactory: { text: 'Acceptable for most people.', actions: ['Generally safe for outdoors', 'Sensitive individuals monitor'] },
  Moderate: { text: 'Some pollutants may affect sensitive groups.', actions: ['Reduce prolonged outdoor exertion', 'Close windows during peak hours'] },
  Poor: { text: 'Everyone may experience health effects.', actions: ['Avoid outdoor exercise', 'Use air purifier indoors'] },
  'Very Poor': { text: 'Health warnings. Serious effects possible.', actions: ['Stay indoors', 'Run air purifiers on high'] },
  Severe: { text: 'Emergency conditions.', actions: ['Do not go outside', 'Seal windows and doors'] },
};

const AXIS = { fontSize: 9, fill: '#666', fontWeight: 600, fontFamily: '"Geist Mono", monospace' };
const TT = { background: '#111114', border: '1px dotted #2a2a30', fontSize: 11, fontFamily: '"Geist Mono"' };

interface Ctx { latest: any; history: any[]; loading: boolean; aqi: number; cat: any; online: boolean; lastUpdated: Date | null; }
const ease = [0.22, 1, 0.36, 1];

export default function Dashboard() {
  const { latest, history, loading, aqi, cat, online, lastUpdated } = useOutletContext<Ctx>();
  const advice = HEALTH_ADVICE[cat.label] ?? HEALTH_ADVICE.Good;
  const chartHistory = history.length > 5 ? history : MOCK_HISTORY;

  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="flex-1 p-6 space-y-5 max-w-[1400px]">

      {/* Row 1: AQI + Map + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AQI */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, ease }}
          className="lg:col-span-3 bg-ds border border-dotted border-db p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cat.color }} />
          <div className="flex items-center gap-2 mb-5">
            <Heartbeat weight="thin" className="h-4 w-4 text-dsc" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dsc">Air Quality Index</span>
          </div>
          <span className="text-5xl font-bold tracking-tight tabular-nums" style={{ color: cat.color }}>
            {loading ? '—' : Math.round(aqi)}
          </span>
          <span className="text-sm font-mono text-dm ml-2">/ 500</span>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
            <span className="text-sm text-dbd">{cat.label}</span>
            <span className="text-[10px] text-dm font-mono ml-auto">AQI {cat.min}–{cat.max}</span>
          </div>
          <div className="mt-3 h-1.5 bg-de w-full">
            <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, (aqi / 500) * 100)}%`, background: cat.color }} />
          </div>
        </motion.div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, ease }}
          className="lg:col-span-5 bg-ds border border-dotted border-db overflow-hidden relative" style={{ minHeight: 240 }}>
          <div className="absolute top-3 left-4 z-[1000] flex items-center gap-1.5">
            <MapPin weight="thin" className="h-3.5 w-3.5 text-dsc" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-dsc">Pimpri-Chinchwad, Pune</span>
          </div>
          <MapContainer center={[18.6298, 73.7997]} zoom={12} scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', minHeight: 240 }}
            attributionControl={false} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[18.6298, 73.7997]}>
              <Popup>
                <div style={{ fontFamily: '"Geist Mono"', fontSize: 11, color: '#111' }}>
                  <strong>AQI Node 01</strong><br />
                  AQI: {Math.round(aqi)} · {cat.label}<br />
                  18.6298°N, 73.7997°E
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </motion.div>

        {/* Health */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, ease }}
          className="lg:col-span-4 bg-ds border border-dotted border-db p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck weight="thin" className="h-4 w-4 text-dsc" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dsc">Health Advisory</span>
          </div>
          <p className="text-sm text-dbd leading-relaxed mb-4">{advice.text}</p>
          <div className="mt-auto">
            <p className="text-[9px] font-mono uppercase tracking-widest text-dm mb-2">Recommended</p>
            <ul className="space-y-1.5">
              {advice.actions.map(a => (
                <li key={a} className="flex items-start gap-2 text-xs text-dsc">
                  <span className="w-1 h-1 rounded-full bg-dsc mt-1.5 shrink-0" />{a}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Sensor Cards — only gas sensors, no duplicates */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'CO', unit: 'µg/m³', value: latest?.co, color: '#f59e0b', decimals: 1 },
          { label: 'NH₃', unit: 'µg/m³', value: latest?.nh3, color: '#8b5cf6', decimals: 1 },
          { label: 'Benzene', unit: 'µg/m³', value: latest?.benzene, color: '#10b981', decimals: 1 },
          { label: 'Smoke', unit: 'µg/m³', value: latest?.smoke, color: '#ef4444', decimals: 1 },
          { label: 'Temp', unit: '°C', value: latest?.temperature, color: '#3b82f6', decimals: 1 },
          { label: 'Humidity', unit: '%', value: latest?.humidity, color: '#06b6d4', decimals: 1 },
          { label: 'Pressure', unit: 'hPa', value: latest?.pressure, color: '#6366f1', decimals: 1 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease }}>
            <SensorCard label={s.label} unit={s.unit} value={s.value ?? null} color={s.color} decimals={s.decimals} />
          </motion.div>
        ))}
      </div>

      {/* Row 3: AQI Trend + Device Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ease }} className="lg:col-span-2">
          <TrendChart history={chartHistory} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease }} className="bg-ds border border-dotted border-db p-6">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dsc">Device Info</span>
          <div className="mt-4 space-y-3">
            {[['Device','AQI_NODE_01'],['Location','Pimpri, Pune'],['MCU','STM32F407'],['Model','XGBoost · m2cgen'],['R²','0.8606'],['Updated',lastUpdated?.toLocaleTimeString('en-IN')??'—'],['Status',online?'Online':'Offline']].map(([l,v])=>(
              <div key={l} className="flex justify-between text-xs border-b border-dotted border-db pb-2">
                <span className="text-dm font-mono">{l}</span><span className="text-dbd">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4: Multi-parameter charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          { title: 'CO Concentration', data: MOCK_CO_HISTORY, color: '#f59e0b', unit: 'µg/m³' },
          { title: 'Temperature', data: MOCK_TEMP_HISTORY, color: '#3b82f6', unit: '°C' },
          { title: 'Humidity', data: MOCK_HUMIDITY_HISTORY, color: '#06b6d4', unit: '%' },
        ].map((chart, i) => (
          <motion.div key={chart.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.08, ease }}
            className="bg-ds border border-dotted border-db p-5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-dsc">{chart.title}</span>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,48,0.5)" vertical={false} />
                  <XAxis dataKey="time" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={6} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="value" stroke={chart.color} strokeWidth={1.5}
                    fill={`url(#grad-${i})`} dot={false} animationDuration={1200} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 5: Wind Panel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, ease }}>
        <WindPanel aqi={aqi} />
      </motion.div>

      {/* Footer */}
      <div className="bg-ds border border-dotted border-db px-6 py-3 flex items-center justify-between text-[10px] font-mono text-dm">
        <span>S3 sync every 30s · Auto-refresh active</span>
        <span className="text-dsc">v1.0.3</span>
      </div>
    </motion.main>
  );
}
