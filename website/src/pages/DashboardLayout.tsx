import { Outlet } from 'react-router-dom';
import { useAQIData } from '../hooks/useAQIData';
import { getAQICategory } from '../lib/aqi';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashHeader } from '../components/dashboard/DashHeader';

export default function DashboardLayout() {
  const { latest, history, loading, error, lastUpdated, refresh, spikeMode, setSpikeMode } = useAQIData();
  // Use latest history point AQI (includes jitter/spike) instead of raw S3 value
  const aqi = history.length > 0 ? history[history.length - 1].aqi : (latest?.aqi ?? 0);
  const cat = getAQICategory(aqi);
  const online = !error && !loading;

  return (
    <div className="dashboard-shell flex min-h-screen bg-dbg font-sans">
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <Sidebar online={online} />
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen relative z-[2]">
        <DashHeader online={online} lastUpdated={lastUpdated} onRefresh={refresh} spikeMode={spikeMode} onToggleSpike={setSpikeMode} />
        <Outlet context={{ latest, history, loading, error, lastUpdated, refresh, aqi, cat, online }} />
      </div>
    </div>
  );
}
