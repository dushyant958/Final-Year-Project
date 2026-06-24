import { useAQIData } from '../hooks/useAQIData';
import { getAQICategory } from '../lib/aqi';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashHeader } from '../components/dashboard/DashHeader';
import { AQIGauge } from '../components/dashboard/AQIGauge';
import { SensorCard } from '../components/dashboard/SensorCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { WindPanel } from '../components/dashboard/WindPanel';

const HEALTH_ADVICE: Record<string, string> = {
  'Good':         'Air quality is great. Perfect for outdoor activities.',
  'Satisfactory': 'Air quality is acceptable. Sensitive individuals may notice mild effects.',
  'Moderate':     'Air quality is acceptable. However, some pollutants may concern sensitive groups.',
  'Poor':         'Everyone may experience health effects. Limit prolonged outdoor exertion.',
  'Very Poor':    'Health warnings. Reduce time outdoors, especially for children and elderly.',
  'Severe':       'Emergency conditions. Avoid all outdoor activity. Wear N95 mask if going out.',
};

export default function Dashboard() {
  const { latest, history, loading, error, lastUpdated, refresh } = useAQIData();

  const aqi = latest?.aqi ?? 0;
  const cat = getAQICategory(aqi);
  const online = !error && !loading;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar online={online} />

      <div className="ml-[215px] flex-1 flex flex-col min-h-screen">
        <DashHeader online={online} lastUpdated={lastUpdated} onRefresh={refresh} />

        <main className="flex-1 p-6 space-y-5">

          {/* Row 1: AQI Gauge + Sensor Cards */}
          <div className="grid grid-cols-12 gap-5">

            {/* AQI Gauge card */}
            <div className="col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-4">Air Quality Index (AQI)</p>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                  Fetching latest reading…
                </div>
              ) : (
                <>
                  <AQIGauge aqi={aqi} />
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 items-start">
                    <span className="text-amber-500 text-sm mt-0.5">ⓘ</span>
                    <p className="text-xs text-amber-700 leading-relaxed">{HEALTH_ADVICE[cat.label]}</p>
                  </div>
                </>
              )}
            </div>

            {/* Sensor Cards 2×4 grid */}
            <div className="col-span-7 grid grid-cols-4 gap-4 content-start">
              <SensorCard label="CO" unit="Carbon Monoxide · μg/m³" value={latest?.co ?? null}
                color="#f59e0b" icon="☁️" decimals={0} />
              <SensorCard label="NH₃" unit="Ammonia · μg/m³" value={latest?.nh3 ?? null}
                color="#8b5cf6" icon="🧪" />
              <SensorCard label="Benzene" unit="Benzene · μg/m³" value={latest?.benzene ?? null}
                color="#10b981" icon="⬡" />
              <SensorCard label="Smoke / PM2.5" unit="Smoke proxy · μg/m³" value={latest?.smoke ?? null}
                color="#ef4444" icon="💨" />
              <SensorCard label="Temperature" unit="°C" value={latest?.temperature ?? null}
                color="#3b82f6" icon="🌡️" />
              <SensorCard label="Humidity" unit="% RH" value={latest?.humidity ?? null}
                color="#06b6d4" icon="💧" />
              <SensorCard label="Pressure" unit="hPa" value={latest?.pressure ?? null}
                color="#6366f1" icon="🌀" decimals={1} />
              {/* 8th slot — AQI category badge */}
              <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: cat.color }}>Category</span>
                  <span className="text-xl">🏷️</span>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-gray-900">{cat.label}</div>
                  <div className="text-xs text-gray-400 mt-1">AQI {cat.min}–{cat.max}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Trend Chart + Latest Reading */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-blue-500">AQI Trend</p>
                <span className="text-xs text-gray-400">
                  {history.length} readings stored · last 24 hours
                </span>
              </div>
              <TrendChart history={history} />
            </div>

            <div className="col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-4">Latest Reading</p>
              <div className="space-y-3">
                {[
                  { label: 'Device ID',        val: 'AQI_NODE_01' },
                  { label: 'Location',         val: '📍 Pimpri, Pune, India' },
                  { label: 'Coordinates',      val: '18.6298°N · 73.7997°E' },
                  { label: 'Data Source',      val: 'STM32F407 + IoT Sensors' },
                  { label: 'Prediction Model', val: 'XGBoost (via m2cgen)' },
                  { label: 'Last Updated',     val: lastUpdated?.toLocaleString('en-IN') ?? '—' },
                  { label: 'Timestamp (UTC)',  val: latest?.timestamp ?? '—' },
                  { label: 'Upload Status',    val: online ? '✅ S3 Cloud' : '⚠️ Offline' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-start gap-2 text-xs border-b border-gray-50 pb-2">
                    <span className="text-gray-400 shrink-0">{row.label}</span>
                    <span className="text-gray-700 font-medium text-right">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Wind + Globe Panel */}
          <WindPanel aqi={aqi} />

          {/* Footer */}
          <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 flex items-center justify-between text-xs text-gray-400 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 text-lg">☁</span>
              <span>Data is pushed to S3-compatible cloud storage every 30 seconds. Dashboard auto-refreshes every 30 seconds.</span>
            </div>
            <span>Designed with ❤️ for a cleaner tomorrow</span>
          </div>
        </main>
      </div>
    </div>
  );
}
