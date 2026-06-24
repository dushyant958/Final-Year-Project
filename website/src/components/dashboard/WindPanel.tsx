import { useEffect, useRef } from 'react';
import { CobGlobe } from '../ui/cobe-globe';
import { useWeather } from '../../hooks/useWeather';
import { getAQICategory } from '../../lib/aqi';

interface Props { aqi: number; }

function WindCanvas({ speed, deg }: { speed: number; deg: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;

    // Wind blows FROM deg, so particles move in opposite direction
    const moveAngle = ((deg + 180) % 360) * (Math.PI / 180);
    const dx = Math.sin(moveAngle);
    const dy = -Math.cos(moveAngle);
    const spd = Math.max(0.3, speed / 10);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 4 + Math.random() * 14,
      sp: spd * (0.5 + Math.random()),
      op: 0.08 + Math.random() * 0.22,
    }));

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx * p.len, p.y + dy * p.len);
        ctx.strokeStyle = `rgba(100, 180, 255, ${p.op})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.stroke();

        p.x += dx * p.sp;
        p.y += dy * p.sp;
        if (p.x < -20) p.x = W + 10;
        if (p.x > W + 20) p.x = -10;
        if (p.y < -20) p.y = H + 10;
        if (p.y > H + 20) p.y = -10;
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [speed, deg]);

  return <canvas ref={ref} width={280} height={280} className="rounded-2xl" style={{ background: 'rgba(15,20,40,0.6)' }} />;
}

function Compass({ deg }: { deg: number }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg viewBox="0 0 112 112" className="absolute inset-0 w-full h-full">
        <circle cx="56" cy="56" r="50" fill="rgba(15,20,40,0.5)" stroke="rgba(100,150,200,0.15)" strokeWidth="1.5" />
        {['N','E','S','W'].map((d, i) => {
          const a = i * 90 * Math.PI / 180;
          const tx = 56 + 38 * Math.sin(a);
          const ty = 56 - 38 * Math.cos(a);
          return <text key={d} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="rgba(150,180,220,0.6)" fontFamily="system-ui" fontWeight="600">{d}</text>;
        })}
        {/* Wind direction arrow */}
        <g transform={`rotate(${deg}, 56, 56)`}>
          <polygon points="56,18 60,50 56,44 52,50" fill="#60a5fa" opacity="0.9" />
          <polygon points="56,94 60,62 56,68 52,62" fill="rgba(100,140,200,0.35)" />
        </g>
        <circle cx="56" cy="56" r="4" fill="#60a5fa" />
      </svg>
    </div>
  );
}

export function WindPanel({ aqi }: Props) {
  const { weather } = useWeather();
  const cat = getAQICategory(aqi);

  return (
    <div className="bg-[#080e1e] rounded-2xl p-6 flex flex-col gap-6 h-full border border-[rgba(60,100,180,0.12)]">
      <h3 className="text-white font-bold text-base">Wind & Location</h3>

      <div className="flex gap-6 flex-wrap">
        {/* Wind canvas */}
        <WindCanvas speed={weather.windSpeed} deg={weather.windDeg} />

        {/* Wind info */}
        <div className="flex flex-col gap-5 flex-1 min-w-[160px]">
          <Compass deg={weather.windDeg} />

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Speed', val: `${weather.windSpeed} km/h` },
              { label: 'Direction', val: weather.windDir },
              { label: 'From', val: `${weather.windDeg}°` },
              { label: 'Conditions', val: weather.description },
            ].map(item => (
              <div key={item.label} className="bg-[rgba(255,255,255,0.04)] rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-white text-sm font-semibold capitalize">{item.val}</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-600 leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-3">
            📍 Pimpri, Pune · 18.63°N 73.80°E<br />
            Deployment: STM32F407G + ESP32-WROOM
          </div>
        </div>

        {/* Globe */}
        <div className="flex items-center justify-center">
          <CobGlobe markerColor={cat.rgb} size={240} />
        </div>
      </div>
    </div>
  );
}
