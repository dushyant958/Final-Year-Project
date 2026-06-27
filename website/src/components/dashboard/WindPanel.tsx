import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Wind, Compass as CompassIcon, MapPin } from '@phosphor-icons/react';
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
        ctx.strokeStyle = `rgba(255, 64, 64, ${p.op})`;
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

  return (
    <canvas
      ref={ref}
      width={280}
      height={280}
      className="rounded-none"
      style={{ background: 'rgba(17,17,20,0.8)' }}
    />
  );
}

function Compass({ deg }: { deg: number }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg viewBox="0 0 112 112" className="absolute inset-0 w-full h-full">
        <rect x="6" y="6" width="100" height="100" fill="rgba(17,17,20,0.6)" stroke="#2a2a30" strokeWidth="1" strokeDasharray="4 2" />
        {['N','E','S','W'].map((d, i) => {
          const a = i * 90 * Math.PI / 180;
          const tx = 56 + 38 * Math.sin(a);
          const ty = 56 - 38 * Math.cos(a);
          return (
            <text key={d} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill="#666666" fontFamily='"Geist Mono", monospace' fontWeight="700">
              {d}
            </text>
          );
        })}
        {/* Wind direction arrow */}
        <g transform={`rotate(${deg}, 56, 56)`}>
          <polygon points="56,18 60,50 56,44 52,50" fill="#ff4040" opacity="0.9" />
          <polygon points="56,94 60,62 56,68 52,62" fill="rgba(255,64,64,0.25)" />
        </g>
        <circle cx="56" cy="56" r="4" fill="#ff4040" />
      </svg>
    </div>
  );
}

const WIND_STATS = (weather: { windSpeed: number; windDir: string; windDeg: number; description: string }) => [
  { label: 'Speed', val: `${weather.windSpeed} km/h` },
  { label: 'Direction', val: weather.windDir },
  { label: 'From', val: `${weather.windDeg}\u00B0` },
  { label: 'Conditions', val: weather.description },
];

export function WindPanel({ aqi }: Props) {
  const { weather } = useWeather();
  const cat = getAQICategory(aqi);
  const stats = WIND_STATS(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'bg-ds border border-dotted border-db p-6 rounded-none',
        'flex flex-col gap-6 h-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wind size={16} weight="thin" className="text-primary" />
        <h3 className="font-display font-bold text-lg tracking-tight text-dh">
          Wind & Location
        </h3>
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* Wind canvas */}
        <WindCanvas speed={weather.windSpeed} deg={weather.windDeg} />

        {/* Wind info */}
        <div className="flex flex-col gap-5 flex-1 min-w-[160px]">
          <Compass deg={weather.windDeg} />

          {/* Hairline grid stats */}
          <div className="grid grid-cols-2">
            {stats.map((item, idx) => (
              <div
                key={item.label}
                className={cn(
                  'px-3 py-3',
                  'border-b border-dotted border-db',
                  idx % 2 === 0 && 'border-r border-dotted border-db'
                )}
              >
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-dm mb-1">
                  {item.label}
                </p>
                <p className="font-display text-2xl font-bold text-dh capitalize">
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {/* Location info */}
          <div className="flex items-start gap-1.5 border-t border-dotted border-db pt-3">
            <MapPin size={12} weight="thin" className="text-dm mt-0.5 shrink-0" />
            <div className="font-mono text-[10px] text-dm leading-relaxed">
              Pimpri, Pune &middot; 18.63&deg;N 73.80&deg;E<br />
              Deployment: STM32F407G + ESP32-WROOM
            </div>
          </div>
        </div>

        {/* Globe */}
        <div className="flex items-center justify-center">
          <CobGlobe markerColor={cat.rgb} size={240} />
        </div>
      </div>
    </motion.div>
  );
}
