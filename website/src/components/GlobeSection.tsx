import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CobGlobe } from './ui/cobe-globe';
import { fetchLatestAQI, getAQICategory, type AQIData } from '../lib/aqi';

export function GlobeSection() {
  const navigate = useNavigate();
  const [data, setData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAQI().then(d => { setData(d); setLoading(false); });
  }, []);

  const aqi = data?.aqi ?? null;
  const cat = aqi !== null ? getAQICategory(aqi) : null;

  return (
    <section className="globe-section">
      {/* Left — text */}
      <div className="globe-text">
        <div className="globe-badge">Live Monitoring</div>

        <h2 className="globe-heading">
          Real-time sensing<br />from{' '}
          <span>Pimpri, Pune</span>
        </h2>

        <p className="globe-description">
          An STM32F407 microcontroller reads MQ-135, MQ-7, and BME680 sensors,
          runs an XGBoost model on-chip, and pushes data to the cloud every 30 seconds.
          No internet required for prediction.
        </p>

        <p className="coords-tag">18.6298° N, 73.7997° E · Pimpri, Maharashtra, India</p>

        {/* Live AQI pill */}
        <div className="aqi-live-pill">
          <div>
            <p className="aqi-pill-label">Current AQI</p>
            {loading ? (
              <p className="aqi-pill-value" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.4rem' }}>
                fetching…
              </p>
            ) : aqi !== null && cat ? (
              <>
                <p className="aqi-pill-value" style={{ color: cat.color }}>{Math.round(aqi)}</p>
                <p className="aqi-pill-category" style={{ color: cat.color }}>{cat.label}</p>
              </>
            ) : (
              <p className="aqi-pill-value" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>
                Sensor offline
              </p>
            )}
          </div>
          {data && (
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.25rem' }}>
              <p className="aqi-pill-label">Temperature</p>
              <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{data.temperature.toFixed(1)}°C</p>
              <p className="aqi-pill-label" style={{ marginTop: '0.5rem' }}>Humidity</p>
              <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{data.humidity.toFixed(1)}%</p>
            </div>
          )}
        </div>

        <button className="globe-enter-btn" onClick={() => navigate('/dashboard')}>
          View Live Dashboard
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Right — globe */}
      <div className="globe-canvas-wrap">
        <CobGlobe
          markerColor={cat?.rgb ?? [0.18, 0.8, 0.4]}
          size={520}
        />
      </div>
    </section>
  );
}
